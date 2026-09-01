# Robot Öğrenme Hafızası Raporu

Oluşturma: 01.09.2026 03:03:10

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1096
- Kazanan tahmin: 221
- Kaybeden tahmin: 183
- Lig sayısı: 209
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 4, bekleyen 3, başarı %100, düz getiri %146, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 219, bekleyen 131, başarı %66, düz getiri %18, ağırlık 1
- MS 2: toplam 210, bekleyen 176, başarı %56, düz getiri %-5, ağırlık 1
- MS 1: toplam 487, bekleyen 393, başarı %53, düz getiri %-13, ağırlık 1
- 2.5 Alt: toplam 577, bekleyen 391, başarı %50, düz getiri %-18, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-01 | İngiltere Non League Premier Kuzey | Leek Town - Warrington Town | 2.5 Alt | pending | 49/100
- 2026-09-01 | İngiltere Non League Premier Güney Merkez | Stourbridge - Leamington | 2.5 Alt | pending | 46/100
- 2026-09-01 | İtalya Kupa 2.Tur | Torino - Monza | 2.5 Üst | pending | 61/100
- 2026-09-01 | İngiltere Championship | Birmingham - Southam | 2.5 Üst | pending | 74/100
- 2026-09-01 | İngiltere Championship | Stoke - Norwich | 2.5 Üst | pending | 68/100
- 2026-09-01 | İtalya Serie C Kupası 2.Tur | Bari - Picerno | 2.5 Alt | pending | 46/100
- 2026-09-01 | İtalya Serie C Kupası 2.Tur | Ravenna - Forli | MS 1 | pending | 54/100
- 2026-09-01 | İtalya Serie C Kupası 2.Tur | Rossoblu Poten - Ss Monopoli 196 | 2.5 Alt | pending | 52/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | Penafiel U23 - Leixoes U23 | 2.5 Üst | pending | 53/100
- 2026-09-01 | Peru Premier Lig Clausura | Atletico Grau - Melgar | 2.5 Alt | pending | 52/100
- 2026-09-01 | Ekvador Pro Lig | Delfin - T.Universitario | 2.5 Alt | pending | 54/100
- 2026-09-01 | Brezilya Serie B | Londrina - Juventude | MS 2 | pending | 45/100
- 2026-09-01 | Uruguay Kupa Ön Eleme Turu Grup 1 | Torque - Danubio | 2.5 Alt | pending | 55/100
- 2026-09-01 | Brezilya Kupa Çeyrek Final | Atletico Mg (1) - (1) Cruzeiro | 2.5 Alt | pending | 44/100
- 2026-09-01 | Ekvador Pro Lig | Ldu Quito - Mushuc Runa | 2.5 Alt | pending | 54/100

