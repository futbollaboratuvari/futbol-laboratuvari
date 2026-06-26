# 2026-06-27 Asama 2.1 Full Bulletin Test ve Yurutme Garantisi

## Amac

Asama 1 ve Asama 2 dosyalari kurulmustu. Testte `data/full-bulletin.json` dosyasinin henuz dolmadigi goruldu. Bu asamada hedef scriptin calistigini kanitlayacak kontrol ciktilari uretmek ve workflow'un kod degisikliginden sonra da otomatik calismasini saglamaktir.

## Eklenen Dosya

- `scripts/full-bulletin-output-check.js`

## Bu Script Ne Yapar

- `data/full-bulletin.json` dosyasini okur.
- Mac sayisini kontrol eder.
- 00:00-07:59 erken saat mac sayisini kontrol eder.
- Canli mac sayisini kontrol eder.
- Ilk 10 maci rapora yazar.
- `data/full-bulletin-health.json` dosyasini uretir.
- `outputs/full_bulletin_test_report.md` raporunu uretir.

## Paket Baglantisi

`package.json` icine su komut eklendi:

- `check:bulletin`

Ayrica su zincirlere kontrol scripti baglandi:

- `update:fixtures`
- `build:bulletin`
- `update:all`

## Workflow Baglantisi

`.github/workflows/auto-relaxed-analysis.yml` icine push tetigi eklendi.

Push tetigi sadece su dosyalar degistiginde calisir:

- `package.json`
- `scripts/**`
- `.github/workflows/auto-relaxed-analysis.yml`

Bu sayede bulten scriptinde veya paket zincirinde degisiklik yapildiginda Actions beklemeden test akisini baslatabilir.

## Guvenlik

- `index.html` degistirilmedi.
- Frontend dosyalari degistirilmedi.
- Yeni bulten paneli henuz siteye baglanmadi.
- Sadece test ve veri uretim zinciri guclendirildi.

## Commitler

- Test scripti eklendi: `6e1aa5d15c7cecb4a7e15811cef05a529ac4614d`
- Paket zincirine baglandi: `48449644bbcc1446649a9b628c133322b6398ed2`
- Workflow push tetigi eklendi: `cf59a7df1375704e7b272ae719fb8435433d0cf9`

## Sonraki Test

Actions calistiktan sonra su dosyalar kontrol edilecek:

- `data/full-bulletin.json`
- `data/full-bulletin-health.json`
- `outputs/full_bulletin_test_report.md`

Beklenen sonuc:

- `full-bulletin.json` dolmali.
- `full-bulletin-health.json` status `pass` olmali veya neden bekledigini yazmali.
- Test raporu ilk maclari tablo halinde gostermeli.
