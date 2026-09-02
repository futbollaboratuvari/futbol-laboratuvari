# Robot Öğrenme Hafızası Raporu

Oluşturma: 02.09.2026 17:35:27

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1084
- Kazanan tahmin: 231
- Kaybeden tahmin: 185
- Lig sayısı: 213
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 6, bekleyen 4, başarı %100, düz getiri %147, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 228, bekleyen 134, başarı %61, düz getiri %7, ağırlık 1
- MS 1: toplam 456, bekleyen 356, başarı %56, düz getiri %-8, ağırlık 1
- MS 2: toplam 219, bekleyen 185, başarı %56, düz getiri %-7, ağırlık 1
- 2.5 Alt: toplam 588, bekleyen 403, başarı %52, düz getiri %-14, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-02 | CONCACAF Ligler Kupası Yarı Final | Toluca - Club Leon | 2.5 Üst | pending | 53/100
- 2026-09-02 | CONCACAF Ligler Kupası Yarı Final | Club America - Monterrey | 2.5 Üst | pending | 53/100
- 2026-09-02 | İngiltere 1.Lig | Reading - Mansfield | MS 1 | pending | 50/100
- 2026-09-02 | İngiltere Premier Lig Kupası Grup E | Preston North - Wolverhampton U | MS 2 | pending | 46/100
- 2026-09-02 | Bosna-Hersek Premier Lig | Borac Banja Lu - Zeljeznicar | 2.5 Üst | pending | 53/100
- 2026-09-02 | Hırvatistan 2.HNL | Croatia Zmijav - Bijelo Brdo | 2.5 Alt | pending | 57/100
- 2026-09-02 | Letonya Kupa Yarı Final | Bfc Daugavpils - Auda | MS 2 | pending | 40/100
- 2026-09-02 | Portekiz U23 Ulusal Şampiyona | Benfica U23 - Academico Viseu | 2.5 Alt | pending | 49/100
- 2026-09-02 | Bahreyn Premier Lig | East Riffa - Sitra | 2.5 Alt | pending | 56/100
- 2026-09-02 | Mısır Premier Lig | El Gounah - Al Mokawloon Al | MS 1 | pending | 44/100
- 2026-09-02 | Arjantin Kupa Son 16 Turu | Boca Juniors - Velez Sarsfield | 2.5 Alt | pending | 65/100
- 2026-09-02 | İngiltere 1.Lig | Wigan - Mk Dons | 2.5 Üst | pending | 57/100
- 2026-09-02 | Polonya Kupa 1.Tur | Miedz Legnica - Chrobry Glogow | 2.5 Alt | pending | 52/100
- 2026-09-02 | Polonya Kupa 1.Tur | Resovia Rzeszo - Arka Gdynia | 2.5 Üst | pending | 54/100
- 2026-09-02 | Belçika Pro Lig | St. Truidense - Union St.G | MS 2 | pending | 50/100

