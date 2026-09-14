# Robot Öğrenme Hafızası Raporu

Oluşturma: 14.09.2026 23:55:22

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1098
- Kazanan tahmin: 212
- Kaybeden tahmin: 190
- Lig sayısı: 248
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 595, bekleyen 447, başarı %57, düz getiri %-3, ağırlık 1
- MS 1: toplam 510, bekleyen 397, başarı %53, düz getiri %-10, ağırlık 1
- 2.5 Üst: toplam 175, bekleyen 97, başarı %53, düz getiri %-7, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %20, ağırlık 1
- KG Var: toplam 16, bekleyen 1, başarı %47, düz getiri %-12, ağırlık 1
- MS 2: toplam 200, bekleyen 154, başarı %39, düz getiri %-26, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-14 | AFC Şampiyonlar Ligi Elite Batı Grubu | Al Shamal - Al Ittihad (Cid | 2.5 Alt | pending | 57/100
- 2026-09-14 | Türkiye Süper Lig | Gaziantep Fk - Fenerbahçe | 2.5 Alt | pending | 65/100
- 2026-09-14 | Brezilya Serie B | Avai - Vila Nova | MS 2 | pending | 58/100
- 2026-09-14 | İrlanda Premier Lig | Dundalk - St Patricks | MS 2 | pending | 48/100
- 2026-09-14 | İsveç Superettan | Ostersund - Helsingborg | MS 1 | pending | 56/100
- 2026-09-14 | İngiltere Premier Lig 2 | Blackburn Rove - Reading (B) | 2.5 Alt | pending | 49/100
- 2026-09-14 | Türkiye Süper Lig | Gaziantep Fk - Fenerbahçe | KG Var | lost | 67/100
- 2026-09-14 | Meksika Liga MX Apertura | Santos Laguna - Fc Juarez | MS 1 | won | 65/100
- 2026-09-14 | Uruguay Premier Lig Clausura | Penarol - Albion | MS 1 | won | 72/100
- 2026-09-14 | Guatemala Ulusal Lig Apertura | Guastatoya - Xelaju | 2.5 Üst | won | 68/100
- 2026-09-14 | Kolombiya Primera A Clausura | Once Caldas - Deportivo Cali | 2.5 Üst | won | 69/100
- 2026-09-14 | Kosta Rika Premier Lig Apertura | Cs Cartagines - Alajuelense | 2.5 Üst | won | 68/100
- 2026-09-14 | Jamaika Premier Lig | Racing United - Arnett Gardens | 2.5 Alt | pending | 54/100
- 2026-09-14 | Portekiz Premier Lig | Braga - Estoril | 2.5 Alt | pending | 61/100
- 2026-09-14 | ABD MLS Next Pro | Portland Timbe - St. Louis City | MS 2 | pending | 46/100

