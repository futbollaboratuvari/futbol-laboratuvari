# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 16:09:45

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1139
- Kazanan tahmin: 203
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

- 2.5 Alt: toplam 589, bekleyen 454, başarı %62, düz getiri %5, ağırlık 1
- 2.5 Üst: toplam 168, bekleyen 104, başarı %56, düz getiri %4, ağırlık 1
- MS 1: toplam 502, bekleyen 396, başarı %54, düz getiri %-10, ağırlık 1
- KG Var: toplam 14, bekleyen 4, başarı %50, düz getiri %-9, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- MS 2: toplam 220, bekleyen 178, başarı %48, düz getiri %-9, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | ABD MLS Next Pro | Real Monarchs - Minnesota Unite | 2.5 Alt | pending | 48/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Arendal - Sandnes | 2.5 Alt | pending | 49/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Terrassa - Binefar | 2.5 Alt | pending | 50/100
- 2026-09-16 | Hırvatistan HR Nogometni Kupası Son 32 Turu | Kustosija - Bijelo Brdo | 2.5 Alt | pending | 52/100
- 2026-09-16 | Uganda Premier Lig | Lugazi Municip - Police | 2.5 Alt | pending | 57/100
- 2026-09-16 | Uganda Premier Lig | Kampala City - Kataka | MS 1 | pending | 56/100
- 2026-09-16 | Çek Cumhuriyeti Kupa 3.Tur | Vitkovice - Sk Artis Brno | MS 2 | pending | 57/100
- 2026-09-16 | Kolombiya Primera A Clausura | Chico - Alianza Petrole | 2.5 Üst | won | 66/100
- 2026-09-16 | UEFA Gençlik Ligi 1.Tur | Cliftonville U - Super Nova U19 | MS 1 | pending | 51/100
- 2026-09-16 | Botsvana Premier Lig | Centre Chiefs - Tonota | 2.5 Alt | pending | 57/100
- 2026-09-16 | İtalya Serie C Grup B | Ostia Mare Lid - Ravenna | MS 2 | pending | 54/100
- 2026-09-16 | İspanya LaLiga | Atletico Madri - Osasuna | 2.5 Üst | pending | 67/100
- 2026-09-16 | İsveç Allsvenskan | Aik Stockholm - Mjallby | 2.5 Üst | pending | 56/100
- 2026-09-16 | İsviçre Süper Lig | Thun - Servette | MS 1 | pending | 47/100
- 2026-09-16 | Danimarka DBU Kupası 3.Tur | Ab Gladsaxe - Sonderjyske | MS 2 | pending | 49/100

