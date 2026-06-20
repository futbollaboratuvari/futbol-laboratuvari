# Mega Hafıza Kaydı - GitHub Actions Gerçek Robot Otomasyonu

Tarih: 2026-06-20
Repo: `futbollaboratuvari/futbol-laboratuvari`

## Yapılan Son İşlem

GitHub Actions tarafında gerçek robot otomasyonu bağlandı.

Güncellenen workflow:

- `.github/workflows/update-fixtures.yml`

Commit mesajı:

- `GitHub Actions gerçek robot otomasyonu bağlandı`

Commit SHA:

- `edc367b33e01ee286ead052a9f77762ebd1152c7`

## Teknik Karar

Önceki durumda GitHub Actions saatlik çalışıyordu ancak ana Python robot dosyası doğrudan çalıştırılmıyordu. Workflow içinde sadece Maçkolik veri çekici ve Node.js analiz akışı vardı.

Bu işlemle workflow içine ana gerçek robot çağrısı eklendi:

```bash
python src/robot.py
```

Çalışma klasörü:

```text
bu-klas-r-i-in-basit
```

## Workflow Akışı

Yeni otomasyon sırası:

1. Repo checkout yapılır.
2. Node.js 20 kurulur.
3. Python 3.11 kurulur.
4. Python robot bağımlılıkları kurulur.
5. Playwright Chromium kurulur.
6. `node scripts/update-fixtures.js` ile Maçkolik fikstür listesi güncellenir.
7. `python src/robot.py` ile ana gerçek robot çalıştırılır.
8. `node scripts/import-robot-raw-pool.js` ile robot ham havuzu site verisine aktarılır.
9. `node scripts/update-analysis-report.js` ile analiz raporu ve site JSON dosyaları üretilir.
10. Değişiklik varsa otomatik commit/push yapılır.

## API Secret Bağlantısı

Workflow job ortamına şu secret isimleri bağlandı:

- `FOOTBALL_DATA_API_KEY`
- `API_FOOTBALL_KEY`
- `API_FOOTBALL_KEY2`

Robot bu secretları `api_secrets.py` içindeki öncelik sırasına göre kullanır.

## Commitlenen Dosya Kapsamı

Otomatik commit/push kapsamına hem kök site verileri hem de robot klasörü çıktıları eklendi:

- `data/fixtures.json`
- `data/spor_toto_bulteni.json`
- `data/ham_mac_havuzu.json`
- `data/tahmin_gecmisi.json`
- `data/analiz_sonuclari.json`
- `outputs/bugunun_en_guclu_maclari.md`
- `outputs/mackolik_veri_cekme_raporu.md`
- `outputs/basari_yuzdesi_raporu.md`
- `bu-klas-r-i-in-basit/data/ham_mac_havuzu.json`
- `bu-klas-r-i-in-basit/data/tahmin_gecmisi.json`
- `bu-klas-r-i-in-basit/data/canli-veri.json`
- `bu-klas-r-i-in-basit/data/analiz_sonuclari.json`
- `bu-klas-r-i-in-basit/outputs/bugunun_en_guclu_maclari.md`
- `bu-klas-r-i-in-basit/outputs/mackolik_veri_cekme_raporu.md`
- `bu-klas-r-i-in-basit/outputs/basari_yuzdesi_raporu.md`

## Önemli Not

`Run full Python robot` adımı `continue-on-error: true` ile bırakıldı. Bunun sebebi, Python robot geçici olarak hata verirse site veri akışının tamamen durmamasıdır. Böylece Node.js fikstür ve analiz fallback akışı çalışmaya devam eder.

Bu durum güvenli geçiş kararıdır. İleride robot tamamen stabil olduğunda bu ayar kaldırılabilir.

## Son Durum

- PC kapalıyken GitHub Actions saatlik çalışma yapabilir.
- Ana robot artık workflow içinde çağrılır.
- API keyler GitHub Secrets üzerinden robot ortamına aktarılır.
- Robot çıktıları ve site verileri otomatik commit/push kapsamına alınmıştır.

## Sonraki Kontrol

GitHub Actions manuel olarak `Run workflow` ile çalıştırılıp şu kontrol edilmeli:

1. Python dependency kurulumu başarılı mı?
2. Playwright Chromium kurulumu başarılı mı?
3. `python src/robot.py` hata veriyor mu?
4. `data/analiz_sonuclari.json` doluyor mu?
5. `outputs/bugunun_en_guclu_maclari.md` güncelleniyor mu?
6. Otomatik commit oluşuyor mu?
