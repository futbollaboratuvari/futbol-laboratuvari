# 2026-06-25 — Robot Öğrenme Hafızası Altyapısı

Bu kayıt, Futbol Laboratuvarı robotuna öğrenme hafızası altyapısı eklenen çalışmayı kalıcı proje hafızasına almak için oluşturuldu.

## Amaç

Robotun sadece veri toplayan ve kurallı skor üreten sistem olarak kalmaması; zamanla tahminlerini, sonuçlarını, lig/market başarılarını ve ağırlık ayarlarını tutabilecek bir hafıza altyapısına kavuşması.

## Kullanıcının Talimatı

- `Robot öğrenme hafızası altyapısını ekle.`
- `Her adımı mega hafızaya kayıt et.`

## Yapılan Adımlar

### 1. Öğrenme hafızası veri dosyası eklendi

Dosya:

```text
/data/learning-memory.json
```

İşlev:

- Robot tahmin kayıtlarını tutar.
- Lig hafızasını tutar.
- Market/seçenek hafızasını tutar.
- Lig + market ortak performans hafızasını tutar.
- Bekleyen/kazanan/kaybeden tahmin sayılarını özetler.

Commit:

```text
6e85dc31d3f8d78975aa9b5c1653546e6e314c4c
Robot ogrenme hafizasi dosyasini ekle
```

### 2. Öğrenme hafızası scripti eklendi

Dosya:

```text
/scripts/robot-learning-memory.js
```

İşlev:

- `data/robot-analysis.json` dosyasındaki robot kararlarını okur.
- `data/live-matches.json` dosyasındaki skor/durum bilgisiyle eşleştirmeye çalışır.
- Her tahmin için kayıt oluşturur.
- Maç sonucu varsa KG Var, KG Yok, 2.5 Üst, 2.5 Alt, 3.5 Üst, MS 1, MS X, MS 2 için kazandı/kaybetti değerlendirmesi yapar.
- Henüz sonuç yoksa tahmini `pending` bırakır.
- Lig, market ve lig+market başarı hafızasını üretir.
- Yeterli veri yoksa ağırlığı nötr bırakır.
- Raporu `outputs/learning-memory-report.md` dosyasına yazar.

Commit:

```text
487879077541838aea3a928ae20d03294ef81f0e
Robot ogrenme hafizasi scriptini ekle
```

### 3. Canlı veri akışına öğrenme hafızası bağlandı

Dosya:

```text
/scripts/ensure-live-json.js
```

İşlev:

- Mevcut workflow zaten bu dosyayı çalıştırdığı için güvenli entegrasyon buradan yapıldı.
- Dosyanın sonunda `robot-learning-memory.js` çağrılır.
- Böylece canlı veri üretimi sonrası öğrenme hafızası da güncellenir.

Not:

- `.github/workflows/update-fixtures.yml` dosyasına doğrudan müdahale güvenlik filtresi tarafından engellendi.
- Aynı otomatik akış, mevcut çalışan `ensure-live-json.js` adımı üzerinden bağlandı.

Commit:

```text
a0f139c996c494fd61f545f2d6221521c91a0c23
Canli veri akisini robot ogrenme hafizasina bagla
```

### 4. Paket komutu eklendi

Dosya:

```text
/package.json
```

Eklenen komut:

```text
npm run learn:robot
```

Karşılığı:

```text
node scripts/robot-learning-memory.js
```

Commit:

```text
2bf3dbc9f0c09c27a4c1f415e4caaea659dfd4dd
Robot ogrenme komutunu paket scriptlerine ekle
```

### 5. İlk rapor dosyası eklendi

Dosya:

```text
/outputs/learning-memory-report.md
```

İşlev:

- İlk bootstrap raporu.
- Canlı veri akışı tekrar çalışınca script gerçek raporu bunun üzerine yazar.

Commit:

```text
920c05bc0ffb468b4b9e9f7c8cf8af26120d1b8f
Robot ogrenme hafizasi ilk raporunu ekle
```

## Öğrenme Mantığı

Robot öğrenme sistemi şu sırayla çalışacak:

```text
1. Robot maç ve seçenek üretir.
2. Tahmin learning-memory içine kaydedilir.
3. Maç sonucu gelene kadar durum pending kalır.
4. Skor geldiğinde tahmin won/lost olarak işlenir.
5. Lig başarı oranı hesaplanır.
6. Market/seçenek başarı oranı hesaplanır.
7. Lig + market ortak başarı oranı hesaplanır.
8. En az 5 sonuç oluşmadan ağırlık değiştirilmez.
9. Yeterli veri oluşunca weight ve confidence_adjustment hesaplanır.
```

## Şimdiki Durum

Robot artık öğrenme için gerekli hafıza dosyasına ve işleyici scriptine sahiptir.

Fakat bu aşama henüz tam otomatik karar ağırlığına bağlanmış nihai model değildir. Şu anki aşama:

```text
Tahminleri kaydet + sonuçları takip et + başarı hafızası oluştur.
```

Bir sonraki aşama:

```text
Öğrenme hafızasını robot skor motoruna bağla.
```

Bu yapılınca robot, geçmiş başarıya göre bazı lig/marketlerde güveni artırıp bazılarını düşürebilecek.

## Dikkat

- Robot acele öğrenmeyecek.
- En az 5 sonuç olmadan market/lig ağırlığı değişmeyecek.
- Ziyaretçiye teknik robot dili gösterilmeyecek.
- Hafıza dosyaları proje hafızasının parçası olarak korunacak.
