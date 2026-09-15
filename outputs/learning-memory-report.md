# Robot Öğrenme Hafızası Raporu

Oluşturma: 15.09.2026 17:56:23

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1120
- Kazanan tahmin: 206
- Kaybeden tahmin: 174
- Lig sayısı: 265
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 612, bekleyen 465, başarı %59, düz getiri %0, ağırlık 1
- MS 1: toplam 503, bekleyen 398, başarı %54, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 166, bekleyen 100, başarı %53, düz getiri %-4, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- KG Var: toplam 16, bekleyen 1, başarı %47, düz getiri %-12, ağırlık 1
- MS 2: toplam 196, bekleyen 153, başarı %44, düz getiri %-16, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-15 | İngiltere Non League Premier Isthmian | Enfield Town - Dartford | MS 1 | pending | 45/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Cray Wanderers - St Albans | MS 2 | pending | 45/100
- 2026-09-15 | İran Azadegan Ligi | Fard Alborz - Sanat Mes Kerma | MS 1 | pending | 44/100
- 2026-09-15 | Suudi Arabistan 1.Lig | Al Adalah - Al-Jandal | 2.5 Alt | pending | 49/100
- 2026-09-15 | Tanzanya Kuu Bara Ligi | Young Africans - Geita Gold | 2.5 Alt | pending | 49/100
- 2026-09-15 | Tayland 2.Lig | Tero Sasana - Songkhla | 2.5 Üst | pending | 53/100
- 2026-09-15 | AFC Şampiyonlar Ligi Elite Doğu Grubu | Daejeon Citize - Kyoto Sanga | MS 1 | won | 60/100
- 2026-09-15 | İngiltere Premier Lig Kupası Grup H | Bromley U21 - Ipswich Town U2 | 2.5 Alt | pending | 48/100
- 2026-09-15 | Venezuela Premier Lig Clausura | Depor Tachira - Academia Puerto | 2.5 Alt | pending | 66/100
- 2026-09-15 | Venezuela Premier Lig Clausura | Ucv - Academia Anzoat | MS 1 | pending | 57/100
- 2026-09-15 | Brezilya Serie B | Regatas - Sport Recife | 2.5 Alt | pending | 51/100
- 2026-09-15 | Türkiye Kupa 1.Tur | Altay - Söke 1970 Sk | MS 1 | pending | 44/100
- 2026-09-15 | AFC Şampiyonlar Ligi 2 Grup B | Gol Gohar Sirj - Al Jazira | MS 2 | pending | 54/100
- 2026-09-15 | Romanya 2.Lig | Csm Resita - Fc Bacau | MS 1 | pending | 53/100
- 2026-09-15 | Portekiz U23 Ulusal Şampiyona | Vizela U23 - Marítimo U23 | 2.5 Alt | pending | 50/100

