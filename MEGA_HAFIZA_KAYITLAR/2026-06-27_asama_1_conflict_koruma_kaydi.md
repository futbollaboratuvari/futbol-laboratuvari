# Aşama 1 - Conflict Koruma Katmanı Kaydı

Tarih: 2026-06-27
Durum: Tamamlandı
Uygulama tipi: Küçük ve güvenli koruma katmanı

## Amaç

Workflow'ların bozuk JSON veya Git conflict marker içeren dosyaları siteye/data klasörüne tekrar commit etmesini engellemek.

## Kök Sorun Bağlamı

Önceki kontrolde repo içinde bazı data/output dosyalarında şu conflict marker işaretleri görüldü:

- <<<<<<<
- =======
- >>>>>>>

Bu işaretler özellikle JSON dosyalarında bulunduğunda dosya artık geçerli JSON olmaz. Robot ham havuzu okunamaz ve fixtures/bülten akışı boş kalır.

## Yapılan Değişiklik 1

Yeni dosya eklendi:

scripts/validate-json-no-conflicts.js

Bu script şu klasörleri tarar:

- data
- outputs
- bu-klas-r-i-in-basit/data
- bu-klas-r-i-in-basit/outputs

Kontrol eder:

1. .json, .md, .txt dosyalarında conflict marker var mı?
2. .json dosyaları parse edilebilir mi?

Sorun bulursa process.exit(1) ile workflow'u durdurur.

Commit:
270f957d46c8b9982bdcd0b33760efc327ae1cd3

## Yapılan Değişiklik 2

Dosya güncellendi:

.github/workflows/update-fixtures.yml

Yeni adım eklendi:

- name: Validate data outputs before commit
  run: node scripts/validate-json-no-conflicts.js

Bu adım commit/push adımından hemen önce çalışır.

Commit:
33c0836c7f54492821fd3a432c74a456d335569d

## Korunan Noktalar

- data/fixtures.json değiştirilmedi.
- bu-klas-r-i-in-basit/data/ham_mac_havuzu.json değiştirilmedi.
- Mevcut veri dosyalarına toplu temizlik yapılmadı.
- Sadece koruma scripti ve ana workflow bağlantısı eklendi.

## Beklenen Etki

Mevcut bozuk dosyalar temizlenmeden workflow çalışırsa commit aşamasından önce durur.
Bu, yeni conflict marker'lı / bozuk JSON dosyalarının tekrar siteye basılmasını engeller.

## Sonraki Aşama

Aşama 2'de bozuk dosyalar tek tek ve kontrollü şekilde temizlenmeli.
Öncelik:

1. bu-klas-r-i-in-basit/data/ham_mac_havuzu.json
2. data tarafındaki conflict marker içeren JSON/rapor dosyaları
3. workflow push/pull güvenliği
