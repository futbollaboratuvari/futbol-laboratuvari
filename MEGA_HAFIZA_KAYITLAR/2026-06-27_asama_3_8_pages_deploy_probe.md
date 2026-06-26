# 2026-06-27 Asama 3.8 Pages Deploy Probe

## Amac

Canli GitHub Pages yansimasinin repo main uzerindeki yeni commitleri alip almadigini test etmek.

## Yapilan Islem

Yeni bulten, yeni widget veya yeni bridge eklenmedi.

Root seviyesine sadece deploy test dosyasi eklendi:

- `pages-deploy-probe.html`

Ayrica rapor dosyasi eklendi:

- `outputs/pages_deploy_probe_raporu.md`

## Probe Marker

`pages-deploy-probe.html` icindeki kontrol isareti:

- `deploy-probe-20260627-single-bulletin-v2`

## Commitler

- Probe dosyasi: `18fe36ad03f366490947ab7418a8e0e5fb0d8de6`
- Probe raporu: `44fd6ce5ca5959df80a31b69c9f39d7e84b734fd`

## Status Bulgusu

Commit status kontrolunde Vercel failure donuyor.

Sebep:

- `build-rate-limit`

Bu Vercel limit problemidir. GitHub Pages kaynak yansimasini tek basina kanitlamaz.

## Guvenlik

- `daily-matches-widget.js` degistirilmedi.
- `index.html` degistirilmedi.
- Yeni bulten eklenmedi.
- Yeni bridge eklenmedi.
- Tek bulten kurali korundu.

## Sonraki Kontrol

Canli sitede su dosya kontrol edilecek:

- `/futbol-laboratuvari/pages-deploy-probe.html`

Marker gorunurse Pages yeni commitleri aliyor demektir.
Marker gorunmezse Pages eski deploy veya farkli kaynak sunuyor demektir.
