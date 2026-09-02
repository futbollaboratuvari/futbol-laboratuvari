# Robot Öğrenme Hafızası Raporu

Oluşturma: 02.09.2026 12:45:00

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1083
- Kazanan tahmin: 232
- Kaybeden tahmin: 185
- Lig sayısı: 211
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
- 2.5 Üst: toplam 227, bekleyen 133, başarı %61, düz getiri %7, ağırlık 1
- MS 1: toplam 458, bekleyen 358, başarı %56, düz getiri %-8, ağırlık 1
- MS 2: toplam 218, bekleyen 184, başarı %56, düz getiri %-7, ağırlık 1
- 2.5 Alt: toplam 588, bekleyen 402, başarı %52, düz getiri %-14, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-02 | Arjantin Kupa Son 16 Turu | Boca Juniors - Velez Sarsfield | 2.5 Alt | pending | 65/100
- 2026-09-02 | İngiltere 1.Lig | Wigan - Mk Dons | 2.5 Üst | pending | 56/100
- 2026-09-02 | Polonya Kupa 1.Tur | Miedz Legnica - Chrobry Glogow | 2.5 Alt | pending | 52/100
- 2026-09-02 | Polonya Kupa 1.Tur | Resovia Rzeszo - Arka Gdynia | 2.5 Üst | pending | 54/100
- 2026-09-02 | Belçika Pro Lig | St. Truidense - Union St.G | MS 2 | pending | 50/100
- 2026-09-02 | Japonya Lig Kupası 1.Tur | Gainare Tottor - Omiya | 2.5 Üst | pending | 54/100
- 2026-09-02 | Japonya Lig Kupası 1.Tur | Renofa Yamaguc - Fujieda | 2.5 Üst | pending | 54/100
- 2026-09-02 | Çin Halk Cumhuriyeti FA Kupası Çeyrek Final | Yunnan Yukun - Chongqing Tongl | MS 1 | pending | 44/100
- 2026-09-02 | Polonya Kupa 1.Tur | Luzino - Wisla Plock | MS 2 | pending | 58/100
- 2026-09-02 | İtalya Kupa 2.Tur | Sassuolo - Frosinone | MS 1 | pending | 54/100
- 2026-09-02 | Uganda Premier Lig | Blacks Power - Police | 2.5 Alt | pending | 57/100
- 2026-09-02 | Uganda Premier Lig | Ntugasaze - Maroons | 2.5 Alt | pending | 57/100
- 2026-09-02 | Avustralya NPL Yeni Güney Galler Eleme Finalleri | Sutherland Sha - Manly United | 2.5 Üst | pending | 46/100
- 2026-09-02 | Avustralya NPL Yeni Güney Galler Eleme Finalleri | Marconi - Nws Spirit | 2.5 Üst | pending | 45/100
- 2026-09-02 | Japonya J1 Lig | Mito Hollyhock - Kashima | 2.5 Üst | pending | 61/100

