# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır. Yeni sayfaya/sohbete geçildiğinde buradan devam edilir.

---

## 0. YENİ SAYFADA MUTLAKA OKUNACAK DEVAM DOSYASI

**26.06.2026 son çalışma özeti ayrı dosyaya kaydedildi. Yeni sohbette önce şu dosya okunacak:**

`MEGA_HAFIZA_KAYITLAR/2026-06-26_yeni_sayfa_devam_ozeti.md`

Bu dosyada bu sayfada yapılan bütün işler kayıtlıdır:

- Canlı veri akışı ve Actions zinciri
- 5 JSON kontrolü
- `sync-analysis-results.js` analiz sonuç köprüsü
- `enrich-fixture-metrics.js` ham maç metrik zenginleştirme
- Kupon Merkezi yedek veri akışı
- Özel Analiz maç listesi kart düzeni
- Ana widgetlara buton ekleme devam işi

**Yeni sayfada ilk iş:** ana widgetların yanına görünür butonları ekleyip canlıda kontrol etmek.

---

## 1. ESKİ ÖNEMLİ NOTLAR

**Maç akışı aktiftir.** Site `data/fixtures.json` dosyasından günlük maçları çekip Günlük Maç Bülteni / Bugünün Maçları alanında gösterebiliyor.

**Kupon Merkezi kart akışı güncellendi.** Kartlar boş kalmasın diye `data/daily-coupons.json` içine düşük puanlı adaylar da kullanıcı tercihine bırakılacak şekilde yazıldı. Güncel çalışma kaydı: `MEGA_HAFIZA_KAYITLAR/2026-06-22_kupon_merkezi_kart_akisi_kaydi.md`.

**Kurucu erişimi ve ziyaretçi kilidi netleştirildi.** Özel analiz / kupon detay alanları normal ziyaretçiye kapalı kalacak; kurucu erişimi public repo içinde açık kodla tutulmayacak. Güncel çalışma kaydı: `MEGA_HAFIZA_KAYITLAR/2026-06-22_kurucu_erisim_ve_ziyaretci_kilidi_kaydi.md`.

**Gerçek analiz / kupon üretimi geliştirme aşamasındadır.** `data/analiz_sonuclari.json` aktif analiz üretmediğinde kartlar tamamen boş kalmayacak; düşük puanlı adaylar bilgi amaçlı gösterilecek ve son karar kullanıcıya bırakılacak.

Öncelik sırası:

1. Yeni sayfa devam dosyası okunacak.
2. Ana widgetlara görünür buton eklenecek.
3. Kupon Merkezi canlıda kontrol edilecek.
4. Özel Analiz maç listesi canlıda kontrol edilecek.
5. Actions ve JSON üretimi kontrol edilecek.
6. Resmi kupon üretimi güçlendirilecek.

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
- Sonuçlar güncellenecek
- Seçim kullanıcıya ait
- Son karar kullanıcıya bırakılır

Kaçınılacak ifadeler:

- PRO robot
- demo mod
- uydurma analiz
- teknik robot katmanı
- veri olmadan seçim gösterilmez
- `market` kelimesi ziyaretçiye mümkün olduğunca gösterilmez; yerine `seçenek` kullanılır.
- `Widget` kelimesi ziyaretçiye mümkün olduğunca gösterilmez; yerine panel/merkez/alan dili kullanılır.

İlgili dosya:

- `visitor-language.js`
- `site-human-language.js`

Bu dosyalar ziyaretçi tarafında kalan teknik ifadeleri daha profesyonel dile çevirir.

---

## 4. Üst Menü, Logo, Giriş ve Üyelik Akışı

Üst menü sadeleştirildi ve daha premium hale getirildi.
