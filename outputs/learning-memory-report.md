# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 15:11:30

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1174
- Kazanan tahmin: 180
- Kaybeden tahmin: 146
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

- KG Var: toplam 34, bekleyen 22, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 159, bekleyen 105, başarı %59, düz getiri %7, ağırlık 1
- 2.5 Alt: toplam 553, bekleyen 438, başarı %56, düz getiri %-3, ağırlık 1
- MS 2: toplam 241, bekleyen 198, başarı %54, düz getiri %3, ağırlık 1
- MS 1: toplam 472, bekleyen 374, başarı %51, düz getiri %-18, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1
- KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 13, bekleyen 13, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Türkiye 1. Lig | Bandirmaspor - Ümraniyespor | KG Var | pending | 46/100
- 2026-09-18 | İrlanda Premier Lig | Dundalk - Shelbourne | MS 1 | pending | 43/100
- 2026-09-18 | Fransa Ligue 2 | Stade Lavalloi - Sochaux | KG Yok | pending | 61/100
- 2026-09-18 | Hollanda Eerste Divisie | Oss - Dordrecht | 2.5 Alt | pending | 48/100
- 2026-09-18 | Cezayir 1.Lig | Mc Alger - Rouisset | MS 1 | pending | 57/100
- 2026-09-18 | Romanya 1.Lig | Rapid Bükreş - Argesul Pitesti | MS 1 | pending | 53/100
- 2026-09-18 | İsveç 2.Lig Södra Götaland | Staffanstorp U - Österlen | MS 1 | pending | 42/100
- 2026-09-18 | Almanya Bölgesel Lig Batı | Rödinghausen - Gutersloh | 2.5 Üst | pending | 54/100
- 2026-09-18 | Ürdün 1.Lig | Ethad Ar - Al Yarmouk | 2.5 Üst | pending | 53/100
- 2026-09-18 | Ürdün 1.Lig | Maan - Al Hashemeya | 2.5 Alt | pending | 55/100
- 2026-09-18 | İsveç Superettan | Falkenberg - Ostersund | KG Var | pending | 54/100
- 2026-09-18 | Finlandiya Ykkösliiga | Japs - Ekenas If | MS 2 | pending | 42/100
- 2026-09-18 | Litvanya 1.Lig | Lietava Jonava - Tauras | KG Var | pending | 55/100
- 2026-09-18 | Cezayir 1.Lig | Usm Khenchela - Es Ben Aknoun | KG Yok | pending | 55/100
- 2026-09-18 | Türkiye TFF 1. Lig | Bandirmaspor - Ümraniyespor | KG Var | pending | 46/100

