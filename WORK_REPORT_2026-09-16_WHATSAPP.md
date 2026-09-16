# WhatsApp Sipariş Hattı Çalışma Raporu

Tarih: 2026-09-16

## Tamamlanan çalışma

- Mevcut banka transferi ve üyelik kodu sistemi incelendi; yeni WhatsApp akışı ayrı bir üyelik veya kod üretim sistemi kurmadan mevcut şifreli üyelik koduna bağlandı.
- Supabase üzerinde `fl-whatsapp-order` Edge Function oluşturuldu ve aktif olarak deploy edildi.
- Meta webhook POST istekleri `X-Hub-Signature-256` HMAC-SHA256 imzasıyla doğrulanır.
- Tekrarlanan webhook teslimleri `whatsapp_webhook_events` tablosu üzerinden tekilleştirilir.
- `whatsapp_webhook_events` için RLS aktiftir; `anon` ve `authenticated` rolleri erişemez, yalnız `service_role` erişebilir.
- Bot, `FL-YYYYMMDD-XXXXXXXXXX` sipariş kodunu mevcut `bank_transfer_orders` kaydıyla eşleştirir.
- Üyelik kodu yalnız sipariş `paid` durumundaysa ve mesajı gönderen WhatsApp numarası siparişte kayıtlı telefonla eşleşiyorsa çözülüp gönderilir.
- Bekleyen, ödeme bildirimi yapılan, reddedilen, iptal edilen veya süresi geçen siparişlerde üyelik kodu açıklanmaz.
- Frontend için `whatsapp-order.js` eklendi. WhatsApp yapılandırması tamamlanmadan arayüz kontrolü görünmez.
- Üyelik ödeme paneli yeni WhatsApp modülünü küçük ve izole bir loader ile yükler.
- Ödeme talebi oluştuktan sonra FL sipariş kodu otomatik olarak WhatsApp hazır mesajına taşınabilir.
- `tests/whatsapp-order-static.test.js` eklendi ve normal production build zincirine bağlandı.
- `index.html`, `daily-matches-widget.js`, bülten JSON dosyaları, Kuponum, Analiz Et ve robot veri üretim dosyaları değiştirilmedi.

## Güvenlik

- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET` ve Meta telefon kimliği frontend'e yazılmaz.
- Üyelik kodu frontend tarafından üretilmez veya statik dosyada tutulmaz.
- Var olan `bank_payment_config.code_crypto_secret` yalnız sunucu tarafında okunur.
- Meta webhook gövdesi imza doğrulamasından geçmeden işlenmez.
- Aynı webhook message ID ikinci kez kod gönderimine neden olmaz.

## Meta aktivasyonu için gerekenler

Supabase Edge Function ortamında aşağıdaki secret'lar tanımlanmalıdır:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_PUBLIC_NUMBER`

`WHATSAPP_GRAPH_VERSION` isteğe bağlıdır; tanımlanmazsa `v26.0` kullanılır.

Callback URL:

`https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-whatsapp-order`

Meta webhook doğrulama tokenı, Supabase'deki `WHATSAPP_VERIFY_TOKEN` ile birebir aynı olmalıdır. WhatsApp Business Account webhook aboneliğinde mesaj olayları etkinleştirilmelidir.

## Durum

Kod, veritabanı koruması, Edge Function, frontend entegrasyonu ve production build koruma testi tamamlandı. Gerçek WhatsApp mesaj alışverişi Meta Cloud API kimlik bilgileri ve WhatsApp Business numarası Supabase secret'larına bağlanana kadar güvenli biçimde kapalı kalır.
