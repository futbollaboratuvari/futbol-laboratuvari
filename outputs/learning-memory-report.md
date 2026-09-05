# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 00:36:36

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1207
- Kazanan tahmin: 158
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

- MS X: toplam 9, bekleyen 6, başarı %67, düz getiri %66, ağırlık 1
- 2.5 Üst: toplam 250, bekleyen 174, başarı %58, düz getiri %0, ağırlık 1
- 2.5 Alt: toplam 537, bekleyen 440, başarı %58, düz getiri %-4, ağırlık 1
- MS 1: toplam 467, bekleyen 383, başarı %49, düz getiri %-21, ağırlık 1
- MS 2: toplam 237, bekleyen 204, başarı %46, düz getiri %-24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | Brezilya Serie A | Corinthians - Chapecoense | 2.5 Üst | pending | 62/100
- 2026-09-06 | Şili Premier Lig | Palestino - Univ De Concepc | MS 1 | pending | 55/100
- 2026-09-06 | Uruguay Premier Lig Clausura | Liverpool Mont - Boston River | 2.5 Alt | pending | 56/100
- 2026-09-06 | Venezuela Premier Lig Clausura | Deportivo La G - Academia Anzoat | MS 1 | pending | 57/100
- 2026-09-06 | Meksika Ascenso MX Apertura | Cd Tapatio - Leones Negros | 2.5 Üst | pending | 63/100
- 2026-09-06 | Guatemala Ulusal Lig Apertura | Municipal - Deportivo San P | 2.5 Alt | pending | 59/100
- 2026-09-06 | Nikaragua Premier Lig Apertura | Walter Ferrett - Managua | 2.5 Üst | pending | 54/100
- 2026-09-06 | Kolombiya Primera A Clausura | Pereira - Los Millionario | 2.5 Üst | pending | 60/100
- 2026-09-06 | Honduras Ulusal Lig Apertura | Real Espana - Upnfm | 2.5 Alt | pending | 58/100
- 2026-09-06 | Peru Premier Lig Clausura | Melgar - Adt | 2.5 Alt | pending | 56/100
- 2026-09-06 | El Salvador Primera Lig Apertura | Firpo - Inter Fa | 2.5 Üst | pending | 55/100
- 2026-09-06 | Ekvador Pro Lig | Aucas - Barcelona Gua | 2.5 Alt | pending | 66/100
- 2026-09-06 | Ekvador Pro Lig | Deportivo Cuen - Libertad | 2.5 Alt | pending | 66/100
- 2026-09-06 | Bolivya Premier Lig | Nacional Potos - Blooming | MS 1 | pending | 58/100
- 2026-09-06 | Arjantin Premier Lig 2. Aşama | Racing Club - Atletico Tucuma | 2.5 Alt | pending | 58/100

