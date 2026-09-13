# Robot Öğrenme Hafızası Raporu

Oluşturma: 14.09.2026 01:31:05

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1142
- Kazanan tahmin: 189
- Kaybeden tahmin: 169
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

- 2.5 Alt: toplam 603, bekleyen 470, başarı %60, düz getiri %1, ağırlık 1
- 2.5 Üst: toplam 170, bekleyen 104, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 508, bekleyen 408, başarı %51, düz getiri %-13, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %20, ağırlık 1
- KG Var: toplam 15, bekleyen 1, başarı %50, düz getiri %-6, ağırlık 1
- MS 2: toplam 200, bekleyen 157, başarı %37, düz getiri %-28, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-14 | Irak Premier Lig | Erbil Sc - Al Karma | 2.5 Alt | pending | 56/100
- 2026-09-14 | Arjantin Primera C | Ca Fenix - C Espanol | MS 2 | pending | 49/100
- 2026-09-14 | AFC Şampiyonlar Ligi Elite Batı Grubu | Esteghlal - Al Sadd | 2.5 Alt | pending | 55/100
- 2026-09-14 | İspanya 2.Lig | Celta Vigo Ii - Eibar | 2.5 Alt | pending | 56/100
- 2026-09-14 | Arjantin Ulusal Primera Lig | D Belgrano - Deportivo Madry | MS 1 | pending | 48/100
- 2026-09-14 | Fransa Ligue 2 | Red Star Paris - Metz | 2.5 Alt | pending | 55/100
- 2026-09-14 | İrlanda Premier Lig | Shelbourne - Drogheda | MS 1 | pending | 52/100
- 2026-09-14 | İrlanda Premier Lig | Dundalk - St Patricks | 2.5 Alt | pending | 50/100
- 2026-09-14 | İrlanda Premier Lig | Waterford - Derry City | 2.5 Alt | pending | 49/100
- 2026-09-14 | İrlanda Premier Lig | Sligo Rovers - Galway United | 2.5 Alt | pending | 50/100
- 2026-09-14 | İngiltere Non League Premier Isthmian | Aveley - Wingate | MS 1 | pending | 57/100
- 2026-09-14 | İngiltere Premier Lig | Leeds Utd - Newcastle Utd | 2.5 Üst | pending | 68/100
- 2026-09-14 | İspanya LaLiga | Villarreal - Real Betis | MS 1 | pending | 52/100
- 2026-09-14 | Danimarka Süperlig | Midtjylland - Brondby | MS 1 | pending | 54/100
- 2026-09-14 | İsveç Allsvenskan | Djurgarden - Gais | MS 1 | pending | 70/100

