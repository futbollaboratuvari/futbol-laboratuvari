# Futbol Laboratuvari Domain Yapilandirma Raporu

## 1. Hedef Domain

Tek kullanilacak domain:

`futbollaboratuvari.eu.org`

## 2. Bulunan Domainler

Proje dosyalari tarandi. Aktif kalan domain referansi sadece hedef domaindir:

| Domain | Durum |
|---|---|
| `futbollaboratuvari.eu.org` | Dogru hedef domain |

## 3. Hatali Domainler

Eski tireli ozel domain referanslari ve eski GitHub Pages proje yolu referanslari temizlendi.

Son tarama sonucu:

| Referans tipi | Durum |
|---|---|
| Eski tireli ozel domain | Aktif referans kalmadi |
| Eski GitHub Pages proje yolu | Aktif referans kalmadi |

## 4. Duzeltilen Dosyalar

| Dosya | Islem |
|---|---|
| `CNAME` | Icerik tek satir hedef domain olacak sekilde duzeltildi |
| `outputs/site_yayin_kontrol_raporu.md` | Domain referanslari hedef domain standardina hizalandi |
| `outputs/site_yayin_durum_raporu.md` | Domain referanslari hedef domain standardina hizalandi |
| `outputs/site_ayaga_kaldirma_raporu.md` | Domain referanslari hedef domain standardina hizalandi |

## 5. CNAME Durumu

Repository kokundeki `CNAME` dosyasi mevcut.

Beklenen icerik:

```text
futbollaboratuvari.eu.org
```

Mevcut yerel icerik bu degerle uyumludur.

## 6. DNS Denetimi

Yapilan DNS kontrollerinde hedef domain icin public DNS uzerinden `NS`, `SOA` ve `CNAME` cevabi alinamadi.

Sonuc:

| Kontrol | Sonuc |
|---|---|
| Public NS sorgusu | Domain bulunamadi |
| Public SOA sorgusu | Domain bulunamadi |
| Public CNAME sorgusu | Domain bulunamadi |
| Cloudflare `etienne` NS uzerinden SOA | Domain bulunamadi |
| Cloudflare `etienne` NS uzerinden NS | Domain bulunamadi |
| Cloudflare `sreeni` NS uzerinden SOA | Domain bulunamadi |
| Cloudflare `sreeni` NS uzerinden NS | Domain bulunamadi |

Bu sonuc, hedef domain icin Cloudflare nameserverlarinin henuz authoritative cevap vermedigini gosterir.

## 7. Cloudflare Yapilandirmasi

Cloudflare'da kullanilmasi gereken zone:

`futbollaboratuvari.eu.org`

Cloudflare tarafinda bulunmasi gereken DNS kaydi:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `futbollaboratuvari.github.io` | DNS only / gri bulut |

Cloudflare tarafinda atanmasi gereken nameserverlar:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

Not: Cloudflare apex/root CNAME icin flattening kullanabilir. Proxy turuncu bulut olmamali; GitHub Pages ozel domain dogrulamasi icin DNS only tercih edilmeli.

## 8. GitHub Pages Yapilandirmasi

GitHub Pages Custom domain alani su degerde olmali:

`futbollaboratuvari.eu.org`

GitHub Pages yayin branch'inde `CNAME` dosyasi bulunmali ve sadece hedef domaini icermeli.

Bu ortamda GitHub Pages ayari uzaktan degistirilemedi; cunku mevcut klasor git repository degil, `git` ve `gh` komutlari kullanilabilir degil.

## 9. EU.org Yapilandirmasi

EU.org basvurusunda kullanilmasi gereken alan adi:

`futbollaboratuvari.eu.org`

EU.org nameserver alanlarina girilmesi gereken degerler:

```text
etienne.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

EU.org tarafinda delegasyon aktif olduktan sonra public DNS sorgularinda hedef domain icin `NS` ve `SOA` cevabi donmelidir.

## 10. 24 Adet Not Authoritative Hatasinin Kesin Sebebi

Mevcut DNS sorgularina gore hedef domain icin public DNS'te aktif delegasyon yoktur ve verilen Cloudflare nameserverlari hedef domain icin authoritative `SOA` veya `NS` cevabi donmemektedir.

Bu nedenle EU.org dogrulama sistemi nameserverlardan yetkili cevap alamiyor ve su hatalari uretiyor:

- `Answer not authoritative`
- `SOA not authoritative`

Kesin teknik sebep:

EU.org tarafinda hedef domain delegasyonu Cloudflare nameserverlarina henuz aktif sekilde baglanmamis veya Cloudflare tarafinda hedef domain zone'u authoritative hale gelmemistir.

## 11. Gerekli Manuel Islemler

1. Cloudflare'da zone adinin `futbollaboratuvari.eu.org` oldugunu kontrol et.
2. Cloudflare'in verdigi nameserverlarin tam olarak `etienne.ns.cloudflare.com` ve `sreeni.ns.cloudflare.com` oldugunu dogrula.
3. EU.org basvurusunda nameserverlari bu iki deger olarak gir.
4. Cloudflare DNS kaydinda root/apex icin CNAME hedefini `futbollaboratuvari.github.io` yap.
5. Proxy ayarini DNS only / gri bulut yap.
6. GitHub Pages Custom domain alanini `futbollaboratuvari.eu.org` yap.
7. GitHub repository yayin branch'ine `CNAME` dosyasini ekle.
8. DNS yayilimi tamamlandiktan sonra GitHub Pages'te HTTPS'i etkinlestir.

## 12. Net Sonuc

| Soru | Cevap |
|---|---|
| Cloudflare'da hangi domain olmali? | `futbollaboratuvari.eu.org` |
| GitHub Pages'te hangi domain olmali? | `futbollaboratuvari.eu.org` |
| EU.org basvurusunda hangi domain kullanilmali? | `futbollaboratuvari.eu.org` |
| Yerel CNAME dogru mu? | EVET |
| Eski domain referanslari temizlendi mi? | EVET |
| DNS authoritative durumda mi? | HAYIR |
| Sorun kod/proje dosyasi kaynakli mi? | HAYIR |
| Kalan asil sorun nerede? | EU.org delegasyonu ve Cloudflare authoritative zone tarafinda |

