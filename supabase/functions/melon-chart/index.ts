import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import * as cheerio from "npm:cheerio@1.0.0";

const MELON_URL = "https://www.melon.com/chart/index.htm";
const STATIC_CHART_URL =
  "https://raw.githubusercontent.com/lamensprout/NMIXX-RESCENE-YENA/web-app/chart.json";
const CACHE_TABLE = "melonitor_chart_cache";
const HISTORY_TABLE = "melonitor_chart_history";
const HISTORY_INTERVAL_MS = 15 * 60 * 1000;
const HISTORY_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
const COOLDOWN_MS = 50_000; // Leave a small margin for the once-per-minute scheduled run.

const ALLOWED_ORIGINS = new Set([
  "https://melonitor.netlify.app",
  "https://melonitor.com",
  "https://www.melonitor.com",
  "https://melonitor.pages.dev",
  "https://melontior.pages.dev",
]);

function isAllowedOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return false;
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (ALLOWED_ORIGINS.has(parsed.origin)) return true;

    // Match the production Pages host and all branch/unique preview hosts for these projects.
    return hostname === "melonitor.pages.dev" ||
      hostname.endsWith(".melonitor.pages.dev") ||
      hostname === "melontior.pages.dev" ||
      hostname.endsWith(".melontior.pages.dev") ||
      hostname === "melonitor.com" ||
      hostname === "www.melonitor.com";
  } catch {
    return false;
  }
}

function getAllowedResponseOrigin(request: Request): string | null {
  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) {
    if (!isAllowedOrigin(headerOrigin)) return null;
    return new URL(headerOrigin).origin;
  }

  // Some non-browser/scheduled requests do not send Origin. Resolve a known site from Referer
  // when available; otherwise use wildcard CORS because there is no browser origin to restrict.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (isAllowedOrigin(refererOrigin)) return refererOrigin;
    } catch {
      // Ignore malformed Referer and handle this as an originless request below.
    }
  }
  return "*";
}

function getKeys() {
  const publishableSet = JSON.parse(
    Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}",
  );
  const secretSet = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  return {
    publishableKey: publishableSet.default || Deno.env.get("SUPABASE_ANON_KEY") || "",
    secretKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || secretSet.default || "",
  };
}

function makeHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(data: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...makeHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function chartPayloadForClient(payload: Record<string, unknown>, refreshStatus: string) {
  const {
    baseline_hour: _baselineHour,
    baseline_updated_at: _baselineUpdatedAt,
    baseline_songs: _baselineSongs,
    ...visiblePayload
  } = payload;
  return { ...visiblePayload, refresh_status: refreshStatus };
}

function normalizeTrackPart(value: unknown) {
  return String(value || "").trim().toLocaleLowerCase("ko-KR").replace(/\s+/g, " ");
}

function trackKey(song: { title?: unknown; artist?: unknown }) {
  return normalizeTrackPart(song.title) + "\u0000" + normalizeTrackPart(song.artist);
}

async function fetchStaticChart() {
  const response = await fetch(STATIC_CHART_URL + "?fallback=" + Date.now(), {
    headers: { "User-Agent": "Melonitor/1.0 chart-cache-fallback" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("기존 차트 데이터를 불러오지 못했습니다.");
  const payload = await response.json();
  if (!payload || !Array.isArray(payload.songs) || payload.songs.length !== 100) {
    throw new Error("기존 차트 데이터가 올바르지 않습니다.");
  }
  return payload;
}

async function fetchMelonChart() {
  const response = await fetch(MELON_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "Referer": "https://www.melon.com/",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error("멜론에서 차트를 가져오지 못했습니다. (HTTP " + response.status + ")");
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const songs: Array<{
    rank: number;
    title: string;
    artist: string;
    album: string;
    album_image: string;
  }> = [];

  $("tr.lst50, tr.lst100").each((_index, row) => {
    const $row = $(row);
    const rankText = $row.find(".rank").first().text().trim();
    const title = $row.find(".ellipsis.rank01 a").first().text().trim();
    const artist = $row.find(".ellipsis.rank02 a")
      .map((_artistIndex, artistNode) => $(artistNode).text().trim())
      .get()
      .filter(Boolean)
      .filter((name, index, names) => names.indexOf(name) === index)
      .join(", ");
    const album = $row.find(".ellipsis.rank03 a").first().text().trim();

    const rank = Number.parseInt(rankText, 10);
    if (!Number.isInteger(rank) || rank < 1 || rank > 100 || !title || !artist) {
      return;
    }

    let image = $row.find("td:nth-child(4) img").first().attr("data-original") ||
      $row.find("td:nth-child(4) img").first().attr("data-lazy") ||
      $row.find("td:nth-child(4) img").first().attr("src") ||
      $row.find(".wrap_album img").first().attr("data-original") ||
      $row.find(".wrap_album img").first().attr("src") ||
      "";

    if (image.startsWith("//")) image = "https:" + image;

    songs.push({ rank, title, artist, album, album_image: image });
  });

  songs.sort((a, b) => a.rank - b.rank);
  if (
    songs.length !== 100 ||
    new Set(songs.map((song) => song.rank)).size !== 100 ||
    songs.some((song, index) => song.rank !== index + 1)
  ) {
    throw new Error(
      "멜론에서 TOP100 100곡을 모두 확인하지 못했습니다. 기존 차트는 유지합니다.",
    );
  }

  return songs;
}

Deno.serve(async (request: Request) => {
  const origin = getAllowedResponseOrigin(request);
  if (origin === null) {
    console.warn("[melon-chart] Rejected browser origin", request.headers.get("origin") || "");
    return new Response("Origin not allowed", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: makeHeaders(origin) });
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ error: "허용되지 않은 요청 방식입니다." }, 405, origin);
  }

  const { publishableKey, secretKey } = getKeys();
  if (!publishableKey || request.headers.get("apikey") !== publishableKey) {
    return jsonResponse({ error: "요청 인증에 실패했습니다." }, 401, origin);
  }
  if (!secretKey) {
    return jsonResponse({ error: "차트 저장 설정을 찾을 수 없습니다." }, 500, origin);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    const { data: existing, error: readError } = await supabase
      .from(CACHE_TABLE)
      .select("id, payload, updated_at, refresh_started_at")
      .eq("id", "current")
      .maybeSingle();

    if (readError) throw new Error("차트 캐시를 읽지 못했습니다.");

    if (request.method === "GET" && new URL(request.url).searchParams.get("history") === "1") {
      const url = new URL(request.url);
      const requestedHours = Number(url.searchParams.get("hours") || "24");
      const hours = Number.isFinite(requestedHours)
        ? Math.max(1, Math.min(8760, Math.floor(requestedHours)))
        : 24;
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const maxSnapshots = Math.min(40000, Math.ceil(hours * 60 * 1000 / HISTORY_INTERVAL_MS) + 1);
      const snapshots: Array<{ snapshot_at: string; artist_ranks: unknown }> = [];
      const pageSize = 1000;
      for (let offset = 0; offset < maxSnapshots; offset += pageSize) {
        const { data: page, error: historyReadError } = await supabase
          .from(HISTORY_TABLE)
          .select("snapshot_at, artist_ranks")
          .gte("snapshot_at", cutoff)
          .order("snapshot_at", { ascending: true })
          .range(offset, Math.min(offset + pageSize - 1, maxSnapshots - 1));

        if (historyReadError) {
          console.error("[melon-chart] History read failed", historyReadError);
          return jsonResponse({ error: "순위 기록을 불러오지 못했습니다.", snapshots: [] }, 500, origin);
        }
        snapshots.push(...(page || []));
        if (!page || page.length < pageSize) break;
      }
      return jsonResponse({
        snapshots,
        interval_minutes: 15,
        retention_days: 365,
        hours,
      }, 200, origin);
    }

    if (request.method === "GET") {
      if (existing?.payload?.songs?.length === 100) {
        return jsonResponse(
          chartPayloadForClient(existing.payload, "cached"),
          200,
          origin,
        );
      }
      const fallback = await fetchStaticChart();
      return jsonResponse(
        { ...fallback, refresh_status: "scheduled" },
        200,
        origin,
      );
    }

    const nowMs = Date.now();
    const currentPayload = existing?.payload;
    const lastStart = existing?.refresh_started_at
      ? Date.parse(existing.refresh_started_at)
      : 0;

    if (lastStart && nowMs - lastStart < COOLDOWN_MS) {
      if (currentPayload?.songs?.length === 100) {
        return jsonResponse(
          {
            ...chartPayloadForClient(currentPayload, "recently_updated"),
            message: "방금 차트가 갱신되어 최신 데이터를 표시합니다.",
          },
          200,
          origin,
        );
      }
      return jsonResponse(
        { error: "차트 갱신이 이미 진행 중입니다. 잠시 후 다시 눌러 주세요." },
        409,
        origin,
      );
    }

    const startIso = new Date(nowMs).toISOString();
    let claimed = false;

    if (!existing) {
      const { error: insertError } = await supabase
        .from(CACHE_TABLE)
        .insert({
          id: "current",
          payload: null,
          updated_at: null,
          refresh_started_at: startIso,
        });
      if (!insertError) {
        claimed = true;
      } else if (insertError.code !== "23505") {
        throw new Error("차트 갱신을 시작하지 못했습니다.");
      }
    }

    if (!claimed) {
      const cutoff = new Date(nowMs - COOLDOWN_MS).toISOString();
      const { data: claim, error: claimError } = await supabase
        .from(CACHE_TABLE)
        .update({ refresh_started_at: startIso })
        .eq("id", "current")
        .or("refresh_started_at.is.null,refresh_started_at.lt." + cutoff)
        .select("id")
        .maybeSingle();

      if (claimError) throw new Error("차트 갱신 권한을 확보하지 못했습니다.");
      claimed = !!claim;
    }

    if (!claimed) {
      const { data: latest } = await supabase
        .from(CACHE_TABLE)
        .select("payload")
        .eq("id", "current")
        .maybeSingle();

      if (latest?.payload?.songs?.length === 100) {
        return jsonResponse(
          chartPayloadForClient(latest.payload, "recently_updated"),
          200,
          origin,
        );
      }
      return jsonResponse(
        { error: "차트 갱신이 이미 진행 중입니다. 잠시 후 다시 눌러 주세요." },
        409,
        origin,
      );
    }

    try {
      const currentSongs = await fetchMelonChart();
      const now = new Date();
      // Minute boundaries are the same in UTC and Korea. Keep one baseline per hour
      // so per-minute chart refreshes do not erase rank movement indicators.
      const hourKey = now.toISOString().slice(0, 13);
      const storedBaseline = Array.isArray(currentPayload?.baseline_songs)
        ? currentPayload.baseline_songs
        : null;
      const canReuseBaseline = now.getUTCMinutes() !== 0 &&
        currentPayload?.baseline_hour === hourKey &&
        storedBaseline?.length === 100;

      let baselineSongs: Array<{ title: string; artist: string; rank: number }>;
      let baselineUpdatedAt: string;
      if (canReuseBaseline && storedBaseline) {
        baselineSongs = storedBaseline;
        baselineUpdatedAt = String(currentPayload?.baseline_updated_at || currentPayload?.updated_at || now.toISOString());
      } else if (!storedBaseline && now.getUTCMinutes() !== 0) {
        // On first deploy, seed from the latest scheduled static snapshot rather than
        // using the previous minute's live cache as a moving baseline.
        const snapshot = await fetchStaticChart();
        baselineSongs = snapshot.songs;
        baselineUpdatedAt = String(snapshot.updated_at || now.toISOString());
      } else {
        // At the top of each hour, start a fresh baseline from the live TOP100.
        // If the top-of-hour run was skipped, use the first successful run in this hour.
        baselineSongs = currentSongs;
        baselineUpdatedAt = now.toISOString();
      }

      const baselineRanks = new Map<string, number>(
        baselineSongs.map((song: { title: string; artist: string; rank: number }) => [
          trackKey(song),
          Number(song.rank),
        ]),
      );

      const songs = currentSongs.map((song) => {
        const baselineRank = baselineRanks.get(trackKey(song));
        return {
          ...song,
          previous_rank: baselineRank ?? null,
          change: baselineRank == null ? 0 : baselineRank - song.rank,
        };
      });

      // Generate per-user notifications for favorite-artist rank changes.
      const baselineHourIso = new Date(hourKey + ":00:00.000Z").toISOString();
      const { data: alertSettings, error: settingsError } = await supabase
        .from("melonitor_rank_alert_settings")
        .select("user_id, threshold, notify_rises, notify_falls")
        .eq("enabled", true);
      if (settingsError) {
        console.warn("[melon-chart] Alert settings read failed", settingsError);
      } else if (Array.isArray(alertSettings) && alertSettings.length) {
        const userIds = alertSettings.map((setting) => setting.user_id);
        const { data: favoriteRows, error: favoritesError } = await supabase
          .from("melonitor_favorite_artists")
          .select("user_id, artist_name")
          .in("user_id", userIds);
        if (favoritesError) {
          console.warn("[melon-chart] Alert favorites read failed", favoritesError);
        } else {
          const normalizeArtist = (value: unknown) =>
            String(value || "").toLocaleLowerCase("ko-KR").replace(/[\\s()（）]/g, "");
          const favoritesByUser = new Map<string, Set<string>>();
          (favoriteRows || []).forEach((row) => {
            const set = favoritesByUser.get(row.user_id) || new Set<string>();
            set.add(normalizeArtist(row.artist_name));
            favoritesByUser.set(row.user_id, set);
          });
          const notificationRows: Array<Record<string, unknown>> = [];
          for (const setting of alertSettings) {
            const favoriteSet = favoritesByUser.get(setting.user_id);
            if (!favoriteSet) continue;
            for (const song of songs) {
              const oldRank = baselineRanks.get(trackKey(song));
              if (oldRank == null || oldRank === song.rank) continue;
              const movement = oldRank - song.rank;
              if (Math.abs(movement) < Number(setting.threshold || 1)) continue;
              if (movement > 0 && !setting.notify_rises) continue;
              if (movement < 0 && !setting.notify_falls) continue;
              if (!favoriteSet.has(normalizeArtist(song.artist))) continue;
              notificationRows.push({
                user_id: setting.user_id,
                artist_name: song.artist,
                song_title: song.title,
                old_rank: oldRank,
                new_rank: song.rank,
                rank_change: movement,
                baseline_hour: baselineHourIso,
              });
            }
          }
          if (notificationRows.length) {
            const { error: notificationError } = await supabase
              .from("melonitor_rank_alert_notifications")
              .upsert(notificationRows, {
                onConflict: "user_id,artist_name,song_title,baseline_hour,rank_change",
                ignoreDuplicates: true,
              });
            if (notificationError) {
              console.warn("[melon-chart] Notification insert failed", notificationError);
            }
          }
        }
      }

      const payload = {
        updated_at: now.toISOString(),
        baseline_hour: hourKey,
        baseline_updated_at: baselineUpdatedAt,
        baseline_songs: baselineSongs.map((song: { title: string; artist: string; rank: number }) => ({
          title: song.title,
          artist: song.artist,
          rank: Number(song.rank),
        })),
        songs,
      };
      const { error: saveError } = await supabase
        .from(CACHE_TABLE)
        .upsert(
          {
            id: "current",
            payload,
            updated_at: payload.updated_at,
            refresh_started_at: payload.updated_at,
          },
          { onConflict: "id" },
        );
      if (saveError) throw new Error("새 차트를 저장하지 못했습니다.");

      // Keep one aggregate artist-rank snapshot per 15-minute window.
      // This limits storage growth while giving the beta view a useful trend line.
      const slotMs = Math.floor(now.getTime() / HISTORY_INTERVAL_MS) * HISTORY_INTERVAL_MS;
      const snapshotAt = new Date(slotMs).toISOString();
      const artistRankMap = new Map<string, { artist: string; rank: number; title: string }>();
      songs.forEach((song) => {
        const existingArtist = artistRankMap.get(normalizeTrackPart(song.artist));
        if (!existingArtist || song.rank < existingArtist.rank) {
          artistRankMap.set(normalizeTrackPart(song.artist), {
            artist: song.artist,
            rank: Number(song.rank),
            title: song.title,
          });
        }
      });
      const artistRanks = Array.from(artistRankMap.values()).sort((a, b) => a.rank - b.rank);
      const { error: historySaveError } = await supabase
        .from(HISTORY_TABLE)
        .upsert({
          snapshot_at: snapshotAt,
          artist_ranks: artistRanks,
        }, { onConflict: "snapshot_at" });

      if (historySaveError) {
        console.warn("[melon-chart] Rank history snapshot failed", historySaveError);
      } else {
        const historyCutoff = new Date(now.getTime() - HISTORY_RETENTION_MS).toISOString();
        const { error: historyCleanupError } = await supabase
          .from(HISTORY_TABLE)
          .delete()
          .lt("snapshot_at", historyCutoff);
        if (historyCleanupError) {
          console.warn("[melon-chart] Rank history cleanup failed", historyCleanupError);
        }
      }

      console.info("[melon-chart] TOP100 refresh succeeded", {
        updated_at: payload.updated_at,
        song_count: songs.length,
      });
      return jsonResponse(
        chartPayloadForClient(payload, "refreshed"),
        200,
        origin,
      );
    } catch (error) {
      await supabase
        .from(CACHE_TABLE)
        .update({ refresh_started_at: null })
        .eq("id", "current");
      throw error;
    }
  } catch (error) {
    console.error("[melon-chart] Request failed", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "차트를 처리하지 못했습니다." },
      502,
      origin,
    );
  }
});
