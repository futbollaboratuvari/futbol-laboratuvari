# Robot Öğrenme Hafızası Raporu

Oluşturma: 04.09.2026 12:45:55

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1099
- Kazanan tahmin: 228
- Kaybeden tahmin: 173
- Lig sayısı: 230
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 236, bekleyen 198, başarı %63, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 221, bekleyen 129, başarı %59, düz getiri %3, ağırlık 1
- MS 1: toplam 474, bekleyen 369, başarı %58, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 560, bekleyen 396, başarı %54, düz getiri %-11, ağırlık 1
- MS X: toplam 9, bekleyen 7, başarı %50, düz getiri %24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-04 | Guatemala Ulusal Lig Apertura | Antigua Guatem - Aurora | MS 1 | pending | 60/100
- 2026-09-04 | İngiltere FA Cup Eleme 1.Tur | Ossett United - Pontefract Coll | 2.5 Alt | pending | 48/100
- 2026-09-04 | İspanya LaLiga | Real Betis - Real Madrid | MS 2 | pending | 60/100
- 2026-09-04 | İrlanda Premier Lig | Shamrock Rover - Shelbourne | MS 1 | pending | 53/100
- 2026-09-04 | Arjantin Premier Lig 2. Aşama | Rio Cuarto - Sarmiento | MS 2 | pending | 44/100
- 2026-09-04 | İrlanda FAI Kupası Çeyrek Final | Waterford - Sligo Rovers | MS 1 | pending | 44/100
- 2026-09-04 | Sırbistan Süper Lig | Novi Pazar - Zeleznicar Panc | 2.5 Üst | pending | 54/100
- 2026-09-04 | İsveç Superettan | Oster - United Nordic | MS 2 | pending | 44/100
- 2026-09-04 | Romanya 1.Lig | Cfr Cluj - Ssc Farul | 2.5 Alt | pending | 53/100
- 2026-09-04 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Port Sudan - Welwalo Adigrat | MS 1 | pending | 50/100
- 2026-09-04 | Slovenya 2.SNL | Jadran Dekani - Tabor Sezana | MS 2 | pending | 57/100
- 2026-09-04 | Finlandiya Ykkösliiga | Jippo Joensuu - Kotka | 2.5 Üst | pending | 53/100
- 2026-09-04 | Tayland 1.Lig | Pattani - Bg Pathum Unite | 2.5 Alt | pending | 50/100
- 2026-09-04 | Ekvador Pro Lig | T.Universitari - Ldu Quito | 2.5 Alt | pending | 61/100
- 2026-09-04 | İngiltere Kadınlar Premier Lig | London City (K - Manchester Unit | 2.5 Alt | pending | 52/100

