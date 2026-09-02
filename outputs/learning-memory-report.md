# Robot Öğrenme Hafızası Raporu

Oluşturma: 03.09.2026 00:54:52

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1081
- Kazanan tahmin: 235
- Kaybeden tahmin: 184
- Lig sayısı: 212
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 8, bekleyen 6, başarı %100, düz getiri %147, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 226, bekleyen 131, başarı %62, düz getiri %10, ağırlık 1
- MS 2: toplam 218, bekleyen 182, başarı %58, düz getiri %-4, ağırlık 1
- MS 1: toplam 463, bekleyen 360, başarı %56, düz getiri %-8, ağırlık 1
- 2.5 Alt: toplam 582, bekleyen 400, başarı %52, düz getiri %-14, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-03 | ABD USL Lig 1 | Westchester Sc - Chattanooga Red | 2.5 Alt | pending | 49/100
- 2026-09-03 | ABD USL Lig 1 | Fort Wayne - Richmond Kicker | MS 1 | pending | 58/100
- 2026-09-03 | ABD USL Lig 1 | New York Cosmo - Sarasota Paradi | MS 1 | pending | 49/100
- 2026-09-03 | ABD USL Lig 1 | Charlotte Inde - Portland Hearts | MS 1 | pending | 59/100
- 2026-09-03 | Ekvador Pro Lig | Barcelona Gua - Indep. Jose Ter | 2.5 Alt | pending | 56/100
- 2026-09-03 | ABD USL Lig 1 | Forward Madiso - One Knoxville | 2.5 Üst | pending | 62/100
- 2026-09-03 | Arjantin Kupa Son 16 Turu | Boca Juniors - Velez Sarsfield | 2.5 Alt | pending | 65/100
- 2026-09-03 | Brezilya Kupa Çeyrek Final | Vitoria Bahia (0) - (1) Vasco Da Gama | 2.5 Alt | pending | 48/100
- 2026-09-03 | Brezilya Kupa Çeyrek Final | Santos (0) - (3) Palmeiras | 2.5 Alt | pending | 45/100
- 2026-09-03 | Şili Premier Lig | Deportes Limac - Atletico Nublen | 2.5 Üst | pending | 56/100
- 2026-09-03 | CONCACAF Ligler Kupası Yarı Final | Toluca - Club Leon | 2.5 Alt | pending | 48/100
- 2026-09-03 | Kolombiya Primera A Clausura | Santa Fe - Los Millionario | 2.5 Alt | pending | 66/100
- 2026-09-03 | CONCACAF Ligler Kupası Yarı Final | Club America - Monterrey | 2.5 Alt | pending | 49/100
- 2026-09-03 | Nikaragua Premier Lig Apertura | Export Sebaco - Walter Ferretti | 2.5 Üst | pending | 53/100
- 2026-09-03 | Ekvador Pro Lig | Deportivo Cuen - Guayaquil City | 2.5 Alt | pending | 58/100

