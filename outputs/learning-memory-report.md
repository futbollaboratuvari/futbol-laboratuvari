# Robot Öğrenme Hafızası Raporu

Oluşturma: 01.09.2026 07:57:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1092
- Kazanan tahmin: 226
- Kaybeden tahmin: 182
- Lig sayısı: 208
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 4, bekleyen 3, başarı %100, düz getiri %146, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 222, bekleyen 132, başarı %64, düz getiri %15, ağırlık 1
- MS 2: toplam 210, bekleyen 175, başarı %57, düz getiri %-4, ağırlık 1
- MS 1: toplam 486, bekleyen 390, başarı %53, düz getiri %-13, ağırlık 1
- 2.5 Alt: toplam 575, bekleyen 390, başarı %51, düz getiri %-15, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-01 | İngiltere Non League Premier Kuzey | Leek Town - Warrington Town | 2.5 Üst | pending | 53/100
- 2026-09-01 | İngiltere Championship | West Ham - Wolverhampton | 2.5 Alt | pending | 56/100
- 2026-09-01 | İngiltere 2.Lig | Swindon - Port Vale | 2.5 Alt | pending | 60/100
- 2026-09-01 | Güney Afrika PSL | Kruger United - Orlando Pirates | 2.5 Üst | pending | 55/100
- 2026-09-01 | Güney Afrika PSL | Durban City - Stellenbosch Fc | MS 1 | pending | 44/100
- 2026-09-01 | Kuveyt Premier Lig | Al Tadhamon - Al Salmiyah | MS 2 | pending | 52/100
- 2026-09-01 | Portekiz U23 Ulusal Şampiyona | Estrela U23 - Sporting Cp U23 | 2.5 Üst | pending | 54/100
- 2026-09-01 | İsveç Superettan | Helsingborg - Orebro | 2.5 Alt | pending | 48/100
- 2026-09-01 | Polonya Kupa 1.Tur | Polonia Sroda - Sandecja Nowy S | 2.5 Alt | pending | 48/100
- 2026-09-01 | İsviçre Challenge Lig | Rappersvil Jon - Sc Kriens | MS 1 | pending | 45/100
- 2026-09-01 | Polonya Kupa 1.Tur | Kluczevia Star - Pogon Siedlce | 2.5 Üst | pending | 54/100
- 2026-09-01 | Mısır Premier Lig | Ghazl El Mehal - Enppi | MS 1 | pending | 44/100
- 2026-09-01 | İngiltere Non League Premier Kuzey | Leek Town - Warrington Town | 2.5 Alt | pending | 49/100
- 2026-09-01 | İngiltere Non League Premier Güney Merkez | Stourbridge - Leamington | 2.5 Alt | pending | 49/100
- 2026-09-01 | İtalya Kupa 2.Tur | Torino - Monza | 2.5 Üst | pending | 61/100

