# 2026-06-27 Asama 3.1 Tek Bulten Motoru Cakisma Temizligi

## Kullanici Uyarisi

Kullanici Ctrl+F5 sonrasi bultende ust uste ezilme oldugunu soyledi. Sebep: eski bulten sistemi varken yeni bridge dosyalari ayni alana tekrar mudahale ediyordu.

## Karar

Bundan sonra frontend tarafinda yeni bulten widget'i eklemek yerine mevcut bulten dosyasi guncellenecek.

Tek bulten motoru:

- `daily-matches-widget.js`

Ana veri kaynagi:

- `data/full-bulletin.json`

Yedek veri kaynaklari:

- `data/live-matches.json`
- `data/fixtures.json`

## Yapilan Temizlik

`cache-version.js` icinden cakisan bridge yuklemesi kaldirildi:

- `daily-matches-live-bridge.js`

Bu dosya silinmedi, ama artik otomatik yuklenmiyor. Boylece ayni `daily-matches-widget` alanini iki scriptin doldurmasi engellendi.

## Yapilan Guncelleme

`daily-matches-widget.js` mevcut dosya olarak guncellendi.

Yeni davranis:

1. Once `data/full-bulletin.json` okur.
2. Veri yoksa `data/live-matches.json` okur.
3. O da yoksa `data/fixtures.json` okur.
4. Sadece bugunun maclari ve yarin 08:00 oncesi erken saat maclarini bulten penceresine alir.
5. Eski veri uydurmaz.
6. Tek renderer olarak ayni bulten alanini doldurur.

## Guvenlik

- `index.html` degistirilmedi.
- Yeni frontend widget eklenmedi.
- Cakisan bridge devreden cikarildi.
- Mevcut bulten dosyasi icinden ilerleme baslatildi.

## Commitler

- Bridge yuklemesi kaldirildi: `f13a2e4793eb67f16691dff44f06981d73b1b076`
- Mevcut bulten dosyasi tek motor olarak guncellendi: `a045ce12950c926afdc737e4aa3f308cec773218`

## Bundan Sonraki Kural

Bulten arayuzu icin yeni dosya eklenmeyecek. Gerekli degisiklikler once `daily-matches-widget.js` icinden yapilacak. Canli bolum ayri olacaksa mevcut sayfa yapisinda net ve tek bir alana baglanacak, bultenin ustune binmeyecek.
