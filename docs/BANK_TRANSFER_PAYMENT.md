# Futbol Laboratuvarı — Havale / EFT / FAST Ödeme Modülü

## Durum

Gerçek modül `feature/bank-transfer-payment` branch'inde izole olarak kurulmuştur. Ana `index.html` ve kritik maç/bülten dosyalarına dokunulmamıştır.

Supabase üretim projesinde `bank_transfer_orders` tablosu kurulmuş, RLS doğrulanmış ve geçici test siparişi ile `pending -> payment_reported -> paid` yaşam döngüsü test edilip test kaydı temizlenmiştir.

## Akış

1. Kullanıcı paket, ad soyad, e-posta ve telefon bilgilerini girer.
2. `POST /api/bank-transfer/create-order` paket/tutarı sunucudaki mevcut plan dosyasından doğrular.
3. Sipariş Supabase `bank_transfer_orders` tablosuna yazılır.
4. API banka adı, hesap sahibi, IBAN, tutar ve yüksek entropili benzersiz `FL-...` ödeme açıklamasını döndürür.
5. Kullanıcı Havale / EFT / FAST yapar ve `POST /api/bank-transfer/report-payment` ile bildirim verir.
6. Admin `GET /api/admin/bank-transfer/orders?status=payment_reported` ile bekleyenleri görür.
7. Banka hesabında transfer görüldüğünde `POST /api/admin/bank-transfer/approve` çağrılır.
8. Sunucu üyelik kodu üretir. Düz kod yalnız AES-256-GCM ile şifreli biçimde özel sipariş tablosunda saklanır.
9. Üyelik veri dosyasına yalnız SHA-256 kod özeti, paket, kalan hak ve son kullanma tarihi yazılır. Müşteri PII veya IBAN yazılmaz.
10. Kullanıcı `POST /api/bank-transfer/order-status` ile durumunu kontrol eder. E-posta URL/query string içine yazılmaz.
11. Ödeme onaylandıysa kullanıcı üyelik kodunu alır ve mevcut Özel Analiz panelinde kullanır.

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

`BANK_IBAN` yalnız Vercel sunucu ortamında tutulur. Frontend kaynak dosyasında sabit IBAN yoktur.

`BANK_TRANSFER_CODE_SECRET` en az 32 karakter rastgele değer olmalıdır. Üyelik kodunu AES-256-GCM ile şifrelemek için kullanılır.

`ADMIN_PAYMENT_SECRET` public admin HTML dosyasında bulunmaz; admin ekranında elle girilir ve localStorage'a kaydedilmez.

`USAGE_LOG_TOKEN` mevcut sistemde üyelik kod özetini ve kullanım haklarını GitHub veri dosyalarında sunucu çağrısıyla yönetmek için kullanılır.

## Supabase

Şema kaynağı: `backend/supabase/bank_transfer_schema.sql`.

Gerçek Supabase projesinde şema uygulanmıştır. Tabloda RLS açıktır ve anon/authenticated policy yoktur. Browser Supabase tablosuna doğrudan erişemez. Yalnız Vercel API `SUPABASE_SERVICE_ROLE_KEY` ile erişir.

Güvenlik advisor kontrolünde bu değişiklik için uyarı bulunmamıştır.

## Test sayfaları

- `bank-transfer-test.html`: müşteri ödeme akışı
- `bank-transfer-admin-test.html`: bekleyen ödeme listesi ve manuel banka onayı

Bu sayfalar `noindex,nofollow` işaretlidir ve ana siteye bağlı değildir.

## Doğrulananlar

- Supabase tablo oluşturma: başarılı.
- RLS: aktif.
- `pending` sipariş kaydı: başarılı.
- `payment_reported` geçişi: başarılı.
- `paid` geçişi: başarılı.
- `updated_at` trigger: başarılı.
- Test verisinin temizlenmesi: başarılı.
- Vercel branch build: build aşaması başarılı.
- Vercel deploy check: kod hatası yerine hesap `build-rate-limit` engeline takılıyor.

## Canlıya alma öncesi kalan dış engeller

- Vercel build-rate-limit kalkmalı veya hesap limiti çözülmeli.
- Vercel env değerleri girilmeli.
- Güncel feature branch preview deployment alınmalı.
- Preview üzerinde sipariş oluşturma -> ödeme bildirimi -> admin onayı -> üyelik kodu -> `/api/verify-code` uçtan uca testi yapılmalı.
- Son test başarılı olunca yalnız gerekli script/HTML bağlantısı `index.html` içine küçük bir değişiklikle alınmalı.

## Kritik güvenlik kararları

- Müşteri adı/e-posta/telefon public GitHub JSON'a yazılmaz.
- IBAN public GitHub'a yazılmaz.
- Admin secret public kaynağa yazılmaz.
- Paket tutarı frontend'den kabul edilmez; `api/_lib/plans.js` kaynak kabul edilir.
- Sipariş kodu 40-bit rastgele bölüm içerir ve transfer açıklaması olarak kullanılır.
- Sipariş durumunda e-posta query string/log URL içine taşınmaz.
- Admin onayı idempotent davranır; ödenmiş sipariş ikinci kez yeni üyelik üretmez.
- Yeni banka üyelik kodlarında paket süresi `expiresAt` ile backend doğrulamasında zorunlu kontrol edilir.
- Preview üyelik kodu, kullanım logu ve hak düşümü preview branch'inde kalır; `main` dalına test verisi sızdırılmaz.
