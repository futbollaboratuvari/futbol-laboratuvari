# Robot Öğrenme Hafızası Raporu

Oluşturma: 19.09.2026 14:13:48

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1187
- Kazanan tahmin: 176
- Kaybeden tahmin: 137
- Lig sayısı: 285
- Seçenek sayısı: 9

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 45, bekleyen 33, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Alt: toplam 544, bekleyen 430, başarı %59, düz getiri %1, ağırlık 1
- 2.5 Üst: toplam 158, bekleyen 105, başarı %59, düz getiri %6, ağırlık 1
- MS 2: toplam 229, bekleyen 190, başarı %54, düz getiri %4, ağırlık 1
- MS 1: toplam 453, bekleyen 362, başarı %52, düz getiri %-18, ağırlık 1
- MS X: toplam 12, bekleyen 8, başarı %50, düz getiri %22, ağırlık 1
- KG Yok: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-19 | Meksika Ascenso MX Apertura | Tepatitlan De - Zacatecas | MS 2 | pending | 45/100
- 2026-09-19 | Meksika Ascenso MX Apertura | Piratas - Venados Fc | MS 1 | pending | 58/100
- 2026-09-19 | Honduras Ulusal Lig Apertura | Choloma - Estrella Roja | 2.5 Üst | pending | 73/100
- 2026-09-19 | Kosta Rika Premier Lig Apertura | Perez Zeledon - Sporting San Jo | 2.5 Alt | pending | 60/100
- 2026-09-19 | Guatemala Ulusal Lig Apertura | Comunicaciones - Guastatoya | 2.5 Alt | pending | 73/100
- 2026-09-19 | Meksika Liga MX Apertura | Fc Juarez - Tigres Uanl | 2.5 Alt | pending | 68/100
- 2026-09-19 | Meksika Ascenso MX Apertura | Ca La Paz - Correcaminos Ua | MS 1 | pending | 53/100
- 2026-09-19 | Arjantin Premier Lig 2. Aşama | Corboda Santia - Defensa Justici | 2.5 Alt | pending | 58/100
- 2026-09-19 | Kolombiya Primera A Clausura | Rionegro Aguil - Pereira | 2.5 Alt | pending | 52/100
- 2026-09-19 | Honduras Ulusal Lig Apertura | Platense - Upnfm | 2.5 Alt | pending | 76/100
- 2026-09-19 | Arjantin Primera C | Cambaceres - Jj Urquiza | MS 1 | pending | 42/100
- 2026-09-19 | Paraguay Intermedia Lig | 3 De Noviembre - Guairena | 2.5 Alt | pending | 54/100
- 2026-09-19 | Brezilya Serie B | Vila Nova - America Mineiro | MS 1 | pending | 66/100
- 2026-09-19 | Bolivya Premier Lig | Independiente - San Antonio Bul | MS 1 | pending | 64/100
- 2026-09-19 | Kolombiya Primera B Clausura | Patriotas - Union Magdalena | 2.5 Alt | pending | 56/100

