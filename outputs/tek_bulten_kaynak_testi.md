# Tek Bulten Kaynak Testi

## Tarih

2026-06-27

## Test Amaci

Tek bulten sisteminin full-bulletin bosken live-matches yedek verisine dusebildigini kontrol etmek.

## Kontrol Edilen Kaynaklar

### 1. `data/full-bulletin.json`

Durum:

- `status`: waiting
- `match_count`: 0
- `matches`: bos

Sonuc: Ana full bulten kaynagi henuz veri uretmemis.

### 2. `data/live-matches.json`

Durum:

- `status`: active
- `counts.total`: 147
- `counts.scheduled`: 147

Sonuc: Yedek kaynak aktif ve bulteni doldurabilecek veri var.

### 3. `daily-matches-widget.js`

Kaynak sirasi:

1. `data/full-bulletin.json`
2. `data/live-matches.json`
3. `data/fixtures.json`

Sonuc: Full bulletin bos kalirsa tek bulten live-matches kaynagina dusecek.

### 4. Tek Bulten Guvenceleri

- Singleton korumasi var.
- Ayni id ile birden fazla bulten alani varsa fazlasi silinir.
- Eski interval ve click listener temizlenir.
- Yeni bridge veya ikinci bulten yok.

## Net Karar

Repo kaynak testine gore tek bulten mantigi dogru calisacak sekilde ayarlandi.

Full-bulletin bos oldugu icin bugunku gorunumun beklenen kaynagi:

- `Canli mac akisi`

## Not

Bu rapor repo dosyalari uzerinden yapilan kaynak testidir. Canli tarayici gorunumu ayrica Ctrl+F5 ile kontrol edilmelidir.
