# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 14:51:46

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1140
- Kazanan tahmin: 202
- Kaybeden tahmin: 158
- Lig sayısı: 280
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 590, bekleyen 455, başarı %62, düz getiri %5, ağırlık 1
- 2.5 Üst: toplam 168, bekleyen 105, başarı %56, düz getiri %2, ağırlık 1
- MS 1: toplam 502, bekleyen 396, başarı %54, düz getiri %-10, ağırlık 1
- KG Var: toplam 14, bekleyen 4, başarı %50, düz getiri %-9, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- MS 2: toplam 219, bekleyen 177, başarı %48, düz getiri %-9, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | UEFA Gençlik Ligi 1.Tur | Cliftonville U - Super Nova U19 | MS 1 | pending | 51/100
- 2026-09-16 | Botsvana Premier Lig | Centre Chiefs - Tonota | 2.5 Alt | pending | 57/100
- 2026-09-16 | İtalya Serie C Grup B | Ostia Mare Lid - Ravenna | MS 2 | pending | 54/100
- 2026-09-16 | İspanya LaLiga | Atletico Madri - Osasuna | 2.5 Üst | pending | 66/100
- 2026-09-16 | İsveç Allsvenskan | Aik Stockholm - Mjallby | 2.5 Üst | pending | 56/100
- 2026-09-16 | İsviçre Süper Lig | Thun - Servette | MS 1 | pending | 47/100
- 2026-09-16 | Danimarka DBU Kupası 3.Tur | Ab Gladsaxe - Sonderjyske | MS 2 | pending | 48/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Sandviken - Asane | MS 1 | pending | 46/100
- 2026-09-16 | Yunanistan Kupa Lig Aşaması | Kifisias - Panathinaikos | MS 2 | pending | 59/100
- 2026-09-16 | Nijerya NPFL | Rivers United - Warri Wolves | MS 1 | pending | 57/100
- 2026-09-16 | Türkiye Kupa 1.Tur | Karaman Fk - Kepezspor Faş | MS 1 | pending | 48/100
- 2026-09-16 | Tayland 2.Lig | Nakhon Pathom - Kanchanaburi | 2.5 Alt | pending | 53/100
- 2026-09-16 | AFC Şampiyonlar Ligi 2 Grup E | Viettel - Melbourne Victo | MS 2 | pending | 52/100
- 2026-09-16 | İspanya Gençler Onur Ligi Grup 4 | Cordoba U19 - Sevilla U19 | 2.5 Alt | pending | 49/100
- 2026-09-16 | İtalya Serie C Grup B | Ostia Mare Lid - Ravenna | 2.5 Üst | pending | 53/100

