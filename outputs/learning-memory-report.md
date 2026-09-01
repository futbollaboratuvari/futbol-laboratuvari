# Robot Öğrenme Hafızası Raporu

Oluşturma: 01.09.2026 21:00:27

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1097
- Kazanan tahmin: 225
- Kaybeden tahmin: 178
- Lig sayısı: 207
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 5, bekleyen 4, başarı %100, düz getiri %146, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 218, bekleyen 132, başarı %67, düz getiri %20, ağırlık 1
- MS 2: toplam 209, bekleyen 175, başarı %59, düz getiri %-1, ağırlık 1
- 2.5 Alt: toplam 584, bekleyen 400, başarı %52, düz getiri %-15, ağırlık 1
- MS 1: toplam 481, bekleyen 384, başarı %52, düz getiri %-15, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-01 | İngiltere Ulusal Lig | Halifax - Hartlepool | 2.5 Alt | pending | 53/100
- 2026-09-01 | İngiltere Championship | West Ham - Wolverhampton | MS 2 | pending | 56/100
- 2026-09-01 | İngiltere Championship | Birmingham - Southam | MS 2 | pending | 58/100
- 2026-09-01 | Kuveyt Premier Lig | Al Tadhamon - Al Salmiyah | 2.5 Alt | pending | 55/100
- 2026-09-01 | İtalya Serie C Kupası 2.Tur | Campobasso - Scafatese | 2.5 Üst | pending | 53/100
- 2026-09-01 | Uruguay Kupa Ön Eleme Turu Grup 6 | Colon - Atl Fenix | MS X | pending | 42/100
- 2026-09-01 | İngiltere Championship | Swansea - Watford | 2.5 Alt | pending | 61/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | Estrela U23 - Sporting Cp U23 | 2.5 Alt | pending | 52/100
- 2026-09-01 | Romanya Kupa Grup D | Targoviste - Voluntari | 2.5 Üst | pending | 53/100
- 2026-09-01 | İtalya Serie C Kupası 2.Tur | Bari - Picerno | MS 1 | pending | 55/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | Penafiel U23 - Leixoes U23 | 2.5 Alt | pending | 52/100
- 2026-09-01 | Brezilya Serie B | Londrina - Juventude | 2.5 Alt | pending | 59/100
- 2026-09-01 | İngiltere 1.Lig | Bromley - Leyton Orient | 2.5 Alt | pending | 61/100
- 2026-09-01 | İngiltere 2.Lig | Bristol Rovers - Colchester | 2.5 Alt | pending | 57/100
- 2026-09-01 | Uruguay Kupa Ön Eleme Turu Grup 6 | Colon - Atl Fenix | MS 2 | pending | 43/100

