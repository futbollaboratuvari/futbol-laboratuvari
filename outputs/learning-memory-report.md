# Robot Öğrenme Hafızası Raporu

Oluşturma: 13.09.2026 16:03:54

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1194
- Kazanan tahmin: 161
- Kaybeden tahmin: 145
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

- 2.5 Alt: toplam 571, bekleyen 458, başarı %62, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 201, bekleyen 132, başarı %54, düz getiri %-4, ağırlık 1
- MS 1: toplam 507, bekleyen 427, başarı %51, düz getiri %-11, ağırlık 1
- MS X: toplam 3, bekleyen 1, başarı %50, düz getiri %61, ağırlık 1
- MS 2: toplam 206, bekleyen 172, başarı %29, düz getiri %-46, ağırlık 1
- KG Var: toplam 12, bekleyen 4, başarı %25, düz getiri %-49, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-13 | Venezuela Premier Lig Clausura | Zamora - Trujillanos | 2.5 Üst | pending | 65/100
- 2026-09-13 | İspanya LaLiga | Real Sociedad - Atletico Madrid | MS 1 | pending | 58/100
- 2026-09-13 | Belçika Pro Lig | Zulte Waregem - Charleroi | MS 1 | pending | 56/100
- 2026-09-13 | Fransa Ligue 1 | Le Mans - Lens | KG Var | pending | 59/100
- 2026-09-13 | İsveç 2.Lig Norra Götaland | Lidkopings - Herrestads | 2.5 Alt | pending | 49/100
- 2026-09-13 | İngiltere Premier Lig | Coventry - Brighton | KG Var | pending | 60/100
- 2026-09-13 | Danimarka Süperlig | Silkeborg - Viborg | KG Var | pending | 60/100
- 2026-09-13 | Almanya Bölgesel Lig Kuzey | Sankt Pauli Ii - Norderstedt | 2.5 Alt | pending | 48/100
- 2026-09-13 | İsveç 2.Lig Södra Svealand | Fittja - Forward | 2.5 Alt | pending | 49/100
- 2026-09-13 | Danimarka 3.Lig | Holstebro - Frem | 2.5 Alt | pending | 49/100
- 2026-09-13 | Hong Kong Premier Lig | Shatin - Kowloon City | 2.5 Alt | pending | 49/100
- 2026-09-13 | ABD USL | Sporting Jax - Rhode Island | KG Var | lost | 70/100
- 2026-09-13 | Venezuela Premier Lig Clausura | Estudiantes Fc - Depor Tachira | 2.5 Üst | lost | 67/100
- 2026-09-13 | İspanya LaLiga | Real Sociedad - Atletico Madrid | MS 2 | pending | 47/100
- 2026-09-13 | İspanya 2.Lig | Tenerife - Leganes | 2.5 Alt | pending | 78/100

