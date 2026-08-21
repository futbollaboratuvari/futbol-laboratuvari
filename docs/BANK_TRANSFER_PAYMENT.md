# Futbol Laboratuvarı — Havale / EFT / FAST Ödeme Modülü

## Durum

Gerçek modül `feature/bank-transfer-payment` branch'inde izole olarak kurulmuştur. Ana `index.html` ve kritik maç/bülten dosyalarına dokunulmamıştır.

## Akış

1. Kullanıcı paket, ad soyad, e-posta ve telefon bilgilerini girer.
2. `POST /api/bank-transfer/create-order` paket/tutarı sunucudaki mevcut plan dosyasından doğrular.
3. Sipariş Supabase `bank_transfer_orders` tablosuna yazılır.
4. API banka adı, hesap sahibi, IBAN, tutar ve benzersiz `FL-...` ödeme açıklamasını döndürür.
5. Kullanıcı Havale / EFT / FAST yapar ve `POST /api/bank-transfer/report-payment` ile bildirim verir.
6. Admin `GET /api/admin/bank-transfer/orders?status=payment_reported` ile bekleyenleri görür.
7. Banka hesabında transfer görüldüğünde `POST /api/admin/bank-transfer/approve` çağrılır.
8. Sunucu üyelik kodu üretir. Düz kod yalnız şifreli biçimde özel sipariş tablosunda saklanır.
9. Public üyelik dosyasına yalnız SHA-256 kod özeti, paket, kalan hak ve son kullanma tarihi yazılır. Müşteri PII veya IBAN yazılmaz.
10. Kullanıcı sipariş durumunu kontrol ettiğinde üyelik kodunu alır ve mevcut Özel Analiz panelinde kullanır.

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

`BANK_IBAN` yalnız Vercel sunucu ortamında tutulur. Frontend kaynak dosyasında sabit IBAN yoktur.

`BANK_TRANSFER_CODE_SECRET` en az 32 karakter rastgele değer olmalıdır. Üyelik kodunu AES-256-GCM ile şifrelemek için kullanılır.

`ADMIN_PAYMENT_SECRET` public admin HTML dosyasında bulunmaz; admin ekranında elle girilir ve localStorage'a kaydedilmez.

`USAGE_LOG_TOKEN` mevcut sistemde üyelik kod özetini `data/membership-codes.json` dosyasına güvenli sunucu çağrısıyla eklemek için kullanılır.

## Supabase

`backend/supabase/bank_transfer_schema.sql` dosyasını Supabase SQL Editor içinde bir kez çalıştır.

Tabloda RLS açıktır ve anon/authenticated policy yoktur. Browser Supabase tablosuna doğrudan erişemez. Yalnız Vercel API `SUPABASE_SERVICE_ROLE_KEY` ile erişir.

## Test sayfaları

- `bank-transfer-test.html`: müşteri ödeme akışı
- `bank-transfer-admin-test.html`: bekleyen ödeme listesi ve manuel banka onayı

Bu sayfalar `noindex,nofollow` işaretlidir ve ana siteye bağlı değildir.

## Canlıya alma öncesi kontrol

- Supabase şeması uygulanmalı.
- Vercel env değerleri girilmeli.
- Test branch deploy edilip gerçek para göndermeden sipariş akışı kontrol edilmeli.
- Çok küçük gerçek bir banka transferi ile eşleştirme/onay testi yapılmalı.
- Üyelik kodunun mevcut `/api/verify-code` endpointinde kabul edildiği ve süre bitince reddedildiği kontrol edilmeli.
- Sonra yalnız gerekli script/HTML bağlantısı `index.html` içine küçük bir değişiklikle alınmalı.

## Kritik güvenlik kararları

- Müşteri adı/e-posta/telefon public GitHub JSON'a yazılmaz.
- IBAN public GitHub'a yazılmaz.
- Admin secret public kaynağa yazılmaz.
- Paket tutarı frontend'den kabul edilmez; `api/_lib/plans.js` kaynak kabul edilir.
- Sipariş kodu benzersizdir ve transfer açıklaması olarak kullanılır.
- Admin onayı idempotent davranır; ödenmiş sipariş ikinci kez yeni üyelik üretmez.
- Yeni banka üyelik kodlarında paket süresi `expiresAt` ile backend doğrulamasında zorunlu kontrol edilir.
