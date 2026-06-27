# 2026-06-27 Detay Market Akisi Kaydi

## Konu

Bultende Detay butonuna basinca detay marketlerin cikmamasi kontrol edildi.

## Tespit

- Ana detay fonksiyonu sadece sinirli marketleri basiyordu.
- Veri akisinda `available_odds` icinde daha fazla market bulunabiliyor.
- `full-bulletin.json` henuz waiting/bos durumda.
- `fixtures.json` ve `robot-analysis.json` bos gorundu.
- Canli veri agirlikli kaynak `data/live-matches.json`.

## Yapilan Islem

Yeni kod dosyasi acilmadi. Dosya silinmedi.

Mevcut dosyalar guncellendi:

1. `cache-version.js`
   - Surum: `20260627-pro122-unified-v3`
   - Detay market onarim mantigi eklendi.
   - Detay tiklamasinda `window.__dailyMatchesData` icinden mac bulunur.
   - Su kaynaklardan market toplanir:
     - `available_odds`
     - `raw_market_guess_odds`
     - `odds`
     - `oranlar`
     - `detay_oranlar`
     - `detailOdds`
     - macin kendi alanlari
     - `raw_market_blocks`

2. `index.html`
   - Surum: `20260627-pro122-unified-v3`
   - `daily-matches-widget.js` ve `cache-version.js` ayni surume baglandi.

## Commitler

- `cache-version.js`: `bdc878ded0dc5ce98be954918cc01f905389aa8c`
- `index.html`: `fb5de763ee180c28900a4b6b05cd321f3fbadb82`

## Sonuc

Detay marketlerin cikmama sebebi veri akisi ile gosterim alaninin tam baglanmamasiydi. Mevcut dosyalar icinde onarim yapildi. Veri dosyasinda null olan marketler yine gosterilmez; veri varsa detay alaninda gorunmesi gerekir.
