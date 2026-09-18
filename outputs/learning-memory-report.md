# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 07:33:07

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1161
- Kazanan tahmin: 187
- Kaybeden tahmin: 152
- Lig sayısı: 292
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 13, bekleyen 1, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 155, bekleyen 101, başarı %59, düz getiri %7, ağırlık 1
- 2.5 Alt: toplam 583, bekleyen 462, başarı %56, düz getiri %-4, ağırlık 1
- MS 2: toplam 247, bekleyen 200, başarı %55, düz getiri %5, ağırlık 1
- MS 1: toplam 490, bekleyen 389, başarı %51, düz getiri %-18, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1
- 3.5 Üst: toplam 3, bekleyen 3, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | İspanya La Liga | Espanyol - Elche | 2.5 Üst | pending | 78/100
- 2026-09-18 | Hollanda 1. Lig | Waalwijk - Maastricht | 3.5 Üst | pending | 73/100
- 2026-09-18 | Hollanda 1. Lig | Almere City - Heracles | 3.5 Üst | pending | 71/100
- 2026-09-18 | İsviçre Challenge Ligi | Winterthur - Aarau | MS 1 | pending | 44/100
- 2026-09-18 | İspanya La Liga 2 | Albacete - Cordoba | 2.5 Alt | pending | 63/100
- 2026-09-18 | Galler Premier Lig | Colwyn Bay - Barry Town | 2.5 Üst | pending | 53/100
- 2026-09-18 | Almanya Amatör Bölgesel Lig KuzeyDoğu | Zwickau - Hallescher | 2.5 Alt | pending | 47/100
- 2026-09-18 | Danimarka 2. Ligi | Roskilde - Fa 2000 | MS 1 | pending | 53/100
- 2026-09-18 | Faroe Adaları Premier Lig | B36 Torshavn - Runavik | MS 2 | pending | 47/100
- 2026-09-18 | Hollanda Eredivisie | Groningen - Zwolle | 3.5 Üst | pending | 74/100
- 2026-09-18 | Ürdün Pro Ligi | Al Arabi - Al Jazeera | 2.5 Alt | pending | 52/100
- 2026-09-18 | Cezayir 2.Lig, Merkez-Doğu | Mo Bejaia - Mo Constantine | 2.5 Alt | pending | 54/100
- 2026-09-18 | Finlandiya Ykkonen | Haka - Klubi 04 | MS 1 | pending | 54/100
- 2026-09-18 | Finlandiya Veikkausliiga, Şampiyonluk Gr | Oulu - Inter Turku | 2.5 Alt | pending | 52/100
- 2026-09-18 | Türkiye 1. Lig | Bandirmaspor - Ümraniyespor | 2.5 Alt | pending | 43/100

