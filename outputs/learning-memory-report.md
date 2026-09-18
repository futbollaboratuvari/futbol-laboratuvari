# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 22:40:05

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1194
- Kazanan tahmin: 174
- Kaybeden tahmin: 132
- Lig sayısı: 288
- Seçenek sayısı: 9

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 44, bekleyen 32, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 158, bekleyen 105, başarı %60, düz getiri %10, ağırlık 1
- 2.5 Alt: toplam 539, bekleyen 429, başarı %59, düz getiri %1, ağırlık 1
- MS 2: toplam 234, bekleyen 196, başarı %55, düz getiri %7, ağırlık 1
- MS 1: toplam 454, bekleyen 365, başarı %52, düz getiri %-17, ağırlık 1
- MS X: toplam 12, bekleyen 8, başarı %50, düz getiri %22, ağırlık 1
- KG Yok: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Galler Premier Lig | Briton Ferry - Trefelin | KG Yok | pending | 54/100
- 2026-09-18 | Kolombiya Primera A Clausura | Rionegro Aguil - Pereira | 2.5 Alt | pending | 51/100
- 2026-09-18 | El Salvador Primera Lig Apertura | Inca-Aruba - Fuerte San Fran | MS 1 | pending | 56/100
- 2026-09-18 | İrlanda 1.Lig | Wexford Youths - Cobh Ramblers | MS 1 | pending | 56/100
- 2026-09-18 | Polonya 1. Lig | Polonia Bytom - Ruch Chorzow | MS X | pending | 43/100
- 2026-09-18 | Kuzey İrlanda Championship | Dundela - Strabane Athlet | 2.5 Üst | pending | 53/100
- 2026-09-18 | Kuzey İrlanda Championship | Newry City Afc - Annagh United | KG Var | pending | 54/100
- 2026-09-18 | İngiltere Ulusal Lig | Yeovil - Solihull Moors | 2.5 Üst | pending | 80/100
- 2026-09-18 | İngiltere Premier Lig | Brentford - Chelsea | KG Var | pending | 77/100
- 2026-09-18 | Portekiz Kupa 2.Tur | Real Massama - Academica | KG Yok | pending | 52/100
- 2026-09-18 | İspanya Tercera Ligi Grup 15 | Huarte - Aoiz | KG Yok | pending | 60/100
- 2026-09-18 | Polonya Ekstraklasa | Wisla Krakow - Slask Wroclaw | KG Yok | pending | 54/100
- 2026-09-18 | İtalya Serie A | Monza - Sassuolo | KG Var | pending | 77/100
- 2026-09-18 | Fransa Ligue 1 | Monaco - Lens | KG Var | pending | 69/100
- 2026-09-18 | İrlanda Premier Lig | Derry City - Galway United | KG Yok | pending | 54/100

