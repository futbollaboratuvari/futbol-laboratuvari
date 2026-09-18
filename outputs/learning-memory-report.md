# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 09:04:37

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1169
- Kazanan tahmin: 182
- Kaybeden tahmin: 149
- Lig sayısı: 287
- Seçenek sayısı: 9

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 30, bekleyen 18, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 157, bekleyen 103, başarı %59, düz getiri %7, ağırlık 1
- 2.5 Alt: toplam 563, bekleyen 445, başarı %56, düz getiri %-4, ağırlık 1
- MS 2: toplam 240, bekleyen 196, başarı %52, düz getiri %0, ağırlık 1
- MS 1: toplam 473, bekleyen 374, başarı %52, düz getiri %-17, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1
- 3.5 Üst: toplam 13, bekleyen 13, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- KG Yok: toplam 9, bekleyen 9, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 6, bekleyen 6, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | İspanya La Liga | Espanyol - Elche | KG Var | pending | 81/100
- 2026-09-18 | Hollanda Eerste Divisie | Den Bosch - Helmond Sport | 3.5 Üst | pending | 71/100
- 2026-09-18 | Hollanda Eerste Divisie | Jong Az Alkmaa - Volendam | 3.5 Üst | pending | 71/100
- 2026-09-18 | Galler Premier Lig | Colwyn Bay - Barry Town | KG Var | pending | 54/100
- 2026-09-18 | Galler Premier Lig | Ammanford - Penybont | 2.5 Alt | pending | 46/100
- 2026-09-18 | Almanya Amatör Bölgesel Lig KuzeyDoğu | Zwickau - Hallescher | MS 2 | pending | 45/100
- 2026-09-18 | Hollanda Eerste Divisie | Oss - Dordrecht | 3.5 Üst | pending | 74/100
- 2026-09-18 | Cezayir 2.Lig, Merkez-Doğu | Mo Bejaia - Mo Constantine | MS 1 | pending | 55/100
- 2026-09-18 | Asya Oyunları | Filipinler U23 - Vietnam U23 | KG Yok | pending | 53/100
- 2026-09-18 | Cezayir 1.Lig | Aso Chlef - Mc Oran | KG Yok | pending | 55/100
- 2026-09-18 | Arjantin Premier Lig 2. Aşama | Racing Club - Sarmiento | KG Var | pending | 74/100
- 2026-09-18 | İtalya Serie B | Juve Stabia - Cesena | KG Var | pending | 77/100
- 2026-09-18 | Belçika Pro Lig | Gent - Standard Liege | KG Var | pending | 55/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Colwyn Bay - Barry Town | KG Var | pending | 54/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Haverfordwest - Holywell Town | KG Yok | pending | 49/100

