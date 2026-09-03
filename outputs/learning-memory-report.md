# Robot Öğrenme Hafızası Raporu

Oluşturma: 04.09.2026 00:48:50

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1061
- Kazanan tahmin: 248
- Kaybeden tahmin: 191
- Lig sayısı: 218
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- MS X: toplam 10, bekleyen 7, başarı %67, düz getiri %64, ağırlık 1
- 2.5 Üst: toplam 234, bekleyen 136, başarı %60, düz getiri %7, ağırlık 1
- MS 2: toplam 213, bekleyen 173, başarı %60, düz getiri %0, ağırlık 1
- MS 1: toplam 457, bekleyen 344, başarı %58, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 583, bekleyen 399, başarı %52, düz getiri %-13, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-04 | Şili Premier Lig | Concepcion - Audax Italiano | 2.5 Üst | pending | 61/100
- 2026-09-04 | Brezilya Serie B | Regatas - America Mineiro | MS 1 | pending | 57/100
- 2026-09-04 | Ekvador Pro Lig | T.Universitari - Ldu Quito | 2.5 Üst | pending | 59/100
- 2026-09-04 | Meksika Ascenso MX Apertura | Durango - Tlaxcala | 2.5 Üst | pending | 63/100
- 2026-09-04 | Guatemala Ulusal Lig Apertura | Antigua Guatem - Aurora | 2.5 Üst | pending | 57/100
- 2026-09-04 | Honduras Ulusal Lig Apertura | Choloma - Olancho | MS 2 | pending | 52/100
- 2026-09-04 | Kosta Rika Premier Lig Apertura | Liberia - Inter San Carlo | 2.5 Üst | pending | 53/100
- 2026-09-04 | Meksika Liga MX Apertura | Fc Juarez - Pachuca | 2.5 Üst | pending | 62/100
- 2026-09-04 | Meksika Ascenso MX Apertura | Ca La Paz - Zacatecas | MS 1 | pending | 50/100
- 2026-09-04 | Avustralya NPL Tazmanya Büyük Final | South Hobart - Devonport City | MS 1 | pending | 45/100
- 2026-09-04 | Avustralya NPL Victoria Eleme Final | Avondale Heigh - Preston Lions | 2.5 Alt | pending | 40/100
- 2026-09-04 | İspanya Primera Lig RFEF Grup 1 | Ponferradina - Lugo | MS 1 | pending | 50/100
- 2026-09-04 | Arjantin Premier Lig 2. Aşama | Rio Cuarto - Sarmiento | MS 1 | pending | 45/100
- 2026-09-04 | Cezayir 1.Lig | Js Kabylie - Rouisset | MS 1 | pending | 57/100
- 2026-09-04 | Peru Premier Lig Clausura | Alianza Atleti - Univ De Cajamar | MS 1 | pending | 55/100

