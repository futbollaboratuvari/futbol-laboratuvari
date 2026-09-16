# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 00:35:33

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1115
- Kazanan tahmin: 215
- Kaybeden tahmin: 170
- Lig sayısı: 282
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 587, bekleyen 441, başarı %62, düz getiri %7, ağırlık 1
- 2.5 Üst: toplam 165, bekleyen 95, başarı %54, düz getiri %-1, ağırlık 1
- MS 1: toplam 499, bekleyen 389, başarı %52, düz getiri %-13, ağırlık 1
- KG Var: toplam 14, bekleyen 4, başarı %50, düz getiri %-9, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- MS 2: toplam 228, bekleyen 183, başarı %49, düz getiri %-9, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | CONCACAF Orta Amerika Kupası Çeyrek Final | Alajuelense (2) - (2) Marathon | 2.5 Alt | pending | 44/100
- 2026-09-17 | Meksika Ascenso MX Apertura | Durango - Cruz Azul Hidal | MS 1 | pending | 55/100
- 2026-09-17 | CONCACAF Orta Amerika Kupası Çeyrek Final | Depor. Olimpia (3) - (0) Firpo | 2.5 Alt | pending | 41/100
- 2026-09-17 | İspanya LaLiga | Malaga - Villarreal | 2.5 Alt | pending | 58/100
- 2026-09-17 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Cuniburo Fc - 9 De Octubre | MS 1 | pending | 44/100
- 2026-09-17 | Ekvador Pro Lig Serie B Küme Düşme Grubu | 22 De Julio - Cumbaya | 2.5 Alt | pending | 46/100
- 2026-09-17 | Kolombiya Primera A Clausura | Bucaramanga - Independiente M | 2.5 Üst | pending | 67/100
- 2026-09-17 | Ekvador Pro Lig Serie B Küme Düşme Grubu | Santo Domingo - El Nacional | MS 1 | pending | 48/100
- 2026-09-17 | Copa Libertadores Çeyrek Final | Flamengo (2) - (0) Indep. Jose Ter | 2.5 Alt | pending | 40/100
- 2026-09-17 | Copa Sudamericana Çeyrek Final | Torque (0) - (2) Cienciano | MS 1 | pending | 48/100
- 2026-09-16 | Almanya Bölgesel Lig Kuzey | Jeddeloh - Atlas Delmenhor | MS 2 | pending | 52/100
- 2026-09-16 | Bosna-Hersek Premier Lig | Sloga Doboj - Borac Banja Luk | MS 2 | pending | 56/100
- 2026-09-16 | Rusya Premier Lig | Fk Rodina Mosk - Rubin Kazan | 2.5 Alt | won | 64/100
- 2026-09-16 | ABD Açık Kupası Yarı Final | Colorado - St. Louis City | 2.5 Üst | pending | 60/100
- 2026-09-16 | İngiltere Ulusal Lig | Kidderminster - Gateshead | 2.5 Alt | pending | 64/100

