# Pages Workflow Run Kontrolu

## Tarih

2026-06-27

## Asama

Asama 3.10 — Pages workflow run kontrolu

## Amac

Deploy tetik dosyasi eklendikten sonra GitHub Actions workflow calisma kaydi gorunuyor mu kontrol etmek.

## Kontrol Edilen Commitler

### 1. Deploy Trigger Commit

Commit:

- `32587bfc81b1410b1398dc2823f500f59b4be8aa`

Workflow run sonucu:

- `workflow_runs: []`

Status sonucu:

- `Vercel`: failure
- Sebep URL: `upgradeToPro=build-rate-limit`

### 2. Mega Hafiza Commit

Commit:

- `eef8aa2eec7e41e42ae397881af506abe8ee4a6d`

Workflow run sonucu:

- `workflow_runs: []`

## Mevcut Workflow Dosyasi

`.github/workflows/deploy-pages.yml` dosyasi repo icinde mevcut.

Workflow ayari:

- `push` -> `main`
- `workflow_dispatch`
- `pages: write`
- `id-token: write`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

## Sonuc

Repo tarafinda Pages workflow dosyasi var fakat kontrol edilen commitlerde workflow run kaydi gorunmedi.

Canli sayfa hala eski icerik gosteriyorsa muhtemel sorun:

1. GitHub Pages deploy workflow calismiyor olabilir.
2. Pages kaynagi farkli bir ayara bagli olabilir.
3. Workflow permissions/pages ayari GitHub arayuzunde kontrol gerektiriyor olabilir.
4. Vercel tarafindaki build-rate-limit ayri bir deploy kanalini bloke ediyor olabilir.

## Yapilmayanlar

- Bulten kodu degistirilmedi.
- Yeni widget eklenmedi.
- Yeni bridge eklenmedi.
- `index.html` degistirilmedi.

## Karar

Siradaki teknik islem GitHub arayuzunde Actions/Pages ayarinin kontrol edilmesidir. Kod tarafinda bulten buyutulmayacak.
