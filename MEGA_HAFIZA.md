# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır. Yeni sayfaya/sohbete geçildiğinde buradan devam edilir.

---

## 0. YENİ SAYFAYA GEÇİŞTE EN ÖNEMLİ NOT

**Maç akışı aktiftir.** Site `data/fixtures.json` dosyasından günlük maçları çekip Günlük Maç Bülteni / Bugünün Maçları alanında gösterebiliyor.

**Kupon Merkezi kart akışı güncellendi.** Kartlar boş kalmasın diye `data/daily-coupons.json` içine düşük puanlı adaylar da kullanıcı tercihine bırakılacak şekilde yazıldı. Güncel çalışma kaydı: `MEGA_HAFIZA_KAYITLAR/2026-06-22_kupon_merkezi_kart_akisi_kaydi.md`.

**Gerçek analiz / kupon üretimi geliştirme aşamasındadır.** `data/analiz_sonuclari.json` aktif analiz üretmediğinde kartlar tamamen boş kalmayacak; düşük puanlı adaylar bilgi amaçlı gösterilecek ve son karar kullanıcıya bırakılacak.

**Yeni sayfadaki ana teknik iş:** gerçek analiz puanlamasını güçlendirip `data/analiz_sonuclari.json` ve `data/daily-coupons.json` akışını daha sağlam hale getirmek.

Öncelik sırası:

1. Robot gerçek maç analizini üretecek.
2. Düşük puanlı adaylar da kullanıcı tercihine açık şekilde gösterilecek.
3. Analiz sonucu `data/analiz_sonuclari.json` içine doğru formatta yazılacak.
4. Kupon Merkezi bu gerçek veriden Dengeli / Yüksek Oranlı / Riskli kuponları gösterecek.
5. Premium Özel Analiz istekleri backend kuyruğuna alınacak.
6. Ödeme sonrası üyelik/premium erişim backend ve veritabanıyla açılacak.

---

## 1. Proje Kimliği

- Proje adı: Futbol Laboratuvarı
- GitHub repo: `futbollaboratuvari/futbol-laboratuvari`
- Ana branch: `main`
- GitHub Pages site: `https://futbollaboratuvari.github.io/futbol-laboratuvari/`
- Çalışma prensibi: eski, sabit veya uydurma veri gösterilmez.
- Linkler GitHub Pages uyumlu ve relative kalacak.
- Repo, proje hafıza deposu olarak da kullanılacak.

---

## 2. Ziyaretçi Dili ve Temizlik Kuralları

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

## 3. Üst Menü, Logo, Giriş ve Üyelik Akışı

Üst menü sadeleştirildi ve daha premium hale getirildi.
