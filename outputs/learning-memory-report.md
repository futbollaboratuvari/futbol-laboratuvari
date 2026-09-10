# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 01:02:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1135
- Kazanan tahmin: 201
- Kaybeden tahmin: 164
- Lig sayısı: 275
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 221, bekleyen 135, başarı %59, düz getiri %3, ağırlık 1
- MS 1: toplam 496, bekleyen 392, başarı %58, düz getiri %-6, ağırlık 1
- MS 2: toplam 224, bekleyen 174, başarı %56, düz getiri %1, ağırlık 1
- 2.5 Alt: toplam 553, bekleyen 431, başarı %50, düz getiri %-18, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- MS X: toplam 3, bekleyen 2, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | İspanya 2.Lig | Burgos - Ceuta | 2.5 Alt | pending | 62/100
- 2026-09-11 | Polonya Ekstraklasa | Wisla Krakow - Jagiellonia | MS 1 | pending | 47/100
- 2026-09-11 | İskoçya Championship | Morton - Livingston | 2.5 Alt | pending | 67/100
- 2026-09-11 | Avusturya 1.Lig | Wacker Innsbru - Voitsberg | 2.5 Alt | pending | 48/100
- 2026-09-11 | Galler FAW Championship Güney | Pontypridd Tow - Afan Lido | MS 1 | pending | 54/100
- 2026-09-11 | Galler FAW Championship Güney | Newport City - Trethomas Blueb | MS 1 | pending | 48/100
- 2026-09-11 | Malta Premier Lig Açılış | Hamrun - Birzebbuga | 2.5 Alt | pending | 50/100
- 2026-09-11 | Arjantin Kadınlar Primera A 2. Aşama | Banfield (K) - San Lorenzo (K) | 2.5 Alt | pending | 57/100
- 2026-09-11 | İtalya Serie A | Unione V. - Fiorentina | 2.5 Üst | pending | 55/100
- 2026-09-11 | Fransa Ligue 1 | Rennes - Marsilya | MS 1 | pending | 49/100
- 2026-09-11 | Belçika Pro Lig | Mechelen - Anderlecht | 2.5 Üst | pending | 65/100
- 2026-09-11 | İrlanda Premier Lig | Shelbourne - Derry City | 2.5 Alt | pending | 53/100
- 2026-09-11 | İrlanda Premier Lig | Waterford - Dundalk | MS 1 | pending | 46/100
- 2026-09-11 | İrlanda Premier Lig | Drogheda - Sligo Rovers | MS 1 | pending | 53/100
- 2026-09-11 | İrlanda Premier Lig | Galway United - Bohemian | MS 2 | pending | 51/100

