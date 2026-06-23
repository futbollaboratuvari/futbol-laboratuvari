# Futbol Laboratuvarı Gerçek Backend

Bu klasör gerçek üyelik kodu kontrolü için hazırlandı.

## Amaç

GitHub Pages sadece site arayüzüdür. Gerçek üyelik kontrolü backend tarafında yapılmalıdır.

Bu backend şu işleri yapar:

1. Üye kodunu backend'e gönderir.
2. Kod veritabanında var mı kontrol eder.
3. Kod aktif mi kontrol eder.
4. Kodun süresi dolmuş mu kontrol eder.
5. Kodun aktivasyon hakkı kalmış mı kontrol eder.
6. Kod geçerliyse üyeliği aktif eder.
7. Aktivasyonu veritabanına kaydeder.

## Kurulum sırası

1. Supabase projesi oluştur.
2. `backend/supabase/schema.sql` dosyasındaki SQL'i Supabase SQL Editor içinde çalıştır.
3. `supabase/functions/verify-code/index.ts` Edge Function dosyasını Supabase'e deploy et.
4. Supabase Function URL adresini frontend'e bağla.
5. Üye kodu üretmek için `backend/tools/generate-code-hash.js` aracını kullan.
6. Üretilen SQL satırını Supabase SQL Editor içinde çalıştır.
7. Siteye dönüp kodu test et.

## Kod üretme

Bilgisayarda Node varsa:

```bash
node backend/tools/generate-code-hash.js KURUCU-TEST-2026
```

Araç sana SQL satırı verecek. O SQL satırı Supabase'e eklenince kod gerçek backend tarafından doğrulanabilir hale gelir.

## Önemli

Kodlar veritabanında düz metin olarak tutulmaz. Kodun SHA256 özeti tutulur. Kullanıcı kodu girdiğinde backend aynı özeti üretir ve veritabanıyla karşılaştırır.

## Sonraki adım

Frontend şu anda demo/test akışına sahip. Backend Function URL alındıktan sonra `premium-analysis-panel.js` dosyasındaki Kod ile Aç butonu Supabase Edge Function'a bağlanacak.
