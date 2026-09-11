# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 12:52:18

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1154
- Kazanan tahmin: 186
- Kaybeden tahmin: 160
- Lig sayısı: 277
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 226, bekleyen 144, başarı %60, düz getiri %4, ağırlık 1
- MS 1: toplam 489, bekleyen 391, başarı %56, düz getiri %-10, ağırlık 1
- MS 2: toplam 225, bekleyen 179, başarı %54, düz getiri %-4, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 554, bekleyen 437, başarı %48, düz getiri %-23, ağırlık 0.94
- MS X: toplam 3, bekleyen 2, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | CONCACAF Orta Amerika Kupası Çeyrek Final | Firpo - Depor. Olimpia | 2.5 Üst | pending | 57/100
- 2026-09-11 | Brezilya Serie B | Sao Bernardo - Londrina | 2.5 Üst | pending | 67/100
- 2026-09-11 | Meksika Liga MX Apertura | Necaxa - Puebla | 2.5 Üst | pending | 62/100
- 2026-09-11 | Meksika Liga MX Apertura | Club Tijuana - Queretaro | 2.5 Üst | pending | 64/100
- 2026-09-11 | Portekiz 2.Lig | Academica - Benfica (B) | 2.5 Üst | pending | 54/100
- 2026-09-11 | Malta Premier Lig Açılış | Hamrun - Birzebbuga | 2.5 Üst | pending | 53/100
- 2026-09-11 | İtalya Serie A | Unione V. - Fiorentina | 2.5 Alt | pending | 47/100
- 2026-09-11 | Belçika Pro Lig | Mechelen - Anderlecht | 2.5 Alt | pending | 50/100
- 2026-09-11 | İrlanda 1.Lig | Cork City - Cobh Ramblers | MS 1 | pending | 59/100
- 2026-09-11 | İsviçre Challenge Lig | Etoile Carouge - Winterthur | MS 2 | pending | 46/100
- 2026-09-11 | Portekiz 2.Lig | Torreense - Leixoes | 2.5 Alt | pending | 50/100
- 2026-09-11 | Almanya Bölgesel Lig Bayern | Buchbach - Bayern Munich ( | MS 2 | pending | 45/100
- 2026-09-11 | Almanya Bölgesel Lig Bayern | Aubstadt - Unterhaching | 2.5 Alt | pending | 46/100
- 2026-09-11 | Almanya Bölgesel Lig Bayern | Illertissen - Nurnberg Ii | MS 2 | pending | 44/100
- 2026-09-11 | Umman Profesyonel Lig | Al Nasr - Al Musannah | MS 1 | pending | 56/100

