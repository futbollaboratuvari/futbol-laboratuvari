# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 07:56:34

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1301
- Kazanan tahmin: 116
- Kaybeden tahmin: 83
- Lig sayısı: 246
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 10, bekleyen 7, başarı %67, düz getiri %66, ağırlık 1
- MS 1: toplam 473, bekleyen 415, başarı %64, düz getiri %5, ağırlık 1
- MS 2: toplam 243, bekleyen 218, başarı %60, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 538, bekleyen 471, başarı %55, düz getiri %-11, ağırlık 1
- 2.5 Üst: toplam 236, bekleyen 190, başarı %54, düz getiri %-5, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Fransa Ligue 2 | St Etienne - Montpellier | 2.5 Alt | pending | 57/100
- 2026-09-05 | Yunanistan Süper Lig | Aek - Aris | 2.5 Üst | pending | 56/100
- 2026-09-05 | İngiltere Premier Lig | Hull - Aston Villa | 2.5 Alt | pending | 54/100
- 2026-09-05 | İtalya Serie C Grup B | Nuova Monteros - Pianese | MS 1 | pending | 49/100
- 2026-09-05 | Slovenya 2.SNL | Krka Novo Mest - Jesenice | 2.5 Alt | pending | 49/100
- 2026-09-05 | İrlanda FAI Kupası Çeyrek Final | St Patricks - Bohemian | 2.5 Alt | pending | 46/100
- 2026-09-05 | Nijerya NPFL | Inter Lagos - Doma United | 2.5 Alt | pending | 57/100
- 2026-09-05 | İzlanda 1.Lig | Grotta - Völsungur | MS 2 | pending | 45/100
- 2026-09-05 | Norveç 3.Lig Grup 1 | Valerenga Ii - Konnerud | MS 1 | pending | 58/100
- 2026-09-05 | İngiltere Ulusal Lig N / S Kuzey | Spalding Unite - Southport | 2.5 Alt | pending | 50/100
- 2026-09-05 | Belçika Challenger Pro Lig | Club Brugge Ii - Eupen | 2.5 Alt | pending | 50/100
- 2026-09-05 | İngiltere 1.Lig | Huddersfield - Notts County | MS 1 | pending | 57/100
- 2026-09-05 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Red Arrows - Rouge | 2.5 Alt | pending | 57/100
- 2026-09-05 | Güney Afrika PSL | Chippa United - Milford | MS 2 | pending | 44/100
- 2026-09-05 | Litvanya 1.Lig | Atmosfera - Tauras | 2.5 Alt | pending | 50/100

