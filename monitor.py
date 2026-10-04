import json
import os
from pathlib import Path

import requests
from bs4 import BeautifulSoup

CHART_URL = "https://www.melon.com/chart/index.htm"
STATE_FILE = Path("state.json")

TARGETS = {
    "NMIXX": ["NMIXX"],
    "RESCENE": ["RESCENE"],
    "YENA": ["YENA", "최예나"],
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36",
    "Referer": "https://www.melon.com/",
}

def load_state():
    if not STATE_FILE.exists():
        return {}
    return json.loads(STATE_FILE.read_text(encoding="utf-8"))

def save_state(state):
    STATE_FILE.write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

def fetch_chart():
    r = requests.get(CHART_URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    rows = []
    for tr in soup.select("tr"):
        rank = tr.select_one("span.rank")
        title = tr.select_one("div.ellipsis.rank01 a")
        artist = tr.select_one("div.ellipsis.rank02 a")
        if not rank or not title or not artist:
            continue
        try:
            rank_num = int(rank.get_text(strip=True))
        except ValueError:
            continue
        rows.append({
            "rank": rank_num,
            "title": title.get_text(" ", strip=True),
            "artist": artist.get_text(" ", strip=True),
        })
    if not rows:
        raise RuntimeError("Melon chart HTML에서 곡 목록을 찾지 못했습니다.")
    return rows

def is_target(artist):
    a = artist.upper()
    return any(
        keyword.upper() in a
        for keywords in TARGETS.values()
        for keyword in keywords
    )

def main():
    current_rows = fetch_chart()
    current = {
        f"{row['title']} | {row['artist']}": row["rank"]
        for row in current_rows
        if is_target(row["artist"])
    }

    previous = load_state()
    changes = []

    if previous:
        for song, new_rank in current.items():
            old_rank = previous.get(song)
            if old_rank is None or old_rank == new_rank:
                continue
            delta = old_rank - new_rank
            direction = "상승" if delta > 0 else "하락"
            changes.append(
                f"- {song}: {old_rank}위 → {new_rank}위 ({direction} {abs(delta)}위)"
            )

    save_state(current)

    if not changes:
        print("순위 변동 없음")
        return

    message = "멜론 차트 순위 변동 감지\n\n" + "\n".join(changes)
    print(message)

    webhook = os.getenv("DISCORD_WEBHOOK_URL")
    if webhook:
        resp = requests.post(webhook, json={"content": message}, timeout=30)
        resp.raise_for_status()
        print("Discord 알림 전송 완료")
    else:
        print("DISCORD_WEBHOOK_URL이 없어 콘솔에만 표시했습니다.")

if __name__ == "__main__":
    main()
