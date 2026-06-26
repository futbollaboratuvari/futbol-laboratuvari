# GitHub Pages Deploy Probe Raporu

## Tarih

2026-06-27

## Asama

Asama 3.8 — Deploy yansima testi icin probe dosyasi

## Amac

Canli GitHub Pages sayfasinin repo main uzerindeki yeni commitleri alip almadigini test etmek.

## Yapilan Islem

Yeni bulten, yeni widget veya yeni bridge eklenmedi.

Root seviyesine sadece yansima kontrol dosyasi eklendi:

- `pages-deploy-probe.html`

## Probe Marker

Dosya icindeki kontrol isareti:

- `deploy-probe-20260627-single-bulletin-v2`

## Commit

- `18fe36ad03f366490947ab7418a8e0e5fb0d8de6`

## Status Kontrolu

Commit status kontrolunde Vercel yine failure donuyor.

Gorunen sebep:

- `build-rate-limit`

Bu Vercel limit problemidir; GitHub Pages yansimasinin kendisini tek basina kanitlamaz.

## Beklenen Manuel Kontrol

Tarayicida su dosya acilirsa GitHub Pages yeni commitleri aliyordur:

- `/futbol-laboratuvari/pages-deploy-probe.html`

Sayfada su marker gorunmeli:

- `deploy-probe-20260627-single-bulletin-v2`

## Karar

Marker canli sayfada gorunurse deploy yansimasi calisiyor demektir.
Marker gorunmezse GitHub Pages eski deploy veya farkli kaynak sunuyor demektir.
