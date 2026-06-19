# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır. Yeni sayfaya/sohbete geçildiğinde buradan devam edilir.

---

## 0. YENİ SAYFAYA GEÇİŞTE EN ÖNEMLİ NOT

**Maç akışı aktiftir.** Site `data/fixtures.json` dosyasından günlük maçları çekip Günlük Maç Bülteni / Bugünün Maçları alanında gösterebiliyor.

**Gerçek analiz / kupon üretimi henüz aktif değildir.** `data/analiz_sonuclari.json` içinde `active_items` ve `completed_items` şu anda boştur. Bu yüzden site kupon veya analiz uydurmayacak; analiz gelene kadar hazırlık/bekleme görünümü gösterecek.

**Yeni sayfadaki ana teknik iş:** robotun gerçek analiz çıktısını güvenli şekilde `data/analiz_sonuclari.json` dosyasına yazdırmak ve bunu workflow/backend akışına bağlamak.

Öncelik sırası:

1. Robot gerçek maç analizini üretecek.
2. Analiz sonucu `data/analiz_sonuclari.json` içine doğru formatta yazılacak.
3. Kupon Merkezi bu gerçek veriden Tekli / 2'li / 3'lü kuponları gösterecek.
4. Premium Özel Analiz istekleri backend kuyruğuna alınacak.
5. Ödeme sonrası üyelik/premium erişim backend ve veritabanıyla açılacak.

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

Bu dosya ziyaretçi tarafında kalan teknik ifadeleri daha profesyonel dile çevirir.

---

## 3. Üst Menü, Logo, Giriş ve Üyelik Akışı

Üst menü sadeleştirildi ve daha premium hale getirildi.

Ana menü akışı:

- Futbol Laboratuvarı
  - Ana Sayfa
  - Bugünün Maçları
- Analiz & Üyelik
  - Kupon Merkezi
  - Üyelik
  - Özel Analiz
- Sonuçlar & Marka
  - Sonuçlar
  - Performans
  - Hakkımızda
  - Yönetim

Yeni üyelik/giriş akışı dosyası:

- `user-access-flow.js`

Üst erişim butonları:

- `👤 Giriş Yap`
- `🎁 1 Gün Dene`

Karar:

- Site üyelik olmadan gezilebilir.
- Ücretsiz deneme, paket satın alma ve özel analiz için üyelik bilgileri gerekir.
- Kullanıcı paket/deneme aşamasında hızlı üyelik akışına yönlendirilir.
- Menü ikonları daha anlaşılır ziyaretçi akışı için eklendi.

İkon sistemi:

- Ana Sayfa → 🏠
- Bugünün Maçları → ⚽
- Kupon Merkezi → 🎫
- Üyelik Paketleri → 🏆
- Özel Analiz → 🎯
- Sonuçlar → 🏁
- Performans → 📊
- Hakkımızda → FL
- Yönetim → ⚙️
- Giriş Yap → 👤
- 1 Gün Dene → 🎁

Üst menü çakışma düzeni:

- `nav-theme.css` güncellendi.
- Header artık flex-wrap kullanır.
- Geniş ekran, orta ekran ve mobil için ayrı genişlik ayarları vardır.
- Logo 1 tık büyütüldü.
- Marka alanı daha premium yapıldı.
- Üst üste binme riskini azaltmak için responsive yapı güçlendirildi.

---

## 4. Canlı Kontrol Merkezi

Dosya:

- `live-control-center.js`

Amaç:

- Site içinden maç akışı ve analiz durumunu tek bakışta göstermek.
- Maç listesi aktif mi kontrol etmek.
- Yayınlanabilir analiz/kupon var mı kontrol etmek.
- Üyelik/deneme akışının hazır olduğunu göstermek.

Gösterilen kartlar:

- Bugünün maç listesi
- Toplam maç kaydı
- Yayınlanabilir analiz / kupon
- Ücretsiz deneme ve üyelik akışı

Gerçek durum:

- `data/fixtures.json` içinde maç listesi vardır; maç akışı site tarafında aktiftir.
- `data/analiz_sonuclari.json` dosyasında yayınlanabilir analiz/kupon henüz yoktur.
- Sistem kupon uydurmaz; analiz gelene kadar hazırlık mesajı gösterir.

---

## 5. Günlük Maç Bülteni

Dosyalar:

- `daily-matches-widget.js`
- `daily-toggle.js`

Özellikler:

- `data/fixtures.json` dosyasını okur.
- Lig bazlı maç listesi oluşturur.
- Bayrak/lig ikonu gösterir.
- Takım logo alanı vardır; logo yoksa takım baş harfi rozet olarak görünür.
- Maç satırları sütun yapısındadır.
- Ana oran alanları görünür.
- Satıra tıklayınca Alt, Üst, KG Var, KG Yok gibi ekstra oranlar açılabilir.
- Mobilde yatay kaydırma desteklenir.

Tasarım sınıfı:

- `Neon Sport`
- Takım isimleri, saatler, skorlar ve maç satırları canlı/spor hissiyle görünür.

---

## 6. Maç Sonuçları Paneli

Dosya:

- `match-results-widget.js`

Amaç:

- Sağ altta `🏁 Maç Sonuçları` butonu gösterir.
- O gün biten maçları listeler.
- Veri yoksa sonuç uydurmaz.
- Sonuç yoksa `Henüz biten maç yok.` gösterir.

Tasarım sınıfı:

- `Neon Sport`
- Skorlar ve takım isimleri neon/spor yazı diliyle görünür.

---

## 7. Kupon Merkezi ve Günün Analiz Kuponları

Dosya:

- `coupon-design.js`

Amaç:

- Tekli, 2'li ve 3'lü kuponları modern kartlarla gösterir.
- Her kartta maç, seçim, güven, risk, oran ve kısa analiz notu yer alır.
- Veri yoksa sade hazırlık mesajı gösterilir.

Kaynak veri:

- `data/analiz_sonuclari.json`

Kural:

- Robot/sistem gerçek analiz üretmeden kupon gösterilmez.
- Beta/hazırlık verisi kupon olarak yayınlanmaz.
- Kupon uydurulmaz.

Tasarım sınıfı:

- `Diamond Clean`
- Güven, risk, oran ve veri kutuları temiz mavi/elmas tonuyla gösterilir.
- Takım/maç adlarında gerektiğinde `Neon Sport` etkisi korunur.

---

## 8. Robot Beta Sürüm Akışı

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

Mevcut durum:

- Maç listesi siteye geliyor.
- Yayınlanabilir analiz/kupon henüz boş.
- Ana teknik iş: robotun gerçek analiz çıktısını `data/analiz_sonuclari.json` içine güvenli biçimde yazdırmak ve workflow/backend akışına bağlamak.

---

## 9. Robot Kalıcı Maç Arşivi

Dosya:

- `data/robot_match_archive.json`

Amaç:

- Robot için özel kalıcı arşivdir.
- Ziyaretçiye normal sitede gösterilmez.
- Maçlar silinmeden birikir.
- Takım bazlı istatistik çıkarılır.

Güncelleme scripti:

- `scripts/update-match-archive.js`

Not:

- Repo public olduğu için dosyaya direkt link bilen teknik olarak erişebilir. Gerçek gizlilik için ileride private backend/database gerekir.

---

## 10. Premium Özel Maç Analizi Paneli

Dosya:

- `premium-analysis-panel.js`

Amaç:

- Projenin ana kilit premium sistemi.
- Üye maç listesinden karşılaşma seçer.
- İstediği seçeneği seçer.
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

Mevcut durum:

- Frontend panel hazır.
- Gerçek üyelik, ödeme ve analiz kuyruğu için backend gerekir.
- Bu panel projenin ana kilit taşıdır: ödeme yapan kullanıcı özel maç seçip seçeneğe göre robot analizi isteyecek.

Tasarım sınıfı:

- `Premium + Diamond`
- Başlıklar premium marka diliyle, veri satırları Diamond Clean tarzıyla görünür.

---

## 11. Üyelik, Paket ve Ödeme Paneli

Ana dosyalar:

- `data/membership_plans.json`
- `membership-payment-panel.js`
- `payment-gold-theme.js`
- `payment-luxury-tiers.js`
- `user-access-flow.js`

Backend/API dosyaları:

- `api/_lib/plans.js`
- `api/_lib/membership.js`
- `api/me/start-trial.js`
- `api/me/subscription.js`
- `api/paytr/create-payment.js`
- `api/paytr/callback.js`

Güncel paket isimleri:

- `Gold Paket`
- `Diamond Paket`
- `Premium Paket`

İç teknik id'ler korunur:

- `starter` → Gold Paket
- `pro` → Diamond Paket
- `vip` → Premium Paket

Güncel paket süreleri:

- Gold Paket: `149 TL / 3 Gün`
- Diamond Paket: `299 TL / 2 Hafta`
- Premium Paket: `499 TL / 4 Hafta`

Ücretsiz deneme kararı:

- Her pakette `1 Gün Ücretsiz Deneme` vardır.
- Deneme süresi bitince erişim kapanır.
- Deneme bittikten sonra kullanıcı devam etmek için seçtiği paketi satın almalıdır.
- Deneme her kullanıcı için tek seferlik olacak; gerçek kontrol backend/veritabanı ile yapılacak.

Ödeme paneli tasarım kararları:

- Ödeme kartları tek tip değildir.
- Gold, Diamond ve Premium paketler ayrı karakterle görünür.
- Gold: parlak altın giriş paketi.
- Diamond: elmas/mavi parlak orta paket.
- Premium: siyah-altın lüks en güçlü paket.
- `1 GÜN ÜCRETSİZ DENEME` yazısı kart içinde büyük kampanya bandı olarak görünür.
- Ücretsiz deneme alanında `🎁 1 GÜN ÜCRETSİZ DENEME` ve `HEMEN DENE` vurgusu kullanılır.
- Deneme butonu ayrıca parlak kampanya butonu gibi vurgulanır.

Ödeme akışı:

1. Kullanıcı paket seçer.
2. Ad Soyad, E-posta, Telefon girer.
3. `1 Gün Ücretsiz Dene` veya `Kartla Satın Al` seçer.
4. Deneme için `/api/me/start-trial` çağrılır.
5. Kartlı ödeme için `/api/paytr/create-payment` çağrılır.
6. PayTR ödeme ekranı açılır.
7. PayTR sonucu `/api/paytr/callback` ile backend'e döner.
8. Callback hash doğrulanır.
9. Başarılıysa üyelik aktif edilir.
10. PayTR'ye düz metin `OK` dönülür.

Kritik kural:

- GitHub Pages tek başına güvenli üyelik/ödeme backend'i değildir.
- Gerçek ödeme sonrası üyelik açma için backend ve veritabanı gerekir.
- Kart bilgisi sitede tutulmayacak.
- PayTR merchant key/salt frontend dosyalarına yazılmayacak.

---

## 12. Şirket ve PayTR Hazırlığı

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

`Futbol Laboratuvarı, futbol maçları için veri destekli analiz, kupon takibi, maç bülteni ve üyeye özel maç analiz paneli sunan dijital üyelik platformudur. Kullanıcılar paket satın alarak özel analiz paneline erişir.`

---

## 13. Premium Ödeme Backend Planı

Ödeme planı dokümanı:

- `docs/PREMIUM_ODEME_PLANI.md`

Backend taslak klasörü:

- `serverless/paytr/`

Canlı endpoint dosyaları:

- `api/paytr/create-payment.js`
- `api/paytr/callback.js`
- `api/me/subscription.js`
- `api/me/start-trial.js`
- `api/_lib/plans.js`
- `api/_lib/http.js`
- `api/_lib/paytr.js`
- `api/_lib/membership.js`

Serverless/Vercel hazırlığı:

- `package.json`
- `vercel.json`

Planlanan backend endpointleri:

- `POST /api/paytr/create-payment`
- `POST /api/paytr/callback`
- `POST /api/me/start-trial`
- `GET /api/me/subscription`

Gerekli ortam değişkenleri:

- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_TEST_MODE`
- `SITE_BASE_URL`

Canlı ödeme için hâlâ gerekenler:

- Şahıs şirketi
- PayTR üye işyeri onayı
- Backend yayını
- Veritabanı
- Auth/session sistemi
- PayTR callback URL ayarı
- Yasal sayfalar

---

## 14. Yazı Stili Sistemi

Dosya:

- `site-typography-system.js`

Karar verilen yazı stili dağılımı:

### Premium Serif

- Ana marka başlıkları
- Hero başlığı
- Büyük bölüm başlıkları
- Marka/Hakkımızda alanları

### Gold Payment

- Paket isimleri
- Fiyatlar
- Deneme/satın alma butonları
- Ödeme kartları

### Neon Sport

- Takım isimleri
- Maç saatleri
- Skorlar
- Maç sonuçları
- Canlı veri/maç satırları

### Diamond Clean

- Güven yüzdesi
- Risk
- Oran
- Veri ve istatistik kutuları
- Kupon metrikleri

Kural:

- Site tek renk gibi durmayacak.
- Her alan kendi görevine göre yazı rengi, yazı stili ve vurgu dili alacak.
- Takım isimlerinde özellikle `Neon Sport` kullanılacak.

---

## 15. Panel ve Alan Sistemi

Dosya:

- `panel-widget-system.js`

Amaç:

- Her panel tek tek sınıflandırılır.
- Her panelin alan yapısı kendi klasmanına göre tasarlanır.
- Yazı rengi, yazı stili ve vurgu dili panelin görevine uygun olur.
- Dinamik sonradan yüklenen alanlar tekrar taranıp aynı sisteme dahil edilir.

Ziyaretçiye gösterilen panel etiketleri:

- `Futbol Laboratuvarı`
- `Kupon Merkezi`
- `Canlı Maç Bülteni`
- `Bugünün Maçları`
- `Üyelik Paketleri`
- `Özel Analiz Paneli`
- `Günün Seçimi`
- `Maç Yorumları`
- `Maç Kayıtları`
- `Sonuçlar`
- `Performans`
- `Spor Toto`
- `Hakkımızda`

---

## 16. GitHub / Site Çalışma Notları

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

Kullanıcı şu ifadeleri söylediğinde GitHub/repo inceleme komutu kabul edilecek:

- `github'a gir`
- `githubuma bak`
- `github'a erişimin var`
- `repo'ya bak`
- `site repo'sunu incele`
- `github'da kontrol et`
- `github üzerinden düzenle`
- `commit/push yap`
- `kayıt et`
- `mega hafızaya işle`
- `nerede kalmıştık`

---

## 17. Son Yapılan Büyük İşler

- Günlük maç bülteni lig bazlı tasarlandı.
- Oran ve detay açılır panel eklendi.
- Maç sonuçları ikon paneli eklendi.
- Günün analiz kuponları kart tasarımı eklendi.
- Robot beta sürüm moduna geçirildi.
- Robot kalıcı maç arşivi kuruldu.
- Premium özel maç analiz paneli eklendi.
- Üyelik ve ödeme paneli eklendi.
- PayTR backend iskeleti eklendi.
- Kartlı ödeme için Vercel/serverless API altyapısı eklendi.
- Paket süreleri güncellendi: Gold 3 gün, Diamond 2 hafta, Premium 4 hafta.
- Her pakete 1 gün ücretsiz deneme eklendi.
- Paket isimleri Gold / Diamond / Premium olarak düzenlendi.
- Ödeme kartlarına dore/altın/parlak tasarım eklendi.
- `1 Gün Ücretsiz Deneme` rozeti büyük kampanya bandına çevrildi.
- Site yazı stili sistemi eklendi.
- Panel/alan sınıflandırma sistemi eklendi.
- Üst menü sadeleştirildi.
- Panel etiketleri ziyaretçi diline çevrildi.
- Giriş Yap / 1 Gün Dene üst erişim alanı eklendi.
- Menü ikon sistemi eklendi.
- Canlı Kontrol Merkezi eklendi.
- Üst menü çakışma riskini azaltmak için header genişlikleri ve responsive yapı düzenlendi.
- Yeni sayfaya geçiş için en önemli not en üste sabitlendi.

---

## 18. Sonraki Görevler

1. Robotun gerçek analiz çıktısını `data/analiz_sonuclari.json` dosyasına güvenli ve gerçek şekilde yazdır.
2. Kupon Merkezi'ni bu gerçek analiz çıktısından çalıştır.
3. Özel maç analiz isteklerini backend kuyruğuna gönder.
4. Robot bu istekleri okuyup özel analiz üretsin.
5. Robot arşivini otomatik workflow içine bağla.
6. Şahıs şirketi açma sürecini tamamla.
7. PayTR başvurusuna hazırlan.
8. Siteye KVKK, gizlilik, iade/iptal, kullanım şartları ve mesafeli satış sayfaları ekle.
9. Üyelik backend altyapısını seç ve yayına al.
10. PayTR bilgileri gelince backend ortam değişkenlerine gir.
11. Test ödeme yap.
12. Veritabanı bağla: users, orders, memberships.
13. Ödeme başarılı olunca premium erişimi otomatik aç.
14. Mobil görünüm gözle kontrol edilsin.
15. Beğenilmeyen renk, yazı veya panel yerleşimleri tek tek düzeltilecek.

---

## 19. Hafıza Kullanım Kuralı

Bu dosya proje hafıza deposudur.

Sohbet sonunda kullanıcı `hafızaya kaydet`, `mega hafızaya işle`, `hafıza deposunu güncelle`, `kayıt et` veya benzer bir komut verdiğinde bu dosya güncellenecek.

Otomatik sohbet sonu algılama garanti değildir; kullanıcı komut verdiğinde güncelleme yapılır.

---

## 20. Son Hafıza Kaydı

Bu kayıt, yeni sayfaya geçmeden önce güncellendi.

Özet:

- En önemli not dosyanın en üstüne sabitlendi.
- Maç akışının aktif olduğu kaydedildi.
- Gerçek analiz/kupon üretiminin henüz aktif olmadığı kaydedildi.
- Sıradaki ana işin robotun gerçek analiz çıktısını `data/analiz_sonuclari.json` dosyasına yazdırmak olduğu kaydedildi.
- Üyelik sistemi kararı kaydedildi: site gezilebilir, deneme/ödeme/özel analiz için üyelik gerekir.
- `user-access-flow.js` eklendiği kaydedildi.
- Üstte `Giriş Yap` ve `1 Gün Dene` erişim alanı kaydedildi.
- Menü ikon sistemi kaydedildi.
- `live-control-center.js` eklendi ve site akışı kontrol kartları kaydedildi.
- `nav-theme.css` üst üste binme riskini azaltmak için güncellendiği kaydedildi.
- `nav-routing.js` yeni üyelik ve kontrol merkezi dosyalarına bağlandı.

---

## 21. Üst Menü Tasarım Kararı - Dar Premium Header

Tarih: 2026-06-20

Kullanıcı son üst menü görselini beğendi ve şu kararı verdi:

> “Bu şekilde tasarla bunu beğendim.”

Ardından kullanıcı görsel gönderilmesini durdurup doğrudan uygulamaya geçilmesini istedi:

> “Bana görsel gönderme artık hazırlamaya başlayalım.”

Bu karar doğrultusunda üst menü için kalıcı tasarım standardı:

- Dar, yatay ve premium header düzeni kullanılacak.
- Sol tarafta küçük logo + `FUTBOL LABORATUVARI` marka yazısı + `Maç ve Kupon Merkezi` alt başlığı olacak.
- Ana menü yatay ve kompakt kalacak.
- `Kupon Merkezi` aktif menü olarak neon yeşil/parlak pill içinde vurgulanacak.
- Altta ikinci satır/şerit olarak `SONUÇLAR & MARKA`, `Sonuçlar`, `Performans`, `Hakkımızda`, `Yönetim` görünecek.
- Sağ tarafta koyu `GİRİŞ YAP` ve dore/altın `1 GÜN DENE` erişim alanı korunacak.
- Renk dili: siyah / koyu lacivert zemin, dore-altın çizgiler, neon yeşil aktif vurgu.
- Header büyük boş kart gibi durmayacak; ince, premium, kompakt ve siteye bağlı olacak.
- Üst alan eski büyük/boş header görünümüne dönmeyecek.

Uygulanan repo dosyası:

- `nav-theme.css`

Uygulanan commit:

- `420506369fb99d926beb75490ddcf8228846abd4`

Kural:

- Bundan sonra üst menü düzeni değiştirilirken bu karar baz alınacak.
- Yeni tasarım yapılmadan doğrudan bu dar premium header standardı korunacak.
- Kullanıcı özellikle istemedikçe üst menü için yeni görsel mockup üretilmeyecek.
