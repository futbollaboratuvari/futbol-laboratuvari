# Robot Öğrenme Hafızası Raporu

Oluşturma: 27.09.2026 04:17:01

## Özet

- Toplam tahmin: 3168
- Bekleyen tahmin: 1958
- Kazanan tahmin: 627
- Kaybeden tahmin: 583
- Lig sayısı: 482
- Seçenek sayısı: 11

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 235, bekleyen 116, başarı %56, düz getiri %-1, ağırlık 1
- MS 2: toplam 386, bekleyen 275, başarı %55, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 908, bekleyen 548, başarı %54, düz getiri %-10, ağırlık 0.951
- 2.5 Üst: toplam 306, bekleyen 142, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 839, bekleyen 543, başarı %50, düz getiri %-19, ağırlık 0.94
- 3.5 Üst: toplam 86, bekleyen 30, başarı %46, düz getiri %-8, ağırlık 1
- KG Yok: toplam 206, bekleyen 114, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 16, bekleyen 4, başarı %25, düz getiri %-36, ağırlık 1
- İkinci Yarı KG Yok: toplam 48, bekleyen 48, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 118, bekleyen 118, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 20, bekleyen 20, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-27 | Meksika Liga MX Apertura | Necaxa - Club America | 2.5 Alt | pending | 63/100
- 2026-09-27 | Kolombiya Primera A Clausura | Deportivo Cali - Rionegro Aguila | 2.5 Alt | pending | 54/100
- 2026-09-27 | Arjantin Ulusal Primera Lig | Gimnasia Jujuy - San Martin Tucu | 2.5 Alt | pending | 56/100
- 2026-09-27 | Jamaika Premier Lig | Waterhouse - Treasure Beach | MS 1 | pending | 51/100
- 2026-09-27 | Meksika Primera Ligi, Açılış | Club Leon - Fc Juarez | MS 1 | pending | 65/100
- 2026-09-27 | Brezilya Serie B | Fortaleza Ce - Athletic Club | 2.5 Alt | pending | 62/100
- 2026-09-27 | Brezilya Serie C Grup C | Brusque - Ferroviaria | 2.5 Alt | pending | 52/100
- 2026-09-27 | Kolombiya Primera B Clausura | Barranguilla - Real Cundinamar | 2.5 Alt | pending | 50/100
- 2026-09-27 | Jamaika Premier Lig | Racing United - Montego Bay Uni | KG Var | pending | 54/100
- 2026-09-27 | ABD MLS | Columbus - Inter Miami | MS 2 | pending | 61/100
- 2026-09-27 | Şili Kupa Son 16 Turu | Deportes Santa (1) - (2) O Higgins | 2.5 Üst | pending | 52/100
- 2026-09-27 | El Salvador Primera Lig Apertura | Municipal Lime - Deportivo Fas | 2.5 Alt | pending | 51/100
- 2026-09-27 | ABD USL Lig 1 | One Knoxville - Westchester Sc | MS 1 | pending | 60/100
- 2026-09-27 | Kolombiya Primera A Clausura | Fortaleza - Deportes Tolima | 2.5 Üst | pending | 67/100
- 2026-09-27 | Arjantin Ulusal Primera Lig | Gimnasia Y Tir - Rafaela | MS 1 | pending | 45/100

