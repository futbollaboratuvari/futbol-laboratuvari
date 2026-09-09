# Robot Öğrenme Hafızası Raporu

Oluşturma: 09.09.2026 04:21:18

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1116
- Kazanan tahmin: 210
- Kaybeden tahmin: 174
- Lig sayısı: 247
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 226, bekleyen 141, başarı %62, düz getiri %8, ağırlık 1
- 2.5 Alt: toplam 548, bekleyen 414, başarı %53, düz getiri %-13, ağırlık 1
- MS 1: toplam 501, bekleyen 393, başarı %53, düz getiri %-15, ağırlık 1
- MS 2: toplam 219, bekleyen 165, başarı %50, düz getiri %-12, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-09 | Venezuela Kupa 1.Tur Grup C | Fundacion Lara - Caracas Fc | MS 2 | pending | 51/100
- 2026-09-09 | Malezya FA Kupası Son 16 Turu | Kuala Lumpur (1) - (0) Perak Fa | MS 1 | pending | 58/100
- 2026-09-09 | Malezya FA Kupası Son 16 Turu | Selangor Fa (2) - (2) Sabah | MS 1 | pending | 60/100
- 2026-09-09 | ABD MLS Next Pro | North Texas - Houston Dynamo | 2.5 Alt | pending | 49/100
- 2026-09-09 | İzlanda 1.Lig Yükselme Play Off Yarı Final | Hk Kopavogur - Fylkir | 2.5 Alt | pending | 41/100
- 2026-09-09 | ABD MLS Next Pro | Huntsville Cit - Chattanooga | 2.5 Alt | pending | 49/100
- 2026-09-09 | Estonya Premium Lig | Vaprus - Harju Jalgpalli | 2.5 Alt | pending | 49/100
- 2026-09-09 | İzlanda 1.Lig Yükselme Play Off Yarı Final | Njardvik - Throttur | 2.5 Alt | pending | 40/100
- 2026-09-09 | Venezuela Kupa 1.Tur Grup C | Yaracuyanos - Aragua | 2.5 Alt | pending | 57/100
- 2026-09-09 | Tanzanya Kuu Bara Ligi | Mashujaa - Singida Black S | MS 2 | pending | 50/100
- 2026-09-09 | ABD MLS | Minnesota Utd - Dallas | MS 1 | pending | 51/100
- 2026-09-09 | Brezilya Serie B | Atletico Goian - Ceara | 2.5 Alt | pending | 57/100
- 2026-09-09 | ABD MLS Next Pro | North Texas - Houston Dynamo | MS 2 | pending | 46/100
- 2026-09-09 | El Salvador Primera Lig Apertura | Municipal Lime - Aguila | 2.5 Üst | pending | 60/100
- 2026-09-09 | CONCACAF Orta Amerika Kupası Çeyrek Final | Deportivo Sapr - Cs Cartagines | 2.5 Alt | pending | 48/100

