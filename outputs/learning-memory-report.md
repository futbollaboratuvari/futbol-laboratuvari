# Robot Öğrenme Hafızası Raporu

Oluşturma: 14.09.2026 00:26:21

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1159
- Kazanan tahmin: 178
- Kaybeden tahmin: 163
- Lig sayısı: 250
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 579, bekleyen 455, başarı %61, düz getiri %3, ağırlık 1
- 2.5 Üst: toplam 180, bekleyen 114, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 514, bekleyen 422, başarı %50, düz getiri %-15, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %61, ağırlık 1
- KG Var: toplam 15, bekleyen 2, başarı %46, düz getiri %-14, ağırlık 1
- MS 2: toplam 207, bekleyen 163, başarı %34, düz getiri %-35, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-14 | Kolombiya Primera A Clausura | America De Cal - Deportivo Pasto | 2.5 Üst | pending | 56/100
- 2026-09-14 | Guatemala Ulusal Lig Apertura | Antigua Guatem - Suchitepequez | 2.5 Üst | pending | 55/100
- 2026-09-14 | Meksika Kadınlar Liga MX Apertura | Pachuca (K) - León (K) | MS 1 | pending | 59/100
- 2026-09-14 | ABD MLS Next Pro | Portland Timbe - St. Louis City | MS 1 | pending | 47/100
- 2026-09-14 | Kolombiya Primera B Clausura | Tigres Fc - Bogota | MS 1 | pending | 46/100
- 2026-09-14 | Arjantin Premier Lig 2. Aşama | Banfield - Barracas | MS 1 | pending | 56/100
- 2026-09-14 | Arjantin Premier Lig 2. Aşama | Riestra - Lanus | MS X | pending | 54/100
- 2026-09-14 | Uruguay Premier Lig Clausura | Torque - Liverpool Monte | 2.5 Alt | pending | 64/100
- 2026-09-14 | Paraguay Intermedia Lig | Indep Cambo Gr - Encarnacion | 2.5 Alt | pending | 54/100
- 2026-09-14 | Brezilya Serie B | Botafogo Ribei - Goias | MS 1 | pending | 48/100
- 2026-09-14 | Brezilya Serie B | America Mineir - Sao Bernardo | 2.5 Alt | pending | 62/100
- 2026-09-14 | Kolombiya Primera B Clausura | Orsomarso - Atletico Fc | 2.5 Alt | pending | 55/100
- 2026-09-14 | Brezilya Serie A | Bahia - Remo | MS 1 | pending | 74/100
- 2026-09-14 | Şili Premier Lig | Union La Caler - Deportes Limach | 2.5 Üst | pending | 62/100
- 2026-09-14 | Ekvador Pro Lig | Univ Catolica - Orense | MS 1 | pending | 73/100

