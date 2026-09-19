# Robot Öğrenme Hafızası Raporu

Oluşturma: 19.09.2026 20:11:55

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1236
- Kazanan tahmin: 156
- Kaybeden tahmin: 108
- Lig sayısı: 290
- Seçenek sayısı: 10

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 70, bekleyen 53, başarı %71, düz getiri %23, ağırlık 1
- 2.5 Üst: toplam 167, bekleyen 123, başarı %64, düz getiri %13, ağırlık 1
- 2.5 Alt: toplam 492, bekleyen 404, başarı %61, düz getiri %5, ağırlık 1
- MS 1: toplam 428, bekleyen 354, başarı %58, düz getiri %-4, ağırlık 1
- KG Yok: toplam 48, bekleyen 46, başarı %50, düz getiri %-26, ağırlık 1
- 3.5 Üst: toplam 24, bekleyen 16, başarı %50, düz getiri %-6, ağırlık 1
- MS 2: toplam 224, bekleyen 196, başarı %46, düz getiri %-13, ağırlık 1
- MS X: toplam 12, bekleyen 9, başarı %33, düz getiri %-17, ağırlık 1
- İlk Yarı KG Var: toplam 5, bekleyen 5, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 30, bekleyen 30, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-19 | ABD MLS | Houston - Cincinnati | KG Yok | pending | 62/100
- 2026-09-19 | ABD MLS | Nashville Sc - Chicago | 3.5 Üst | pending | 67/100
- 2026-09-19 | Ekvador Pro Lig Copa Sudamericana Play Off | Emelec - Libertad | KG Yok | pending | 74/100
- 2026-09-19 | Portekiz Premier Lig | Alverca - Rio Ave | 2.5 Üst | pending | 72/100
- 2026-09-19 | Belçika Pro Lig | Charleroi - Cercle Brugge | 2.5 Alt | pending | 71/100
- 2026-09-19 | İsveç Allsvenskan | Orgryte - Sirius | 2.5 Alt | pending | 72/100
- 2026-09-19 | İspanya La Liga | Celta Vigo - Santander | 2.5 Alt | pending | 64/100
- 2026-09-19 | İspanya La Liga 2 | Castellon - Tenerife | KG Yok | pending | 70/100
- 2026-09-19 | Fransa Ligue 2 | Metz - St Etienne | MS 2 | pending | 58/100
- 2026-09-19 | Birleşik Arap Emirlikleri Lig Kupası Ön ElemeTuru | Al Wasl - Al Ain | İlk Yarı KG Var | pending | 52/100
- 2026-09-19 | Birleşik Arap Emirlikleri Lig Kupası Ön ElemeTuru | Ajman - Al Sharjah | 2.5 Üst | pending | 53/100
- 2026-09-19 | İspanya LaLiga | Celta Vigo - Santander | 2.5 Alt | pending | 66/100
- 2026-09-19 | İspanya 2.Lig | Castellon - Tenerife | KG Yok | pending | 70/100
- 2026-09-19 | İngiltere Kadınlar Premier Lig | Arsenal (K) - Manchester Unit | KG Yok | pending | 54/100
- 2026-09-19 | Hollanda Eredivisie | Sparta Rotterd - Heerenveen | 3.5 Üst | pending | 61/100

