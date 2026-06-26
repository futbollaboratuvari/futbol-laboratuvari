# 2026-06-27 Asama 2 Full Bulletin Script ve Baglanti

## Is

Tam iddaa bulteni uretmek icin yeni script eklendi ve paket zincirine baglandi.

## Eklenen Script

- `scripts/build-full-bulletin.js`

## Scriptin Gorevi

- Mackolik iddaa programini okumayi dener.
- Yerel kaynaklari yedek olarak kullanir:
  - `data/fixtures.json`
  - `data/live-matches.json`
  - `data/spor_toto_bulteni.json`
  - `data/two-day-bulletin.json`
- Bugunun tum maclarini bultene alir.
- Yarin 08:00 oncesindeki erken saat maclarini da bulten penceresine ekler.
- Maclari tarih, saat, lig ve takim sirasi ile siralar.
- Ciktiyi `data/full-bulletin.json` dosyasina yazar.

## Paket Baglantisi

`package.json` icine yeni komut eklendi:

- `build:bulletin`

Ayrica su zincirlere baglandi:

- `update:fixtures`
- `update:all`

## Guvenlik

`index.html` degistirilmedi. Mevcut frontend dosyalari degistirilmedi. Yeni script, mevcut sistemi bozmadan ayri bulten dosyasi uretir.

## Commitler

- Script eklendi: `29b6090e89854302865a746137727cd12187fc94`
- Paket zinciri baglandi: `709f5312e6940a93b6e85bc0ee0526029e2b8db6`
- Build komutu korunarak paket duzeltildi: `1f3d669b7ec223d517e2e92c0210243b56e59f0b`

## Sonraki Adim

Actions calistiktan sonra `data/full-bulletin.json` kontrol edilecek. Dosya dolarsa Asama 3 ve Asama 4'e gecilecek.
