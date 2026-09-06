# Robot Öğrenme Hafızası Raporu

Oluşturma: 07.09.2026 00:52:44

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1126
- Kazanan tahmin: 194
- Kaybeden tahmin: 180
- Lig sayısı: 217
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 2, bekleyen 0, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 230, bekleyen 143, başarı %60, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 541, bekleyen 417, başarı %53, düz getiri %-12, ağırlık 1
- MS 2: toplam 231, bekleyen 181, başarı %48, düz getiri %-14, ağırlık 1
- MS 1: toplam 496, bekleyen 385, başarı %45, düz getiri %-25, ağırlık 0.94

## Son Tahmin Kayıtları

- 2026-09-07 | Arjantin Premier Lig 2. Aşama | River Plate - Rivadavia | 2.5 Alt | pending | 61/100
- 2026-09-07 | Brezilya Serie A | Corinthians - Chapecoense | 2.5 Üst | pending | 63/100
- 2026-09-07 | Şili Premier Lig | Palestino - Univ De Concepc | MS 1 | pending | 50/100
- 2026-09-07 | Uruguay Premier Lig Clausura | Liverpool Mont - Boston River | 2.5 Alt | pending | 56/100
- 2026-09-07 | Venezuela Premier Lig Clausura | Deportivo La G - Academia Anzoat | 2.5 Alt | pending | 49/100
- 2026-09-07 | Meksika Ascenso MX Apertura | Cd Tapatio - Leones Negros | 2.5 Üst | pending | 63/100
- 2026-09-07 | Guatemala Ulusal Lig Apertura | Municipal - Deportivo San P | 2.5 Alt | pending | 59/100
- 2026-09-07 | Nikaragua Premier Lig Apertura | Walter Ferrett - Managua | MS 2 | pending | 49/100
- 2026-09-07 | Kolombiya Primera A Clausura | Pereira - Los Millionario | 2.5 Alt | pending | 53/100
- 2026-09-07 | Honduras Ulusal Lig Apertura | Real Espana - Upnfm | 2.5 Alt | pending | 56/100
- 2026-09-07 | Peru Premier Lig Clausura | Melgar - Adt | MS 1 | pending | 56/100
- 2026-09-07 | El Salvador Primera Lig Apertura | Firpo - Inter Fa | 2.5 Alt | pending | 53/100
- 2026-09-07 | Ekvador Pro Lig | Aucas - Barcelona Gua | 2.5 Alt | pending | 66/100
- 2026-09-07 | Ekvador Pro Lig | Deportivo Cuen - Libertad | 2.5 Alt | pending | 67/100
- 2026-09-07 | Bolivya Premier Lig | Nacional Potos - Blooming | MS 1 | pending | 57/100

