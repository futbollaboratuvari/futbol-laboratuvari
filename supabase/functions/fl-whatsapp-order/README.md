# Futbol Laboratuvarı WhatsApp Sipariş Hattı

Bu Edge Function, WhatsApp Cloud API üzerinden gelen sipariş mesajlarını güvenli biçimde mevcut banka ödeme ve üyelik kodu sistemiyle birleştirir.

## Güvenlik modeli

- Meta webhook POST gövdesi `X-Hub-Signature-256` ile doğrulanır.
- Üyelik kodu yalnız `bank_transfer_orders.status = paid` olduğunda gönderilir.
- WhatsApp gönderen numarası siparişte kayıtlı telefon numarasıyla eşleşmek zorundadır.
- Üyelik kodu tarayıcıda veya statik JavaScript içinde tutulmaz.
- Tekrarlanan Meta webhook mesajları `whatsapp_webhook_events` tablosuyla tekilleştirilir.
- `whatsapp_webhook_events` RLS korumalıdır; `anon` ve `authenticated` erişemez.

## Meta / Supabase ortam değişkenleri

Aşağıdaki secret değerleri Supabase Edge Functions ortamında tanımlanmalıdır:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_PUBLIC_NUMBER`
- `WHATSAPP_GRAPH_VERSION` isteğe bağlıdır; ayarlanmazsa `v26.0` kullanılır.

Secret değerlerini GitHub'a, frontend JavaScript'e veya bu belgeye yazmayın.

## Meta webhook ayarı

Callback URL:

`https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-whatsapp-order`

Verify Token, Supabase ortamındaki `WHATSAPP_VERIFY_TOKEN` ile birebir aynı olmalıdır.

WhatsApp Business Account için uygulama webhook aboneliğinde mesaj olayları etkinleştirilmelidir.

## Akış

1. Müşteri siteden üyelik paketi ve banka ödeme talebi oluşturur.
2. Sistem müşteriye `FL-YYYYMMDD-XXXXXXXXXX` biçiminde sipariş/ödeme referansı verir.
3. Ödeme onaylandıktan sonra üyelik kodu mevcut `fl-bank-transfer` sistemi tarafından üretilir ve şifreli saklanır.
4. Müşteri sitedeki `WhatsApp’tan Kodumu Al` düğmesine basar veya sipariş kodunu WhatsApp hattına yollar.
5. Bot siparişi, ödeme durumunu ve telefon eşleşmesini kontrol eder.
6. Yalnız `paid` siparişte üyelik kodunu çözüp aynı WhatsApp numarasına cevap verir.
7. Kullanıcı kodu sitedeki `Üyelik Kodum Var` alanında kullanır.

## Public endpointler

- `GET ?action=health` servis durumunu döndürür, secret içermez.
- `GET ?action=public-config` yalnız botun etkin olup olmadığını döndürür.
- `GET ?action=chat-link` etkin bot için genel WhatsApp konuşma bağlantısına yönlendirir.
- `GET ?action=order-link&order_code=FL-...` sipariş kodu hazır mesajıyla WhatsApp'a yönlendirir.
- Callback URL üzerindeki Meta GET doğrulaması `hub.verify_token` ve `hub.challenge` kullanır.
- Callback URL üzerindeki POST istekleri Meta imzası doğrulandıktan sonra işlenir.

## Frontend

`whatsapp-order.js` yalnız `public-config.enabled = true` olduğunda WhatsApp kontrollerini gösterir. Meta erişim tokenı, App Secret veya telefon kimliği frontend'e verilmez.
