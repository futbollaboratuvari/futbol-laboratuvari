# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 00:50:59

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1099
- Kazanan tahmin: 225
- Kaybeden tahmin: 176
- Lig sayısı: 275
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
- KG Var: toplam 13, bekleyen 2, başarı %64, düz getiri %14, ağırlık 1
- 2.5 Alt: toplam 606, bekleyen 453, başarı %59, düz getiri %0, ağırlık 1
- 2.5 Üst: toplam 160, bekleyen 92, başarı %56, düz getiri %1, ağırlık 1
- MS 2: toplam 235, bekleyen 186, başarı %53, düz getiri %-1, ağırlık 1
- MS 1: toplam 477, bekleyen 360, başarı %53, düz getiri %-14, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Guatemala Ulusal Lig Apertura | Comunicaciones - Guastatoya | 2.5 Alt | pending | 69/100
- 2026-09-18 | Meksika Liga MX Apertura | Fc Juarez - Tigres Uanl | 2.5 Alt | pending | 65/100
- 2026-09-18 | Meksika Ascenso MX Apertura | Ca La Paz - Correcaminos Ua | MS 1 | pending | 53/100
- 2026-09-18 | Arjantin Primera C | Cambaceres - Jj Urquiza | MS 2 | pending | 41/100
- 2026-09-18 | Paraguay Intermedia Lig | 3 De Noviembre - Guairena | 2.5 Alt | pending | 53/100
- 2026-09-18 | Brezilya Serie B | Vila Nova - America Mineiro | MS 1 | pending | 67/100
- 2026-09-18 | Bolivya Premier Lig | Independiente - San Antonio Bul | MS 1 | pending | 65/100
- 2026-09-18 | Kolombiya Primera B Clausura | Patriotas - Union Magdalena | 2.5 Alt | pending | 54/100
- 2026-09-18 | ABD MLS | New York City - New York | 2.5 Alt | pending | 66/100
- 2026-09-18 | Brezilya Serie B | Ceara - Novorizontino | 2.5 Üst | pending | 71/100
- 2026-09-18 | Brezilya Serie B | Sao Bernardo - Atletico Goiani | 2.5 Alt | pending | 63/100
- 2026-09-18 | El Salvador Primera Lig Apertura | Inca-Aruba - Fuerte San Fran | 2.5 Alt | pending | 63/100
- 2026-09-18 | Arjantin Premier Lig 2. Aşama | Racing Club - Sarmiento | 2.5 Alt | pending | 62/100
- 2026-09-18 | Ekvador Pro Lig Şampiyonluk Grubu | Aucas - Depor Macara | 2.5 Alt | pending | 72/100
- 2026-09-18 | Meksika Liga MX Apertura | Puebla - Atlante | 2.5 Alt | pending | 67/100

