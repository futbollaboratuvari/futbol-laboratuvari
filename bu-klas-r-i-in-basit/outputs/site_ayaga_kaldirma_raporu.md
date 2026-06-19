# Site Ayaga Kaldirma Raporu

Tarih: 2026-06-19

## Tek Domain

Kullanilacak tek domain:

```text
futbollaboratuvari.eu.org
```

## Yapilan Duzeltme

Repo kokundeki `CNAME` dosyasi tek domaine gore guncellendi:

```text
futbollaboratuvari.eu.org
```

## GitHub Pages

GitHub Pages yayini calisiyor.

Temel GitHub Pages hostu:

```text
https://futbollaboratuvari.github.io
```

## Ozel Domain

Ozel domain:

```text
https://futbollaboratuvari.eu.org
```

Mevcut durum:

- DNS cozumlenmiyor.
- EU.org tarafinda authoritative delegation henuz dogru gorunmuyor.
- Cloudflare zone veya EU.org nameserver delegasyonu kullanici tarafindan tamamlanmali.

## Kalan Isler

1. `CNAME` dosyasini yayinlanan GitHub branch'ine push et.
2. GitHub Pages custom domain alanini `futbollaboratuvari.eu.org` yap.
3. Cloudflare zone domainini `futbollaboratuvari.eu.org` olarak kullan.
4. EU.org nameserverlarini su iki Cloudflare NS olarak ayarla:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

5. Cloudflare'da apex CNAME ekle:

```text
Type: CNAME
Name: @
Target: futbollaboratuvari.github.io
Proxy: DNS only
```

## Final

GITHUB PAGES: CALISIYOR

CNAME DOSYASI: HAZIR

CNAME PUSH: KULLANICI YAPACAK

CLOUDFLARE AYARI: KULLANICI YAPACAK

EU.ORG DURUMU: BEKLEMEDE

OZEL DOMAIN: CALISMIYOR
