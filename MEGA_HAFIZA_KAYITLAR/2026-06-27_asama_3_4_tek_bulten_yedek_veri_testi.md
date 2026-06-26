# 2026-06-27 Asama 3.4 Tek Bulten Yedek Veri Testi

## Amac

Full bulletin bosken tek bultenin live-matches yedeginden dolmasini garanti altina almak.

## Yapilan Guncelleme

`daily-matches-widget.js` mevcut dosya olarak guncellendi.

Eklenen guvenceler:

1. Singleton korumasi aktif.
2. Eski interval temizlenir.
3. Eski click listener temizlenir.
4. Ayni id ile birden fazla bulten alani varsa fazlasi silinir.
5. Veri kaynagi sirasi korunur:
   - `data/full-bulletin.json`
   - `data/live-matches.json`
   - `data/fixtures.json`
6. Widget uzerine kaynak bilgisi islenir:
   - `data-bulletin-source`
   - `data-bulletin-count`

## Test Bulgulari

### Full Bulletin

`data/full-bulletin.json` henuz bos:

- `status`: waiting
- `match_count`: 0
- `matches`: []

### Yedek Veri

`data/live-matches.json` aktif:

- `status`: active
- `total`: 147
- `scheduled`: 147

Bu nedenle tek bulten motoru full-bulletin bos kaldiginda live-matches kaynagina dusecek.

## Cache

`cache-version.js` versiyonu guncellendi:

- `20260627-single-bulletin-v2`

## Commitler

- Tek bulten yedek veri ve singleton guncellemesi: `da004c8a87a4ef137493c4a21daa262bf8b54a6a`
- Cache v2 guncellemesi: `e571a0e6ff256bb4c42325356519dca732f1a858`

## Guvenlik

- Yeni bulten widget'i eklenmedi.
- Yeni bridge eklenmedi.
- `index.html` degistirilmedi.
- Tek bulten dosyasi icinden ilerleme kurali korundu.

## Sonraki Adim

Sitede Ctrl+F5 sonrasi tek bultenin gorunumu kontrol edilecek. Kaynak etiketi `Canli mac akisi` ise fallback dogru calisiyor demektir.
