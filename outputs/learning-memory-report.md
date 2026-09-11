# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 01:08:14

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1302
- Kazanan tahmin: 105
- Kaybeden tahmin: 93
- Lig sayısı: 272
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 213, bekleyen 175, başarı %61, düz getiri %10, ağırlık 1
- MS 1: toplam 522, bekleyen 456, başarı %58, düz getiri %-4, ağırlık 1
- MS 2: toplam 246, bekleyen 218, başarı %57, düz getiri %1, ağırlık 1
- 2.5 Alt: toplam 513, bekleyen 449, başarı %44, düz getiri %-29, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | İspanya 2. Lig RFEF Grup 4 | Estepona - Linares Deporti | 2.5 Alt | pending | 52/100
- 2026-09-12 | Bolivya Premier Lig | Gualberto Vill - Nacional Potosi | 2.5 Alt | pending | 45/100
- 2026-09-12 | Arjantin Prim B Metro | Brown - Burzaco | MS 1 | pending | 48/100
- 2026-09-12 | Portekiz Premier Lig | Academico Vise - Guimaraes | 2.5 Alt | pending | 54/100
- 2026-09-12 | Uruguay Premier Lig Clausura | Montevideo Wan - Nacional Df | 2.5 Alt | pending | 53/100
- 2026-09-12 | Brezilya Serie A | Chapecoense - Internacional | 2.5 Üst | pending | 70/100
- 2026-09-12 | Cezayir 1.Lig | Cs Constantine - Aso Chlef | 2.5 Alt | pending | 54/100
- 2026-09-12 | Venezuela Premier Lig Clausura | Academia Anzoa - Metropolitanos | 2.5 Üst | pending | 54/100
- 2026-09-12 | Arjantin Ulusal Primera Lig | Quilmes - San Martin Sj | MS 2 | pending | 56/100
- 2026-09-12 | Kanada Premier Lig | Supra Du Quebe - Hfx Wanderers | MS 1 | pending | 46/100
- 2026-09-12 | Brezilya Serie C Grup B | Botafogo Pb - Floresta | MS 1 | pending | 55/100
- 2026-09-12 | Peru Premier Lig Clausura | Deportivo Moqu - Sporting Crista | 2.5 Alt | pending | 51/100
- 2026-09-12 | Arjantin Premier Lig 2. Aşama | Atletico Tucum - River Plate | MS 2 | pending | 50/100
- 2026-09-12 | Kolombiya Primera B Clausura | Envigado - Leones Fc | 2.5 Alt | pending | 52/100
- 2026-09-12 | Arjantin Ulusal Primera Lig | All Boys - San Telmo | MS 1 | pending | 59/100

