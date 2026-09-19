# Robot Öğrenme Hafızası Raporu

Oluşturma: 19.09.2026 19:12:04

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1305
- Kazanan tahmin: 112
- Kaybeden tahmin: 83
- Lig sayısı: 292
- Seçenek sayısı: 10

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 166, bekleyen 133, başarı %67, düz getiri %20, ağırlık 1
- 2.5 Alt: toplam 502, bekleyen 431, başarı %62, düz getiri %7, ağırlık 1
- KG Var: toplam 68, bekleyen 63, başarı %60, düz getiri %1, ağırlık 1
- MS 2: toplam 222, bekleyen 199, başarı %52, düz getiri %-3, ağırlık 1
- MS 1: toplam 437, bekleyen 377, başarı %50, düz getiri %-23, ağırlık 1
- MS X: toplam 12, bekleyen 9, başarı %33, düz getiri %-17, ağırlık 1
- KG Yok: toplam 41, bekleyen 41, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 29, bekleyen 29, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-19 | ABD USL | Rhode Island - Miami Fc | KG Var | pending | 73/100
- 2026-09-19 | Venezuela Premier Lig Clausura | Rayo Zuliano - Monagas | 2.5 Alt | pending | 65/100
- 2026-09-19 | İtalya Serie A | Unione V. - Lazio | MS 2 | pending | 47/100
- 2026-09-19 | İspanya 2. Lig RFEF Grup 5 | Calamocha - Atletico Madrid | MS 1 | pending | 48/100
- 2026-09-19 | İspanya Tercera Ligi Grup 5 | Ue Cornella - Lhospitalet | 2.5 Üst | pending | 53/100
- 2026-09-19 | İngiltere Ulusal Lig | Hornchurch - Scunthorpe | 2.5 Üst | pending | 76/100
- 2026-09-19 | Birleşik Arap Emirlikleri Lig Kupası Ön ElemeTuru | Al Wasl - Al Ain | MS 1 | pending | 44/100
- 2026-09-19 | İspanya Tercera Ligi Grup 4 | Durango - Aretxabaleta | KG Var | pending | 57/100
- 2026-09-19 | Kadınlar U20 Dünya Kupası Çeyrek Final | Brezilya U20 ( - İspanya U20 (K) | MS 2 | pending | 47/100
- 2026-09-19 | Slovakya 2.Lig | Tatran Presov - Samorin | 2.5 Alt | pending | 54/100
- 2026-09-19 | Litvanya 1.Lig | Kauno Zalgiris - Garliava | KG Var | pending | 54/100
- 2026-09-19 | Suudi Arabistan 1.Lig | Al Anwar - Al Najma | MS 1 | pending | 49/100
- 2026-09-19 | İtalya Serie A | Roma - Inter | MS 1 | pending | 65/100
- 2026-09-19 | Çek Cumhuriyeti Czech Liga | Slovacko - Banik Ostrava | KG Var | pending | 54/100
- 2026-09-19 | Norveç Eliteserien | Molde - Aalesund | MS 1 | pending | 52/100

