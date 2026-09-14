# Robot Öğrenme Hafızası Raporu

Oluşturma: 15.09.2026 02:15:06

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1131
- Kazanan tahmin: 201
- Kaybeden tahmin: 168
- Lig sayısı: 263
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 619, bekleyen 476, başarı %59, düz getiri %2, ağırlık 1
- MS 1: toplam 506, bekleyen 403, başarı %54, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 163, bekleyen 97, başarı %53, düz getiri %-4, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %20, ağırlık 1
- KG Var: toplam 16, bekleyen 1, başarı %47, düz getiri %-12, ağırlık 1
- MS 2: toplam 191, bekleyen 151, başarı %43, düz getiri %-21, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-15 | Arjantin Primera C | Claypole - Sacachispas | 2.5 Alt | pending | 50/100
- 2026-09-15 | Meksika Ascenso MX Apertura | Dorados - Cancun Fc | MS 1 | pending | 57/100
- 2026-09-15 | İngiltere Ulusal Lig | Worthing - Hornchurch | MS 1 | pending | 61/100
- 2026-09-15 | İngiltere Ulusal Lig N / S Güney | Truro City - Salisbury | MS 1 | pending | 51/100
- 2026-09-15 | İngiltere Ulusal Lig N / S Güney | Billericay Tow - Braintree | MS 1 | pending | 54/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Brentwood Town - Stanway Rovers | MS 1 | pending | 58/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Welling Utd - Cheshunt | 2.5 Alt | pending | 56/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Enfield Town - Dartford | 2.5 Alt | pending | 48/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Leatherhead - Afc Whyteleafe | MS 1 | pending | 54/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Lewes - Carshalton Athl | 2.5 Alt | pending | 49/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Eastbourne Bor - Chatham Town | 2.5 Alt | pending | 49/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Cray Wanderers - St Albans | 2.5 Alt | pending | 48/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Whitehawk - Three Bridges | MS 2 | pending | 45/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Ramsgate - Maldon And Tipt | MS 1 | pending | 54/100
- 2026-09-15 | İngiltere Non League Premier Güney | Berkhamsted - Uxbridge | 2.5 Alt | pending | 49/100

