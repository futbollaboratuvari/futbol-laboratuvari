# Robot Öğrenme Hafızası Raporu

Oluşturma: 21.09.2026 01:47:50

## Özet

- Toplam tahmin: 2481
- Bekleyen tahmin: 1754
- Kazanan tahmin: 374
- Kaybeden tahmin: 353
- Lig sayısı: 345
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 347, bekleyen 277, başarı %57, düz getiri %3, ağırlık 1
- KG Var: toplam 166, bekleyen 94, başarı %56, düz getiri %-2, ağırlık 1
- MS 1: toplam 649, bekleyen 477, başarı %52, düz getiri %-16, ağırlık 1
- 2.5 Üst: toplam 269, bekleyen 160, başarı %51, düz getiri %-9, ağırlık 1
- 2.5 Alt: toplam 751, bekleyen 547, başarı %50, düz getiri %-17, ağırlık 1
- KG Yok: toplam 144, bekleyen 89, başarı %49, düz getiri %-16, ağırlık 1
- 3.5 Üst: toplam 65, bekleyen 28, başarı %49, düz getiri %-3, ağırlık 1
- MS X: toplam 19, bekleyen 11, başarı %38, düz getiri %-4, ağırlık 1
- İkinci Yarı KG Yok: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 14, bekleyen 14, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 5, bekleyen 5, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-21 | Uruguay Premier Lig Clausura | Central Espano - Torque | KG Var | pending | 65/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | León (K) - Juarez (K) | 2.5 Alt | pending | 49/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | Toluca (K) - Tigres Uanl (K) | MS 2 | pending | 46/100
- 2026-09-21 | Arjantin Premier Lig 2. Aşama | Lanus - Estudiantes Lp | 2.5 Alt | pending | 76/100
- 2026-09-21 | Brezilya Serie B | Cuiaba - Nautico | KG Var | pending | 70/100
- 2026-09-21 | Kolombiya Primera B Clausura | Real Cartagena - Envigado | 2.5 Alt | pending | 55/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | Santos Laguna - Cruz Azul (K) | MS 2 | pending | 50/100
- 2026-09-21 | Brezilya Seri B | Criciuma - Operario | 2.5 Alt | pending | 71/100
- 2026-09-21 | Bulgaristan 2.Lig | Spartak Pleven - Ludogorets Ii | KG Var | pending | 54/100
- 2026-09-21 | Bulgaristan 2.Lig | Dobrudzha 1919 - Cska Sofia Ii | 2.5 Alt | pending | 52/100
- 2026-09-21 | Bulgaristan 2.Lig | Montana - Hebar 1918 | MS 1 | pending | 49/100
- 2026-09-21 | Danimarka 1.Lig | Hb Koge - Hobro | 2.5 Alt | pending | 49/100
- 2026-09-21 | Gürcistan Erovnuli Liga | Spaeri - Dila Gori | 2.5 Alt | pending | 52/100
- 2026-09-21 | Norveç 3.Lig Grup 2 | Nardo - Ranheim Ii | MS 1 | pending | 46/100
- 2026-09-21 | Arjantin Premier Lig 2. Aşama | Aldosivi - Atletico Tucuma | MS 2 | pending | 53/100

