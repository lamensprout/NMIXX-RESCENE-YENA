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
        album_element = row.select_one(".ellipsis.rank03 a")
        album_image_element = row.select_one("td:nth-child(4) img") or row.select_one(".wrap_album img")

        if not rank_element or not title_element or not artist_element:
            continue

        try:
            rank = int(rank_element.get_text(strip=True))
        except ValueError:
            continue

        title = title_element.get_text(strip=True)
        artist = artist_element.get_text(strip=True)
        album = album_element.get_text(strip=True) if album_element else "앨범 정보 없음"

        album_image = ""
        if album_image_element:
            album_image = (
                album_image_element.get("data-original")
                or album_image_element.get("data-lazy")
                or album_image_element.get("src")
                or ""
            )

            if album_image.startswith("//"):
                album_image = "https:" + album_image

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
            "album": album,
            "album_image": album_image,
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


def build_message(previous, current):
    rows = []

    for key, song in sorted(
        current.items(),
        key=lambda item: item[1]["rank"]
    ):
        old_rank = previous.get(key, {}).get("rank")
        new_rank = song["rank"]

        if old_rank is None or new_rank == old_rank:
            change_text = '<span style="color:#777777;font-weight:700;">-</span>'
        elif new_rank < old_rank:
            change_text = (
                f'<span style="color:#e91e63;font-weight:700;">'
                f'▲ {old_rank - new_rank}'
                f'</span>'
            )
        else:
            change_text = (
                f'<span style="color:#1976d2;font-weight:700;">'
                f'▼ {new_rank - old_rank}'
                f'</span>'
            )

        rows.append(
            f"""
            <tr>
                <td style="padding:9px 8px;border-bottom:1px solid #eeeeee;
                           text-align:right;width:42px;
                           font-size:16px;font-weight:700;color:#333333;">
                    {new_rank}
                </td>
                <td style="padding:9px 8px;border-bottom:1px solid #eeeeee;
                           text-align:left;width:52px;font-size:14px;">
                    {change_text}
                </td>
                <td style="padding:9px 8px;border-bottom:1px solid #eeeeee;width:58px;">
                    {
                        f'<img src="{song["album_image"]}" width="48" height="48" '
                        f'style="display:block;width:48px;height:48px;object-fit:cover;border-radius:4px;" '
                        f'alt="">'
                        if song.get("album_image")
                        else ""
                    }
                </td>
                <td style="padding:9px 8px;border-bottom:1px solid #eeeeee;">
                    <div style="font-size:15px;font-weight:700;color:#222222;">
                        {song["title"]}
                    </div>
                    <div style="margin-top:3px;font-size:12px;color:#777777;">
                        {song["artist"]}
                    </div>
                    <div style="margin-top:3px;font-size:11px;color:#999999;">
                        {song.get("album", "앨범 정보 없음")}
                    </div>
                </td>
            </tr>
            """
        )

    return f"""
    <html>
      <body style="margin:0;padding:20px;
                   font-family:Arial,'Malgun Gothic',sans-serif;
                   background:#ffffff;color:#222222;">
        <div style="max-width:620px;">
          <h2 style="margin:0 0 14px 0;font-size:20px;">
            🍈 멜론 차트
          </h2>

          <table style="border-collapse:collapse;width:100%;">
            <thead>
              <tr>
                <th style="padding:7px 8px;text-align:right;font-size:11px;color:#999999;">순위</th>
                <th style="padding:7px 8px;font-size:11px;color:#999999;">변동</th>
                <th style="padding:7px 8px;font-size:11px;color:#999999;"></th>
                <th style="padding:7px 8px;text-align:left;font-size:11px;color:#999999;">곡 / 아티스트 / 앨범</th>
              </tr>
            </thead>
            <tbody>
              {"".join(rows)}
            </tbody>
          </table>

          <div style="margin-top:14px;font-size:12px;color:#888888;">
            <span style="color:#e91e63;font-weight:700;">▲</span>
            상승&nbsp;&nbsp;
            <span style="color:#1976d2;font-weight:700;">▼</span>
            하락&nbsp;&nbsp;
            - 변동 없음
          </div>
        </div>
      </body>
    </html>
    """


def send_email(html_message):
    import smtplib
    from email.header import Header
    from email.utils import formataddr
    from email.mime.image import MIMEImage
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    import re

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

    # 이미지가 메일 서버에서 차단되지 않도록 외부 이미지를 메일 안에 직접 첨부합니다.
    image_urls = []
    for url in re.findall(r'<img[^>]+src="([^"]+)"', html_message):
        if url.startswith("http://") or url.startswith("https://"):
            image_urls.append(url)

    image_map = {}
    for index, url in enumerate(dict.fromkeys(image_urls), start=1):
        try:
            image_response = requests.get(
                url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/154.0.0.0 Safari/537.36"
                    ),
                    "Referer": "https://www.melon.com/chart/index.htm",
                },
                timeout=20,
            )
            image_response.raise_for_status()
            image_map[url] = (f"album_{index}", image_response.content)
        except requests.RequestException as e:
            print(f"앨범아트 다운로드 실패: {url} ({e})")

    for url, (content_id, _) in image_map.items():
        html_message = html_message.replace(
            f'src="{url}"',
            f'src="cid:{content_id}"'
        )

    mail = MIMEMultipart("related")
    mail["Subject"] = Header("🍈 멜론 차트 순위 변동", "utf-8")
    mail["From"] = formataddr(("Melon_Bot", sender))
    mail["To"] = ", ".join(recipients)

    alternative = MIMEMultipart("alternative")
    alternative.attach(
        MIMEText(
            "멜론 차트 순위 변동 알림입니다. HTML 메일을 지원하는 환경에서 확인해주세요.",
            "plain",
            "utf-8",
        )
    )
    alternative.attach(MIMEText(html_message, "html", "utf-8"))
    mail.attach(alternative)

    for content_id, image_bytes in image_map.values():
        image = MIMEImage(image_bytes)
        image.add_header("Content-ID", f"<{content_id}>")
        image.add_header("Content-Disposition", "inline")
        mail.attach(image)

    with smtplib.SMTP_SSL("smtp.naver.com", 465, timeout=20) as server:
        server.login(sender, app_password)
        server.sendmail(sender, recipients, mail.as_string())

    print(f"이메일 알림 전송 완료: {len(recipients)}명 / 앨범아트 {len(image_map)}개")
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


def send_notifications(previous, current):
    message = build_message(previous, current)

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
    else:
        print("순위 변동 없음. 현재 차트를 확인합니다.")

    from datetime import datetime, timezone, timedelta

    kst = timezone(timedelta(hours=9))
    current_hour = datetime.now(kst).hour

    if 8 <= current_hour < 24:
        send_notifications(previous, current)
    else:
        print("00:00~07:59 알림 금지 시간입니다. 차트 확인 및 순위 저장만 합니다.")

    save_state(current)


if __name__ == "__main__":
    main()
