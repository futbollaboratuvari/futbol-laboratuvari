# Robot Öğrenme Hafızası Raporu

Oluşturma: 24.09.2026 15:13:46

## Özet

- Toplam tahmin: 2941
- Bekleyen tahmin: 1992
- Kazanan tahmin: 494
- Kaybeden tahmin: 455
- Lig sayısı: 426
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 858, bekleyen 583, başarı %56, düz getiri %-8, ağırlık 1
- MS 2: toplam 399, bekleyen 313, başarı %55, düz getiri %-2, ağırlık 1
- KG Var: toplam 199, bekleyen 105, başarı %54, düz getiri %-4, ağırlık 1
- 2.5 Üst: toplam 299, bekleyen 161, başarı %51, düz getiri %-9, ağırlık 1
- 3.5 Üst: toplam 77, bekleyen 34, başarı %51, düz getiri %1, ağırlık 1
- MS 1: toplam 758, bekleyen 537, başarı %50, düz getiri %-19, ağırlık 0.94
- KG Yok: toplam 180, bekleyen 99, başarı %44, düz getiri %-24, ağırlık 1
- MS X: toplam 22, bekleyen 11, başarı %27, düz getiri %-30, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 66, bekleyen 66, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 34, bekleyen 34, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-24 | Meksika Ascenso MX Apertura | Zacatecas - Piratas | 2.5 Üst | pending | 67/100
- 2026-09-24 | Kolombiya Primera A Clausura | Atletico Nacio - Los Millionario | 2.5 Alt | pending | 56/100
- 2026-09-24 | Meksika Ascenso MX Apertura | Alebrijes - Ca La Paz | MS 2 | pending | 61/100
- 2026-09-24 | Guatemala Ulusal Lig Apertura | Municipal - Suchitepequez | KG Var | pending | 70/100
- 2026-09-24 | CONCACAF Uluslar Ligi Lig A Grup A | Haiti - Trinidad & Toba | MS 1 | pending | 50/100
- 2026-09-24 | CONCACAF Uluslar A Ligi, Grp A | Kosta Rika - Curacao | İY KG / 2Y KG Hayır / Hayır | pending | 58/100
- 2026-09-24 | Şili Kupa Son 16 Turu | O Higgins - Deportes Santa | MS 1 | pending | 50/100
- 2026-09-24 | Şili Kupa Son 16 Turu | Everton De Vin - Univ. De Şili | 2.5 Alt | pending | 50/100
- 2026-09-24 | Fas Botola Pro | Amal Tiznit - Ittihad Tanger | MS 2 | pending | 42/100
- 2026-09-24 | Fransa Ligue 3 | Caen - Rouen | 2.5 Üst | pending | 52/100
- 2026-09-24 | Paraguay Kupa Son 16 Turu | Atlético Tembe - Sportivo Iteno | 2.5 Alt | pending | 49/100
- 2026-09-24 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Atletico Fc - Deportivo Cuenc | KG Var | pending | 58/100
- 2026-09-24 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Independiente - Cuniburo Fc | MS 1 | pending | 50/100
- 2026-09-24 | CONCACAF Uluslar Ligi Lig A Grup A | Dominik Cumhur - Nikaragua | İY KG / 2Y KG Hayır / Hayır | pending | 58/100
- 2026-09-24 | Ekvador Kupa Çeyrek Final | Gualaceo - Indep. Jose Ter | 2.5 Alt | pending | 41/100

