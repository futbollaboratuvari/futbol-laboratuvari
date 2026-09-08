# Robot Öğrenme Hafızası Raporu

Oluşturma: 09.09.2026 02:16:27

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1122
- Kazanan tahmin: 204
- Kaybeden tahmin: 174
- Lig sayısı: 247
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, düz getiri %146, ağırlık 1
- KG Var: toplam 3, bekleyen 2, başarı %100, düz getiri %93, ağırlık 1
- 2.5 Üst: toplam 229, bekleyen 142, başarı %61, düz getiri %5, ağırlık 1
- 2.5 Alt: toplam 547, bekleyen 413, başarı %54, düz getiri %-12, ağırlık 1
- MS 1: toplam 500, bekleyen 397, başarı %51, düz getiri %-18, ağırlık 1
- MS 2: toplam 218, bekleyen 166, başarı %48, düz getiri %-15, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-09 | ABD MLS | Minnesota Utd - Dallas | MS 1 | pending | 48/100
- 2026-09-09 | Brezilya Serie B | Atletico Goian - Ceara | 2.5 Alt | pending | 57/100
- 2026-09-09 | ABD MLS Next Pro | North Texas - Houston Dynamo | MS 2 | pending | 46/100
- 2026-09-09 | El Salvador Primera Lig Apertura | Municipal Lime - Aguila | 2.5 Üst | pending | 60/100
- 2026-09-09 | CONCACAF Orta Amerika Kupası Çeyrek Final | Deportivo Sapr - Cs Cartagines | 2.5 Alt | pending | 48/100
- 2026-09-09 | Kolombiya Kupa Son 16 Turu | Deportivo Past - Independiente M | 2.5 Üst | pending | 59/100
- 2026-09-09 | Guatemala Ulusal Lig Apertura | Suchitepequez - Guastatoya | 2.5 Üst | pending | 66/100
- 2026-09-09 | ABD MLS | Vancouver - Los Angeles | MS 1 | pending | 57/100
- 2026-09-09 | ABD MLS | Portland - St. Louis City | MS 1 | pending | 45/100
- 2026-09-09 | ABD MLS | Los Angeles Fc - New York | MS 1 | pending | 57/100
- 2026-09-09 | ABD MLS | San Diego - San Jose | MS 1 | pending | 52/100
- 2026-09-09 | ABD MLS Next Pro | San Jose Earth - Ventura County | MS 1 | pending | 46/100
- 2026-09-09 | CONCACAF Orta Amerika Kupası Çeyrek Final | Depor Motagua - Alianza | MS 1 | pending | 48/100
- 2026-09-09 | ABD MLS | Austin - Colorado | 2.5 Üst | pending | 66/100
- 2026-09-09 | Uruguay Kupa Ön Eleme Turu Grup 3 | Deportivo Mald - Montevideo Wand | 2.5 Alt | pending | 64/100

