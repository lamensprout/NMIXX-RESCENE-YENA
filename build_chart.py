import json
import os
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup

MELON_URL = "https://www.melon.com/chart/index.htm"
CHART_FILE = "chart.json"
KOREA_TZ = ZoneInfo("Asia/Seoul")
MAX_HISTORY_SNAPSHOTS = 48


def get_chart():
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/154.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(MELON_URL, headers=headers, timeout=20)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.select("tr.lst50, tr.lst100")

    chart = []

    for row in rows:
        rank_el = row.select_one(".rank")
        title_el = row.select_one(".ellipsis.rank01 a")
        artist_el = row.select_one(".ellipsis.rank02 a")
        album_el = row.select_one(".ellipsis.rank03 a")
        image_el = (
            row.select_one("td:nth-child(4) img")
            or row.select_one(".wrap_album img")
        )

        if not rank_el or not title_el or not artist_el:
            continue

        try:
            rank = int(rank_el.get_text(strip=True))
        except ValueError:
            continue

        image = ""
        if image_el:
            image = (
                image_el.get("data-original")
                or image_el.get("data-lazy")
                or image_el.get("src")
                or ""
            )
            if image.startswith("//"):
                image = "https:" + image

        chart.append(
            {
                "rank": rank,
                "title": title_el.get_text(strip=True),
                "artist": artist_el.get_text(strip=True),
                "album": album_el.get_text(strip=True) if album_el else "",
                "album_image": image,
            }
        )

    return chart


def load_previous_payload():
    if not os.path.exists(CHART_FILE):
        return {}

    try:
        with open(CHART_FILE, "r", encoding="utf-8") as f:
            payload = json.load(f)
        return payload if isinstance(payload, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def parse_timestamp(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(KOREA_TZ)
    except (TypeError, ValueError):
        return None


def get_comparison_songs(previous_payload, now_kst):
    previous_songs = previous_payload.get("songs", [])
    if not isinstance(previous_songs, list):
        previous_songs = []

    # At 00:00 KST, compare against the previous day's 23:00 chart,
    # not an arbitrary or stale snapshot. The previous current snapshot
    # and archived snapshots are both candidates.
    if now_kst.hour == 0:
        candidates = []
        previous_timestamp = parse_timestamp(previous_payload.get("updated_at"))
        if previous_timestamp and previous_songs:
            candidates.append({
                "updated_at": previous_payload.get("updated_at"),
                "songs": previous_songs,
            })

        history = previous_payload.get("history", [])
        if isinstance(history, list):
            candidates.extend(item for item in history if isinstance(item, dict))

        target_date = now_kst.date() - timedelta(days=1)
        prior_23_snapshots = []
        for snapshot in candidates:
            timestamp = parse_timestamp(snapshot.get("updated_at"))
            snapshot_songs = snapshot.get("songs")
            if (
                timestamp
                and timestamp.date() == target_date
                and timestamp.hour == 23
                and isinstance(snapshot_songs, list)
                and snapshot_songs
            ):
                prior_23_snapshots.append((timestamp, snapshot_songs))

        if prior_23_snapshots:
            prior_23_snapshots.sort(key=lambda item: item[0])
            timestamp, songs = prior_23_snapshots[-1]
            print(
                "자정 순위 변동 비교 기준: 전날 23시 기록 "
                f"({timestamp.isoformat()})"
            )
            return songs

        print(
            "경고: 전날 23시 차트 기록을 찾지 못했습니다. "
            "기존 최신 차트를 비교 기준으로 사용합니다."
        )

    return previous_songs


def build_history(previous_payload, current_updated_at):
    history = previous_payload.get("history", [])
    if not isinstance(history, list):
        history = []

    # Preserve the previous current chart as a timestamped snapshot.
    previous_updated_at = previous_payload.get("updated_at")
    previous_songs = previous_payload.get("songs")
    snapshots = [
        item for item in history
        if isinstance(item, dict)
        and item.get("updated_at")
        and isinstance(item.get("songs"), list)
    ]
    if previous_updated_at and isinstance(previous_songs, list) and previous_songs:
        snapshots.append({
            "updated_at": previous_updated_at,
            "songs": previous_songs,
        })

    # Deduplicate by timestamp and keep the newest bounded history.
    by_timestamp = {}
    for snapshot in snapshots:
        timestamp = snapshot.get("updated_at")
        if timestamp and timestamp != current_updated_at:
            by_timestamp[timestamp] = snapshot

    ordered = sorted(
        by_timestamp.values(),
        key=lambda item: parse_timestamp(item.get("updated_at")) or datetime.min.replace(tzinfo=timezone.utc),
    )
    return ordered[-MAX_HISTORY_SNAPSHOTS:]


def main():
    current = get_chart()
    previous_payload = load_previous_payload()
    now_utc = datetime.now(timezone.utc)
    now_kst = now_utc.astimezone(KOREA_TZ)
    updated_at = now_utc.isoformat()

    previous = get_comparison_songs(previous_payload, now_kst)

    previous_by_key = {
        (song.get("title"), song.get("artist")): song.get("rank")
        for song in previous
        if isinstance(song, dict)
    }

    for song in current:
        key = (song["title"], song["artist"])
        old_rank = previous_by_key.get(key)

        song["previous_rank"] = old_rank
        if old_rank is None:
            song["change"] = 0
        else:
            song["change"] = old_rank - song["rank"]

    payload = {
        "updated_at": updated_at,
        "songs": current,
        "history": build_history(previous_payload, updated_at),
    }

    with open(CHART_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"차트 {len(current)}곡 저장 완료")


if __name__ == "__main__":
    main()
