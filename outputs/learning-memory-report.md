# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 01:20:44

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1173
- Kazanan tahmin: 188
- Kaybeden tahmin: 139
- Lig sayısı: 280
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 596, bekleyen 471, başarı %61, düz getiri %4, ağırlık 1
- MS 1: toplam 502, bekleyen 414, başarı %59, düz getiri %0, ağırlık 1
- 2.5 Üst: toplam 166, bekleyen 107, başarı %56, düz getiri %2, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- KG Var: toplam 15, bekleyen 1, başarı %50, düz getiri %-6, ağırlık 1
- MS 2: toplam 214, bekleyen 177, başarı %49, düz getiri %-5, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | Kuzey Amerika Şampiyonlar Kupası Final | Inter Miami - Cruz Azul | MS 1 | pending | 49/100
- 2026-09-16 | Copa Libertadores Çeyrek Final | Corinthians (1) - (1) Estudiantes Lp | MS 1 | pending | 42/100
- 2026-09-16 | CONCACAF Orta Amerika Kupası Çeyrek Final | Cs Cartagines (2) - (2) Deportivo Sapri | 2.5 Alt | pending | 48/100
- 2026-09-16 | Bolivya Premier Lig | Blooming - Universitario D | MS 1 | pending | 59/100
- 2026-09-16 | ABD USL | Birmingham Leg - New Mexico Unit | MS 1 | pending | 46/100
- 2026-09-16 | El Salvador Primera Lig Apertura | Inter Fa - Deportivo Fas | 2.5 Alt | pending | 53/100
- 2026-09-16 | ABD USL Lig 1 | Athletic Club - Charlotte Indep | MS 1 | pending | 61/100
- 2026-09-16 | Kolombiya Primera A Clausura | Inter Bogota - Atletico Nacion | 2.5 Üst | pending | 55/100
- 2026-09-16 | ABD Açık Kupası Yarı Final | Colorado - St. Louis City | MS 2 | pending | 51/100
- 2026-09-16 | CONCACAF Orta Amerika Kupası Çeyrek Final | Alianza (0) - (3) Depor Motagua | 2.5 Alt | pending | 45/100
- 2026-09-16 | UEFA Avrupa Ligi Lig Aşaması | Ac Milan - Benfica | MS 1 | pending | 54/100
- 2026-09-16 | UEFA Avrupa Ligi Lig Aşaması | Olympiakos - Jagiellonia | 2.5 Alt | pending | 49/100
- 2026-09-16 | UEFA Avrupa Ligi Lig Aşaması | Sunderland - Az Alkmaar | 2.5 Alt | pending | 66/100
- 2026-09-16 | UEFA Avrupa Ligi Lig Aşaması | Hapoel Beer Sh - Dinamo Zagreb | MS 2 | pending | 49/100
- 2026-09-16 | UEFA Avrupa Ligi Lig Aşaması | Anderlecht - Lyon | 2.5 Alt | pending | 65/100

