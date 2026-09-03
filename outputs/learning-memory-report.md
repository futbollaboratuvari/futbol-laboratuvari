# Robot Öğrenme Hafızası Raporu

Oluşturma: 03.09.2026 14:17:31

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1054
- Kazanan tahmin: 251
- Kaybeden tahmin: 195
- Lig sayısı: 215
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- MS X: toplam 9, bekleyen 6, başarı %67, düz getiri %64, ağırlık 1
- 2.5 Üst: toplam 230, bekleyen 129, başarı %61, düz getiri %9, ağırlık 1
- MS 2: toplam 217, bekleyen 177, başarı %60, düz getiri %0, ağırlık 1
- MS 1: toplam 455, bekleyen 341, başarı %58, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 586, bekleyen 399, başarı %51, düz getiri %-15, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-03 | Kolombiya Primera A Clausura | Pereira - Independiente M | MS 2 | pending | 54/100
- 2026-09-03 | Cezayir 1.Lig | Js El Biar - Oued Akbou | MS 1 | pending | 44/100
- 2026-09-03 | Irak Premier Lig | Al Mosul - Al Zawraa | MS 2 | pending | 49/100
- 2026-09-03 | Romanya Kupa Grup A | Asu Poli Timiş - Rapid Bükreş | MS 2 | pending | 53/100
- 2026-09-03 | İtalya Serie C Kupası 2.Tur | Trento Calcio - Calvina | 2.5 Alt | pending | 55/100
- 2026-09-03 | Letonya Kupa Yarı Final | Daugava Riga - Riga Fc | 2.5 Alt | pending | 40/100
- 2026-09-03 | Türkiye TFF 1. Lig | Bursaspor - İstanbulspor | MS 1 | pending | 59/100
- 2026-09-03 | Uganda Premier Lig | Express - Kampala City | MS 2 | pending | 48/100
- 2026-09-03 | Belçika Pro Lig | Gent - Oh Leuven | 2.5 Üst | pending | 56/100
- 2026-09-03 | İsviçre Süper Lig | Basel - Sion | MS 2 | pending | 45/100
- 2026-09-03 | İtalya Serie C Kupası 2.Tur | Cittadella - Renate | 2.5 Alt | pending | 54/100
- 2026-09-03 | Polonya Kupa 1.Tur | Gks Tychy - Lks Lodz | MS 2 | pending | 45/100
- 2026-09-03 | Ürdün Premier Lig | Al Baqaa - Doqarah | MS 2 | pending | 46/100
- 2026-09-03 | Ekvador Pro Lig | Univ Catolica - Aucas | 2.5 Üst | pending | 60/100
- 2026-09-03 | Venezuela Premier Lig Clausura | Academia Anzoa - Monagas | 2.5 Üst | pending | 56/100

