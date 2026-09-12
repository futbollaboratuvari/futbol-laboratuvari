# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 04:37:46

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1320
- Kazanan tahmin: 94
- Kaybeden tahmin: 86
- Lig sayısı: 266
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 220, bekleyen 181, başarı %59, düz getiri %8, ağırlık 1
- MS 1: toplam 509, bekleyen 449, başarı %57, düz getiri %-5, ağırlık 1
- MS 2: toplam 231, bekleyen 208, başarı %56, düz getiri %-1, ağırlık 1
- 2.5 Alt: toplam 528, bekleyen 472, başarı %43, düz getiri %-30, ağırlık 1
- KG Var: toplam 8, bekleyen 7, başarı %0, düz getiri %-100, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | ABD USL | Sporting Jax - Rhode Island | KG Var | pending | 71/100
- 2026-09-12 | Güney Afrika PSL | Amazulu - Marumo Gallants | MS 1 | pending | 50/100
- 2026-09-12 | Letonya Virsliga | Grobina - Fs Jelgava | 2.5 Alt | pending | 52/100
- 2026-09-12 | Romanya 2.Lig | Afumati - Asa Targu Mureş | 2.5 Alt | pending | 49/100
- 2026-09-12 | Çin Halk Cumhuriyeti 1.Lig | Guangxi Hengch - Yanbian Longdin | 2.5 Üst | pending | 53/100
- 2026-09-12 | Litvanya 1.Lig | Garliava - Bfa | 2.5 Üst | pending | 54/100
- 2026-09-12 | ABD USL | Phoenix Rising - Tulsa Roughneck | 2.5 Üst | pending | 64/100
- 2026-09-12 | ABD MLS | Los Angeles - Seattle | MS 1 | pending | 49/100
- 2026-09-12 | ABD MLS | San Jose - Houston | 2.5 Alt | pending | 62/100
- 2026-09-12 | Meksika Liga MX Apertura | Cruz Azul - Club America | 2.5 Alt | pending | 70/100
- 2026-09-12 | Avustralya NPL Kuzey YGG Büyük Final | Weston Bears - Maitland | MS 1 | pending | 44/100
- 2026-09-12 | ABD MLS | Columbus - New York | MS 1 | pending | 60/100
- 2026-09-12 | ABD MLS | Orlando City - Toronto | MS 1 | pending | 61/100
- 2026-09-12 | ABD MLS | Inter Miami - Nashville Sc | MS 1 | pending | 58/100
- 2026-09-12 | ABD MLS | Dc United - Atlanta Utd | MS 1 | pending | 49/100

