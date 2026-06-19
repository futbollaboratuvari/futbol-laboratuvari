# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır.

Amaç: Sohbetlerde alınan kararlar, yapılan site/robot değişiklikleri, ödeme-üyelik planı, robot veri akışı ve gelecek görevler burada tutulur. Bu dosya proje deposunda ana hafıza deposu olarak kullanılacaktır.

---

## 1. Proje Kimliği

- Proje adı: Futbol Laboratuvarı
- GitHub repo: `futbollaboratuvari/futbol-laboratuvari`
- Ana branch: `main`
- GitHub Pages site: `https://futbollaboratuvari.github.io/futbol-laboratuvari/`
- Çalışma prensibi: Eski, sabit veya uydurma veri gösterilmez.
- Linkler GitHub Pages uyumlu ve relative kalacak.
- Repo, proje hafıza deposu olarak da kullanılacak.

---

## 2. Site Dili ve Ziyaretçi Kuralları

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

Kaçınılacak iç ifadeler:

- PRO robot
- demo mod
- uydurma analiz
- teknik robot katmanı
- veri olmadan seçim gösterilmez
- market kelimesi ziyaretçiye mümkün olduğunca gösterilmez; yerine seçenek kullanılır.

---

## 3. Günlük Maç Bülteni

Günlük maç bülteni `daily-matches-widget.js` ile çalışır.

Özellikler:

- `data/fixtures.json` dosyasını okur.
- Lig bazlı maç listesi oluşturur.
- Bayrak/lig ikonu gösterir.
- Takım logo alanı vardır; logo yoksa takım baş harfi rozet olarak görünür.
- Maç satırları sütun yapısındadır.
- Ana oran alanları görünür.
- Ekstra oranlar tıklanarak açılabilir.
- Mobilde yatay kaydırma desteklenir.

Ek detay paneli:

- `daily-toggle.js`
- Satıra tıklayınca Alt, Üst, KG Var, KG Yok gibi ekstra oranlar açılır.

---

## 4. Maç Sonuçları Paneli

Dosya: `match-results-widget.js`

Amaç:

- Sağ altta `🏁 Maç Sonuçları` butonu gösterir.
- O gün biten maçları listeler.
- Veri yoksa sonuç uydurmaz.
- Sonuç yoksa `Henüz biten maç yok.` gösterir.

---

## 5. Kupon Merkezi ve Günün Analiz Kuponları

Dosya: `coupon-design.js`

Amaç:

- Tekli, 2'li ve 3'lü kuponları modern kartlarla gösterir.
- Her kartta maç, seçim, güven, risk, oran ve kısa analiz notu yer alır.
- Veri yoksa sade hazırlık mesajı gösterilir.

Kaynak veri:

- `data/analiz_sonuclari.json`

Kural:

- Robot gerçek analiz üretmeden kupon gösterilmez.
- Demo/beta bekleme verisi kupon olarak yayınlanmaz.

---

## 6. Robot Beta Sürüm Akışı

Robot artık demo adıyla değil beta sürüm adıyla anılacak.

İlgili dosyalar:

- `bu-klas-r-i-in-basit/src/api_secrets.py`
- `bu-klas-r-i-in-basit/src/beta_modu.py`
- `bu-klas-r-i-in-basit/run_beta_robot.bat`

API secret önceliği:

1. `FOOTBALL_DATA_API_KEY`
2. `API_FOOTBALL_KEY`
3. `API_FOOTBALL_KEY2`
4. Beta Mode

Kural:

- API yoksa robot durmaz; beta bekleme raporu üretir.
- Gerçek canlı veri yoksa siteye kupon basılmaz.

---

## 7. Robot Kalıcı Maç Arşivi

Dosya: `data/robot_match_archive.json`

Amaç:

- Robot için özel kalıcı arşivdir.
- Ziyaretçiye normal sitede gösterilmez.
- Maçlar silinmeden birikir.
- Takım bazlı istatistik çıkarılır.

Güncelleme scripti:

- `scripts/update-match-archive.js`

Takım istatistikleri:

- maç sayısı
- biten maç sayısı
- galibiyet
- beraberlik
- mağlubiyet
- attığı gol
- yediği gol
- son 10 maç formu

Not:

- Repo public olduğu için dosyaya direkt link bilen teknik olarak erişebilir. Gerçek gizlilik için ileride private backend/database gerekir.

---

## 8. Premium Özel Maç Analizi Paneli

Dosya: `premium-analysis-panel.js`

Amaç:

- Projenin ana kilit premium sistemi.
- Üye maç listesinden karşılaşma seçer.
- İstediği seçeneği/marketi seçer.
- Robot için özel analiz isteği hazırlar.

Seçenekler:

- MS 1
- MS X
- MS 2
- 2.5 Alt
- 2.5 Üst
- KG Var
- KG Yok
- İY 1
- İY X
- İY 2

Beta erişim kodu:

- `FL-BETA`

Mevcut durum:

- Frontend beta panel hazır.
- Gerçek üyelik, ödeme ve analiz kuyruğu için backend gerekir.
- Bu panel projenin ana kilit taşıdır: ödeme yapan kullanıcı özel maç seçip seçeneğe göre robot analizi isteyecek.

---

## 9. Üyelik ve Ödeme Paneli

Dosyalar:

- `data/membership_plans.json`
- `membership-payment-panel.js`

Paketler:

- Başlangıç: 149 TL / Ay
- Pro Analiz: 299 TL / Ay
- VIP Kupon: 499 TL / Ay

Planlanan ödeme akışı:

1. Kullanıcı hesap oluşturur.
2. Paket seçer.
3. PayTR veya iyzico ödeme sayfasına yönlenir.
4. Ödeme başarılı olursa backend üyeliği aktif eder.
5. Premium özel maç analiz paneli açılır.

Kural:

- Kart bilgisi sitede tutulmayacak.
- Ödeme sağlayıcı alacak.
- Backend ödeme onayını alacak.
- Ücret PayTR/iyzico üzerinden işletme banka hesabına aktarılacak.
- GitHub Pages tek başına güvenli üyelik/ödeme backend'i değildir; gerçek ödeme sonrası üyelik açma için backend gerekir.

---

## 10. Şirket ve PayTR Hazırlığı

PayTR için planlanan süreç:

- Önce şahıs şirketi açılacak.
- Vergi levhası hazırlanacak.
- Banka hesabı/IBAN belirlenecek.
- Siteye gerekli yasal sayfalar eklenecek:
  - KVKK
  - Gizlilik Politikası
  - Kullanım Şartları
  - İade/İptal Politikası
  - Mesafeli Satış Sözleşmesi

PayTR başvuru açıklaması:

`Futbol Laboratuvarı, futbol maçları için veri destekli analiz, kupon takibi, maç bülteni ve üyeye özel maç analiz paneli sunan dijital abonelik platformudur. Kullanıcılar aylık üyelik paketi satın alarak özel analiz paneline erişir.`

Son karar:

- Şahıs şirketi açma süreci ayrı sohbette takip edilecek.
- PayTR başvurusu için şirket, banka hesabı, yasal metinler ve site açıklaması hazırlanacak.

---

## 11. GitHub / Site Çalışma Notları

Repo erişimi:

- `futbollaboratuvari/futbol-laboratuvari`
- Yetki: push/admin erişimi mevcut.

Ana site:

- `https://futbollaboratuvari.github.io/futbol-laboratuvari/`

Kurallar:

- `main` branch üzerinde çalışılır.
- Commit mesajları kısa ve açıklayıcı olur.
- GitHub Pages relative link uyumu korunur.
- Fake veri, eski sabit veri ve uydurma başarı oranı gösterilmez.

Yeni sohbetlerde GitHub erişimi için kullanılacak ifade:

`GitHub hesabım bağlı. Futbol Laboratuvarı web sitesi repo adresim: futbollaboratuvari/futbol-laboratuvari. Bu repoya erişip dosyaları incele, gerekli düzenlemeleri yap, commit/push işlemlerini mümkünse GitHub üzerinden uygula.`

---

## 12. Son Yapılan Büyük İşler

- Günlük maç bülteni lig bazlı tasarlandı.
- Oran ve detay açılır panel eklendi.
- Maç sonuçları ikon paneli eklendi.
- Günün analiz kuponları kart tasarımı eklendi.
- Robot beta sürüm moduna geçirildi.
- Robot kalıcı maç arşivi kuruldu.
- Premium özel maç analiz paneli eklendi.
- Üyelik ve ödeme paneli eklendi.
- PayTR/şahıs şirketi süreci için karar verildi.
- `MEGA_HAFIZA.md` proje hafıza deposu olarak oluşturuldu.

---

## 13. Sonraki Görevler

1. Şahıs şirketi açma sürecini tamamla.
2. PayTR başvurusuna hazırlan.
3. Siteye KVKK, gizlilik, iade/iptal, kullanım şartları ve mesafeli satış sayfaları ekle.
4. Üyelik backend altyapısını seç:
   - Supabase
   - Firebase
   - Vercel/Netlify function
   - küçük VPS/backend
5. Ödeme başarılı olunca premium erişimi otomatik aç.
6. Özel maç analiz isteklerini backend kuyruğuna gönder.
7. Robotun bu istekleri okuyup özel analiz üretmesini sağla.
8. Robot arşivini otomatik workflow içine bağla.
9. PayTR başvurusu öncesi sitedeki üyelik/ödeme alanını yasal metinlerle güçlendir.

---

## 14. Hafıza Kullanım Kuralı

Bu dosya proje hafıza deposudur.

Sohbet sonunda kullanıcı `hafızaya kaydet`, `mega hafızaya işle`, `hafıza deposunu güncelle` veya benzer bir komut verdiğinde bu dosya güncellenecek.

Otomatik sohbet sonu algılama garanti değildir; kullanıcı komut verdiğinde güncelleme yapılır.

---

## 15. Son Hafıza Kaydı

Bu kayıt, `hafızaya kaydet` komutuyla güncellendi.

Özet:

- Kullanıcı, repo içinde kalıcı hafıza deposu istedi.
- `MEGA_HAFIZA.md` dosyası oluşturuldu ve proje hafıza deposu olarak belirlendi.
- Bu dosya sohbetlerde alınan kararların, commitlerin, site/robot akışlarının ve ödeme/üyelik planlarının kayıt yeri olacak.
- Kullanıcı `hafızaya kaydet` veya benzer komut verdiğinde bu dosya güncellenecek.
- Son odak: Şahıs şirketi açma süreci, PayTR başvurusu, üyelik/ödeme backend altyapısı ve premium özel maç analiz panelini gerçek ödeme sistemiyle bağlama.
