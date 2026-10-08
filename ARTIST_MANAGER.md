# 아티스트 추가/제거 버전

기존 Melon Chart Monitor 완성본을 그대로 바탕으로,
감시할 아티스트를 추가하거나 제거할 수 있게 만든 별도 테스트 버전입니다.

## 현재 등록된 아티스트

- NMIXX
- RESCENE
- YENA

YENA 별칭:
- 최예나
- YENA
- YENA (최예나)

## 추가

```bash
python manage_artists.py add "Hearts2Hearts"
```

멜론에서 다른 이름으로 표시되는 경우 별칭도 넣을 수 있습니다.

```bash
python manage_artists.py add "Hearts2Hearts" "H2H"
```

## 제거

```bash
python manage_artists.py remove "RESCENE"
```

## 목록 확인

```bash
python manage_artists.py list
```

이 버전은 `artist-manager` 브랜치에 있으며 현재 운영 중인 `main` 브랜치는 변경하지 않았습니다.
