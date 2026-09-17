# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 00:03:12

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1083
- Kazanan tahmin: 235
- Kaybeden tahmin: 182
- Lig sayısı: 274
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 9, bekleyen 6, başarı %67, düz getiri %63, ağırlık 1
- 2.5 Alt: toplam 603, bekleyen 443, başarı %60, düz getiri %2, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 161, bekleyen 90, başarı %56, düz getiri %1, ağırlık 1
- MS 2: toplam 234, bekleyen 185, başarı %53, düz getiri %-1, ağırlık 1
- MS 1: toplam 479, bekleyen 357, başarı %53, düz getiri %-13, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Kolombiya Primera A Clausura | Bucaramanga - Independiente M | 2.5 Üst | pending | 70/100
- 2026-09-18 | Ekvador Pro Lig Serie B Küme Düşme Grubu | Santo Domingo - El Nacional | 2.5 Alt | pending | 46/100
- 2026-09-18 | Kolombiya Primera A Clausura | Bucaramanga - Independiente M | 2.5 Üst | pending | 70/100
- 2026-09-18 | Copa Sudamericana Çeyrek Final | Torque (0) - (2) Cienciano | MS 1 | pending | 46/100
- 2026-09-18 | CONCACAF Orta Amerika Kupası Çeyrek Final | Alajuelense (2) - (2) Marathon | 2.5 Alt | pending | 43/100
- 2026-09-18 | Meksika Ascenso MX Apertura | Durango - Cruz Azul Hidal | 2.5 Alt | pending | 54/100
- 2026-09-18 | CONCACAF Orta Amerika Kupası Çeyrek Final | Depor. Olimpia (3) - (0) Firpo | 2.5 Alt | pending | 39/100
- 2026-09-18 | Japonya J2 Lig | Vanraure - Tegevajaro Miya | 2.5 Alt | pending | 54/100
- 2026-09-17 | İspanya LaLiga | Real Betis - Getafe | MS 1 | pending | 71/100
- 2026-09-17 | AFC Şampiyonlar Ligi 2 Grup H | Phnom Penh Cro - Kuching Fa | MS 1 | won | 42/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Crystal Palace - Lech Poznan | MS 1 | pending | 66/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Viktoria Plzen - Union St.G | MS 1 | pending | 43/100
- 2026-09-17 | Rusya FNL | Olimpiyets - Leningradets | MS 1 | pending | 56/100
- 2026-09-17 | Ekvador Pro Lig Serie B Küme Düşme Grubu | Santo Domingo - El Nacional | 2.5 Alt | pending | 46/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Levski Sofya - Salzburg | MS 2 | won | 48/100

