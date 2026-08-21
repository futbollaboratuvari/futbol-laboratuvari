# Futbol Laboratuvarı — Havale / EFT / FAST Ödeme Modülü

## Durum

Gerçek modül `feature/bank-transfer-payment` branch'inde izole olarak kurulmuştur. Ana `index.html` ve kritik maç/bülten dosyalarına dokunulmamıştır.

Supabase üretim projesinde `bank_transfer_orders` tablosu kurulmuş, RLS doğrulanmış ve geçici test siparişi ile `pending -> payment_reported -> paid` yaşam döngüsü test edilip test kaydı temizlenmiştir.

Üyelik paneli banka transferi modülüne `membership-bank-transfer-bridge.js` üzerinden bağlanmıştır. Köprü, mevcut üyelik paneli kodunu büyük ölçüde değiştirmeden satın alma tıklamasını Havale / EFT / FAST akışına yönlendirir. 1 günlük deneme ayrı buton olarak korunur.

## Akış

1. Kullanıcı paket, ad soyad, e-posta ve telefon bilgilerini girer.
2. Kullanıcı `Havale / EFT / FAST ile Öde` butonuna basar.
3. Banka ödeme paneli seçilen paket ve müşteri bilgileri ile açılır.
4. Kullanıcı `Ödeme Talebi Oluştur` butonuna basar.
5. `POST /api/bank-transfer/create-order` paket/tutarı sunucudaki plan tanımından doğrular.
6. Sipariş Supabase `bank_transfer_orders` tablosuna yazılır.
7. API banka adı, hesap sahibi, IBAN, tutar ve yüksek entropili benzersiz `FL-...` ödeme açıklamasını döndürür.
8. Kullanıcı Havale / EFT / FAST yapar ve `POST /api/bank-transfer/report-payment` ile bildirim verir.
9. Admin `bank-transfer-admin.html` ekranından bekleyen ödemeleri listeler.
10. Banka hesabında tutar ve FL-... açıklaması gerçekten görüldüğünde admin `POST /api/admin/bank-transfer/approve` ile onay verir.
11. Sunucu üyelik kodu üretir. Düz kod yalnız AES-256-GCM ile şifreli biçimde özel sipariş tablosunda saklanır.
12. Üyelik veri dosyasına yalnız SHA-256 kod özeti, paket, kalan hak ve son kullanma tarihi yazılır. Müşteri PII veya IBAN yazılmaz.
13. Kullanıcı `POST /api/bank-transfer/order-status` ile durumunu kontrol eder. E-posta URL/query string içine yazılmaz.
14. Ödeme onaylandıysa kullanıcı üyelik kodunu alır ve mevcut Özel Analiz panelinde kullanır.

## Kullanıcı arayüzü bağlantısı

- `nav-routing.js`, üyelik panelinden sonra sırasıyla `bank-transfer-payment.js`, `membership-bank-transfer-bridge.js` ve deneme mesajı düzeltmesini yükler.
- Mevcut paket kartı ana satın alma butonu `Havale / EFT / FAST ile Öde` olarak kullanılır.
- Mevcut 1 günlük deneme ayrı ikincil buton olarak korunur.
- Eski `membership-submit-guard.js` yeni banka butonunu hedeflemez; selector çakışması kontrol edilmiştir.
- IBAN frontend kaynak koduna yazılmaz.
- IBAN yalnız başarılı sipariş oluşturma cevabından sonra ekranda görünür.
- Sipariş kodu oluşmadan kullanıcıya para göndermemesi açıkça belirtilir.
- Seçilen paket banka formunda kilitlenir; fiyat ve tutar yine backend plan tanımından doğrulanır.
- Banka modülü yüklenemezse akış fail-closed davranır ve kullanıcıya para göndermemesi söylenir.

## Yönetim ekranı

`bank-transfer-admin.html` gerçek banka ödeme yönetim ekranıdır.

- Eski `bank-transfer-admin-test.html` adresi yeni gerçek yönetim ekranına yönlendirilir.
- `ADMIN_PAYMENT_SECRET` tarayıcıda saklanmaz.
- Bekleyen / ödeme bildirildi / ödendi filtreleri bulunur.
- Onay öncesi sipariş kodu, tutar ve ödeme açıklaması tekrar gösterilir.
- Yönetici banka hesabında transferi gerçekten görmeden onay vermemesi konusunda uyarılır.
- Onay sonrası üyelik kodu oluşturulur.

`bank-transfer-test.html` bilerek korunur. Bu sayfa ana üyelik panelinden bağımsız izole uçtan uca API testi için kullanılacaktır; canlı müşteri girişi değildir.

## Vercel ortam değişkenleri

Aşağıdaki değerler GitHub'a yazılmamalıdır:

```env
BANK_NAME=...
BANK_ACCOUNT_HOLDER=...
BANK_IBAN=TR...
BANK_TRANSFER_CODE_SECRET=uzun-rastgele-gizli-deger
ADMIN_PAYMENT_SECRET=uzun-rastgele-admin-gizli-deger
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
USAGE_LOG_TOKEN=...
```

İsteğe bağlı branch izolasyon değişkenleri:

```env
MEMBERSHIP_PUBLISH_BRANCH=feature/bank-transfer-payment
MEMBERSHIP_VERIFY_BRANCH=feature/bank-transfer-payment
USAGE_LOG_BRANCH=feature/bank-transfer-payment
```

Vercel preview ortamında bu değerler verilmezse kod `VERCEL_GIT_COMMIT_REF` üzerinden preview branch'ini kullanır. Production ortamında üyelik yayını varsayılan olarak `main` dalına gider. Production dışındaki üyelik yayını branch tespit edemezse güvenli biçimde hata verir; `main`e sessizce yazmaz.

`BANK_IBAN` yalnız Vercel sunucu ortamında tutulur. Frontend kaynak dosyasında sabit IBAN yoktur. Sunucuda Türkiye IBAN biçimi ve mod-97 checksum kontrolü yapılır.

`BANK_TRANSFER_CODE_SECRET` en az 32 karakter rastgele değer olmalıdır. Üyelik kodunu AES-256-GCM ile şifrelemek için kullanılır.

`ADMIN_PAYMENT_SECRET` public admin HTML dosyasında bulunmaz; admin ekranında elle girilir ve tarayıcı depolamasına kaydedilmez.

`USAGE_LOG_TOKEN` mevcut sistemde üyelik kod özetini ve kullanım haklarını GitHub veri dosyalarında sunucu çağrısıyla yönetmek için kullanılır.

## Supabase

Şema kaynağı: `backend/supabase/bank_transfer_schema.sql`.

Gerçek Supabase projesinde şema uygulanmıştır. Tabloda RLS açıktır ve anon/authenticated policy yoktur. Browser Supabase tablosuna doğrudan erişemez. Yalnız Vercel API `SUPABASE_SERVICE_ROLE_KEY` ile erişir.

Güvenlik ve performans advisor kontrolünde bu değişiklik için uyarı bulunmamıştır.

## Vercel function sınırı düzeltmesi

Önceki production ve preview deploymentlarında Vercel Hobby planının 12 Serverless Function sınırı aşılıyordu. Kök neden `/api/_lib` ve `/api/lib` altındaki yardımcı JavaScript dosyalarının function olarak paketlenmesiydi.

Yardımcı modüller `/server/routes` altına taşındı. `/api` altında yalnız ince HTTP wrapper dosyaları bırakıldı. PayTR create/callback endpointleri feature branch'te kaldırıldığı için banka ödeme yapısı ile birlikte 11 gerçek HTTP function kalır.

## Doğrulananlar

- Supabase tablo oluşturma: başarılı.
- RLS: aktif.
- Supabase security/performance advisor: temiz.
- `pending` sipariş kaydı: başarılı.
- `payment_reported` geçişi: başarılı.
- `paid` geçişi: başarılı.
- `updated_at` trigger: başarılı.
- Test verisinin temizlenmesi: başarılı.
- Kullanıcı üyelik paneli -> banka ödeme modülü bağlantısı: feature branch'te tamamlandı.
- Admin banka ödeme ekranı: feature branch'te tamamlandı.
- PayTR mesajları banka satın alma ve deneme akışından kaldırıldı.
- Eski üyelik submit guard ile yeni banka köprüsü arasında selector çakışması yok.
- Banka köprüsü JavaScript sözdizimi kontrolünden geçti.
- Vercel function-count yapısal düzeltmesi: feature branch'te tamamlandı.
- PR mergeable durumdadır ancak bilerek draft tutulur.

## Canlıya alma öncesi kalan dış engeller

1. Vercel hesabındaki `build-rate-limit` kalkmalı veya hesap limiti çözülmeli. Güncel GitHub/Vercel check bu nedenle başarısızdır; build henüz başlamamaktadır.
2. Vercel environment variables girilmeli.
3. Güncel feature branch preview deployment alınmalı.
4. İzole `bank-transfer-test.html` ile sipariş API akışı kontrol edilmeli.
5. Preview ana üyelik panelinde sipariş oluşturma -> ödeme bildirimi -> admin onayı -> üyelik kodu -> `/api/verify-code` uçtan uca testi yapılmalı.
6. Gerçek para testi yapılacaksa önce çok küçük kontrollü bir transferle FL-... açıklama eşleştirmesi doğrulanmalı.
7. Tüm kontroller başarılı olunca PR `main` dalına merge edilmelidir.

## Kritik güvenlik kararları

- Müşteri adı/e-posta/telefon public GitHub JSON'a yazılmaz.
- IBAN public GitHub'a yazılmaz.
- Admin secret public kaynağa yazılmaz.
- Paket tutarı frontend'den kabul edilmez; backend plan tanımı kaynak kabul edilir.
- Sipariş kodu yüksek entropili rastgele bölüm içerir ve transfer açıklaması olarak kullanılır.
- Sipariş durumunda e-posta query string/log URL içine taşınmaz.
- Admin onayı idempotent davranır; ödenmiş sipariş ikinci kez yeni üyelik üretmez.
- Yeni banka üyelik kodlarında paket süresi `expiresAt` ile backend doğrulamasında zorunlu kontrol edilir.
- Preview üyelik kodu, kullanım logu ve hak düşümü preview branch'inde kalır; `main` dalına test verisi sızdırılmaz.
- Sipariş oluşturulmadan IBAN gösterilmez; kullanıcıya FL-... referans kodu oluşmadan para göndermemesi söylenir.
