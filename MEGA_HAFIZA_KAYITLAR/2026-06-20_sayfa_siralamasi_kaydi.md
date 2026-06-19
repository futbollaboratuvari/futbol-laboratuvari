# Mega Hafıza Ek Kaydı - Sayfa Sıralaması Kararı

Tarih: 2026-06-20

Bu kayıt Futbol Laboratuvarı web sitesinde yapılan sayfa sıralaması analizini, alınan kararları ve uygulanan teknik değişiklikleri kalıcı hafızaya eklemek için oluşturuldu.

---

## 1. Kullanıcının İsteği

Kullanıcı site içinde `Hakkımızda` bölümünün fazla yukarıda göründüğünü belirtti ve sayfa sıralamasının doğru yapılmasını istedi.

Kullanıcının temel isteği:

- `Hakkımızda` bölümü aşağı alınsın.
- Sayfa akışı daha profesyonel hale gelsin.
- Site önce maç/veri/kupon/analiz değerini göstersin.
- Marka ve kurucu bilgisi daha sonra gelsin.

---

## 2. Analiz Sonucu

Mevcut eski akışta `Hakkımızda / Cem Kaplanoğlu` bölümü, `Bugünün Maçları` bölümünden hemen sonra geliyordu.

Bu akış uygun görülmedi çünkü Futbol Laboratuvarı bir kişisel portfolyo değil, bir futbol analiz ve kupon platformudur.

Doğru kullanıcı yolculuğu:

1. Kullanıcı önce maç listesini ve oranları görmeli.
2. Sonra kupon merkezine geçmeli.
3. Sonra analiz ve yorumları okumalı.
4. Sonra üyelik/özel analiz akışını görmeli.
5. Sonra sonuç/performance ile güven kazanmalı.
6. En son sistem açıklaması, hakkımızda ve galeri alanlarına geçmeli.

---

## 3. Kalıcı Sayfa Sıralaması Kararı

Yeni sayfa sıralaması şu şekilde belirlendi:

1. Ana Sayfa / Hero
2. Günlük Maç Bülteni
3. Maç Bülteni Özeti
4. Kupon Merkezi
5. Günün Seçimi
6. Maç Yorumları
7. Üyelik Paketleri
8. Özel Analiz Paneli
9. Spor Toto
10. Sonuçlar
11. Performans
12. Maç Kayıtları
13. Yorum Köşesi
14. Nasıl Değerlendiriyoruz?
15. Hakkımızda
16. Galeri
17. Footer

---

## 4. Akış Mantığı

Yeni akışın mantığı:

**Veri → Kupon → Analiz → Üyelik → Özel Analiz → Sonuç/Performans → Sistem Açıklaması → Hakkımızda → Galeri**

Bu kararın sebebi:

- Kullanıcı önce sitenin işlevini görmeli.
- Maç listesi ve oran tablosu platformun ana vitrini olmalı.
- Kupon Merkezi, maç verisinin hemen arkasından gelmeli.
- Üyelik, kullanıcı değer gördükten sonra sunulmalı.
- Hakkımızda güven destek alanıdır; ana ürünün önüne geçmemelidir.
- Galeri marka destek alanıdır; en altta kalmalıdır.

---

## 5. Uygulanan Teknik Çözüm

Yeni dosya eklendi:

- `section-order.js`

Bu dosya, sayfa açıldıktan sonra ana bölümleri belirlenen sıraya göre yeniden dizer.

Sıralama dizisi:

- `platform`
- `daily-matches-widget`
- `yaklasan-maclar`
- `robot-analizleri`
- `guclu-tahmin`
- `son-analizler`
- `membership-payment-panel`
- `premium-analysis-panel`
- `spor-toto-performansi`
- `sonuc-arsivi`
- `basari-takip`
- `analiz-veritabani`
- `yorum-kosesi`
- `analiz-modulleri`
- `kurucu`
- `medya-galerisi`

---

## 6. Dinamik Panel Sebebiyle Ek Koruma

Bazı bölümler HTML içinde sabit değildir; JavaScript ile sonradan eklenir.

Özellikle:

- `daily-matches-widget`
- `membership-payment-panel`
- `premium-analysis-panel`

Bu yüzden `section-order.js` sadece bir kez değil, yükleme sonrası üç defa çalışır:

- 400 ms
- 1400 ms
- 3200 ms

Böylece geç oluşan dinamik paneller de doğru sıraya yerleşir.

---

## 7. Siteye Bağlama

`section-order.js`, `nav-routing.js` içine eklendi.

Böylece site yüklendiğinde bölüm sıralama sistemi otomatik çalışır.

İlgili dosyalar:

- `section-order.js`
- `nav-routing.js`

İlgili commitler:

- `ed41051bd61d044ac875c885c7c2881b2541a5bd`
- `db68370358d1eccb1ba363ab936d2fa01cae10ab`

---

## 8. Kalıcı Kural

Bundan sonra sayfa sıralaması değiştirilirken şu kural korunacak:

- Üstte ürün ve veri değeri gösterilecek.
- Maç bülteni ve kupon merkezi yukarıda kalacak.
- Üyelik, kullanıcı sistem değerini gördükten sonra sunulacak.
- Sonuçlar ve performans güven kanıtı olarak orta-alt bölümde olacak.
- Sistem açıklaması, Hakkımızda ve Galeri sayfanın alt tarafında kalacak.

Özellikle:

- `Hakkımızda` tekrar üst bölümlere alınmayacak.
- `Galeri` üst akışı bölmeyecek.
- Site akışı kişisel portfolyo gibi değil, futbol analiz platformu gibi kalacak.

---

## 9. Son Durum

Sayfa sıralaması uygulanmıştır.

GitHub Pages güncellendikten sonra site Ctrl + F5 ile yenilenmelidir.
