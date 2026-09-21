# Robot Öğrenme Hafızası Raporu

Oluşturma: 21.09.2026 14:12:11

## Özet

- Toplam tahmin: 2517
- Bekleyen tahmin: 1707
- Kazanan tahmin: 416
- Kaybeden tahmin: 394
- Lig sayısı: 346
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 349, bekleyen 279, başarı %57, düz getiri %3, ağırlık 1
- KG Var: toplam 169, bekleyen 89, başarı %55, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 760, bekleyen 529, başarı %53, düz getiri %-12, ağırlık 0.946
- 2.5 Üst: toplam 271, bekleyen 145, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 658, bekleyen 467, başarı %50, düz getiri %-18, ağırlık 0.94
- 3.5 Üst: toplam 65, bekleyen 27, başarı %47, düz getiri %-6, ağırlık 1
- KG Yok: toplam 146, bekleyen 81, başarı %43, düz getiri %-27, ağırlık 1
- MS X: toplam 20, bekleyen 11, başarı %33, düz getiri %-15, ağırlık 1
- İkinci Yarı KG Yok: toplam 17, bekleyen 17, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 18, bekleyen 18, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-21 | Brezilya Brasileiro Kadınlar 1.Aşama Yarı Final | Corinthians (K (1) - (0) Bahia (K) | KG Var | pending | 45/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | Santos Laguna - Cruz Azul (K) | MS 2 | pending | 48/100
- 2026-09-21 | Brezilya Serie B | Cuiaba - Nautico | KG Var | pending | 70/100
- 2026-09-21 | Kolombiya Primera B Clausura | Real Cartagena - Envigado | 2.5 Alt | pending | 51/100
- 2026-09-21 | Uruguay Premier Lig Clausura | Central Espano - Torque | 2.5 Alt | pending | 58/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | León (K) - Juarez (K) | MS 1 | pending | 40/100
- 2026-09-21 | Meksika Kadınlar Liga MX Apertura | Toluca (K) - Tigres Uanl (K) | İkinci Yarı KG Yok | pending | 57/100
- 2026-09-21 | İngiltere Non League Premier Güney Merkez | Redditch Unite - Racing Club War | MS 1 | pending | 44/100
- 2026-09-21 | Ekvador Pro Lig Küme Düşme Grubu | Manta - Orense | KG Yok | pending | 60/100
- 2026-09-21 | Kolombiya Primera B Clausura | Bogota - Barranguilla | 2.5 Alt | pending | 50/100
- 2026-09-21 | Arjantin Premier Lig 2. Aşama | Barracas - Rivadavia | MS 2 | pending | 53/100
- 2026-09-21 | Kolombiya Primera B Clausura | Real Cundinama - Quindio | 2.5 Alt | pending | 54/100
- 2026-09-21 | İtalya Serie C Grup B | Nuova Monteros - Livorno | 2.5 Alt | pending | 53/100
- 2026-09-21 | Arjantin Primera C | Sacachispas - V.Arenas | MS 1 | pending | 44/100
- 2026-09-21 | Arjantin Primera C | B. Bolivar - Canuelas | MS 2 | pending | 39/100

