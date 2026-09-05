# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 03:13:19

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1296
- Kazanan tahmin: 121
- Kaybeden tahmin: 83
- Lig sayısı: 245
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 1: toplam 476, bekleyen 415, başarı %64, düz getiri %5, ağırlık 1
- MS 2: toplam 241, bekleyen 215, başarı %62, düz getiri %-1, ağırlık 1
- 2.5 Alt: toplam 534, bekleyen 466, başarı %57, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 239, bekleyen 192, başarı %55, düz getiri %-3, ağırlık 1
- MS X: toplam 10, bekleyen 8, başarı %50, düz getiri %24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Meksika Liga MX Apertura | Atlas - Atlante | 2.5 Alt | pending | 60/100
- 2026-09-05 | Guatemala Ulusal Lig Apertura | Marquense - Xelaju | 2.5 Üst | pending | 61/100
- 2026-09-05 | Japonya J2 Lig | Sapporo - Tochigi City | 2.5 Alt | pending | 48/100
- 2026-09-05 | Avustralya NPL Yeni Güney Galler Yarı Final | Sydney United - Manly United | MS 1 | pending | 48/100
- 2026-09-05 | Meksika Ascenso MX Apertura | Piratas - Correcaminos Ua | MS 1 | pending | 57/100
- 2026-09-05 | Meksika Ascenso MX Apertura | Cancun Fc - Cruz Azul Hidal | 2.5 Alt | pending | 50/100
- 2026-09-05 | Meksika Ascenso MX Apertura | Cds Tampico Ma - Venados Fc | MS 1 | pending | 53/100
- 2026-09-05 | Meksika Ascenso MX Apertura | Monarcas - Alebrijes | MS 1 | pending | 58/100
- 2026-09-05 | Guatemala Ulusal Lig Apertura | Malacateco - Suchitepequez | 2.5 Alt | pending | 61/100
- 2026-09-05 | ABD USL | Orange County - Sacramento Repu | 2.5 Üst | pending | 62/100
- 2026-09-05 | El Salvador Primera Lig Apertura | Isidro Metapan - Inca-Aruba | 2.5 Alt | pending | 60/100
- 2026-09-05 | ABD MLS | Los Angeles - New England | MS 1 | pending | 47/100
- 2026-09-05 | ABD MLS | Salt Lake - Los Angeles Fc | 2.5 Alt | pending | 49/100
- 2026-09-05 | Kolombiya Primera A Clausura | Atletico Junio - Jaguares | 2.5 Üst | pending | 60/100
- 2026-09-05 | Peru Premier Lig Clausura | Universitario - Comerciantes Un | 2.5 Alt | pending | 50/100

