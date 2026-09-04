# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 00:36:27

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1114
- Kazanan tahmin: 220
- Kaybeden tahmin: 166
- Lig sayısı: 228
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 236, bekleyen 198, başarı %66, düz getiri %10, ağırlık 1
- 2.5 Üst: toplam 226, bekleyen 135, başarı %59, düz getiri %4, ağırlık 1
- MS 1: toplam 481, bekleyen 376, başarı %57, düz getiri %-6, ağırlık 1
- 2.5 Alt: toplam 547, bekleyen 397, başarı %53, düz getiri %-11, ağırlık 1
- MS X: toplam 10, bekleyen 8, başarı %50, düz getiri %24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Avustralya NPL Tazmanya Büyük Final | South Hobart - Devonport City | MS 1 | pending | 42/100
- 2026-09-05 | Avustralya NPL Victoria Eleme Final | Avondale Heigh - Preston Lions | 2.5 Alt | pending | 40/100
- 2026-09-05 | Brezilya Serie B | Criciuma - Cuiaba | MS 1 | pending | 51/100
- 2026-09-05 | Arjantin Ulusal Primera Lig | Ferro Carril O - Ca Mitre | MS 1 | pending | 56/100
- 2026-09-05 | ABD USL | Loudoun United - Colorado Spring | 2.5 Alt | pending | 58/100
- 2026-09-05 | ABD MLS | New York City - Nashville Sc | 2.5 Üst | pending | 63/100
- 2026-09-05 | Brezilya Serie B | Athletic Club - Vila Nova | MS 1 | pending | 46/100
- 2026-09-05 | Şili Premier Lig | Concepcion - Audax Italiano | 2.5 Alt | pending | 60/100
- 2026-09-05 | Brezilya Serie B | Regatas - America Mineiro | MS 1 | pending | 58/100
- 2026-09-05 | Ekvador Pro Lig | T.Universitari - Ldu Quito | 2.5 Alt | pending | 61/100
- 2026-09-05 | Meksika Ascenso MX Apertura | Durango - Tlaxcala | 2.5 Üst | pending | 65/100
- 2026-09-05 | Guatemala Ulusal Lig Apertura | Antigua Guatem - Aurora | 2.5 Üst | pending | 56/100
- 2026-09-05 | Honduras Ulusal Lig Apertura | Choloma - Olancho | 2.5 Alt | pending | 55/100
- 2026-09-05 | Kosta Rika Premier Lig Apertura | Liberia - Inter San Carlo | 2.5 Üst | pending | 54/100
- 2026-09-05 | Meksika Liga MX Apertura | Fc Juarez - Pachuca | 2.5 Üst | pending | 62/100

