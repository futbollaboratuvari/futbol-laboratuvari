# 2026-06-27 Asama 3.5 Tek Bulten Kaynak Testi

## Amac

Tek bultenin full-bulletin bosken live-matches yedeginden dolacagini repo kaynaklari uzerinden kanitlamak.

## Yapilan Islem

Yeni frontend bulten, widget veya bridge eklenmedi.

Sadece rapor dosyasi eklendi:

- `outputs/tek_bulten_kaynak_testi.md`

## Kontrol Edilenler

### Full Bulletin

`data/full-bulletin.json` henuz bos:

- `status`: waiting
- `match_count`: 0
- `matches`: []

### Live Matches

`data/live-matches.json` aktif:

- `status`: active
- `counts.total`: 147
- `counts.scheduled`: 147

### Tek Bulten Motoru

`daily-matches-widget.js` kaynak sirasi:

1. `data/full-bulletin.json`
2. `data/live-matches.json`
3. `data/fixtures.json`

Bu nedenle full-bulletin bos kalirsa live-matches verisine duser.

## Tek Bulten Guvenceleri

- Singleton korumasi var.
- Eski interval temizlenir.
- Eski click listener temizlenir.
- Ayni id ile birden fazla widget varsa fazlasi silinir.
- `daily-matches-live-bridge.js` cache-version tarafindan yuklenmiyor.

## Net Karar

Repo kaynak testine gore tek bulten full-bulletin bosken `Canli mac akisi` yedeginden dolacak sekilde ayarlandi.

## Commit

- Kaynak test raporu: `8de45f1b299ca7f2de6a235bf5645eb909f0c0a8`

## Sonraki Asama

Canli tarayici tarafinda Ctrl+F5 sonrasi tek bulten gorunumu kontrol edilecek. Bulten basliginda kaynak `Canli mac akisi` yazarsa fallback calisiyor demektir.
