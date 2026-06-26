# Aşama 2 - Conflict Tamir Katmanı Kaydı

Tarih: 2026-06-27
Durum: Tamamlandı
Uygulama tipi: Küçük ve kontrollü tamir katmanı

## Amaç

Robot ve site veri akışı başlamadan önce conflict marker içeren bozuk JSON/rapor dosyalarını otomatik temizlemeyi denemek.

Bu aşama, büyük veri dosyalarını elle sıfırlamadan veya ham havuzu silmeden yapıldı.

## Yapılan Değişiklik 1

Yeni dosya eklendi:

scripts/repair-conflict-markers.js

Görevi:

- data
- outputs
- bu-klas-r-i-in-basit/data
- bu-klas-r-i-in-basit/outputs

klasörlerini tarar.

Şu conflict marker işaretlerini arar:

- <<<<<<<
- =======
- >>>>>>>

Bulduğu conflict bloklarını otomatik temizlemeyi dener.
JSON dosyalarında temizlik sonrası JSON.parse kontrolü yapar.
Geçerli JSON değilse dosyayı sessizce siteye basmaz; hata verip durur.

Commit:
c5c0823500ca4169276f9a81f283dc8a84a8f741

## Yapılan Değişiklik 2

Dosya güncellendi:

.github/workflows/update-fixtures.yml

Yeni adım, veri akışı başlamadan önce eklendi:

- name: Repair conflict markers before data run
  run: node scripts/repair-conflict-markers.js

Bu adım şu işlemlerden önce çalışır:

1. node scripts/update-fixtures.js
2. python src/robot.py
3. node scripts/import-robot-raw-pool.js

Böylece Python robot, bozuk ham veri havuzunu okumadan önce dosya temizlenmeye çalışılır.

Commit:
52b36af89ba29a1256f1ee24753d0442e59c3dde

## Korunan Noktalar

- bu-klas-r-i-in-basit/data/ham_mac_havuzu.json elle sıfırlanmadı.
- data/fixtures.json elle değiştirilmedi.
- Mevcut veri havuzu silinmedi.
- Sadece otomatik tamir katmanı eklendi ve ana workflow'a bağlandı.

## Aşama 1 ile Bağlantı

Aşama 1'de eklenen validate-json-no-conflicts.js commit öncesi kontrol yapıyordu.
Aşama 2'de eklenen repair-conflict-markers.js ise veri akışı başlamadan önce temizlik denemesi yapıyor.

Yeni zincir:

1. Repair conflict markers before data run
2. Update Mackolik fixture list
3. Run full Python robot
4. Import robot raw pool into site data
5. Validate data outputs before commit
6. Commit and push outputs

## Beklenen Etki

Workflow tekrar çalıştığında:

- Eğer ham havuzdaki conflict marker otomatik temizlenebilirse robot dosyayı okuyabilir.
- Maçkolik'ten bulunan maçlar ham havuza kaydedilebilir.
- Import adımı fixtures.json içine aktarım yapabilir.
- Validate adımı son kontrolü yapar.

## Sonraki Aşama

Aşama 3'te workflow tetiklenip sonuç kontrol edilmeli:

- bu-klas-r-i-in-basit/outputs/mackolik_veri_cekme_raporu.md
- bu-klas-r-i-in-basit/data/ham_mac_havuzu.json
- data/fixtures.json
- data/spor_toto_bulteni.json

Kontrol hedefi:

- Conflict marker temizlendi mi?
- Maçkolik bulunan maçları kaydetti mi?
- fixtures.json doldu mu?
- bülten siteye maç verdi mi?
