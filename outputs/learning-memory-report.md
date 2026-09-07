# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 02:37:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1131
- Kazanan tahmin: 194
- Kaybeden tahmin: 175
- Lig sayısı: 238
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 1, bekleyen 0, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 231, bekleyen 136, başarı %61, düz getiri %4, ağırlık 1
- 2.5 Alt: toplam 529, bekleyen 397, başarı %56, düz getiri %-7, ağırlık 1
- MS 2: toplam 234, bekleyen 191, başarı %44, düz getiri %-19, ağırlık 1
- MS 1: toplam 503, bekleyen 406, başarı %42, düz getiri %-31, ağırlık 0.94

## Son Tahmin Kayıtları

- 2026-09-08 | Mısır Premier Lig | Al Zamalek Cai - Abu Qair | 2.5 Alt | pending | 54/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Fakenham Town - Ware | 2.5 Alt | pending | 48/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Havant And W. - Chippenham Town | 2.5 Alt | pending | 49/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Kettering - Wellingborough | MS 1 | pending | 52/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Porto - Manchester City | MS 2 | pending | 54/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | B.Dortmund - Villarreal | MS 1 | pending | 50/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Real Madrid - Inter | MS 1 | pending | 56/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Lille - Real Betis | 2.5 Alt | pending | 61/100
- 2026-09-08 | İngiltere Lig Kupası 3.Tur | Millwall - Newcastle Utd | MS 2 | pending | 62/100
- 2026-09-08 | İngiltere Championship | Bolton - West Ham | MS 2 | pending | 70/100
- 2026-09-08 | Copa Libertadores Çeyrek Final | Fluminense - Platense | MS 1 | pending | 58/100
- 2026-09-08 | Copa Sudamericana Çeyrek Final | Santa Fe - Vasco Da Gama | 2.5 Alt | pending | 58/100
- 2026-09-08 | ABD USL Kupası Yarı Final | Hartford Athle - Colorado Spring | 2.5 Üst | pending | 53/100
- 2026-09-08 | ABD MLS Next Pro | New York City - New York Rb Ii | MS 2 | pending | 49/100
- 2026-09-08 | ABD MLS Next Pro | Toronto Fc Ii - Columbus Crew I | MS 1 | pending | 44/100

