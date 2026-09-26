# Robot Öğrenme Hafızası Raporu

Oluşturma: 27.09.2026 02:08:32

## Özet

- Toplam tahmin: 3149
- Bekleyen tahmin: 1996
- Kazanan tahmin: 603
- Kaybeden tahmin: 550
- Lig sayısı: 481
- Seçenek sayısı: 11

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 230, bekleyen 117, başarı %57, düz getiri %2, ağırlık 1
- MS 2: toplam 386, bekleyen 276, başarı %55, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 904, bekleyen 564, başarı %53, düz getiri %-12, ağırlık 0.944
- 2.5 Üst: toplam 304, bekleyen 147, başarı %53, düz getiri %-7, ağırlık 1
- MS 1: toplam 837, bekleyen 561, başarı %52, düz getiri %-17, ağırlık 0.94
- 3.5 Üst: toplam 85, bekleyen 32, başarı %49, düz getiri %-3, ağırlık 1
- KG Yok: toplam 205, bekleyen 113, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 16, bekleyen 4, başarı %25, düz getiri %-36, ağırlık 1
- İkinci Yarı KG Yok: toplam 46, bekleyen 46, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 116, bekleyen 116, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 20, bekleyen 20, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-27 | Meksika Liga MX Apertura | Necaxa - Club America | 2.5 Alt | pending | 61/100
- 2026-09-27 | Kolombiya Primera A Clausura | Deportivo Cali - Rionegro Aguila | 2.5 Alt | pending | 54/100
- 2026-09-27 | Arjantin Ulusal Primera Lig | Gimnasia Y Tir - Rafaela | MS 1 | pending | 45/100
- 2026-09-27 | Uruguay Premier Lig Clausura | Defensor Sport - Danubio | 2.5 Alt | pending | 59/100
- 2026-09-27 | Guatemala Ulusal Lig Apertura | Mixco - Antigua Guatema | 2.5 Alt | pending | 56/100
- 2026-09-27 | El Salvador Primera Lig Apertura | Alianza - Inca-Aruba | 2.5 Alt | pending | 59/100
- 2026-09-27 | El Salvador Primera Lig Apertura | Platense - Fuerte San Fran | KG Var | pending | 76/100
- 2026-09-27 | Brezilya Serie B | Fortaleza Ce - Athletic Club | 2.5 Alt | pending | 62/100
- 2026-09-27 | Brezilya Serie C Grup C | Brusque - Ferroviaria | 2.5 Alt | pending | 52/100
- 2026-09-27 | Kolombiya Primera B Clausura | Barranguilla - Real Cundinamar | 2.5 Alt | pending | 50/100
- 2026-09-27 | Jamaika Premier Lig | Racing United - Montego Bay Uni | KG Var | pending | 55/100
- 2026-09-27 | ABD MLS | Columbus - Inter Miami | MS 2 | pending | 61/100
- 2026-09-27 | Şili Kupa Son 16 Turu | Deportes Santa (1) - (2) O Higgins | 2.5 Üst | pending | 53/100
- 2026-09-27 | El Salvador Primera Lig Apertura | Municipal Lime - Deportivo Fas | 2.5 Alt | pending | 51/100
- 2026-09-27 | ABD USL Lig 1 | One Knoxville - Westchester Sc | MS 1 | pending | 60/100

