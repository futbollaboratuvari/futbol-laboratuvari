# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 17:40:30

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1118
- Kazanan tahmin: 200
- Kaybeden tahmin: 182
- Lig sayısı: 239
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 3, bekleyen 2, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 235, bekleyen 136, başarı %61, düz getiri %4, ağırlık 1
- 2.5 Alt: toplam 536, bekleyen 400, başarı %55, düz getiri %-9, ağırlık 1
- MS 1: toplam 502, bekleyen 403, başarı %44, düz getiri %-27, ağırlık 0.94
- MS 2: toplam 222, bekleyen 176, başarı %41, düz getiri %-25, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-08 | İngiltere Ulusal Lig N / S Kuzey | Telford - Oxford City | MS 1 | pending | 42/100
- 2026-09-08 | Güney Kore K Lig 1 | Incheon Utd - Bucheon | 2.5 Üst | pending | 59/100
- 2026-09-08 | ABD MLS Next Pro | Toronto Fc Ii - Columbus Crew I | MS 1 | pending | 44/100
- 2026-09-08 | ABD MLS Next Pro | New York City - New York Rb Ii | MS 2 | pending | 49/100
- 2026-09-08 | Copa Sudamericana Çeyrek Final | Santa Fe - Vasco Da Gama | MS 1 | pending | 46/100
- 2026-09-08 | Paraguay Intermedia Lig | General Caball - Resistencia | MS 1 | pending | 48/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Güney | Maidenhead Utd - Torquay | 2.5 Üst | pending | 53/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Buckhurst Hill - Yaxley | MS 1 | pending | 42/100
- 2026-09-08 | Irak Premier Lig | Al Gharraf - Al Shorta | 2.5 Alt | pending | 55/100
- 2026-09-08 | İspanya De La Reina Kupası 1. Tur | Huesca (K) - Zaragoza (K) | 2.5 Alt | pending | 54/100
- 2026-09-08 | İspanya De La Reina Kupası 1. Tur | Alhama (K) - Fundacion Albac | MS 1 | pending | 50/100
- 2026-09-08 | İngiltere Premier Lig Kupası Grup E | Fleetwood Town - Burnley U21 | 2.5 Alt | pending | 50/100
- 2026-09-08 | Suudi Arabistan 1.Lig | Al Zulfi - Hajer | MS 1 | pending | 51/100
- 2026-09-08 | Paraguay Intermedia Lig | General Caball - Resistencia | 2.5 Alt | pending | 54/100
- 2026-09-08 | ABD USL Kupası Yarı Final | Hartford Athle - Colorado Spring | MS 1 | pending | 36/100

