# Robot Öğrenme Hafızası Raporu

Oluşturma: 09.09.2026 02:00:15

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1103
- Kazanan tahmin: 210
- Kaybeden tahmin: 187
- Lig sayısı: 246
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 3, bekleyen 2, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 229, bekleyen 138, başarı %62, düz getiri %6, ağırlık 1
- 2.5 Alt: toplam 543, bekleyen 404, başarı %53, düz getiri %-14, ağırlık 1
- MS 1: toplam 504, bekleyen 392, başarı %48, düz getiri %-22, ağırlık 0.94
- MS 2: toplam 219, bekleyen 166, başarı %47, düz getiri %-16, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-09 | İspanya De La Reina Kupası 1. Tur | Samper (K) - Olympia Las Roz | MS 2 | pending | 48/100
- 2026-09-09 | Paraguay Intermedia Lig | Depor Santani - Indep Cambo Gra | 2.5 Alt | pending | 53/100
- 2026-09-09 | Kolombiya Primera B Clausura | Independiente - Quindio | MS 1 | pending | 46/100
- 2026-09-09 | Güney Afrika PSL | Mamelodi Sundo - Siwelele | 2.5 Üst | pending | 61/100
- 2026-09-09 | Suudi Arabistan 1.Lig | Jeddah Club - Al Orubah Club | 2.5 Alt | pending | 57/100
- 2026-09-09 | Suudi Arabistan Pro Lig | Al Fateh - Diriyah | 2.5 Alt | pending | 67/100
- 2026-09-09 | Uruguay Kupa Ön Eleme Turu Grup 4 | Racing Montevi - Central Espanol | MS 1 | pending | 47/100
- 2026-09-09 | Uruguay Kupa Ön Eleme Turu Grup 6 | Boston River - Colon | 2.5 Alt | pending | 57/100
- 2026-09-09 | Irak Premier Lig | Newroz - Al Mosul | 2.5 Alt | pending | 55/100
- 2026-09-09 | Irak Premier Lig | Al Minaa Basra - Naft Maysan | 2.5 Alt | pending | 57/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Comillas - Lhospitalet | MS 2 | pending | 50/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Badalona - Sestao | MS 2 | pending | 48/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Torrent - Saguntino | MS 1 | pending | 45/100
- 2026-09-09 | Karadağ 1.Lig | Decic Tuzi - Petrovac | MS 1 | pending | 43/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | San Juan - Terrassa | MS 2 | pending | 51/100

