# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 00:30:45

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1107
- Kazanan tahmin: 207
- Kaybeden tahmin: 186
- Lig sayısı: 223
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 1, bekleyen 0, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 3, bekleyen 1, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 240, bekleyen 140, başarı %59, düz getiri %0, ağırlık 1
- 2.5 Alt: toplam 548, bekleyen 408, başarı %56, düz getiri %-6, ağırlık 1
- MS 1: toplam 483, bekleyen 379, başarı %44, düz getiri %-27, ağırlık 0.94
- MS 2: toplam 225, bekleyen 179, başarı %44, düz getiri %-20, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-08 | Brezilya Serie C Grup C | Paysandu - Brusque | MS 1 | pending | 50/100
- 2026-09-08 | Meksika Kadınlar Liga MX Apertura Grup 1 | Atlante (K) - Juarez (K) | MS 2 | pending | 51/100
- 2026-09-08 | Arjantin Premier Lig 2. Aşama | Barracas - Argentinos Jr | MS 2 | pending | 50/100
- 2026-09-08 | Venezuela Premier Lig Clausura | Carabobo - Estudiantes Fc | 2.5 Üst | pending | 62/100
- 2026-09-08 | Brezilya Serie A | Vitoria Bahia - Gremio | 2.5 Alt | pending | 71/100
- 2026-09-08 | Kolombiya Primera A Clausura | Llaneros - Deportes Tolima | 2.5 Alt | pending | 57/100
- 2026-09-08 | Venezuela Premier Lig Clausura | Ucv - Academia Puerto | 2.5 Alt | pending | 64/100
- 2026-09-08 | Şili Premier Lig | Deportes Limac - Cobresal | MS 1 | pending | 54/100
- 2026-09-08 | Arjantin Prim B Metro | Excur - Ituzaingo | 2.5 Alt | pending | 54/100
- 2026-09-08 | Ekvador Pro Lig | Emelec - Manta | 2.5 Alt | pending | 65/100
- 2026-09-08 | Ekvador Pro Lig | Mushuc Runa - Leones Del Nort | 2.5 Alt | pending | 64/100
- 2026-09-08 | Ekvador Pro Lig | Orense - Guayaquil City | 2.5 Üst | pending | 68/100
- 2026-09-08 | Arjantin Premier Lig 2. Aşama | Union Santa Fe - Instituto Cordo | MS 2 | pending | 45/100
- 2026-09-08 | Kolombiya Kupa Son 16 Turu | Atletico Nacio - Deportivo Cali | 2.5 Üst | pending | 61/100
- 2026-09-07 | Meksika Kadınlar Liga MX Apertura Grup 1 | Atlante (K) - Juarez (K) | MS 2 | pending | 51/100

