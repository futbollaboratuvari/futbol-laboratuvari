# Robot Öğrenme Hafızası Raporu

Oluşturma: 04.09.2026 07:45:52

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1105
- Kazanan tahmin: 226
- Kaybeden tahmin: 169
- Lig sayısı: 231
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 232, bekleyen 194, başarı %63, düz getiri %4, ağırlık 1
- MS 1: toplam 478, bekleyen 373, başarı %59, düz getiri %-3, ağırlık 1
- 2.5 Üst: toplam 220, bekleyen 130, başarı %58, düz getiri %2, ağırlık 1
- 2.5 Alt: toplam 559, bekleyen 399, başarı %54, düz getiri %-10, ağırlık 1
- MS X: toplam 9, bekleyen 7, başarı %50, düz getiri %24, ağırlık 1
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-04 | Ekvador Pro Lig | T.Universitari - Ldu Quito | 2.5 Alt | pending | 61/100
- 2026-09-04 | İngiltere Kadınlar Premier Lig | London City (K - Manchester Unit | 2.5 Alt | pending | 52/100
- 2026-09-04 | Belarus Premier Lig | Slavia Mozyr - Vitebsk | MS 1 | pending | 46/100
- 2026-09-04 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Es Zarzis - Asc Diambars | 2.5 Alt | pending | 57/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Gap Connahs Qu - Haverfordwest | 2.5 Alt | pending | 48/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Caernarfon - Flint Town | MS 1 | pending | 57/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Cardiff Mu - Cambrian | MS 1 | pending | 51/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Holywell Town - Trefelin | MS 2 | pending | 46/100
- 2026-09-04 | Galler Premier Lig 1.Aşama | Briton Ferry - Airbus Uk | MS 1 | pending | 48/100
- 2026-09-04 | Kuzey İrlanda Premiership | Larne Fc - Glentoran | 2.5 Alt | pending | 54/100
- 2026-09-04 | İrlanda 1.Lig | Treaty Unt. - Wexford Youths | 2.5 Üst | pending | 53/100
- 2026-09-04 | İrlanda 1.Lig | Finn Harps - Athlone | MS 2 | pending | 51/100
- 2026-09-04 | İrlanda 1.Lig | Cobh Ramblers - Ucd | 2.5 Alt | pending | 49/100
- 2026-09-04 | İrlanda 1.Lig | Bray Wanderers - Cork City | MS 2 | pending | 49/100
- 2026-09-04 | Kuzey İrlanda Championship | Annagh United - Ards Fc | MS 1 | pending | 53/100

