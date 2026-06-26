# 2026-06-27 Asama 3.10 Pages Workflow Run Kontrolu

## Amac

Deploy tetik dosyasi sonrasi GitHub Actions calisma kaydi gorunuyor mu kontrol etmek.

## Yapilan Islem

Yeni bulten, widget veya bridge eklenmedi. Sadece kontrol raporu eklendi:

- `outputs/pages_workflow_run_kontrolu.md`

## Kontrol Edilen Commitler

Deploy trigger commit:

- `32587bfc81b1410b1398dc2823f500f59b4be8aa`
- Sonuc: `workflow_runs: []`
- Status: Vercel failure, build-rate-limit

Mega hafiza commit:

- `eef8aa2eec7e41e42ae397881af506abe8ee4a6d`
- Sonuc: `workflow_runs: []`

## Mevcut Workflow

`.github/workflows/deploy-pages.yml` repo icinde var.

Ayar ozeti:

- push main
- workflow_dispatch
- pages write
- id-token write
- upload-pages-artifact
- deploy-pages

## Sonuc

Pages workflow dosyasi var; fakat kontrol edilen commitlerde workflow run kaydi gorunmedi.

Canli sayfa eski icerik gosteriyorsa sorun buyuk ihtimalle Pages/Actions yansima ayaridir.

## Korunan Kural

- `daily-matches-widget.js` degistirilmedi.
- `index.html` degistirilmedi.
- Yeni bulten eklenmedi.
- Yeni bridge eklenmedi.

## Sonraki Asama

GitHub arayuzunde Actions ve Pages ayari kontrol edilecek. Kod tarafinda bulten buyutulmayacak.
