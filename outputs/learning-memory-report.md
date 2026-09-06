# Robot Öğrenme Hafızası Raporu

Oluşturma: 07.09.2026 02:13:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1144
- Kazanan tahmin: 185
- Kaybeden tahmin: 171
- Lig sayısı: 221
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 1, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 235, bekleyen 151, başarı %60, düz getiri %1, ağırlık 1
- 2.5 Alt: toplam 546, bekleyen 425, başarı %53, düz getiri %-12, ağırlık 1
- MS 2: toplam 228, bekleyen 181, başarı %49, düz getiri %-11, ağırlık 1
- MS 1: toplam 487, bekleyen 385, başarı %45, düz getiri %-25, ağırlık 0.94
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-07 | İspanya Kadınlar Primera Lig | Granada (K) - Real Sociedad ( | KG Var | pending | 57/100
- 2026-09-07 | İngiltere Premier Lig Kupası Grup D | Luton Town U21 - Peterborough Un | 2.5 Alt | pending | 48/100
- 2026-09-07 | Arjantin Premier Lig 2. Aşama | Barracas - Argentinos Jr | MS 2 | pending | 50/100
- 2026-09-07 | Venezuela Premier Lig Clausura | Carabobo - Estudiantes Fc | 2.5 Üst | pending | 61/100
- 2026-09-07 | Brezilya Serie A | Vitoria Bahia - Gremio | 2.5 Alt | pending | 71/100
- 2026-09-07 | Kolombiya Primera A Clausura | Llaneros - Deportes Tolima | 2.5 Alt | pending | 58/100
- 2026-09-07 | Venezuela Premier Lig Clausura | Ucv - Academia Puerto | 2.5 Alt | pending | 64/100
- 2026-09-07 | Şili Premier Lig | Deportes Limac - Cobresal | MS 1 | pending | 52/100
- 2026-09-07 | Ekvador Pro Lig | Emelec - Manta | 2.5 Alt | pending | 64/100
- 2026-09-07 | Ekvador Pro Lig | Mushuc Runa - Leones Del Nort | 2.5 Alt | pending | 63/100
- 2026-09-07 | Ekvador Pro Lig | Orense - Guayaquil City | 2.5 Üst | pending | 68/100
- 2026-09-07 | Arjantin Premier Lig 2. Aşama | Union Santa Fe - Instituto Cordo | MS 1 | pending | 42/100
- 2026-09-07 | Kolombiya Kupa Son 16 Turu | Atletico Nacio - Deportivo Cali | 2.5 Üst | pending | 61/100
- 2026-09-07 | Belarus Premier Lig | Dinamo Brest - Bate Borisov | MS 1 | pending | 50/100
- 2026-09-07 | İtalya Serie C Grup C | Catania - Cosenza | MS 1 | pending | 54/100

