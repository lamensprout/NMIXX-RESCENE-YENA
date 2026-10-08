import json
import os
import requests
from bs4 import BeautifulSoup

MELON_URL = "https://www.melon.com/chart/index.htm"
CHART_FILE = "chart.json"


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


def load_previous():
    if not os.path.exists(CHART_FILE):
        return []

    try:
        with open(CHART_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("songs", [])
    except (json.JSONDecodeError, OSError):
        return []


def main():
    current = get_chart()
    previous = load_previous()

    previous_by_key = {
        (song["title"], song["artist"]): song["rank"]
        for song in previous
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
        "updated_at": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat(),
        "songs": current,
    }

    with open(CHART_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"차트 {len(current)}곡 저장 완료")


if __name__ == "__main__":
    main()
