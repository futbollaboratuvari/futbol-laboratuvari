# Futbol Laboratuvarı Premium Ödeme Planı

Bu doküman Futbol Laboratuvarı ücretli üyelik ve ödeme altyapısının ana planıdır.

Amaç: Kullanıcı paket seçsin, güvenli ödeme yapsın, ödeme başarılı olunca premium özel maç analiz paneli açılsın.

---

## 1. Hedef Akış

1. Kullanıcı siteye gelir.
2. Üyelik paketlerinden birini seçer.
3. E-posta / ad soyad / telefon bilgisi alınır.
4. Backend tarafında sipariş kaydı oluşturulur.
5. PayTR ödeme token veya ödeme linki üretilir.
6. Kullanıcı PayTR güvenli ödeme ekranına yönlendirilir.
7. PayTR ödeme sonucunu backend `callback` adresine POST eder.
8. Backend hash doğrulaması yapar.
9. Ödeme başarılıysa üyelik aktif edilir.
10. Kullanıcı premium özel maç analiz paneline erişir.

---

## 2. Neden Backend Gerekli?

GitHub Pages statik sitedir. Aşağıdaki işlemler güvenli şekilde frontend içinde yapılamaz:

- PayTR merchant key / salt saklama
- Ödeme token üretme
- PayTR callback karşılama
- Hash doğrulama
- Üyeliği güvenli şekilde aktif etme
- Kullanıcı hesabı ve abonelik süresi tutma

Bu yüzden küçük bir backend gerekir.

Önerilen ilk backend seçenekleri:

- Supabase Edge Functions
- Vercel Functions
- Netlify Functions
- Küçük VPS üzerinde Node.js API

İlk aşama için en pratik seçenek: **Vercel Functions veya Supabase Edge Functions**.

---

## 3. Ödeme Sağlayıcı Kararı

İlk hedef sağlayıcı: **PayTR**

Sebep:

- Türkiye odaklı.
- Sanal POS ve ödeme sayfası akışı var.
- Bildirim URL / callback mantığı üyelik aktif etmek için uygun.
- Üye işyeri hesabı açıldıktan sonra mağaza bilgileri alınabilir.

Alternatif sağlayıcı:

- iyzico

---

## 4. PayTR İçin Gerekli Bilgiler

PayTR mağaza panelinden alınacak bilgiler:

- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`

Backend ortam değişkenleri:

```env
PAYTR_MERCHANT_ID=...
PAYTR_MERCHANT_KEY=...
PAYTR_MERCHANT_SALT=...
PAYTR_TEST_MODE=1
SITE_BASE_URL=https://futbollaboratuvari.github.io/futbol-laboratuvari
```

Bu bilgiler asla frontend dosyalarına yazılmayacak.

---

## 5. Paket Yapısı

Mevcut paket dosyası:

- `data/membership_plans.json`

Paketler:

- Başlangıç: 149 TL / Ay
- Pro Analiz: 299 TL / Ay
- VIP Kupon: 499 TL / Ay

İleride veritabanında tutulması gereken alanlar:

```json
{
  "user_id": "...",
  "email": "...",
  "plan_id": "pro",
  "membership_status": "active",
  "membership_started_at": "...",
  "membership_expires_at": "...",
  "payment_provider": "paytr",
  "last_order_id": "..."
}
```

---

## 6. Sipariş Tablosu

Backend tarafında tutulacak sipariş modeli:

```json
{
  "order_id": "FL-20260619-ABC123",
  "email": "uye@example.com",
  "name": "Ad Soyad",
  "phone": "05xx...",
  "plan_id": "pro",
  "amount_kurus": 29900,
  "currency": "TL",
  "status": "pending",
  "provider": "paytr",
  "created_at": "...",
  "paid_at": null
}
```

Durumlar:

- `pending`: ödeme başlatıldı
- `paid`: ödeme başarılı
- `failed`: ödeme başarısız
- `cancelled`: iptal edildi
- `expired`: süresi doldu

---

## 7. Callback Mantığı

PayTR ödeme sonucunu backend Bildirim URL adresine gönderir.

Backend şunları yapmalı:

1. `merchant_oid` ile siparişi bul.
2. PayTR hash değerini doğrula.
3. Sipariş daha önce işlendiyse sadece `OK` dön.
4. `status=success` ise siparişi `paid` yap.
5. Üyeliği aktif et.
6. Başarısızsa siparişi `failed` yap.
7. PayTR'ye sadece düz metin `OK` dön.

---

## 8. Site Paneli Bağlantısı

Mevcut dosya:

- `membership-payment-panel.js`

Şu an frontend beta paneldir.

İleride yapılacak:

- Paket seçildiğinde backend endpoint çağrılacak.
- Backend ödeme token/link dönecek.
- Kullanıcı ödeme sayfasına yönlendirilecek.

Planlanan endpoint:

```txt
POST /api/paytr/create-payment
```

Örnek istek:

```json
{
  "plan_id": "pro",
  "email": "uye@example.com",
  "name": "Ad Soyad",
  "phone": "05xx..."
}
```

Örnek cevap:

```json
{
  "ok": true,
  "order_id": "FL-...",
  "payment_url": "https://..."
}
```

---

## 9. Premium Panel Açma

Ödeme başarılı olunca backend kullanıcı üyeliğini aktif eder.

Frontend premium erişim kontrolü ileride şu şekilde yapılacak:

```txt
GET /api/me/subscription
```

Cevap:

```json
{
  "active": true,
  "plan_id": "pro",
  "expires_at": "..."
}
```

Böylece `FL-BETA` gibi geçici kod sistemi kaldırılacak.

---

## 10. Yasal Sayfalar

PayTR başvurusu ve ödeme güveni için siteye eklenecek sayfalar:

- KVKK
- Gizlilik Politikası
- Kullanım Şartları
- İade / İptal Politikası
- Mesafeli Satış Sözleşmesi
- İletişim

---

## 11. Öncelikli Uygulama Sırası

1. Şahıs şirketi aç.
2. PayTR üye işyeri başvurusu yap.
3. Siteye yasal sayfaları ekle.
4. Backend seç: Vercel/Supabase/Netlify/VPS.
5. PayTR test bilgilerini backend ortam değişkenlerine gir.
6. `create-payment` endpointini çalıştır.
7. PayTR callback endpointini test et.
8. Ödeme başarılı olunca üyelik aktif et.
9. Premium özel maç analiz panelini üyeliğe bağla.

---

## 12. Kritik Güvenlik Kuralları

- PayTR merchant key ve salt frontend'e yazılmayacak.
- Kart bilgisi sitede saklanmayacak.
- Callback hash kontrolü zorunlu olacak.
- Aynı siparişe tekrar ödeme bildirimi gelirse ikinci kez üyelik/ödeme işlenmeyecek.
- Üyelik açma sadece callback doğrulandıktan sonra yapılacak.

---

## 13. Durum

Mevcut durum:

- Frontend üyelik/ödeme paneli hazır.
- Paket dosyası hazır.
- Premium özel analiz paneli hazır.
- Backend/payment entegrasyonu henüz canlı değil.

Sonraki teknik adım:

- `serverless/paytr` içindeki backend taslağı gerçek backend sağlayıcısına taşınacak.
