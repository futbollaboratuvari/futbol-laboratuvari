# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 12:15:12

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1294
- Kazanan tahmin: 119
- Kaybeden tahmin: 87
- Lig sayısı: 246
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
- MS 1: toplam 476, bekleyen 416, başarı %63, düz getiri %5, ağırlık 1
- MS 2: toplam 246, bekleyen 221, başarı %60, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 529, bekleyen 459, başarı %56, düz getiri %-10, ağırlık 1
- 2.5 Üst: toplam 239, bekleyen 191, başarı %52, düz getiri %-9, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Meksika Liga MX Apertura | Tigres Uanl - Necaxa | 2.5 Alt | pending | 57/100
- 2026-09-05 | Meksika Ascenso MX Apertura | Cancun Fc - Cruz Azul Hidal | MS 1 | pending | 50/100
- 2026-09-05 | ABD MLS | Los Angeles - New England | MS 2 | pending | 45/100
- 2026-09-05 | ABD MLS | Salt Lake - Los Angeles Fc | MS 2 | pending | 46/100
- 2026-09-05 | Kosta Rika Premier Lig Apertura | Alajuelense - Deportivo Sapri | 2.5 Üst | pending | 54/100
- 2026-09-05 | Ekvador Pro Lig | Indep. Jose Te - Depor Macara | 2.5 Alt | pending | 53/100
- 2026-09-05 | Brezilya Serie B | Ceara - Sport Recife | 2.5 Alt | pending | 59/100
- 2026-09-05 | Arjantin Ulusal Primera Lig | Acassuso - All Boys | MS 2 | pending | 45/100
- 2026-09-05 | Malta Premier Lig Açılış | Marsaxlokk Fc - Mosta Fc | MS 1 | pending | 53/100
- 2026-09-05 | İtalya Serie A | Roma - Atalanta | MS 1 | pending | 56/100
- 2026-09-05 | Belçika Pro Lig | Standard Liege - Antwerp | MS 1 | pending | 49/100
- 2026-09-05 | İspanya 2.Lig | Eldense - Mallorca | 2.5 Üst | pending | 61/100
- 2026-09-05 | Brezilya Serie B | Goias - Fortaleza Ce | MS 1 | pending | 46/100
- 2026-09-05 | Cezayir 1.Lig | Temouchent - Cs Constantine | MS 2 | pending | 44/100
- 2026-09-05 | Arjantin Ulusal Primera Lig | San Telmo - Los Andes | MS 2 | pending | 44/100

