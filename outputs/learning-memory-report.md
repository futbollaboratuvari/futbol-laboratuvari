# Robot Öğrenme Hafızası Raporu

Oluşturma: 21.09.2026 04:16:32

## Özet

- Toplam tahmin: 2487
- Bekleyen tahmin: 1718
- Kazanan tahmin: 395
- Kaybeden tahmin: 374
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
- KG Var: toplam 168, bekleyen 90, başarı %54, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 751, bekleyen 533, başarı %51, düz getiri %-15, ağırlık 0.94
- 2.5 Üst: toplam 269, bekleyen 156, başarı %51, düz getiri %-9, ağırlık 1
- MS 1: toplam 649, bekleyen 465, başarı %51, düz getiri %-16, ağırlık 0.94
- KG Yok: toplam 145, bekleyen 86, başarı %48, düz getiri %-19, ağırlık 1
- 3.5 Üst: toplam 65, bekleyen 27, başarı %47, düz getiri %-6, ağırlık 1
- MS X: toplam 19, bekleyen 10, başarı %33, düz getiri %-15, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 17, bekleyen 17, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 5, bekleyen 5, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | Toluca (K) - Tigres Uanl (K) | MS 2 | pending | 45/100
- 2026-09-21 | Arjantin Premier Lig 2. Aşama | Lanus - Estudiantes Lp | 2.5 Alt | pending | 70/100
- 2026-09-21 | Brezilya Serie B | Cuiaba - Nautico | KG Var | pending | 70/100
- 2026-09-21 | Kolombiya Primera B Clausura | Real Cartagena - Envigado | 2.5 Alt | pending | 52/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | Santos Laguna - Cruz Azul (K) | MS 2 | pending | 50/100
- 2026-09-21 | Uruguay Premier Lig Clausura | Central Espano - Torque | KG Var | pending | 65/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | León (K) - Juarez (K) | 2.5 Alt | pending | 45/100
- 2026-09-21 | İngiltere Non League Premier Güney Merkez | Redditch Unite - Racing Club War | MS 1 | pending | 46/100
- 2026-09-21 | Ekvador Pro Lig Küme Düşme Grubu | Manta - Orense | KG Yok | pending | 60/100
- 2026-09-21 | Kolombiya Primera B Clausura | Bogota - Barranguilla | 2.5 Alt | pending | 50/100
- 2026-09-21 | Arjantin Premier Lig 2. Aşama | Barracas - Rivadavia | MS 2 | pending | 61/100
- 2026-09-21 | Arjantin Ulusal Primera Lig | Nueva Chicago - Patronato | KG Yok | pending | 77/100
- 2026-09-21 | Kolombiya Primera B Clausura | Real Cundinama - Quindio | MS 1 | pending | 42/100
- 2026-09-21 | Arjantin Primera C | Claypole - Yupanqui | 2.5 Alt | pending | 55/100
- 2026-09-21 | Arjantin Primera C | Ballester - C Cordoba | MS 2 | pending | 42/100

