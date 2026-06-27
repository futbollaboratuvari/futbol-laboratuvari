# Pages Actions Kaynak Kontrol Raporu

## Tarih

2026-06-27

## Asama

Asama 3.11 - Pages kaynak kontrolu

## Amac

Canli sayfanin neden repo main ile ayni gorunmedigini bulten koduna dokunmadan incelemek.

## Kontroller

### Repo kullanicisi ve yetki

Aktif GitHub kullanicisi:

- `futbollaboratuvari`

Repo yetkisi:

- `admin`

### Workflow dosyasi

Repo icinde su dosya var:

- `.github/workflows/deploy-pages.yml`

Dosya ozeti:

- main push tetigi var
- workflow_dispatch var
- Pages deploy adimlari var
- root klasor `.` deploy artifact olarak yukleniyor

### Workflow run sonucu

Kontrol edilen commitlerde calisma kaydi gorunmedi:

- `32587bfc81b1410b1398dc2823f500f59b4be8aa` -> `workflow_runs: []`
- `eef8aa2eec7e41e42ae397881af506abe8ee4a6d` -> `workflow_runs: []`

### Vercel status

Vercel status failure donuyor:

- `build-rate-limit`

## Sonuc

Repo yazma yetkisi var ve deploy workflow dosyasi mevcut. Buna ragmen kontrol edilen commitlerde workflow run kaydi gorunmuyor.

Canli sayfa eski icerik gosteriyorsa sorun bulten kodu degil, Pages veya deploy yansima ayaridir.

## Yapilmayanlar

- `daily-matches-widget.js` degistirilmedi.
- `index.html` degistirilmedi.
- Yeni bulten eklenmedi.
- Yeni bridge eklenmedi.

## Sonraki Is

GitHub arayuzunde repo Settings -> Pages ve repo Actions bolumleri kontrol edilmeli. Kod tarafinda bulten buyutulmayacak.
