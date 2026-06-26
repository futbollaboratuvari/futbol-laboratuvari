# Futbol Laboratuvari Mega Hafiza Kaydi

Tarih: 2026-06-26
Konu: A8 aday havuzu, MS 1/X/2 secenekleri, workflow duzeltmeleri ve domain yonlendirme temizligi

## Ana ilke
Yeni sohbette kullanici site/repo/robot duzeltmesi isterse varsayilan cevap Codex'e ver demek olmayacak. Once dogrudan repo/GitHub kontrolu ve mumkunse dogrudan duzeltme denenecek.

## Repo ve linkler
Repo: futbollaboratuvari/futbol-laboratuvari
Ana GitHub Pages linki: https://futbollaboratuvari.github.io/futbol-laboratuvari/
Admin panel linki: https://futbollaboratuvari.github.io/futbol-laboratuvari/admin

## A8 aday havuzu tamamlanan mantik
A8 ile aday havuzu genisletildi.
Skor siniflari:
- 65 ve ustu: ana aday / kupon adayi olabilir.
- 40-64: on izleme / izleme havuzu.
- 40 alti: eleme.

Bu mantik robot-coupon-engine.js, export-high-value-json.js ve robot-exact-scoring.js tarafinda kontrol edildi.

## A8 secenekleri
Robot secenek listesinde artik su basliklar bulunuyor:
- MS 1
- MS X
- MS 2
- Ilk Yari KG Var
- Ilk Yari KG Yok
- Ikinci Yari KG Var
- Ikinci Yari KG Yok
- KG Var
- KG Yok
- 1.5 Ust
- 2.5 Ust
- 3.5 Ust
- Ev Sahibi Gol Atar
- Deplasman Gol Atar

## MS 1 / X / 2 islemi
Kullanici MS 1, MS X, MS 2 seceneklerinin on izleme havuzuna alinmasini ve uygun skor alirsa kupon adayi olabilmesini istedi.
Buna gore iki motor dosyasinda MS secenekleri eklendi:
- scripts/robot-coupon-engine.js
- scripts/robot-exact-scoring.js

Kontrol edilen sonuc:
robot-coupon-engine.js icinde marketRules basinda ms1, msx, ms2 var.
robot-exact-scoring.js icinde marketRules basinda ms1, msx, ms2 var.

## Olusan workflow/script temizligi
Ilk MS workflow denemelerinde YAML hatasi cikti. Sebep uzun PowerShell bloklarinin YAML tarafinda hata uretmesiydi.
Bozuk workflow dosyalari silindi:
- .github/workflows/a8-ms-coupon.yml
- .github/workflows/a8-ms-exact.yml

Yerine temiz Node tabanli yapi kuruldu:
- scripts/a8-ms-options-apply.js
- .github/workflows/a8-ms-apply.yml

A8 MS Apply workflow temiz YAML yapiya sahip. Node 20 kuruyor, scripts/a8-ms-options-apply.js scriptini calistiriyor, robot-coupon-engine.js ve robot-exact-scoring.js syntax kontrolu yapiyor, sonra degisiklik varsa commit/push yapiyor.

## Domain yonlendirme sorunu
Kullanici admin linkine tiklayinca futbollaboratuvari.org/admin adresine atildigini ve DNS_PROBE_FINISHED_NXDOMAIN hatasi aldigini gosterdi.
Sebep: repo kokunde CNAME dosyasi vardi ve icinde futbollaboratuvari.org yaziyordu.
Bu domain DNS'te aktif olmadigi icin GitHub Pages yonlendirmesi kiriliyordu.
CNAME dosyasi silindi.
Commit: d7b48387c54a4523fddbe55156ae626b185869d3
Bundan sonra panel GitHub Pages linkinden acilmali:
https://futbollaboratuvari.github.io/futbol-laboratuvari/admin

## Dikkat edilecek nokta
Tarayici hala .org adresine atarsa sebep buyuk ihtimalle Chrome cache veya GitHub Pages yayininin gecikmesidir. Gizli sekme veya elle github.io linki denenmeli.

## Aksiyon durumu
Kod tarafi tamam kabul edildi:
- A8 aday havuzu tamam.
- MS 1/X/2 secenek listesine eklendi.
- 40-64 on izleme, 65+ kupon adayi mantigi korunuyor.
- Yanlis CNAME domain yonlendirmesi kaldirildi.

Yeni sohbette devam edilecek ilk kontrol:
1. Admin panel github.io linkinden aciliyor mu?
2. Site hala .org adresine atiyor mu?
3. Robot yeni gunluk veri urettiginde watch_candidate_count ve coupon_candidate_count alanlari mantikli doluyor mu?
4. MS 1/X/2 secenekleri gunluk analiz ciktisinda ihtiyaca gore gorunuyor mu?

## Kullanici tercihi
Kullanici hizli, net ve dogrudan repo uzerinden islem istiyor. Gereksiz uzun teknik anlatim istemiyor. Hata varsa saklamadan net soylenmeli. Mumkunse asistan dogrudan duzeltmeli.
