# Robot Öğrenme Hafızası Raporu

Oluşturma: 01.09.2026 12:48:43

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1095
- Kazanan tahmin: 226
- Kaybeden tahmin: 179
- Lig sayısı: 208
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
- 2.5 Üst: toplam 216, bekleyen 130, başarı %67, düz getiri %20, ağırlık 1
- MS 2: toplam 210, bekleyen 176, başarı %59, düz getiri %-1, ağırlık 1
- 2.5 Alt: toplam 582, bekleyen 396, başarı %52, düz getiri %-15, ağırlık 1
- MS 1: toplam 485, bekleyen 388, başarı %52, düz getiri %-15, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-01 | İtalya Serie C Kupası 2.Tur | Bari - Picerno | MS 1 | pending | 57/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | Penafiel U23 - Leixoes U23 | 2.5 Alt | pending | 52/100
- 2026-09-01 | Brezilya Serie B | Londrina - Juventude | 2.5 Alt | pending | 60/100
- 2026-09-01 | İngiltere 1.Lig | Bromley - Leyton Orient | 2.5 Alt | pending | 61/100
- 2026-09-01 | İngiltere 2.Lig | Bristol Rovers - Colchester | 2.5 Alt | pending | 57/100
- 2026-09-01 | Uruguay Kupa Ön Eleme Turu Grup 6 | Colon - Atl Fenix | MS 2 | pending | 43/100
- 2026-09-01 | İngiltere Championship | West Ham - Wolverhampton | MS 1 | pending | 55/100
- 2026-09-01 | Polonya Kupa 1.Tur | Rzeszow - P. Bielsko | MS 1 | pending | 45/100
- 2026-09-01 | Güney Afrika PSL | Durban City - Stellenbosch Fc | 2.5 Alt | pending | 58/100
- 2026-09-01 | Türkiye TFF 1. Lig | Ümraniyespor - Muğlaspor | 2.5 Alt | pending | 56/100
- 2026-09-01 | Romanya Kupa Grup C | Corona Brasov - Bihor | 2.5 Alt | pending | 52/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | União De Leiri - Marítimo U23 | 2.5 Alt | pending | 52/100
- 2026-09-01 | Uganda Premier Lig | Entebbe Uppc - Updf | 2.5 Alt | pending | 56/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | Farense U23 - Famalicão U23 | 2.5 Alt | pending | 49/100
- 2026-09-01 | İngiltere Non League Premier Kuzey | Leek Town - Warrington Town | 2.5 Üst | pending | 53/100

