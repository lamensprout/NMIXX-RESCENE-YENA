import json
import sys

ARTISTS_FILE = "artists.json"


def load_artists():
    with open(ARTISTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_artists(artists):
    with open(ARTISTS_FILE, "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)
        f.write("\n")


def find_artist_key(artists, name):
    name_lower = name.strip().lower()

    for key, aliases in artists.items():
        if key.lower() == name_lower:
            return key
        if any(alias.lower() == name_lower for alias in aliases):
            return key

    return None


def add_artist(name, aliases):
    artists = load_artists()
    name = name.strip()

    if not name:
        raise ValueError("아티스트 이름을 입력해줘.")

    if find_artist_key(artists, name):
        print(f"이미 등록되어 있어: {name}")
        return

    clean_aliases = []
    for alias in aliases:
        alias = alias.strip()
        if alias and alias.lower() != name.lower() and alias not in clean_aliases:
            clean_aliases.append(alias)

    artists[name] = clean_aliases
    save_artists(artists)
    print(f"추가 완료: {name}")


def remove_artist(name):
    artists = load_artists()
    key = find_artist_key(artists, name)

    if not key:
        print(f"등록된 아티스트를 찾지 못했어: {name}")
        return

    del artists[key]
    save_artists(artists)
    print(f"제거 완료: {key}")


def list_artists():
    artists = load_artists()

    for name, aliases in artists.items():
        label = f" [{', '.join(aliases)}]" if aliases else ""
        print(f"- {name}{label}")


def main():
    if len(sys.argv) < 2:
        print("사용법:")
        print('  python manage_artists.py list')
        print('  python manage_artists.py add "아티스트명" "별칭1" "별칭2"')
        print('  python manage_artists.py remove "아티스트명"')
        return

    command = sys.argv[1].lower()

    if command == "list":
        list_artists()
    elif command == "add" and len(sys.argv) >= 3:
        add_artist(sys.argv[2], sys.argv[3:])
    elif command == "remove" and len(sys.argv) >= 3:
        remove_artist(sys.argv[2])
    else:
        print("명령어를 확인해줘.")


if __name__ == "__main__":
    main()
