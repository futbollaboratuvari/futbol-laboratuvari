# 2026-06-27 Asama 3.12 Toparlama ve Kapanis

## Net Karar

Tek bulten tarafi kod olarak toparlandi. Bulten icin yeni widget, yeni bridge veya ikinci bulten eklenmeyecek.

Tek bulten motoru:

- `daily-matches-widget.js`

Veri sirasi:

1. `data/full-bulletin.json`
2. `data/live-matches.json`
3. `data/fixtures.json`

## Kod Tarafi

`daily-matches-widget.js` icinde:

- Singleton korumasi var.
- Onceki calisma varsa cleanup yapiliyor.
- Full bulletin bos ise live-matches yedek olarak kullaniliyor.
- Timer temizleniyor.
- Click listener temizleniyor.
- Detay paneli ayni bulten satiri altinda calisiyor.

`cache-version.js` icinde:

- Versiyon `20260627-single-bulletin-v2`
- `daily-matches-live-bridge.js` otomatik yukleme listesinden kaldirildi.

## Veri Durumu

`data/full-bulletin.json`:

- status waiting
- match_count 0
- matches bos

`data/live-matches.json`:

- status active
- total 147
- scheduled 147
- coupon_candidates 9

Beklenen bulten kaynagi:

- Canli mac akisi

## Deploy Durumu

Repo icinde Pages workflow var:

- `.github/workflows/deploy-pages.yml`

Workflow push main ve workflow_dispatch destekliyor. Pages izinleri ve deploy adimlari dosyada mevcut.

Fakat kontrol edilen commitlerde workflow run kaydi gorunmedi:

- `32587bfc81b1410b1398dc2823f500f59b4be8aa` -> workflow_runs bos
- `eef8aa2eec7e41e42ae397881af506abe8ee4a6d` -> workflow_runs bos

Vercel tarafinda build-rate-limit failure gorundu.

## Sonuc

Bulten kodu tarafi kapanis seviyesine geldi. Kalan sorun bulten kodu degil, canli deploy / GitHub Pages / Actions yansima ayaridir.

## Sonraki Tek Is

GitHub arayuzunde Settings -> Pages ve Actions -> General kontrol edilecek.

Canli test dosyalari:

- `/futbol-laboratuvari/pages-deploy-trigger.json`
- `/futbol-laboratuvari/pages-deploy-probe.html`

Bu dosyalar canlida gorunmeden bulten kodu daha fazla buyutulmayacak.

## Rapor

Toparlama raporu eklendi:

- `outputs/asama_3_12_toparlama_ve_kapanis_raporu.md`

Commit:

- `cc57af44ca6675b5e5ed78cb0411e090717e02d7`
