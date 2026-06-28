# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır. Yeni sayfaya/sohbete geçildiğinde buradan devam edilir.

---

## 0. EN GÜNCEL DEVAM DOSYASI / 28.06.2026

**Başlayan maçların Futbol Bülteni'nden gizlenmesi ve bu sohbetteki çalışma kuralı ayrı dosyaya kaydedildi. Yeni sohbette bülten / başlayan maç / site kontrolü işine devam edilecekse önce şu dosya okunacak:**

`MEGA_HAFIZA_KAYITLAR/2026-06-28_baslayan_mac_bulten_filtresi_kaydi.md`

Bu dosyada kayıtlı ana başlıklar:

- Kullanıcının net kuralı: maç tarihi bugünse ve maç saati <= şu anki Türkiye saatiyse maç Futbol Bülteni'nde gösterilmeyecek
- Video gözlemi: 03:19'da 02:00, 02:30, 03:00 maçları bültende görünüyordu
- Doğru teknik işlem: sadece `daily-matches-widget.js` değiştirildi
- Commit: `ce93a7afa4467c1177370a32fca205289b3ca1ca`
- Kesin çalışma kuralı: branch reset, workflow, CNAME, domain, Pages ayarı, ekstra dosya ve kapsam dışı değişiklik yapılmayacak

**Yeni sayfada ilk iş:** önce bu kayıt okunacak; kullanıcı site kontrolü isterse sadece kontrol edilecek, dosya değiştirilmeyecek. Kod değişikliği istenirse sadece açıkça söylenen dosyaya ve kurala dokunulacak.

---

## 0.1. ÖNCEKİ EN GÜNCEL DEVAM DOSYASI / 26.06.2026 12:16:09

**AdSense reklam bağlantısı ve politika sayfaları devam kaydı oluşturuldu. Yeni sohbette reklam/politika işine devam edilecekse önce şu dosya okunacak:**

`MEGA_HAFIZA_KAYITLAR/2026-06-26_12-16_adsense_reklam_politika_devam_kaydi.md`

Bu dosyada kayıtlı ana başlıklar:

- AdSense client kodunun `index.html` içine eklenmesi
- `ads.txt` dosyasının oluşturulması
- Otomatik reklamların kullanıcı tarafından açıldığının not edilmesi
- Admin paneline reklam koymama kararı
- Gizlilik politikası, kullanım şartları, çerez politikası, yasal uyarı, sorumlu kullanım ve iletişim sayfalarının sıradaki iş olarak işaretlenmesi

**İlgili eski ilk iş:** politika/gizlilik sayfalarını oluştur, footer linklerini bağla, sonra AdSense site durumunu kontrol et.

---

## 0.2. ÖNCEKİ YENİ SAYFA DEVAM DOSYASI

**26.06.2026 önceki çalışma özeti ayrı dosyaya kaydedildi:**

`MEGA_HAFIZA_KAYITLAR/2026-06-26_yeni_sayfa_devam_ozeti.md`

Bu dosyada bu sayfada yapılan bütün işler kayıtlıdır:

- Canlı veri akışı ve Actions zinciri
- 5 JSON kontrolü
- `sync-analysis-results.js` analiz sonuç köprüsü
- `enrich-fixture-metrics.js` ham maç metrik zenginleştirme
- Kupon Merkezi yedek veri akışı
- Özel Analiz maç listesi kart düzeni
- Ana widgetlara buton ekleme devam işi

**İlgili eski ilk iş:** ana widgetların yanına görünür butonları ekleyip canlıda kontrol etmek.

---

## 1. ESKİ ÖNEMLİ NOTLAR

**Maç akışı aktiftir.** Site `data/fixtures.json` dosyasından günlük maçları çekip Günlük Maç Bülteni / Bugünün Maçları alanında gösterebiliyor.

**Kupon Merkezi kart akışı güncellendi.** Kartlar boş kalmasın diye `data/daily-coupons.json` içine düşük puanlı adaylar da kullanıcı tercihine bırakılacak şekilde yazıldı. Güncel çalışma kaydı: `MEGA_HAFIZA_KAYITLAR/2026-06-22_kupon_merkezi_kart_akisi_kaydi.md`.

**Kurucu erişimi ve ziyaretçi kilidi netleştirildi.** Özel analiz / kupon detay alanları normal ziyaretçiye kapalı kalacak; kurucu erişimi public repo içinde açık kodla tutulmayacak. Güncel çalışma kaydı: `MEGA_HAFIZA_KAYITLAR/2026-06-22_kurucu_erisim_ve_ziyaretci_kilidi_kaydi.md`.

**Gerçek analiz / kupon üretimi geliştirme aşamasındadır.** `data/analiz_sonuclari.json` aktif analiz üretmediğinde kartlar tamamen boş kalmayacak; düşük puanlı adaylar bilgi amaçlı gösterilecek ve son karar kullanıcıya bırakılacak.

Öncelik sırası:

1. En güncel devam dosyası okunacak.
2. Başlayan maçların Futbol Bülteni'nde görünmemesi kuralı korunacak.
3. Site kontrolü istenirse sadece kontrol edilecek; dosya değiştirilmeyecek.
4. Politika/gizlilik/yasal sayfalar tamamlanacak.
5. Footer linkleri bağlanacak.
6. AdSense site durumu kontrol edilecek.
7. Ana widgetlara görünür buton eklenecek.
8. Kupon Merkezi canlıda kontrol edilecek.
9. Özel Analiz maç listesi canlıda kontrol edilecek.
10. Actions ve JSON üretimi kontrol edilecek.
11. Resmi kupon üretimi güçlendirilecek.

---

## 2. Proje Kimliği

- Proje adı: Futbol Laboratuvarı
- GitHub repo: `futbollaboratuvari/futbol-laboratuvari`
- Ana branch: `main`
- Canlı domain: `https://futbollaboratuvari.org/`
- GitHub Pages site: `https://futbollaboratuvari.github.io/futbol-laboratuvari/`
- Çalışma prensibi: eski, sabit veya uydurma veri gösterilmez.
- Linkler GitHub Pages uyumlu ve relative kalacak.
- Repo, proje hafıza deposu olarak da kullanılacak.

---
