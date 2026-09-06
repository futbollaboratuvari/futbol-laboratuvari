# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 09:07:27

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1224
- Kazanan tahmin: 148
- Kaybeden tahmin: 128
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
- 2.5 Üst: toplam 234, bekleyen 173, başarı %61, düz getiri %4, ağırlık 1
- 2.5 Alt: toplam 543, bekleyen 449, başarı %60, düz getiri %-1, ağırlık 1
- MS 1: toplam 493, bekleyen 407, başarı %45, düz getiri %-24, ağırlık 0.94
- MS 2: toplam 227, bekleyen 194, başarı %42, düz getiri %-21, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | El Salvador Primera Lig Apertura | Firpo - Inter Fa | 2.5 Alt | pending | 53/100
- 2026-09-06 | Nikaragua Premier Lig Apertura | Matagalpa - Diriangen | 2.5 Üst | pending | 53/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | Club Atletico - Gimnasia Y Tiro | MS 1 | pending | 41/100
- 2026-09-06 | Belçika Pro Lig | Anderlecht - Genk | MS 1 | pending | 45/100
- 2026-09-06 | Hırvatistan 2.HNL | Karlovac 1919 - Hrvace | 2.5 Alt | pending | 52/100
- 2026-09-06 | İtalya Serie C Grup B | Pescara - Ravenna | 2.5 Üst | pending | 53/100
- 2026-09-06 | İngiltere Premier Lig | Arsenal - Chelsea | 2.5 Üst | pending | 60/100
- 2026-09-06 | Güney Afrika PSL | Kaizer Chiefs - Siwelele | MS 1 | pending | 53/100
- 2026-09-06 | Norveç 3.Lig Grup 5 | Stromsgodset B - Finnsnes | MS 1 | pending | 44/100
- 2026-09-06 | Ukrayna Premier Lig | Epitsentr Duna - Bukovyna | 2.5 Üst | pending | 53/100
- 2026-09-06 | İrlanda FAI Kupası Çeyrek Final | Derry City - Dundalk | MS 1 | pending | 39/100
- 2026-09-06 | Nijerya NPFL | Nasarawa Unite - Bendel Insuranc | 2.5 Alt | pending | 57/100
- 2026-09-06 | ABD USL | Miami Fc - Pittsburgh Rive | 2.5 Üst | pending | 61/100
- 2026-09-06 | Almanya Bundesliga | Hamburg - Mainz | 2.5 Üst | pending | 62/100
- 2026-09-06 | Azerbaycan Premier Lig | Turan - Sumqayit | 2.5 Alt | pending | 54/100

