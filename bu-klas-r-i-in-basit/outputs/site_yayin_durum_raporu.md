# Site Yayin Durum Raporu

Tarih: 2026-06-19

## Tek Domain Karari

Bundan sonra Futbol Laboratuvari icin tek ozel domain:

```text
futbollaboratuvari.eu.org
```

## GitHub Pages Durumu

GitHub Pages yayini calisiyor.

Kontrol edilen temel yayin:

```text
https://futbollaboratuvari.github.io
```

CSS, JS ve gorsel dosyalar 200 donuyor.

## Domain Durumu

Ozel domain:

```text
https://futbollaboratuvari.eu.org
```

Mevcut durum:

- DNS cozumlenmiyor.
- NS kaydi gorunmuyor.
- SOA authoritative degil.
- A/CNAME kaydi gorunmuyor.

## DNS / Cloudflare

Cloudflare'da zone su domain icin olmali:

```text
futbollaboratuvari.eu.org
```

EU.org delegasyonunda girilecek nameserverlar:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

Cloudflare DNS kaydi:

```text
Type: CNAME
Name: @
Target: futbollaboratuvari.github.io
Proxy: DNS only
```

GitHub Pages custom domain:

```text
futbollaboratuvari.eu.org
```

## Sonuc

Sorun GitHub Pages yayini degil. Sorun EU.org delegasyonunun Cloudflare nameserverlarina authoritative olarak tamamlanmamis olmasi veya Cloudflare zone/DNS kaydinin dogru kurulmamis olmasidir.
