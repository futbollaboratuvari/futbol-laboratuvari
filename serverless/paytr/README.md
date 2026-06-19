# PayTR Backend Taslağı

Bu klasör Futbol Laboratuvarı premium ödeme sistemi için backend iskeletidir.

GitHub Pages statik olduğu için PayTR entegrasyonunun güvenli kısmı burada veya benzer bir serverless backend içinde çalışmalıdır.

---

## Endpointler

### 1. Ödeme Başlatma

```txt
POST /api/paytr/create-payment
```

Görevleri:

- Paket ve kullanıcı bilgilerini alır.
- Sipariş numarası üretir.
- Siparişi veritabanına `pending` olarak kaydeder.
- PayTR token veya ödeme linki oluşturur.
- Frontend'e ödeme yönlendirme bilgisini döner.

### 2. PayTR Callback

```txt
POST /api/paytr/callback
```

Görevleri:

- PayTR ödeme sonucunu alır.
- Hash doğrular.
- `merchant_oid` ile siparişi bulur.
- Ödeme başarılıysa üyeliği aktif eder.
- Başarısızsa siparişi failed yapar.
- PayTR'ye düz metin `OK` döner.

---

## Gerekli Ortam Değişkenleri

```env
PAYTR_MERCHANT_ID=...
PAYTR_MERCHANT_KEY=...
PAYTR_MERCHANT_SALT=...
PAYTR_TEST_MODE=1
SITE_BASE_URL=https://futbollaboratuvari.github.io/futbol-laboratuvari
```

Bu bilgiler frontend dosyalarına yazılmayacak.

---

## Veritabanı Tabloları

### users

- id
- email
- name
- phone
- created_at

### orders

- id
- merchant_oid
- user_id
- plan_id
- amount_kurus
- currency
- status
- provider
- created_at
- paid_at

### memberships

- id
- user_id
- plan_id
- status
- started_at
- expires_at
- last_order_id

---

## Uygulama Notu

Bu klasördeki kodlar doğrudan GitHub Pages içinde çalışmaz. Vercel, Netlify, Supabase Edge Functions veya küçük bir VPS üzerinde çalıştırılmalıdır.
