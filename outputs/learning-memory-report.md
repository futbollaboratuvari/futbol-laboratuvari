# Robot Öğrenme Hafızası Raporu

Oluşturma: 02.09.2026 02:06:00

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1076
- Kazanan tahmin: 233
- Kaybeden tahmin: 191
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
- 2.5 Üst: toplam 226, bekleyen 126, başarı %61, düz getiri %8, ağırlık 1
- MS 1: toplam 458, bekleyen 357, başarı %55, düz getiri %-9, ağırlık 1
- MS 2: toplam 216, bekleyen 181, başarı %54, düz getiri %-9, ağırlık 1
- 2.5 Alt: toplam 591, bekleyen 406, başarı %51, düz getiri %-15, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-02 | Ekvador Pro Lig | Deportivo Cuen - Guayaquil City | 2.5 Alt | pending | 56/100
- 2026-09-02 | Şili Premier Lig | Coquimbo Unido - Univ De Concepc | MS 1 | pending | 57/100
- 2026-09-02 | Nikaragua Premier Lig Apertura | Jalapa - Rancho Santana | MS 1 | pending | 53/100
- 2026-09-02 | Brezilya Serie A | Flamengo - Mirassol | 2.5 Alt | pending | 55/100
- 2026-09-02 | Kolombiya Kupa Son 16 Turu | Quindio - Llaneros | MS 1 | pending | 45/100
- 2026-09-02 | Venezuela Premier Lig Clausura | Caracas Fc - Portuguesa | 2.5 Alt | pending | 65/100
- 2026-09-02 | Arjantin Ulusal Primera Lig | Colegiales - Midland | MS 1 | pending | 49/100
- 2026-09-02 | Uruguay Kupa Ön Eleme Turu Grup 1 | Atenas - Penarol | 2.5 Alt | pending | 58/100
- 2026-09-02 | ABD USL | Charleston Bat - Hartford Athlet | MS 1 | pending | 57/100
- 2026-09-02 | ABD USL Lig 1 | Westchester Sc - Chattanooga Red | 2.5 Alt | pending | 49/100
- 2026-09-02 | ABD USL Lig 1 | Fort Wayne - Richmond Kicker | MS 1 | pending | 57/100
- 2026-09-02 | ABD USL Lig 1 | New York Cosmo - Sarasota Paradi | MS 1 | pending | 49/100
- 2026-09-02 | ABD USL Lig 1 | Charlotte Inde - Portland Hearts | MS 1 | pending | 59/100
- 2026-09-02 | Ekvador Pro Lig | Barcelona Gua - Indep. Jose Ter | 2.5 Alt | pending | 55/100
- 2026-09-02 | ABD USL Lig 1 | Forward Madiso - One Knoxville | 2.5 Üst | pending | 62/100

