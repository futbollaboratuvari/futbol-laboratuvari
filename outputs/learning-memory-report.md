# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 00:32:24

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1116
- Kazanan tahmin: 212
- Kaybeden tahmin: 172
- Lig sayısı: 266
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 613, bekleyen 464, başarı %60, düz getiri %2, ağırlık 1
- MS 1: toplam 503, bekleyen 397, başarı %55, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 167, bekleyen 100, başarı %54, düz getiri %-3, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- KG Var: toplam 16, bekleyen 1, başarı %47, düz getiri %-12, ağırlık 1
- MS 2: toplam 194, bekleyen 151, başarı %47, düz getiri %-11, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | Copa Sudamericana Çeyrek Final | Sao Paulo (0) - (1) Boca Juniors | MS 1 | pending | 38/100
- 2026-09-16 | Kolombiya Primera A Clausura | Chico - Alianza Petrole | 2.5 Alt | pending | 65/100
- 2026-09-16 | Brezilya Brasileiro Kadınlar 1.Aşama Yarı Final | Bahia (K) - Corinthians (K) | MS 2 | pending | 45/100
- 2026-09-16 | Meksika Liga MX Apertura | Puebla - Toluca | 2.5 Alt | pending | 68/100
- 2026-09-16 | Meksika Ascenso MX Apertura | Dorados - Cancun Fc | MS 1 | pending | 56/100
- 2026-09-16 | Bolivya Premier Lig | Academia Del B - The Strongest | MS 2 | pending | 54/100
- 2026-09-16 | Copa Sudamericana Çeyrek Final | Vasco Da Gama (0) - (0) Santa Fe | 2.5 Alt | pending | 44/100
- 2026-09-16 | Venezuela Premier Lig Clausura | Carabobo - Deportivo La Gu | 2.5 Alt | pending | 63/100
- 2026-09-16 | Kolombiya Primera B Clausura | Barranguilla - Independiente Y | 2.5 Alt | pending | 52/100
- 2026-09-16 | Paraguay Intermedia Lig | Tacuary - 12 De Junio Vh | MS 2 | pending | 46/100
- 2026-09-16 | Brezilya Serie B | Londrina - Ponte Preta | 2.5 Alt | pending | 69/100
- 2026-09-16 | Brezilya Serie B | Nautico - Operario | 2.5 Alt | pending | 64/100
- 2026-09-16 | Venezuela Premier Lig Clausura | Depor Tachira - Academia Puerto | 2.5 Alt | pending | 66/100
- 2026-09-16 | ABD USL | Indy Eleven - Brooklyn | MS 1 | pending | 61/100
- 2026-09-16 | Venezuela Premier Lig Clausura | Ucv - Academia Anzoat | MS 1 | pending | 57/100

