# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 02:36:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1325
- Kazanan tahmin: 93
- Kaybeden tahmin: 82
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

- 2.5 Üst: toplam 219, bekleyen 184, başarı %60, düz getiri %9, ağırlık 1
- MS 1: toplam 511, bekleyen 450, başarı %59, düz getiri %-1, ağırlık 1
- MS 2: toplam 233, bekleyen 209, başarı %58, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 526, bekleyen 473, başarı %42, düz getiri %-33, ağırlık 1
- KG Var: toplam 7, bekleyen 6, başarı %0, düz getiri %-100, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | ABD USL | Phoenix Rising - Tulsa Roughneck | 2.5 Üst | pending | 64/100
- 2026-09-12 | ABD MLS | Los Angeles - Seattle | MS 1 | pending | 49/100
- 2026-09-12 | ABD MLS | San Jose - Houston | 2.5 Alt | pending | 60/100
- 2026-09-12 | Meksika Liga MX Apertura | Cruz Azul - Club America | 2.5 Alt | pending | 67/100
- 2026-09-12 | Avustralya NPL Kuzey YGG Büyük Final | Weston Bears - Maitland | MS 1 | pending | 44/100
- 2026-09-12 | ABD MLS | Columbus - New York | MS 1 | pending | 60/100
- 2026-09-12 | ABD MLS | Orlando City - Toronto | MS 1 | pending | 61/100
- 2026-09-12 | ABD MLS | Inter Miami - Nashville Sc | MS 1 | pending | 58/100
- 2026-09-12 | ABD MLS | Dc United - Atlanta Utd | MS 1 | pending | 49/100
- 2026-09-12 | Brezilya Serie A | Botafogo - Bragantino | 2.5 Üst | pending | 69/100
- 2026-09-12 | Brezilya Serie A | Santos - Cruzeiro | 2.5 Üst | pending | 71/100
- 2026-09-12 | Ekvador Pro Lig | Ldu Quito - Deportivo Cuenc | 2.5 Üst | pending | 61/100
- 2026-09-12 | ABD MLS Next Pro | Minnesota Unit - Whitecaps Fc Ii | MS 1 | pending | 57/100
- 2026-09-12 | ABD MLS | Dallas - Portland | MS 1 | pending | 59/100
- 2026-09-12 | ABD MLS | Kansas - Los Angeles Fc | MS 2 | pending | 54/100

