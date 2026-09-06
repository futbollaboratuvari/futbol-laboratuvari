# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 09:04:30

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1258
- Kazanan tahmin: 126
- Kaybeden tahmin: 116
- Lig sayısı: 223
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 1, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 234, bekleyen 181, başarı %62, düz getiri %7, ağırlık 1
- 2.5 Alt: toplam 543, bekleyen 459, başarı %57, düz getiri %-5, ağırlık 1
- MS 1: toplam 493, bekleyen 418, başarı %43, düz getiri %-29, ağırlık 1
- MS 2: toplam 227, bekleyen 199, başarı %39, düz getiri %-30, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | Nikaragua Premier Lig Apertura | Matagalpa - Diriangen | 2.5 Üst | pending | 53/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | Club Atletico - Gimnasia Y Tiro | MS 1 | pending | 44/100
- 2026-09-06 | Belçika Pro Lig | Anderlecht - Genk | MS 1 | pending | 48/100
- 2026-09-06 | Hırvatistan 2.HNL | Karlovac 1919 - Hrvace | 2.5 Alt | pending | 52/100
- 2026-09-06 | İtalya Serie C Grup B | Pescara - Ravenna | 2.5 Üst | pending | 53/100
- 2026-09-06 | İngiltere Premier Lig | Arsenal - Chelsea | 2.5 Üst | pending | 60/100
- 2026-09-06 | Güney Afrika PSL | Kaizer Chiefs - Siwelele | MS 1 | pending | 56/100
- 2026-09-06 | Norveç 3.Lig Grup 5 | Stromsgodset B - Finnsnes | MS 1 | pending | 47/100
- 2026-09-06 | Ukrayna Premier Lig | Epitsentr Duna - Bukovyna | 2.5 Üst | pending | 53/100
- 2026-09-06 | İrlanda FAI Kupası Çeyrek Final | Derry City - Dundalk | MS 1 | pending | 42/100
- 2026-09-06 | Nijerya NPFL | Nasarawa Unite - Bendel Insuranc | 2.5 Alt | pending | 57/100
- 2026-09-06 | ABD USL | Miami Fc - Pittsburgh Rive | 2.5 Üst | pending | 61/100
- 2026-09-06 | Almanya Bundesliga | Hamburg - Mainz | 2.5 Üst | pending | 62/100
- 2026-09-06 | Azerbaycan Premier Lig | Turan - Sumqayit | 2.5 Alt | pending | 54/100
- 2026-09-06 | İtalya Serie A | Frosinone - Unione V. | MS 1 | pending | 46/100

