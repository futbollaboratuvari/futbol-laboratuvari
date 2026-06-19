# Domain Hatasi Duzeltme Raporu

## Hedef

Tum sistem tek domaine hizalandi:

`futbollaboratuvari.eu.org`

## Yerel Proje Kontrolu

| Kontrol | Sonuc |
|---|---|
| Repository `CNAME` dosyasi var mi? | EVET |
| `CNAME` icerigi dogru mu? | EVET |
| Projede eski tireli domain referansi kaldi mi? | HAYIR |
| GitHub Pages custom domain icin hedef deger belli mi? | EVET |
| EU.org basvurusu icin hedef domain belli mi? | EVET |

## CNAME Icerigi

```text
futbollaboratuvari.eu.org
```

## Cloudflare'da Yapilacak Tek Dogru Kurulum

Cloudflare'da kullanilacak zone:

```text
futbollaboratuvari.eu.org
```

DNS kaydi:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `futbollaboratuvari.github.io` | DNS only / gri bulut |

Nameserverlar:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

## GitHub Pages Ayari

Custom Domain:

```text
futbollaboratuvari.eu.org
```

Yayinlanan branch'te `CNAME` dosyasi bulunmali ve sadece hedef domaini icermelidir.

## EU.org Basvurusu

Domain:

```text
futbollaboratuvari.eu.org
```

Nameserverlar:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

## Hatanin Sebebi

EU.org basvurusu hedef domain icin yapiliyor, ancak Cloudflare tarafinda farkli bir zone kullanildiginda verilen nameserverlar hedef domain icin authoritative cevap uretmez.

Bu durumda EU.org kontrolu `SOA` ve authoritative `NS` cevabi alamaz ve su hatalari verir:

- `Answer not authoritative`
- `SOA not authoritative`

## Kesin Duzeltme

1. Cloudflare'da yanlis/eski zone kullanilmayacak.
2. Cloudflare'da `futbollaboratuvari.eu.org` zone'u olusturulacak.
3. Cloudflare'in bu zone icin verdigi nameserverlar EU.org basvurusuna girilecek.
4. Nameserverlar hedef degerlerle eslesmeli:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

5. Cloudflare DNS kaydi root/apex icin `futbollaboratuvari.github.io` hedefine CNAME olarak eklenecek.
6. Proxy DNS only / gri bulut olacak.
7. GitHub Pages Custom Domain `futbollaboratuvari.eu.org` olacak.

## Sonuc

| Alan | Kullanilacak Deger |
|---|---|
| Cloudflare zone | `futbollaboratuvari.eu.org` |
| Cloudflare CNAME target | `futbollaboratuvari.github.io` |
| GitHub Pages custom domain | `futbollaboratuvari.eu.org` |
| Repository CNAME | `futbollaboratuvari.eu.org` |
| EU.org domain | `futbollaboratuvari.eu.org` |
| EU.org nameserver 1 | `etienne.ns.cloudflare.com` |
| EU.org nameserver 2 | `sreeni.ns.cloudflare.com` |

DOMAIN KARISIKLIGI PROJE DOSYALARINDA KALDIRILDI.

