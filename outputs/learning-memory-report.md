# Robot Öğrenme Hafızası Raporu

Oluşturma: 04.09.2026 02:29:30

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1103
- Kazanan tahmin: 228
- Kaybeden tahmin: 169
- Lig sayısı: 231
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 232, bekleyen 194, başarı %63, düz getiri %4, ağırlık 1
- MS 1: toplam 477, bekleyen 372, başarı %59, düz getiri %-3, ağırlık 1
- 2.5 Üst: toplam 220, bekleyen 130, başarı %58, düz getiri %2, ağırlık 1
- 2.5 Alt: toplam 560, bekleyen 398, başarı %55, düz getiri %-8, ağırlık 1
- MS X: toplam 9, bekleyen 7, başarı %50, düz getiri %24, ağırlık 1
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-04 | Galler Premier Lig 1.Aşama | Gap Connahs Qu - Haverfordwest | 2.5 Alt | pending | 48/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Caernarfon - Flint Town | MS 1 | pending | 57/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Cardiff Mu - Cambrian | MS 1 | pending | 51/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Holywell Town - Trefelin | MS 2 | pending | 46/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Briton Ferry - Airbus Uk | MS 1 | pending | 48/100
- 2026-09-04 | Kuzey İrlanda Premiership | Larne Fc - Glentoran | 2.5 Alt | pending | 54/100
- 2026-09-04 | İrlanda 1.Lig | Treaty Unt. - Wexford Youths | 2.5 Üst | pending | 53/100
- 2026-09-04 | İrlanda 1.Lig | Finn Harps - Athlone | MS 2 | pending | 52/100
- 2026-09-04 | İrlanda 1.Lig | Cobh Ramblers - Ucd | 2.5 Alt | pending | 49/100
- 2026-09-04 | İrlanda 1.Lig | Bray Wanderers - Cork City | MS 2 | pending | 49/100
- 2026-09-04 | Kuzey İrlanda Championship | Annagh United - Ards Fc | MS 1 | pending | 53/100
- 2026-09-04 | Kuzey İrlanda Championship | Newry City Afc - Armagh | MS 1 | pending | 55/100
- 2026-09-04 | İngiltere Ulusal Lig | Altrincham - Eastleigh | 2.5 Alt | pending | 60/100
- 2026-09-04 | Galler FAW Championship Kuzey | Ruthin Town - Caersws | MS 2 | pending | 48/100
- 2026-09-04 | Galler FAW Championship Güney | Trethomas Blue - Caerphilly Athl | MS 1 | pending | 46/100

