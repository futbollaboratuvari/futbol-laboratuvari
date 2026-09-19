# Robot Öğrenme Hafızası Raporu

Oluşturma: 19.09.2026 20:27:39

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1238
- Kazanan tahmin: 155
- Kaybeden tahmin: 107
- Lig sayısı: 291
- Seçenek sayısı: 10

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 73, bekleyen 56, başarı %71, düz getiri %23, ağırlık 1
- 2.5 Üst: toplam 163, bekleyen 120, başarı %63, düz getiri %11, ağırlık 1
- 2.5 Alt: toplam 484, bekleyen 397, başarı %62, düz getiri %6, ağırlık 1
- MS 1: toplam 429, bekleyen 355, başarı %58, düz getiri %-4, ağırlık 1
- 3.5 Üst: toplam 27, bekleyen 19, başarı %50, düz getiri %-6, ağırlık 1
- KG Yok: toplam 52, bekleyen 50, başarı %50, düz getiri %-26, ağırlık 1
- MS 2: toplam 223, bekleyen 195, başarı %46, düz getiri %-13, ağırlık 1
- MS X: toplam 13, bekleyen 10, başarı %33, düz getiri %-17, ağırlık 1
- İlk Yarı KG Var: toplam 6, bekleyen 6, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 30, bekleyen 30, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-19 | İspanya La Liga | Celta Vigo - Santander | KG Var | pending | 79/100
- 2026-09-19 | Almanya Bundesliga | Stuttgart - B.Dortmund | 3.5 Üst | pending | 69/100
- 2026-09-19 | Galler Premier Lig | The New Saints - Llandudno | 3.5 Üst | pending | 65/100
- 2026-09-19 | Albania Kategori Super | Dinamo Tirana - Kf Laci | MS 1 | pending | 55/100
- 2026-09-19 | İsviçre Süper Lig | Sion - Zurich | 3.5 Üst | pending | 67/100
- 2026-09-19 | ABD USL | Detroit City - Pittsburgh Rive | KG Yok | pending | 66/100
- 2026-09-19 | ABD USL | Charleston Bat - Monterey Bay | KG Var | pending | 66/100
- 2026-09-19 | Suudi Arabistan 1.Lig | Al Zulfi - Al-Raed | MS 1 | pending | 55/100
- 2026-09-19 | İspanya 2. Lig RFEF Grup 1 | Portugalete - Coruxo | 2.5 Alt | pending | 58/100
- 2026-09-19 | Arnavutluk Süperlig | Dinamo Tirana - Kf Laci | MS 1 | pending | 55/100
- 2026-09-19 | İngiltere Ulusal Lig | Hornchurch - Scunthorpe | MS 1 | pending | 59/100
- 2026-09-19 | İngiltere Kadınlar Premier Lig | Arsenal (K) - Manchester Unit | MS 1 | pending | 57/100
- 2026-09-19 | İskoçya Premiership | Kilmarnock - Hearts | MS 1 | pending | 47/100
- 2026-09-19 | İspanya Primera Lig RFEF Grup 2 | Villarreal B - Antequera | 2.5 Üst | pending | 52/100
- 2026-09-19 | Türkiye Süper Lig | Trabzonspor - Galatasaray | İlk Yarı KG Var | pending | 66/100

