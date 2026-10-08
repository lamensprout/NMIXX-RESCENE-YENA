import json
import os
import requests
from bs4 import BeautifulSoup

MELON_URL = "https://www.melon.com/chart/index.htm"
STATE_FILE = "state.json"

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


def build_message(changes):
    lines = ["🍈 멜론 차트 순위 변동"]

    for change in changes:
        lines.append(
            f'{change["artist"]} - {change["title"]}\\n'
            f'{change["old_rank"]}위 → {change["new_rank"]}위 '
            f'({change["direction"]} {change["difference"]}단계)'
        )

    return "\\n\\n".join(lines)


def send_email(message):
    import smtplib
    from email.mime.text import MIMEText
    from email.header import Header

    sender = os.environ.get("EMAIL_SENDER")
    app_password = os.environ.get("EMAIL_APP_PASSWORD")
    recipients_raw = os.environ.get("EMAIL_RECIPIENT")

    recipients = [
        address.strip()
        for address in (recipients_raw or "").split(",")
        if address.strip()
    ]

    if not sender or not app_password or not recipients:
        print("이메일 설정이 없어 이메일 알림을 건너뜁니다.")
        return

    mail = MIMEText(message, "plain", "utf-8")
    mail["Subject"] = Header("🍈 멜론 차트 순위 변동", "utf-8")
    mail["From"] = sender
    mail["To"] = ", ".join(recipients)

    with smtplib.SMTP_SSL("smtp.naver.com", 465, timeout=20) as server:
        server.login(sender, app_password)
        server.sendmail(sender, recipients, mail.as_string())

    print(f"이메일 알림 전송 완료: {len(recipients)}명")


def send_kakao(message):
    refresh_token = os.environ.get("KAKAO_REFRESH_TOKEN")
    rest_api_key = os.environ.get("KAKAO_REST_API_KEY")
    client_secret = os.environ.get("KAKAO_CLIENT_SECRET")

    if not refresh_token or not rest_api_key:
        print("카카오톡 설정이 없어 카카오톡 알림을 건너뜁니다.")
        return

    token_data = {
        "grant_type": "refresh_token",
        "client_id": rest_api_key,
        "refresh_token": refresh_token,
    }

    if client_secret:
        token_data["client_secret"] = client_secret

    token_response = requests.post(
        "https://kauth.kakao.com/oauth/token",
        data=token_data,
        timeout=20,
    )
    token_response.raise_for_status()

    access_token = token_response.json().get("access_token")
    if not access_token:
        raise RuntimeError("카카오 액세스 토큰을 갱신하지 못했습니다.")

    template_object = {
        "object_type": "text",
        "text": message,
        "link": {
            "web_url": "https://www.melon.com/chart/index.htm",
            "mobile_web_url": "https://www.melon.com/chart/index.htm",
        },
    }

    response = requests.post(
        "https://kapi.kakao.com/v2/api/talk/memo/default/send",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        data={
            "template_object": json.dumps(
                template_object,
                ensure_ascii=False,
            )
        },
        timeout=20,
    )
    response.raise_for_status()

    if response.json().get("result_code") != 0:
        raise RuntimeError(f"카카오톡 메시지 전송 실패: {response.text}")

    print("카카오톡 알림 전송 완료.")


def send_notifications(changes):
    message = build_message(changes)

    try:
        send_email(message)
    except Exception as e:
        print(f"이메일 알림 실패: {e}")

    try:
        send_kakao(message)
    except Exception as e:
        print(f"카카오톡 알림 실패: {e}")


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

        send_notifications(changes)
    else:
        print("순위 변동 없음.")

    save_state(current)


if __name__ == "__main__":
    main()
