# 2026-06-27 Asama 3.9 Pages Deploy Tetikleme

## Amac

Canli GitHub Pages sayfasinin repo main uzerindeki guncel tek bulten dosyalarini yayinlamasi icin mevcut Pages workflow'un push ile tetiklenmesini saglamak.

## Yapilan Islem

Yeni bulten, yeni widget veya yeni bridge eklenmedi.

Root seviyeye deploy tetik ve kontrol dosyasi eklendi:

- `pages-deploy-trigger.json`

Rapor dosyasi eklendi:

- `outputs/pages_deploy_trigger_raporu.md`

## Marker

`pages-deploy-trigger.json` icindeki kontrol isareti:

- `pages-deploy-trigger-20260627-single-bulletin-v3`

## Mevcut Pages Workflow

`.github/workflows/deploy-pages.yml` dosyasi mevcuttur.

Workflow davranisi:

- `push` ile `main` branch tetiklenir.
- `workflow_dispatch` vardir.
- `pages: write` ve `id-token: write` izinleri vardir.
- `actions/upload-pages-artifact@v3` root `.` yolunu yukler.
- `actions/deploy-pages@v4` GitHub Pages deploy yapar.

## Commitler

- Trigger dosyasi: `32587bfc81b1410b1398dc2823f500f59b4be8aa`
- Trigger raporu: `6f5eab677b1839f841f07f68918e8d3b5f3a87ce`

## Guvenlik

- `daily-matches-widget.js` degistirilmedi.
- `index.html` degistirilmedi.
- Yeni bulten eklenmedi.
- Yeni bridge eklenmedi.
- Tek bulten kurali korundu.

## Sonraki Kontrol

Canli sitede su dosya kontrol edilecek:

- `/futbol-laboratuvari/pages-deploy-trigger.json`

Marker gorunurse Pages deploy guncel main dosyalarini yayinliyor demektir.
Marker gorunmezse Pages workflow ya calismamis ya da canli kaynak farkli demektir.
