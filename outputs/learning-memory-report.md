# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 02:19:29

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1273
- Kazanan tahmin: 119
- Kaybeden tahmin: 108
- Lig sayısı: 224
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 4, bekleyen 2, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 228, bekleyen 176, başarı %62, düz getiri %6, ağırlık 1
- 2.5 Alt: toplam 548, bekleyen 475, başarı %56, düz getiri %-6, ağırlık 1
- MS 1: toplam 490, bekleyen 418, başarı %44, düz getiri %-27, ağırlık 1
- MS 2: toplam 230, bekleyen 202, başarı %43, düz getiri %-25, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | Brezilya Serie A | Cruzeiro - Atletico Pr | 2.5 Üst | pending | 64/100
- 2026-09-06 | Brezilya Serie A | Internacional - Santos | 2.5 Alt | pending | 67/100
- 2026-09-06 | Brezilya Serie A | Remo - Flamengo | 2.5 Üst | pending | 67/100
- 2026-09-06 | İtalya Serie C Grup A | Ospitaletto - Union Arzignano | MS 1 | pending | 45/100
- 2026-09-06 | İtalya Serie C Grup A | Cittadella - Lumezzane | 2.5 Alt | pending | 54/100
- 2026-09-06 | İtalya Serie C Grup A | Union Brescia - Calvina | MS 1 | pending | 57/100
- 2026-09-06 | İtalya Serie C Grup B | Perugia - Pineto | 2.5 Alt | pending | 56/100
- 2026-09-06 | İtalya Serie C Grup C | Casertana - Scafatese | 2.5 Alt | pending | 54/100
- 2026-09-06 | İtalya Serie C Grup C | Foggia - Audace Cerignol | 2.5 Alt | pending | 55/100
- 2026-09-06 | Hırvatistan 1.HNL | Slaven Belupo - Lokomotiva | 2.5 Alt | pending | 49/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | Maipu - Patronato | MS 1 | pending | 50/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | Chaco For Ever - Caseros | MS 1 | pending | 48/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | Deportivo Madr - Ciudad De Bolív | MS 1 | pending | 55/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | Atl Temperley - Colegiales | MS 1 | pending | 51/100
- 2026-09-06 | Guatemala Ulusal Lig Apertura | Coban Imperial - Guastatoya | 2.5 Üst | pending | 63/100

