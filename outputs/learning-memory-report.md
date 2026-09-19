# Robot Öğrenme Hafızası Raporu

Oluşturma: 19.09.2026 21:42:52

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1245
- Kazanan tahmin: 149
- Kaybeden tahmin: 106
- Lig sayısı: 290
- Seçenek sayısı: 10

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 74, bekleyen 58, başarı %75, düz getiri %30, ağırlık 1
- 2.5 Alt: toplam 479, bekleyen 393, başarı %62, düz getiri %5, ağırlık 1
- 2.5 Üst: toplam 159, bekleyen 119, başarı %60, düz getiri %5, ağırlık 1
- MS 1: toplam 428, bekleyen 356, başarı %57, düz getiri %-6, ağırlık 1
- 3.5 Üst: toplam 31, bekleyen 23, başarı %50, düz getiri %-6, ağırlık 1
- KG Yok: toplam 56, bekleyen 54, başarı %50, düz getiri %-26, ağırlık 1
- MS 2: toplam 223, bekleyen 195, başarı %46, düz getiri %-13, ağırlık 1
- MS X: toplam 13, bekleyen 10, başarı %33, düz getiri %-17, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 30, bekleyen 30, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-19 | Hollanda Eredivisie | Ajax - Excelsior | 3.5 Üst | pending | 64/100
- 2026-09-19 | Arjantin Prim B Metro | Urquiza - Excur | 3.5 Üst | pending | 88/100
- 2026-09-19 | Galler Premier Lig 1.Aşama | The New Saints - Llandudno | 3.5 Üst | pending | 65/100
- 2026-09-19 | Fransa Ligue 1 | Le Mans - Lorient | KG Var | pending | 75/100
- 2026-09-19 | Fransa Ligue 1 | Angers - Troyes | 2.5 Üst | pending | 67/100
- 2026-09-19 | İrlanda Premier Lig | Sligo Rovers - St Patricks | KG Yok | pending | 53/100
- 2026-09-19 | Polonya Ekstraklasa | Motor Lublin - Gornik Zabrze | MS 2 | pending | 41/100
- 2026-09-19 | Slovenya 1.SNL | Maribor - Aluminij | KG Yok | pending | 48/100
- 2026-09-19 | Almanya 2. Bundesliga | Dynamo Dresden - Hertha Berlin | İlk Yarı KG Var | pending | 58/100
- 2026-09-19 | Arjantin Ulusal Primera Lig | San Telmo - Caseros | MS 2 | pending | 42/100
- 2026-09-19 | Andorra 1.Lig | Carroi - Penya | KG Yok | pending | 55/100
- 2026-09-19 | Macaristan NB I | Debreceni - Vasas | 3.5 Üst | pending | 57/100
- 2026-09-19 | Fransa Ligue 2 | Metz - St Etienne | KG Var | pending | 72/100
- 2026-09-19 | Hırvatistan 1.HNL | Istra - Hnk Gorica | MS 1 | pending | 47/100
- 2026-09-19 | Güney Afrika PSL | Kruger United - Stellenbosch Fc | 2.5 Alt | pending | 66/100

