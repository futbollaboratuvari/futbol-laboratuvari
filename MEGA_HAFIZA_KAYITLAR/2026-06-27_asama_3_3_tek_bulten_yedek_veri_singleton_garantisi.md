# 2026-06-27 Asama 3.3 Tek Bulten Yedek Veri ve Singleton Garantisi

## Amac

Full bulletin henuz bosken sitenin tek bulten motorunun yedek veriden calismasini garanti altina almak ve Ctrl+F5 sonrasi ust uste bulten/olay dinleyici bindirme riskini azaltmak.

## Kullanici Kurali

- Sadece 1 tane bulten olacak.
- Yeni bulten/widget/bridge eklenmeyecek.
- Mevcut bulten dosyasi icinden guncelleme yapilacak.

## Guncellenen Dosya

- `daily-matches-widget.js`

## Yapilanlar

### 1. Singleton korumasi eklendi

`daily-matches-widget.js` basinda global singleton anahtari eklendi:

- `__flDailyMatchesWidgetSingleton`

Yeni script calistiginda onceki calisma varsa cleanup yapar. Bu, ayni bultenin ayni sayfada birden fazla interval veya click listener ile davranmasini azaltir.

### 2. Kaynak sirasi netlestirildi

Tek bulten motoru su sirayla veri arar:

1. `data/full-bulletin.json`
2. `data/live-matches.json`
3. `data/fixtures.json`

Full bulletin bos kalirsa live-matches yedek kaynak olarak kullanilir.

### 3. Bulten penceresi korunur

Tek bulten motoru sadece:

- Bugunun maclari
- Yarin 08:00 oncesi erken saat maclari

gosterir.

### 4. Tek widget guvencesi

`daily-matches-widget.js` icinde ayni id ile birden fazla `daily-matches-widget` elemani varsa fazlalari temizlenir.

### 5. Kaynak etiketi eklendi

Widget uzerinde su dataset alanlari islenir:

- `data-bulletin-source`
- `data-bulletin-count`

Bu sayede bultenin hangi kaynaktan doldugu gorulebilir.

### 6. Cache versiyonu arttirildi

`cache-version.js` versiyonu guncellendi:

- `20260627-single-bulletin-v2`

## Commitler

- Tek bulten yedek veri ve singleton korumasi: `da004c8a87a4ef137493c4a21daa262bf8b54a6a`
- Cache versiyonu v2: `e571a0e6ff256bb4c42325356519dca732f1a858`

## Guvenlik

- `index.html` degistirilmedi.
- Yeni frontend widget eklenmedi.
- Yeni bridge eklenmedi.
- Mevcut bulten dosyasi uzerinden gidildi.

## Sonraki Test

Siradaki asama:

- Site Ctrl+F5 sonrasi tek bulten gosteriyor mu?
- Bulten `full-bulletin` bosken `live-matches` kaynagindan doluyor mu?
- `data-bulletin-source` alaninda dogru kaynak gorunuyor mu?
