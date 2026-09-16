# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 03:43:01

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1150
- Kazanan tahmin: 196
- Kaybeden tahmin: 154
- Lig sayısı: 280
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 594, bekleyen 465, başarı %62, düz getiri %6, ağırlık 1
- MS 1: toplam 505, bekleyen 401, başarı %55, düz getiri %-8, ağırlık 1
- 2.5 Üst: toplam 165, bekleyen 104, başarı %54, düz getiri %-2, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- MS 2: toplam 214, bekleyen 173, başarı %46, düz getiri %-10, ağırlık 1
- KG Var: toplam 15, bekleyen 4, başarı %46, düz getiri %-17, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | Bolivya Premier Lig | Guabira - Aurora | 2.5 Alt | pending | 63/100
- 2026-09-16 | AFC Şampiyonlar Ligi 2 Grup C | Al Nahda - Al Taawon | MS 1 | pending | 51/100
- 2026-09-16 | Endonezya Süper Lig | Borneo Fc - Dewa United | MS 1 | pending | 49/100
- 2026-09-16 | ABD USL Lig 1 | Fort Wayne - One Knoxville | 2.5 Alt | pending | 61/100
- 2026-09-16 | İngiltere Lig Kupası 3.Tur | Fleetwood Town - Sheffield Utd | KG Var | pending | 76/100
- 2026-09-16 | İngiltere Lig Kupası 3.Tur | Everton - Wolverhampton | 2.5 Alt | pending | 65/100
- 2026-09-16 | İngiltere Ulusal Lig | Altrincham - Hartlepool | 2.5 Alt | pending | 66/100
- 2026-09-16 | İngiltere Ulusal Lig | Scunthorpe - Boreham Wood | KG Var | pending | 75/100
- 2026-09-16 | Yunanistan Kupa Lig Aşaması | Atromitos - Paok | KG Var | pending | 68/100
- 2026-09-16 | Uganda Premier Lig | Mbarara City - Entebbe Uppc | 2.5 Alt | pending | 50/100
- 2026-09-16 | İngiltere Ulusal Lig | Altrincham - Hartlepool | MS 1 | pending | 66/100
- 2026-09-16 | Kadınlar U20 Dünya Kupası Son 16 Turu | Brezilya U20 ( - Abd U20 (K) | 2.5 Alt | pending | 50/100
- 2026-09-16 | Kuzey Amerika Şampiyonlar Kupası Final | Inter Miami - Cruz Azul | MS 1 | pending | 50/100
- 2026-09-16 | Copa Libertadores Çeyrek Final | Corinthians (1) - (1) Estudiantes Lp | MS 1 | pending | 42/100
- 2026-09-16 | CONCACAF Orta Amerika Kupası Çeyrek Final | Cs Cartagines (2) - (2) Deportivo Sapri | 2.5 Alt | pending | 47/100

