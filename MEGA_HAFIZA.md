# Futbol Laboratuvarı MEGA HAFIZA

Bu dosya Futbol Laboratuvarı projesinin kalıcı çalışma hafızasıdır.

Amaç: Sohbetlerde alınan kararlar, yapılan site/robot değişiklikleri, ödeme-üyelik planı, robot veri akışı, panel tasarım kararları ve gelecek görevler burada tutulur. Bu dosya proje deposunda ana hafıza deposu olarak kullanılacaktır.

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
- `market` kelimesi ziyaretçiye mümkün olduğunca gösterilmez; yerine `seçenek` kullanılır.

---

## 3. Günlük Maç Bülteni

Dosya: `daily-matches-widget.js`

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

- Dosya: `daily-toggle.js`
- Satıra tıklayınca Alt, Üst, KG Var, KG Yok gibi ekstra oranlar açılır.

Tasarım sınıfı:

- `Neon Sport`
- Takım isimleri, saatler, skorlar ve maç satırları canlı/spor hissiyle görünür.

---

## 4. Maç Sonuçları Paneli

Dosya: `match-results-widget.js`

Amaç:

- Sağ altta `🏁 Maç Sonuçları` butonu gösterir.
- O gün biten maçları listeler.
- Veri yoksa sonuç uydurmaz.
- Sonuç yoksa `Henüz biten maç yok.` gösterir.

Tasarım sınıfı:

- `Neon Sport`
- Skorlar ve takım isimleri neon/spor yazı diliyle görünür.

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

Tasarım sınıfı:

- `Diamond Clean`
- Güven, risk, oran ve veri kutuları temiz mavi/elmas tonuyla gösterilir.
- Takım/maç adlarında gerektiğinde `Neon Sport` etkisi korunur.

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

Beta erişim kodu:

- `FL-BETA`

Mevcut durum:

- Frontend beta panel hazır.
- Gerçek üyelik, ödeme ve analiz kuyruğu için backend gerekir.
- Bu panel projenin ana kilit taşıdır: ödeme yapan kullanıcı özel maç seçip seçeneğe göre robot analizi isteyecek.

Tasarım sınıfı:

- `Premium + Diamond`
- Başlıklar premium marka diliyle, veri satırları Diamond Clean tarzıyla görünür.

---

## 9. Üyelik, Paket ve Ödeme Paneli

Ana dosyalar:

- `data/membership_plans.json`
- `membership-payment-panel.js`
- `payment-gold-theme.js`
- `payment-luxury-tiers.js`

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

Deneme/üyelik durumları:

- `trial_active`
- `trial_expired_payment_required`
- `active`
- `expired`
- `none`

Ödeme paneli tasarım kararları:

- Ödeme kartları artık tek tip değildir.
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

`Futbol Laboratuvarı, futbol maçları için veri destekli analiz, kupon takibi, maç bülteni ve üyeye özel maç analiz paneli sunan dijital üyelik platformudur. Kullanıcılar paket satın alarak özel analiz paneline erişir.`

Son karar:

- Şahıs şirketi açma süreci ayrı sohbette takip edilecek.
- PayTR başvurusu için şirket, banka hesabı, yasal metinler ve site açıklaması hazırlanacak.

---

## 11. Premium Ödeme Backend Planı

Ödeme planı dokümanı:

- `docs/PREMIUM_ODEME_PLANI.md`

Backend taslak klasörü:

- `serverless/paytr/`

Eklenen dosyalar:

- `serverless/paytr/README.md`
- `serverless/paytr/create-payment.example.js`
- `serverless/paytr/callback.example.js`

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

## 12. Yazı Stili Sistemi

Dosya:

- `site-typography-system.js`

Karar verilen yazı stili dağılımı:

### Premium Serif

Kullanım yeri:

- Ana marka başlıkları
- Hero başlığı
- Büyük bölüm başlıkları
- Marka/Hakkımızda alanları

Amaç:

- Lüks, ciddi, marka odaklı görünüm.

### Gold Payment

Kullanım yeri:

- Paket isimleri
- Fiyatlar
- Deneme/satın alma butonları
- Ödeme kartları

Amaç:

- Dore/altın, parlak, satın alma odaklı görünüm.

### Neon Sport

Kullanım yeri:

- Takım isimleri
- Maç saatleri
- Skorlar
- Maç sonuçları
- Canlı veri/maç satırları

Amaç:

- Canlı, hızlı, sportif, tech hissi.

### Diamond Clean

Kullanım yeri:

- Güven yüzdesi
- Risk
- Oran
- Veri ve istatistik kutuları
- Kupon metrikleri

Amaç:

- Temiz, net, mavi/elmas veri dili.

Kural:

- Site tek renk gibi durmayacak.
- Her alan kendi görevine göre yazı rengi, yazı stili ve vurgu dili alacak.
- Takım isimlerinde özellikle `Neon Sport` kullanılacak.

---

## 13. Panel ve Widget Sistemi

Dosya:

- `panel-widget-system.js`

Amaç:

- Her panel tek tek sınıflandırılacak.
- Her panelin widget yapısı kendi klasmanına göre tasarlanacak.
- Yazı rengi, yazı stili ve vurgu dili panelin görevine uygun olacak.
- Dinamik sonradan yüklenen widgetler tekrar taranıp aynı sisteme dahil edilecek.

Panel sınıflandırması:

### Premium Marka Paneli

Kullanım:

- Ana sayfa
- Hero alanı
- Hakkımızda
- Galeri
- Değerlendirme modülleri

Stil:

- Premium Serif
- Altın/marka hissi

### Gold Ödeme Widgeti

Kullanım:

- Üyelik & Ödeme
- Gold / Diamond / Premium paketleri
- Fiyatlar
- Ücretsiz deneme
- Satın alma butonları

Stil:

- Gold Payment
- Dore/altın/parlak ödeme dili

### Neon Maç Widgeti

Kullanım:

- Günlük Maç Bülteni
- Bugünün maçları
- Takım isimleri
- Maç sonuçları
- Skorlar
- Spor Toto

Stil:

- Neon Sport
- Canlı/spor/tech görünüm

### Diamond Widget

Kullanım:

- Kupon Merkezi
- Güven / Risk / Oran
- Veri kutuları
- Performans
- Maç kayıtları
- Maç yorumları

Stil:

- Diamond Clean
- Mavi/elmas temiz veri dili

### Premium Analiz Widgeti

Kullanım:

- Özel Maç Analizi paneli

Stil:

- Premium + Diamond
- Başlıklar premium, veri satırları Diamond Clean

Eklenen panel etiketleri:

- `👑 Premium Marka Paneli`
- `🏆 Gold Ödeme Widgeti`
- `⚽ Neon Maç Widgeti`
- `💎 Kupon Widget Merkezi`
- `👑 Premium Analiz Widgeti`

---

## 14. GitHub / Site Çalışma Notları

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

Bu ifadeler geldiğinde, GitHub aracı mevcutsa doğrudan `futbollaboratuvari/futbol-laboratuvari` reposu kontrol edilecek. GitHub aracı yoksa kullanıcıya GitHub/Codex için net talimat verilecek.

---

## 15. Son Yapılan Büyük İşler

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
- Yeni sohbetlerde GitHub çağırma kelimeleri belirlendi.
- Premium ödeme planı dokümanı eklendi.
- PayTR backend iskeleti eklendi.
- Kartlı ödeme için Vercel/serverless API altyapısı eklendi.
- Kartla ödeme butonu PayTR create-payment endpointine bağlandı.
- Paket süreleri güncellendi: Gold 3 gün, Diamond 2 hafta, Premium 4 hafta.
- Her pakete 1 gün ücretsiz deneme eklendi.
- Deneme bittikten sonra ödeme zorunlu olacak şekilde üyelik mantığı kuruldu.
- Paket isimleri Gold / Diamond / Premium olarak düzenlendi.
- Ödeme kartlarına dore/altın/parlak tasarım eklendi.
- `1 Gün Ücretsiz Deneme` rozeti büyük kampanya bandına çevrildi.
- Site yazı stili sistemi eklendi.
- Panel/widget sınıflandırma sistemi eklendi.
- Paneller kendi görevine göre renk, yazı stili ve widget etiketi almaya başladı.

---

## 16. Sonraki Görevler

1. Şahıs şirketi açma sürecini tamamla.
2. PayTR başvurusuna hazırlan.
3. Siteye KVKK, gizlilik, iade/iptal, kullanım şartları ve mesafeli satış sayfaları ekle.
4. Üyelik backend altyapısını seç ve yayına al:
   - Vercel Functions
   - Supabase Edge Functions
   - Netlify Functions
   - küçük VPS/backend
5. PayTR üye işyeri bilgileri gelince `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` backend ortam değişkenlerine girilecek.
6. `PAYTR_TEST_MODE=1` ile test ödeme yapılacak.
7. Test başarılı olunca ödeme callback doğrulaması kontrol edilecek.
8. Veritabanı bağlanacak: users, orders, memberships.
9. Ödeme başarılı olunca premium erişimi otomatik açılacak.
10. Özel maç analiz istekleri backend kuyruğuna gönderilecek.
11. Robot bu istekleri okuyup özel analiz üretecek.
12. Robot arşivi otomatik workflow içine bağlanacak.
13. PayTR başvurusu öncesi sitedeki üyelik/ödeme alanı yasal metinlerle güçlendirilecek.
14. Panel/widget sistemi site üzerinde gözle kontrol edilecek.
15. Mobil görünümde Gold/Diamond/Premium kartlar ve maç widgetleri tekrar incelenecek.
16. Beğenilmeyen panel etiketleri, renkleri veya yazı stilleri tek tek düzeltilecek.

---

## 17. Hafıza Kullanım Kuralı

Bu dosya proje hafıza deposudur.

Sohbet sonunda kullanıcı `hafızaya kaydet`, `mega hafızaya işle`, `hafıza deposunu güncelle`, `kayıt et` veya benzer bir komut verdiğinde bu dosya güncellenecek.

Otomatik sohbet sonu algılama garanti değildir; kullanıcı komut verdiğinde güncelleme yapılır.

---

## 18. Son Hafıza Kaydı

Bu kayıt, `kayıt et` komutuyla güncellendi.

Özet:

- Paketler Gold / Diamond / Premium olarak güncellendi.
- Paket süreleri Gold 3 gün, Diamond 2 hafta, Premium 4 hafta olarak kaydedildi.
- Tüm paketlerde 1 gün ücretsiz deneme kararı kaydedildi.
- Deneme bittikten sonra ödeme zorunlu olacak akış kaydedildi.
- `api/me/start-trial.js`, `api/_lib/membership.js`, `api/me/subscription.js` deneme/üyelik akışı için kaydedildi.
- `payment-gold-theme.js` ve `payment-luxury-tiers.js` ödeme kartlarının dore/altın/parlak tasarım dosyaları olarak kaydedildi.
- `1 GÜN ÜCRETSİZ DENEME` alanının kampanya bandı ve `HEMEN DENE` etiketiyle öne çıkarıldığı kaydedildi.
- `site-typography-system.js` ile Premium Serif, Gold Payment, Neon Sport ve Diamond Clean yazı sistemi kaydedildi.
- `panel-widget-system.js` ile her panelin kendi klasmanına göre widget yapısı, yazı rengi ve yazı stili alacağı kaydedildi.
- Canlı ödeme için hâlâ PayTR üye işyeri, şirket, backend yayını, veritabanı ve yasal sayfalar gerektiği tekrar kaydedildi.
