# Robot Öğrenme Hafızası Raporu

Oluşturma: 07.09.2026 00:56:35

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1134
- Kazanan tahmin: 191
- Kaybeden tahmin: 175
- Lig sayısı: 220
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
- 2.5 Üst: toplam 235, bekleyen 148, başarı %60, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 544, bekleyen 421, başarı %54, düz getiri %-11, ağırlık 1
- MS 2: toplam 228, bekleyen 180, başarı %48, düz getiri %-13, ağırlık 1
- MS 1: toplam 490, bekleyen 384, başarı %45, düz getiri %-25, ağırlık 0.94

## Son Tahmin Kayıtları

- 2026-09-07 | İtalya Serie C Grup C | Catania - Cosenza | MS 1 | pending | 54/100
- 2026-09-07 | İtalya Serie A | Udinese - Lazio | 2.5 Alt | pending | 65/100
- 2026-09-07 | Fransa Ligue 2 | Nantes - Nancy | 2.5 Üst | pending | 56/100
- 2026-09-07 | İngiltere 1.Lig | Bromley - Afc Wimbledon | 2.5 Üst | pending | 70/100
- 2026-09-07 | İtalya Serie C Grup A | Alcione - Treviso | MS 1 | pending | 44/100
- 2026-09-07 | İtalya Serie C Grup A | Renate - Novara | 2.5 Alt | pending | 56/100
- 2026-09-07 | İtalya Serie C Grup A | Pro Vercelli - Folgore Carates | MS 1 | pending | 46/100
- 2026-09-07 | İtalya Serie C Grup A | Trento Calcio - Lecco | 2.5 Alt | pending | 55/100
- 2026-09-07 | İtalya Serie C Grup C | Picerno - Internazionale | 2.5 Alt | pending | 55/100
- 2026-09-07 | Kanada Premier Lig | Hfx Wanderers - Cavalry | MS 2 | pending | 51/100
- 2026-09-07 | Portekiz Premier Lig | Estoril - Arouca | 2.5 Üst | pending | 60/100
- 2026-09-07 | İspanya LaLiga | Elche - Real Sociedad | MS 2 | pending | 47/100
- 2026-09-07 | Arjantin Ulusal Primera Lig | Nueva Chicago - Quilmes | MS 1 | pending | 43/100
- 2026-09-07 | Mısır Premier Lig | Petrojet - Masryal Masry P | 2.5 Alt | pending | 56/100
- 2026-09-07 | Polonya 1.Lig | Ruch Chorzow - Unia Skierniewi | MS 1 | pending | 49/100

