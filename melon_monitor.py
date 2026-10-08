import json
import os
import requests
from bs4 import BeautifulSoup

MELON_URL = "https://www.melon.com/chart/index.htm"
STATE_FILE = "state.json"
NTFY_BASE_URL = "https://ntfy.sh"

TARGET_ARTISTS = [
    "NMIXX",
    "엔믹스",
    "RESCENE",
    "리센느",
    "최예나",
    "YENA",
    "YENA (최예나)",
]


def get_melon_chart():
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

    if not rows:
        raise RuntimeError("멜론 차트 데이터를 찾지 못했습니다.")

    chart = {}

    for row in rows:
        rank_element = row.select_one(".rank")
        title_element = row.select_one(".ellipsis.rank01 a")
        artist_element = row.select_one(".ellipsis.rank02 a")

        if not rank_element or not title_element or not artist_element:
            continue

        try:
            rank = int(rank_element.get_text(strip=True))
        except ValueError:
            continue

        title = title_element.get_text(strip=True)
        artist = artist_element.get_text(strip=True)

        is_target = any(
            target.lower() in artist.lower()
            for target in TARGET_ARTISTS
        )

        if not is_target:
            continue

        key = f"{title}|||{artist}"

        chart[key] = {
            "title": title,
            "artist": artist,
            "rank": rank,
        }

    return chart


def load_previous_state():
    if not os.path.exists(STATE_FILE):
        return {}

    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_state(chart):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(chart, f, ensure_ascii=False, indent=2)


def compare_ranks(previous, current):
    changes = []

    for key, song in current.items():
        if key not in previous:
            continue

        old_rank = previous[key]["rank"]
        new_rank = song["rank"]

        if old_rank == new_rank:
            continue

        difference = old_rank - new_rank
        direction = "상승" if difference > 0 else "하락"

        changes.append(
            {
                "title": song["title"],
                "artist": song["artist"],
                "old_rank": old_rank,
                "new_rank": new_rank,
                "difference": abs(difference),
                "direction": direction,
            }
        )

    return changes


def send_ntfy(changes):
    topic = os.environ.get("NTFY_TOPIC")

    if not topic:
        print("NTFY_TOPIC이 설정되지 않아 알림을 보내지 않습니다.")
        return

    lines = ["🍈 멜론 차트 순위 변동"]

    for change in changes:
        lines.append(
            f'{change["artist"]} - {change["title"]}\n'
            f'{change["old_rank"]}위 → {change["new_rank"]}위 '
            f'({change["direction"]} {change["difference"]}단계)'
        )

    message = "\n\n".join(lines)

    response = requests.post(
        f"{NTFY_BASE_URL}/{topic}",
        data=message.encode("utf-8"),
        headers={
            "Title": "멜론 차트 순위 변동",
            "Priority": "4",
            "Tags": "chart_with_upwards_trend",
        },
        timeout=20,
    )
    response.raise_for_status()

    print("ntfy 알림 전송 완료.")


def main():
    print("멜론 차트 확인 중...")

    current = get_melon_chart()
    previous = load_previous_state()

    print(f"대상 곡 {len(current)}곡 확인")

    if not previous:
        print("첫 실행입니다. 현재 순위를 저장합니다.")
        save_state(current)
        return

    changes = compare_ranks(previous, current)

    if changes:
        print("\n순위 변동 발견!")

        for change in changes:
            print(
                f'{change["artist"]} - {change["title"]}: '
                f'{change["old_rank"]}위 → {change["new_rank"]}위 '
                f'({change["direction"]} {change["difference"]}단계)'
            )

        send_ntfy(changes)
    else:
        print("순위 변동 없음.")

    save_state(current)


if __name__ == "__main__":
    main()
