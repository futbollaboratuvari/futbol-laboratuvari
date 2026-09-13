# Robot Öğrenme Hafızası Raporu

Oluşturma: 13.09.2026 19:37:45

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1173
- Kazanan tahmin: 169
- Kaybeden tahmin: 158
- Lig sayısı: 255
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 573, bekleyen 453, başarı %61, düz getiri %2, ağırlık 1
- 2.5 Üst: toplam 187, bekleyen 121, başarı %53, düz getiri %-6, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %61, ağırlık 1
- MS 1: toplam 515, bekleyen 424, başarı %50, düz getiri %-16, ağırlık 1
- MS 2: toplam 208, bekleyen 170, başarı %32, düz getiri %-41, ağırlık 1
- KG Var: toplam 13, bekleyen 3, başarı %30, düz getiri %-43, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-13 | Guatemala Ulusal Lig Apertura | Guastatoya - Xelaju | 2.5 Alt | pending | 71/100
- 2026-09-13 | Meksika Kadınlar Liga MX Apertura | Atletico San L - Santos Laguna ( | MS 1 | pending | 56/100
- 2026-09-13 | Meksika Kadınlar Liga MX Apertura | América (K) - Tigres Uanl (K) | MS 1 | pending | 55/100
- 2026-09-13 | Honduras Ulusal Lig Apertura | Marathon - Depor. Olimpia | 2.5 Üst | pending | 76/100
- 2026-09-13 | Honduras Ulusal Lig Apertura | Atlético Indep - Juticalpa | 2.5 Üst | pending | 57/100
- 2026-09-13 | El Salvador Primera Lig Apertura | Cacahuatique - Inter Fa | 2.5 Alt | pending | 55/100
- 2026-09-13 | Ekvador Pro Lig | Libertad - Indep. Jose Ter | 2.5 Alt | pending | 55/100
- 2026-09-13 | Arjantin Ulusal Primera Lig | Almirante - Ferro Carril Oe | MS 2 | pending | 43/100
- 2026-09-13 | İspanya Tercera Ligi Grup 10 | Linense - Tomares | MS 1 | pending | 56/100
- 2026-09-13 | Norveç Eliteserien | Fredrikstad - Sarpsborg | MS 2 | pending | 45/100
- 2026-09-13 | İspanya 2.Lig | Tenerife - Leganes | MS 1 | pending | 53/100
- 2026-09-13 | Brezilya Serie B | Atletico Goian - Criciuma | 2.5 Alt | pending | 62/100
- 2026-09-13 | Venezuela Premier Lig Clausura | Rayo Zuliano - Portuguesa | 2.5 Alt | pending | 63/100
- 2026-09-13 | Brezilya Serie A | Flamengo - Corinthians | 2.5 Alt | pending | 63/100
- 2026-09-13 | Şili Premier Lig | Colo Colo - Concepcion | MS 1 | pending | 60/100

