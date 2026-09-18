# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 20:10:40

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1185
- Kazanan tahmin: 177
- Kaybeden tahmin: 138
- Lig sayısı: 289
- Seçenek sayısı: 9

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 39, bekleyen 27, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 157, bekleyen 104, başarı %60, düz getiri %10, ağırlık 1
- 2.5 Alt: toplam 540, bekleyen 428, başarı %58, düz getiri %0, ağırlık 1
- MS 2: toplam 238, bekleyen 197, başarı %54, düz getiri %2, ağırlık 1
- MS 1: toplam 462, bekleyen 369, başarı %52, düz getiri %-17, ağırlık 1
- MS X: toplam 11, bekleyen 7, başarı %50, düz getiri %22, ağırlık 1
- İkinci Yarı KG Var: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- KG Yok: toplam 16, bekleyen 16, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | İsviçre Challenge Lig | Sc Kriens - Etoile Carouge | İkinci Yarı KG Var | pending | 57/100
- 2026-09-18 | Almanya Kadınlar Bundesliga | Hoffenheim (K) - Wolfsburg (K) | 3.5 Üst | pending | 60/100
- 2026-09-18 | Türkiye TFF 1. Lig | Muğlaspor - Iğdır Fk | MS 2 | pending | 53/100
- 2026-09-18 | Norveç Eliteserien | Sarpsborg - Kfum Oslo | 2.5 Alt | pending | 61/100
- 2026-09-18 | Litvanya 1.Lig | Lietava Jonava - Tauras | 2.5 Alt | pending | 49/100
- 2026-09-18 | Ürdün 1.Lig | Jerash - Al Sahl Horan | MS 1 | pending | 47/100
- 2026-09-18 | Almanya 2. Bundesliga | Wolfsburg - Darmstadt | İkinci Yarı KG Var | pending | 53/100
- 2026-09-18 | Finlandiya Ykkonen | Haka - Klubi 04 | 2.5 Alt | pending | 59/100
- 2026-09-18 | Finlandiya Veikkausliiga | Oulu - Inter Turku | İkinci Yarı KG Var | pending | 57/100
- 2026-09-18 | Peru Premier Lig Clausura | Alianza Atleti - Comerciantes Un | KG Var | pending | 56/100
- 2026-09-18 | Danimarka 2.Lig | Skive - B93 Kopenhag | İkinci Yarı KG Var | pending | 52/100
- 2026-09-18 | Ürdün Premier Lig | Al Wihdat Amma - Al-Ramtha | 2.5 Üst | pending | 53/100
- 2026-09-18 | Litvanya 1.Lig | Lietava Jonava - Tauras | MS 1 | pending | 48/100
- 2026-09-18 | Avusturya 1.Lig | Floridsdorfer - Liefering | 2.5 Alt | pending | 48/100
- 2026-09-18 | Almanya 3. Lig | Verl 1924 - Würzburger Kick | İkinci Yarı KG Var | pending | 59/100

