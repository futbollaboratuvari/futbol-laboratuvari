# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 14:13:29

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1335
- Kazanan tahmin: 82
- Kaybeden tahmin: 83
- Lig sayısı: 266
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 219, bekleyen 178, başarı %56, düz getiri %2, ağırlık 1
- MS 2: toplam 231, bekleyen 213, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 528, bekleyen 471, başarı %49, düz getiri %-20, ağırlık 1
- MS 1: toplam 510, bekleyen 462, başarı %46, düz getiri %-19, ağırlık 1
- MS X: toplam 5, bekleyen 4, başarı %0, düz getiri %-100, ağırlık 1
- KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | Kosta Rika Premier Lig Apertura | Liberia - Herediano | 2.5 Alt | pending | 54/100
- 2026-09-12 | Arjantin Ulusal Primera Lig | Quilmes - San Martin Sj | MS 1 | pending | 52/100
- 2026-09-12 | Ekvador Pro Lig | Manta - Aucas | MS 2 | pending | 61/100
- 2026-09-12 | Romanya 1.Lig | Rapid Bükreş - Voluntari | 2.5 Alt | pending | 50/100
- 2026-09-12 | Arjantin Prim B Metro | Def Unidos - Dock Sud | 2.5 Alt | pending | 56/100
- 2026-09-12 | Arjantin Prim B Metro | Armenio - Sportivo | MS X | pending | 42/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 4 | Marbella U19 - Cordoba U19 | 2.5 Alt | pending | 49/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 5 | Union Adarve U - Rayo Vallecano | 2.5 Alt | pending | 49/100
- 2026-09-12 | İspanya Primera Lig RFEF Grup 2 | Teruel - Real Jaen | 2.5 Alt | pending | 57/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 4 | Almeria U18 - Cadiz U19 | 2.5 Üst | pending | 53/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 5 | Leganes U19 - Las Rozas U18 | MS 1 | pending | 51/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 1 | Sporting Gijon - Racing Santande | MS 1 | pending | 53/100
- 2026-09-12 | İngiltere Non League Premier Kuzey | Lancaster City - Curzon Ashton | 2.5 Alt | pending | 51/100
- 2026-09-12 | İngiltere Premier Lig | Crystal Palace - Ipswich | MS 1 | pending | 62/100
- 2026-09-12 | Belarus 1.Lig | Bate Ii - Uni Minsk | MS 1 | pending | 46/100

