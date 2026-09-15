# Robot Öğrenme Hafızası Raporu

Oluşturma: 15.09.2026 19:59:01

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1119
- Kazanan tahmin: 208
- Kaybeden tahmin: 173
- Lig sayısı: 267
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 610, bekleyen 463, başarı %59, düz getiri %0, ağırlık 1
- MS 1: toplam 504, bekleyen 398, başarı %55, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 168, bekleyen 101, başarı %54, düz getiri %-3, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- KG Var: toplam 16, bekleyen 1, başarı %47, düz getiri %-12, ağırlık 1
- MS 2: toplam 195, bekleyen 153, başarı %45, düz getiri %-14, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-15 | Portekiz U23 Ulusal Şampiyona | Penafiel U23 - Santa Clara U23 | 2.5 Üst | pending | 54/100
- 2026-09-15 | Copa Sudamericana Çeyrek Final | Vasco Da Gama (0) - (0) Santa Fe | 2.5 Alt | pending | 44/100
- 2026-09-15 | Brezilya Brasileiro Kadınlar 1.Aşama Yarı Final | Bahia (K) - Corinthians (K) | MS 2 | pending | 45/100
- 2026-09-15 | Meksika Liga MX Apertura | Puebla - Toluca | 2.5 Alt | pending | 68/100
- 2026-09-15 | İtalya Serie C Grup C | Barletta - Salernitana | 2.5 Üst | pending | 53/100
- 2026-09-15 | Galler Premier Lig 1.Aşama | Trefelin - Cambrian | 2.5 Alt | pending | 49/100
- 2026-09-15 | İsveç Superettan | Brage - Sandvikens | 2.5 Alt | pending | 48/100
- 2026-09-15 | Almanya Bölgesel Lig Kuzey Doğu | Zwickau - Altglienicke | MS 2 | pending | 49/100
- 2026-09-15 | Almanya Bölgesel Lig Bayern | Schweinfurt - Illertissen | MS 1 | pending | 52/100
- 2026-09-15 | Almanya Bölgesel Lig Bayern | Memmingen - Burghausen | MS 1 | pending | 50/100
- 2026-09-15 | İngiltere EFL Trophy Kuzey Grup D | Chesterfield - Man City U21 | MS 2 | pending | 47/100
- 2026-09-15 | Polonya Ekstraklasa | Rakow Czestoch - Zaglebie Lubin | MS 1 | pending | 51/100
- 2026-09-15 | İtalya Serie C Grup C | Picerno - Catania | MS 2 | pending | 45/100
- 2026-09-15 | Almanya Bölgesel Lig Bayern | Bayern Munich - Augsburg Ii | MS 1 | pending | 52/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Enfield Town - Dartford | MS 1 | pending | 45/100

