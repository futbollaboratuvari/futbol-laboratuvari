# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 18:41:24

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1183
- Kazanan tahmin: 177
- Kaybeden tahmin: 140
- Lig sayısı: 291
- Seçenek sayısı: 9

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 38, bekleyen 26, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 157, bekleyen 104, başarı %60, düz getiri %10, ağırlık 1
- 2.5 Alt: toplam 546, bekleyen 432, başarı %57, düz getiri %-2, ağırlık 1
- MS 2: toplam 237, bekleyen 196, başarı %54, düz getiri %2, ağırlık 1
- MS 1: toplam 467, bekleyen 374, başarı %52, düz getiri %-17, ağırlık 1
- MS X: toplam 11, bekleyen 7, başarı %50, düz getiri %22, ağırlık 1
- İkinci Yarı KG Var: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- KG Yok: toplam 15, bekleyen 15, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 14, bekleyen 14, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Finlandiya Veikkausliiga, Şampiyonluk Gr | Oulu - Inter Turku | İkinci Yarı KG Var | pending | 57/100
- 2026-09-18 | United Arab Emirates UAE League Division 1 | Al Bataeh - Al Hamriyah | MS 2 | pending | 50/100
- 2026-09-18 | Honduras Ulusal Lig Apertura | Choloma - Estrella Roja | 2.5 Alt | pending | 58/100
- 2026-09-18 | Arjantin Primera C | Cambaceres - Jj Urquiza | MS 1 | pending | 42/100
- 2026-09-18 | Malta Premier Lig Açılış | Marsaxlokk Fc - Hamrun | KG Var | pending | 54/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Haverfordwest - Holywell Town | KG Var | pending | 54/100
- 2026-09-18 | Estonya Esiliiga B | Vaprus Ii - Tallinna Jk Leg | İkinci Yarı KG Var | pending | 54/100
- 2026-09-18 | Polonya Ekstraklasa | Widzew Lodz - Ks Wieczysta Kr | MS 1 | pending | 47/100
- 2026-09-18 | Finlandiya Veikkausliiga Şampiyonluk Grubu | Oulu - Inter Turku | İkinci Yarı KG Var | pending | 57/100
- 2026-09-18 | Polonya 1.Lig | Warta Poznan - Puszcza Niepolo | İkinci Yarı KG Var | pending | 54/100
- 2026-09-18 | Hırvatistan 2.HNL | Zdralovi - Segesta | KG Var | pending | 53/100
- 2026-09-18 | Birleşik Arap Emirlikleri 1.Lig | Al Urooba - Emirates | 2.5 Alt | pending | 53/100
- 2026-09-18 | Birleşik Arap Emirlikleri 1.Lig | Al Bataeh - Al Hamriyah | MS 2 | pending | 50/100
- 2026-09-18 | Birleşik Arap Emirlikleri 1.Lig | Gulf United - Al Jazira Al Ha | KG Yok | pending | 53/100
- 2026-09-18 | Birleşik Arap Emirlikleri 1.Lig | City Fc Dubai - Al Arabi | KG Var | pending | 54/100

