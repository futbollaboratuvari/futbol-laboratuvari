# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 16:12:03

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1176
- Kazanan tahmin: 180
- Kaybeden tahmin: 144
- Lig sayısı: 291
- Seçenek sayısı: 9

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 34, bekleyen 22, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 160, bekleyen 106, başarı %59, düz getiri %7, ağırlık 1
- 2.5 Alt: toplam 547, bekleyen 433, başarı %57, düz getiri %-2, ağırlık 1
- MS 2: toplam 238, bekleyen 195, başarı %54, düz getiri %3, ağırlık 1
- MS 1: toplam 473, bekleyen 376, başarı %52, düz getiri %-17, ağırlık 1
- MS X: toplam 11, bekleyen 7, başarı %50, düz getiri %22, ağırlık 1
- 3.5 Üst: toplam 14, bekleyen 14, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- KG Yok: toplam 13, bekleyen 13, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 10, bekleyen 10, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Çin Halk Cumhuriyeti Süper Lig | Zhejiang G. Fc - Wuhan Three Tow | 3.5 Üst | pending | 67/100
- 2026-09-18 | Peru Premier Lig Clausura | Alianza Atleti - Comerciantes Un | 2.5 Üst | pending | 56/100
- 2026-09-18 | Arjantin Primera C | Cambaceres - Jj Urquiza | MS X | pending | 42/100
- 2026-09-18 | İtalya Serie B | Juve Stabia - Cesena | 2.5 Üst | pending | 66/100
- 2026-09-18 | İspanya Tercera Ligi Grup 16 | Yagüe - River Ebro | MS 1 | pending | 56/100
- 2026-09-18 | Danimarka 1.Lig | Kolding If - Hillerod | 2.5 Üst | pending | 54/100
- 2026-09-18 | Almanya Bölgesel Lig Güney Batı | Fsv Frankfurt - Stuttgarter Kic | MS 1 | pending | 41/100
- 2026-09-18 | İsveç 2.Lig Södra Götaland | Lilla Torg - Linero | MS 1 | pending | 42/100
- 2026-09-18 | Almanya Kadınlar Bundesliga | Hoffenheim (K) - Wolfsburg (K) | KG Yok | pending | 47/100
- 2026-09-18 | Cezayir 1.Lig | Usm Khenchela - Es Ben Aknoun | İkinci Yarı KG Var | pending | 60/100
- 2026-09-18 | Romanya 1.Lig | Uta Arad - Sepsi | İkinci Yarı KG Var | pending | 56/100
- 2026-09-18 | Finlandiya Ykkösliiga | Japs - Ekenas If | MS 1 | pending | 42/100
- 2026-09-18 | Mısır 2. Lig | Derot - El Harby | 2.5 Alt | pending | 56/100
- 2026-09-18 | Cezayir 1. Lig | Js El Biar - Js Saoura | İkinci Yarı KG Var | pending | 60/100
- 2026-09-18 | Mısır 2. Lig | Proxy - Maleyet Kafr El | MS X | pending | 42/100

