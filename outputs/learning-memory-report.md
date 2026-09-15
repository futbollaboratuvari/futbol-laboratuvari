# Robot Öğrenme Hafızası Raporu

Oluşturma: 15.09.2026 05:00:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1127
- Kazanan tahmin: 202
- Kaybeden tahmin: 171
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

- 2.5 Alt: toplam 616, bekleyen 471, başarı %59, düz getiri %1, ağırlık 1
- MS 1: toplam 504, bekleyen 400, başarı %54, düz getiri %-8, ağırlık 1
- 2.5 Üst: toplam 166, bekleyen 100, başarı %53, düz getiri %-4, ağırlık 1
- KG Var: toplam 16, bekleyen 1, başarı %47, düz getiri %-12, ağırlık 1
- MS 2: toplam 192, bekleyen 152, başarı %43, düz getiri %-21, ağırlık 1
- MS X: toplam 6, bekleyen 3, başarı %33, düz getiri %-20, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-15 | Arjantin Premier Lig 2. Aşama | Banfield - Barracas | MS X | pending | 58/100
- 2026-09-15 | Arjantin Premier Lig 2. Aşama | Riestra - Lanus | MS 2 | pending | 58/100
- 2026-09-15 | Uruguay Premier Lig Clausura | Torque - Liverpool Monte | 2.5 Üst | pending | 62/100
- 2026-09-15 | Paraguay Intermedia Lig | Tacuary - 12 De Junio Vh | 2.5 Alt | pending | 53/100
- 2026-09-15 | Brezilya Serie B | Regatas - Sport Recife | 2.5 Üst | pending | 55/100
- 2026-09-15 | Kolombiya Primera A Clausura | Chico - Alianza Petrole | MS 1 | pending | 49/100
- 2026-09-15 | Almanya Bölgesel Lig Kuzey Doğu | Hallescher - Carl Zeiss Jena | 2.5 Üst | pending | 54/100
- 2026-09-15 | Tayland 2.Lig | Tero Sasana - Songkhla | 2.5 Üst | pending | 53/100
- 2026-09-15 | Arjantin Primera C | Claypole - Sacachispas | 2.5 Alt | pending | 50/100
- 2026-09-15 | Meksika Ascenso MX Apertura | Dorados - Cancun Fc | MS 1 | pending | 56/100
- 2026-09-15 | İngiltere Ulusal Lig | Worthing - Hornchurch | MS 1 | pending | 61/100
- 2026-09-15 | İngiltere Ulusal Lig N / S Güney | Truro City - Salisbury | MS 1 | pending | 51/100
- 2026-09-15 | İngiltere Ulusal Lig N / S Güney | Billericay Tow - Braintree | MS 1 | pending | 54/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Brentwood Town - Stanway Rovers | MS 1 | pending | 58/100
- 2026-09-15 | İngiltere Non League Premier Isthmian | Welling Utd - Cheshunt | 2.5 Alt | pending | 56/100

