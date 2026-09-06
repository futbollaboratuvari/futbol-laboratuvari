# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 16:54:05

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1227
- Kazanan tahmin: 144
- Kaybeden tahmin: 129
- Lig sayısı: 218
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 1, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 230, bekleyen 170, başarı %60, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 530, bekleyen 437, başarı %59, düz getiri %-1, ağırlık 1
- MS 1: toplam 506, bekleyen 421, başarı %44, düz getiri %-26, ağırlık 0.94
- MS 2: toplam 231, bekleyen 198, başarı %42, düz getiri %-21, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | Peru Premier Lig Clausura | Melgar - Adt | MS 1 | pending | 57/100
- 2026-09-06 | Peru Premier Lig Clausura | Deportivo Garc - Atletico Grau | 2.5 Alt | pending | 60/100
- 2026-09-06 | Portekiz 2.Lig | Leiria - Portimonense | 2.5 Alt | pending | 52/100
- 2026-09-06 | İspanya 2. Lig RFEF Grup 2 | Pena Sport - Utebo | 2.5 Alt | pending | 53/100
- 2026-09-06 | İspanya 2. Lig RFEF Grup 2 | Barbastro - Girona Ii | MS 1 | pending | 41/100
- 2026-09-06 | İspanya 2. Lig RFEF Grup 2 | Ue Olot - Ebro | MS 1 | pending | 44/100
- 2026-09-06 | Bulgaristan 1.Lig | Lokomotiv Plov - Cherno More | MS 1 | pending | 41/100
- 2026-09-06 | Gürcistan Erovnuli Liga | Torpedo Kutais - Dinamo Tiflis | MS 1 | pending | 42/100
- 2026-09-06 | İrlanda FAI Kupası Çeyrek Final | Derry City - Dundalk | 2.5 Alt | pending | 41/100
- 2026-09-06 | Letonya Virsliga | Auda - Grobina | 2.5 Alt | pending | 48/100
- 2026-09-06 | Kazakistan Premier Lig | Tobol Kostanay - Ulytau | MS 1 | pending | 51/100
- 2026-09-06 | Türkiye 2.Lig Kırmızı Grup | İnegölspor - 12 Bingolspor | MS 1 | pending | 50/100
- 2026-09-06 | Türkiye 2.Lig Kırmızı Grup | Karacabey Bld - Serik Bld. | MS 1 | pending | 43/100
- 2026-09-06 | Türkiye 3.Lig 2.Grup | Bigaspor - Uşak Spor A.Ş. | MS 1 | pending | 46/100
- 2026-09-06 | Türkiye 3.Lig 2.Grup | Balikesirspor - Bucaspor 1928 | MS 1 | pending | 54/100

