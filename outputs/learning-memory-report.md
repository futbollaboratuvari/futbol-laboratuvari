# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 02:00:28

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1142
- Kazanan tahmin: 196
- Kaybeden tahmin: 162
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

- 2.5 Üst: toplam 225, bekleyen 139, başarı %59, düz getiri %3, ağırlık 1
- MS 1: toplam 494, bekleyen 392, başarı %57, düz getiri %-7, ağırlık 1
- MS 2: toplam 223, bekleyen 174, başarı %55, düz getiri %-2, ağırlık 1
- 2.5 Alt: toplam 552, bekleyen 434, başarı %50, düz getiri %-19, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- MS X: toplam 3, bekleyen 2, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | ABD USL Lig 1 | Athletic Club - New York Cosmos | 2.5 Üst | pending | 73/100
- 2026-09-11 | İtalya Serie B | Pisa - Virtus Entella | 2.5 Üst | pending | 67/100
- 2026-09-11 | İtalya Serie B | Benevento - Verona | 2.5 Üst | pending | 65/100
- 2026-09-11 | İngiltere Premier Lig 2 | Stoke (B) - Wolverhampton U | 2.5 Alt | pending | 48/100
- 2026-09-11 | İngiltere Premier Lig 2 | Derby County U - Tottenham U21 | 2.5 Alt | pending | 49/100
- 2026-09-11 | Ürdün 1.Lig | Al Hashemeya - Al Ahli | 2.5 Alt | pending | 49/100
- 2026-09-11 | CONCACAF Orta Amerika Kupası Çeyrek Final | Marathon - Alajuelense | 2.5 Üst | pending | 57/100
- 2026-09-11 | Brezilya Serie B | Sao Bernardo - Londrina | 2.5 Alt | pending | 65/100
- 2026-09-11 | İspanya 2.Lig | Burgos - Ceuta | 2.5 Alt | pending | 62/100
- 2026-09-11 | Polonya Ekstraklasa | Wisla Krakow - Jagiellonia | MS 1 | pending | 47/100
- 2026-09-11 | İskoçya Championship | Morton - Livingston | 2.5 Alt | pending | 70/100
- 2026-09-11 | Avusturya 1.Lig | Wacker Innsbru - Voitsberg | 2.5 Alt | pending | 48/100
- 2026-09-11 | Galler FAW Championship Güney | Pontypridd Tow - Afan Lido | MS 1 | pending | 54/100
- 2026-09-11 | Galler FAW Championship Güney | Newport City - Trethomas Blueb | MS 1 | pending | 48/100
- 2026-09-11 | Malta Premier Lig Açılış | Hamrun - Birzebbuga | 2.5 Alt | pending | 50/100

