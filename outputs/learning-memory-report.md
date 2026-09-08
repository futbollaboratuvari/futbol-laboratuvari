# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 12:52:21

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1109
- Kazanan tahmin: 207
- Kaybeden tahmin: 184
- Lig sayısı: 238
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 232, bekleyen 130, başarı %61, düz getiri %5, ağırlık 1
- 2.5 Alt: toplam 537, bekleyen 398, başarı %56, düz getiri %-7, ağırlık 1
- MS 1: toplam 500, bekleyen 399, başarı %45, düz getiri %-27, ağırlık 0.94
- MS 2: toplam 227, bekleyen 180, başarı %43, düz getiri %-22, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-08 | İskoçya Challenge Kupası Lig Aşaması | Banks O Dee - Forfar | 2.5 Alt | pending | 49/100
- 2026-09-08 | Kolombiya Primera A Clausura | Llaneros - Deportes Tolima | 2.5 Üst | won | 61/100
- 2026-09-08 | Arjantin Prim B Metro | Excur - Ituzaingo | 2.5 Üst | won | 60/100
- 2026-09-08 | Arjantin Premier Lig 2. Aşama | Union Santa Fe - Instituto Cordo | 2.5 Üst | won | 56/100
- 2026-09-08 | İspanya Federasyon Kupası Son 32 Turu | Ud San Fernand - Orihuela | 2.5 Alt | pending | 54/100
- 2026-09-08 | Venezuela Premier Lig Clausura | Carabobo - Estudiantes Fc | 2.5 Alt | won | 67/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Kuzey | Telford - Oxford City | 2.5 Alt | pending | 50/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Güney | Dorking Wand. - Chelmsford | MS 1 | pending | 45/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Güney | Maidenhead Utd - Torquay | 2.5 Alt | pending | 48/100
- 2026-09-08 | Karadağ 1.Lig | Sutjeska - Mornar Bar | 2.5 Alt | pending | 57/100
- 2026-09-08 | İskoçya Challenge Kupası Lig Aşaması | Edinburg C. - Queen Of South | 2.5 Alt | pending | 56/100
- 2026-09-08 | Suudi Arabistan 1.Lig | Al Anwar - Al Taee | 2.5 Alt | pending | 50/100
- 2026-09-08 | Almanya Bölgesel Lig Güney Batı | Astoria Walldo - Stuttgarter Kic | 2.5 Alt | pending | 48/100
- 2026-09-08 | Uganda Premier Lig | Kigezi Home Bo - Kampala City | 2.5 Alt | pending | 57/100
- 2026-09-08 | Uganda Premier Lig | Bul - Ntugasaze | 2.5 Alt | pending | 55/100

