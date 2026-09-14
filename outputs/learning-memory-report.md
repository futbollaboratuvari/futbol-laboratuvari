# Robot Öğrenme Hafızası Raporu

Oluşturma: 14.09.2026 17:02:18

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1108
- Kazanan tahmin: 206
- Kaybeden tahmin: 186
- Lig sayısı: 250
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 599, bekleyen 452, başarı %58, düz getiri %-3, ağırlık 1
- MS 1: toplam 510, bekleyen 399, başarı %52, düz getiri %-11, ağırlık 1
- 2.5 Üst: toplam 173, bekleyen 99, başarı %51, düz getiri %-9, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %20, ağırlık 1
- KG Var: toplam 15, bekleyen 1, başarı %50, düz getiri %-6, ağırlık 1
- MS 2: toplam 199, bekleyen 155, başarı %39, düz getiri %-25, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-14 | Jamaika Premier Lig | Racing United - Arnett Gardens | 2.5 Alt | pending | 54/100
- 2026-09-14 | Portekiz Premier Lig | Braga - Estoril | 2.5 Alt | pending | 62/100
- 2026-09-14 | ABD MLS Next Pro | Portland Timbe - St. Louis City | MS 2 | pending | 46/100
- 2026-09-14 | Jamaika Premier Lig | Molynes United - Treasure Beach | 2.5 Alt | pending | 54/100
- 2026-09-14 | Şili Premier Lig | Union La Caler - Deportes Limach | 2.5 Alt | pending | 56/100
- 2026-09-14 | Kolombiya Primera A Clausura | America De Cal - Deportivo Pasto | MS 1 | pending | 60/100
- 2026-09-14 | Norveç 3.Lig Grup 5 | Skedsmo - Lillestrom Sk I | MS 1 | pending | 55/100
- 2026-09-14 | İsveç Superettan | Ostersund - Helsingborg | 2.5 Üst | pending | 53/100
- 2026-09-14 | Bulgaristan 1.Lig | Ludogorets - Septemvri Sofia | 2.5 Alt | pending | 53/100
- 2026-09-14 | Arjantin Primera C | Ca Fenix - C Espanol | 2.5 Alt | pending | 50/100
- 2026-09-14 | Fransa Ligue 2 | Red Star Paris - Metz | 2.5 Üst | pending | 56/100
- 2026-09-14 | İrlanda Premier Lig | Shelbourne - Drogheda | 2.5 Üst | pending | 53/100
- 2026-09-14 | Polonya 1.Lig | Stal Mielec - Nieciecza | 2.5 Alt | pending | 48/100
- 2026-09-14 | Norveç 3.Lig Grup 5 | Fauske/Sprint - Stromsgodset B | MS 1 | pending | 46/100
- 2026-09-14 | Irak Premier Lig | Al Golan - Newroz | 2.5 Alt | pending | 55/100

