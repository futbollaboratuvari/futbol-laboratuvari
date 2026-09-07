# Robot Öğrenme Hafızası Raporu

Oluşturma: 07.09.2026 13:22:13

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1117
- Kazanan tahmin: 203
- Kaybeden tahmin: 180
- Lig sayısı: 222
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 1, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 238, bekleyen 145, başarı %59, düz getiri %0, ağırlık 1
- 2.5 Alt: toplam 540, bekleyen 408, başarı %55, düz getiri %-8, ağırlık 1
- MS 2: toplam 228, bekleyen 179, başarı %47, düz getiri %-15, ağırlık 1
- MS 1: toplam 490, bekleyen 383, başarı %47, düz getiri %-23, ağırlık 0.94
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-07 | İngiltere FA Cup Eleme 1.Tur Tekrar | Carshalton Ath - Chertsey Town | MS 1 | pending | 49/100
- 2026-09-07 | İngiltere FA Cup Eleme 1.Tur Tekrar | Swindon Superm - Winslow United | MS 1 | pending | 51/100
- 2026-09-07 | İngiltere FA Cup Eleme 1.Tur Tekrar | Redditch Unite - Malvern Town | MS 1 | pending | 52/100
- 2026-09-07 | Portekiz U23 Ulusal Şampiyona | Sporting Braga - Penafiel U23 | MS 1 | pending | 49/100
- 2026-09-07 | Arjantin Ulusal Primera Lig | Nueva Chicago - Quilmes | MS 2 | pending | 45/100
- 2026-09-07 | Tanzanya Kuu Bara Ligi | Azam Fc - Namungo | 2.5 Alt | pending | 52/100
- 2026-09-07 | Suudi Arabistan 1.Lig | Al Jabalain - Al Wahda | 2.5 Üst | pending | 54/100
- 2026-09-07 | İtalya Serie A | Cagliari - Lecce | 2.5 Üst | pending | 60/100
- 2026-09-07 | İsveç Allsvenskan | Mjallby - Göteborg | 2.5 Üst | pending | 61/100
- 2026-09-07 | Mısır Premier Lig | National Bank - Ghazl El Mehall | 2.5 Alt | pending | 49/100
- 2026-09-07 | Norveç 3.Lig Grup 2 | Kvik Trond - Ranheim Ii | MS 2 | pending | 50/100
- 2026-09-07 | Norveç 3.Lig Grup 3 | Gneist - Asane Ii | MS 1 | pending | 43/100
- 2026-09-07 | Norveç 3.Lig Grup 6 | Orn Horten - Sarpsborg 08 Ii | MS 1 | pending | 51/100
- 2026-09-07 | Malta Süper Kupa | Floriana - Valletta | MS 1 | pending | 46/100
- 2026-09-07 | Kosta Rika Premier Lig Apertura | Ad San Carlos - Sporting San Jo | 2.5 Alt | pending | 64/100

