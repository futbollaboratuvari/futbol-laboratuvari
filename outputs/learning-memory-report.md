# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 00:23:33

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1204
- Kazanan tahmin: 161
- Kaybeden tahmin: 135
- Lig sayısı: 243
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 10, bekleyen 7, başarı %67, düz getiri %66, ağırlık 1
- 2.5 Alt: toplam 532, bekleyen 434, başarı %58, düz getiri %-3, ağırlık 1
- 2.5 Üst: toplam 241, bekleyen 165, başarı %58, düz getiri %0, ağırlık 1
- MS 1: toplam 473, bekleyen 387, başarı %50, düz getiri %-18, ağırlık 1
- MS 2: toplam 244, bekleyen 211, başarı %46, düz getiri %-24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | Japonya J2 Lig | Sapporo - Tochigi City | 2.5 Alt | pending | 48/100
- 2026-09-06 | Avustralya NPL Yeni Güney Galler Yarı Final | Sydney United - Manly United | MS 1 | pending | 48/100
- 2026-09-06 | Meksika Ascenso MX Apertura | Cds Tampico Ma - Venados Fc | MS 1 | pending | 52/100
- 2026-09-06 | Meksika Ascenso MX Apertura | Monarcas - Alebrijes | MS 1 | pending | 57/100
- 2026-09-06 | Guatemala Ulusal Lig Apertura | Malacateco - Suchitepequez | 2.5 Alt | pending | 61/100
- 2026-09-06 | ABD USL | Orange County - Sacramento Repu | 2.5 Üst | pending | 61/100
- 2026-09-06 | El Salvador Primera Lig Apertura | Isidro Metapan - Inca-Aruba | 2.5 Alt | pending | 60/100
- 2026-09-06 | ABD MLS | Los Angeles - New England | MS 1 | pending | 46/100
- 2026-09-06 | ABD MLS | Salt Lake - Los Angeles Fc | 2.5 Alt | pending | 50/100
- 2026-09-06 | Kolombiya Primera A Clausura | Atletico Junio - Jaguares | 2.5 Üst | pending | 60/100
- 2026-09-06 | Peru Premier Lig Clausura | Universitario - Comerciantes Un | 2.5 Alt | pending | 51/100
- 2026-09-06 | Honduras Ulusal Lig Apertura | Marathon - Estrella Roja | 2.5 Üst | pending | 64/100
- 2026-09-06 | Kosta Rika Premier Lig Apertura | Alajuelense - Deportivo Sapri | 2.5 Üst | pending | 54/100
- 2026-09-06 | ABD USL | Monterey Bay - Phoenix Rising | MS 2 | pending | 50/100
- 2026-09-06 | ABD MLS | Portland - Minnesota Utd | MS 1 | pending | 47/100

