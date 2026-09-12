# Robot Öğrenme Hafızası Raporu

Oluşturma: 13.09.2026 01:44:57

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1247
- Kazanan tahmin: 132
- Kaybeden tahmin: 121
- Lig sayısı: 249
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 568, bekleyen 478, başarı %63, düz getiri %6, ağırlık 1
- 2.5 Üst: toplam 203, bekleyen 140, başarı %54, düz getiri %-3, ağırlık 1
- MS X: toplam 3, bekleyen 1, başarı %50, düz getiri %61, ağırlık 1
- MS 1: toplam 508, bekleyen 447, başarı %48, düz getiri %-16, ağırlık 1
- MS 2: toplam 210, bekleyen 180, başarı %30, düz getiri %-43, ağırlık 1
- KG Var: toplam 8, bekleyen 1, başarı %29, düz getiri %-42, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-13 | İspanya LaLiga | Real Sociedad - Atletico Madrid | MS 2 | pending | 47/100
- 2026-09-13 | İspanya 2.Lig | Tenerife - Leganes | 2.5 Alt | pending | 74/100
- 2026-09-13 | Brezilya Serie A | Mirassol - Vitoria Bahia | 2.5 Alt | pending | 69/100
- 2026-09-13 | İtalya Serie C Grup A | Union Arzignan - Calvina | 2.5 Alt | pending | 57/100
- 2026-09-13 | İtalya Serie C Grup A | Novara - Pergolettese | 2.5 Alt | pending | 55/100
- 2026-09-13 | İtalya Serie C Grup A | Trento Calcio - Union Brescia | 2.5 Alt | pending | 56/100
- 2026-09-13 | Kolombiya Primera A Clausura | Pereira - Bucaramanga | 2.5 Alt | pending | 65/100
- 2026-09-13 | Arjantin Ulusal Primera Lig | R Cordoba - Moron | MS 1 | pending | 44/100
- 2026-09-13 | Arjantin Ulusal Primera Lig | Gimnasia Jujuy - Rafaela | 2.5 Alt | pending | 59/100
- 2026-09-13 | Arjantin Ulusal Primera Lig | Ca Mitre - Chaco For Ever | MS 1 | pending | 46/100
- 2026-09-13 | Brezilya Serie B | Atletico Goian - Criciuma | MS 1 | pending | 46/100
- 2026-09-13 | Uruguay Premier Lig Clausura | Defensor Sport - Deportivo Maldo | 2.5 Alt | pending | 63/100
- 2026-09-13 | Guatemala Ulusal Lig Apertura | Coban Imperial - Comunicaciones | 2.5 Alt | pending | 71/100
- 2026-09-13 | Kanada Premier Lig | Inter Toronto - Vancouver Fc | 2.5 Alt | pending | 49/100
- 2026-09-13 | ABD MLS Next Pro | Chicago Fire I - Bethlehem Steel | MS 1 | pending | 47/100

