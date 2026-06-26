# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır. Yeni sayfaya/sohbete geçildiğinde buradan devam edilir.

---

## 0. EN GÜNCEL DEVAM DOSYASI / 26.06.2026 12:16:09

**AdSense reklam bağlantısı ve politika sayfaları devam kaydı oluşturuldu. Yeni sohbette reklam/politika işine devam edilecekse önce şu dosya okunacak:**

`MEGA_HAFIZA_KAYITLAR/2026-06-26_12-16_adsense_reklam_politika_devam_kaydi.md`

Bu dosyada kayıtlı ana başlıklar:

- AdSense client kodunun `index.html` içine eklenmesi
- `ads.txt` dosyasının oluşturulması
- Otomatik reklamların kullanıcı tarafından açıldığının not edilmesi
- Admin paneline reklam koymama kararı
- Gizlilik politikası, kullanım şartları, çerez politikası, yasal uyarı, sorumlu kullanım ve iletişim sayfalarının sıradaki iş olarak işaretlenmesi

**Yeni sayfada ilk iş:** politika/gizlilik sayfalarını oluştur, footer linklerini bağla, sonra AdSense site durumunu kontrol et.

---

## 0.1. ÖNCEKİ YENİ SAYFA DEVAM DOSYASI

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
2. Politika/gizlilik/yasal sayfalar tamamlanacak.
3. Footer linkleri bağlanacak.
4. AdSense site durumu kontrol edilecek.
5. Ana widgetlara görünür buton eklenecek.
6. Kupon Merkezi canlıda kontrol edilecek.
7. Özel Analiz maç listesi canlıda kontrol edilecek.
8. Actions ve JSON üretimi kontrol edilecek.
9. Resmi kupon üretimi güçlendirilecek.

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

## 3. Ziyaretçi Dili ve Temizlik Kuralları

Ziyaretçiye teknik/robot iç dili gösterilmez.

Kullanılacak ziyaretçi dili:

- Günlük Maç Bülteni
- Günlük Maç Listesi
- Bugünün maçları
- Kupon Merkezi
- Günün Seçimi
- Maç Yorumları
- Maç Kayıtları
- Başarılar
- Performans
- Seçenek
- Güven
- Risk
- Durum
- Analiz hazırlanıyor
