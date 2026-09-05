# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 15:51:13

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1297
- Kazanan tahmin: 118
- Kaybeden tahmin: 85
- Lig sayısı: 246
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 10, bekleyen 7, başarı %67, düz getiri %66, ağırlık 1
- MS 1: toplam 474, bekleyen 415, başarı %64, düz getiri %8, ağırlık 1
- MS 2: toplam 247, bekleyen 223, başarı %58, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 532, bekleyen 464, başarı %57, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 237, bekleyen 188, başarı %51, düz getiri %-11, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Honduras Ulusal Lig Apertura | Atlético Indep - Depor Motagua | 2.5 Üst | pending | 57/100
- 2026-09-05 | İspanya 2. Lig RFEF Grup 3 | Castellonense - Ucam Murcia | 2.5 Alt | pending | 53/100
- 2026-09-05 | Kuveyt Premier Lig | Al Fahaheel - Al Tadhamon | MS 1 | pending | 50/100
- 2026-09-05 | İspanya Primera Lig RFEF Grup 2 | Sant Andreu - Cd Aguilas | MS 1 | pending | 47/100
- 2026-09-05 | Arjantin Premier Lig 2. Aşama | Aldosivi - Banfield | 2.5 Alt | pending | 60/100
- 2026-09-05 | Birleşik Arap Emirlikleri 1.Lig | Palm City 365 - Al Hamriyah | MS 2 | pending | 45/100
- 2026-09-05 | Slovenya 2.SNL | Nk Bilje - Nd Slovan Ljubl | 2.5 Alt | pending | 50/100
- 2026-09-05 | Gana Premier Lig | Vision - Young Apostles | 2.5 Alt | pending | 57/100
- 2026-09-05 | İngiltere FA Cup Eleme 1.Tur | Avro - Witton Albion | MS 1 | pending | 55/100
- 2026-09-05 | İzlanda 2.Lig | Kfg Gardabar - Vikingur Ol. | MS 1 | pending | 48/100
- 2026-09-05 | Letonya Virsliga | Fs Jelgava - Super Nova | MS 1 | pending | 51/100
- 2026-09-05 | İngiltere Ulusal Lig N / S Kuzey | Hednesford Tow - Gateshead(South | 2.5 Alt | pending | 48/100
- 2026-09-05 | İngiltere Ulusal Lig | Gateshead - Solihull Moors | MS 2 | pending | 55/100
- 2026-09-05 | İskoçya 1.Lig | Queen Of South - Airdrieonians | 2.5 Üst | pending | 60/100
- 2026-09-05 | Moldova Ulusal Lig | Politeh Chişin - Dacia-Buiucani | 2.5 Alt | pending | 49/100

