# Robot Öğrenme Hafızası Raporu

Oluşturma: 13.09.2026 22:34:40

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1153
- Kazanan tahmin: 183
- Kaybeden tahmin: 164
- Lig sayısı: 254
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 576, bekleyen 451, başarı %62, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 184, bekleyen 117, başarı %52, düz getiri %-8, ağırlık 1
- MS 1: toplam 510, bekleyen 416, başarı %50, düz getiri %-15, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %61, ağırlık 1
- KG Var: toplam 15, bekleyen 2, başarı %46, düz getiri %-14, ağırlık 1
- MS 2: toplam 211, bekleyen 165, başarı %37, düz getiri %-30, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-13 | Norveç 3.Lig Grup 2 | Ranheim Ii - Byasen | 2.5 Alt | pending | 51/100
- 2026-09-13 | Portekiz Premier Lig | Famalicao - Sporting Cp | MS 2 | pending | 68/100
- 2026-09-13 | Norveç 3.Lig Grup 2 | Ranheim Ii - Byasen | MS 2 | pending | 46/100
- 2026-09-13 | Malta Premier Lig Açılış | Sliema - Mosta Fc | 2.5 Alt | pending | 55/100
- 2026-09-13 | Rusya Premier Lig | Spartak Moskov - Rostov | MS 1 | won | 69/100
- 2026-09-13 | Güney Afrika PSL | Siwelele - Golden Arrows | MS 2 | lost | 56/100
- 2026-09-13 | İngiltere Kadınlar Premier Lig | Everton (K) - Charlton Athlet | 2.5 Alt | won | 59/100
- 2026-09-13 | İngiltere Kadınlar Premier Lig | Liverpool (K) - Tottenham Hotsp | 2.5 Alt | won | 60/100
- 2026-09-13 | İngiltere Premier Lig | Coventry - Brighton | MS 2 | won | 63/100
- 2026-09-13 | İtalya Serie A | Lecce - Monza | 2.5 Üst | won | 69/100
- 2026-09-13 | Uruguay Premier Lig Clausura | Progreso - Cerro | MS 2 | won | 56/100
- 2026-09-13 | Rusya Premier Lig | Akhmat Grozny - Makhachkala | 2.5 Üst | won | 69/100
- 2026-09-13 | Danimarka Süperlig | Silkeborg - Viborg | 2.5 Alt | won | 62/100
- 2026-09-13 | İspanya Tercera Ligi Grup 6 | Ontinyent 1931 - Saguntino | 2.5 Alt | pending | 50/100
- 2026-09-13 | İran Persian Gulf Pro Lig | Mes Shahr-E Ba - Nassaji Mazanda | 2.5 Alt | pending | 49/100

