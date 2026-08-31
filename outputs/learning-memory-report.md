# Robot Öğrenme Hafızası Raporu

Oluşturma: 01.09.2026 02:57:23

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1078
- Kazanan tahmin: 231
- Kaybeden tahmin: 191
- Lig sayısı: 190
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 210, bekleyen 119, başarı %66, düz getiri %18, ağırlık 1
- MS 2: toplam 194, bekleyen 159, başarı %57, düz getiri %-3, ağırlık 1
- MS 1: toplam 490, bekleyen 393, başarı %55, düz getiri %-10, ağırlık 1
- 2.5 Alt: toplam 601, bekleyen 404, başarı %49, düz getiri %-19, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-01 | Arjantin Ulusal Primera Lig | Gimnasia Jujuy - Agropecuario | 2.5 Alt | pending | 55/100
- 2026-09-01 | Arjantin Premier Lig 2. Aşama | Tigre - Barracas | MS 1 | pending | 53/100
- 2026-09-01 | Arjantin Premier Lig 2. Aşama | Instituto Cord - San Lorenzo | MS 1 | pending | 51/100
- 2026-09-01 | Şili Premier Lig | Univ. Catolica - O Higgins | MS 1 | pending | 54/100
- 2026-09-01 | Kolombiya Primera A Clausura | Deportes Tolim - Depor Cucuta | MS 1 | pending | 59/100
- 2026-09-01 | Arjantin Premier Lig 2. Aşama | Defensa Justic - Platense | MS 1 | pending | 47/100
- 2026-09-01 | Arjantin Premier Lig 2. Aşama | Estudiantes Lp - Newells Old Boy | 2.5 Alt | pending | 54/100
- 2026-09-01 | Arjantin Ulusal Primera Lig | Los Andes - Acassuso | MS 1 | pending | 48/100
- 2026-09-01 | Şili Premier Lig | Union La Caler - La Serena | 2.5 Üst | pending | 54/100
- 2026-09-01 | Venezuela Premier Lig Clausura | Ucv - Rayo Zuliano | 2.5 Alt | pending | 51/100
- 2026-09-01 | Brezilya Serie B | Fortaleza Ce - Operario | 2.5 Alt | pending | 58/100
- 2026-09-01 | Brezilya Serie A | Remo - Coritiba | 2.5 Üst | pending | 61/100
- 2026-09-01 | Kolombiya Primera A Clausura | Deportivo Past - Pereira | MS 1 | pending | 56/100
- 2026-09-01 | Venezuela Premier Lig Clausura | Academia Puert - Academia Anzoat | 2.5 Üst | pending | 54/100
- 2026-08-31 | Kolombiya Primera A Clausura | Deportes Tolim - Depor Cucuta | MS 1 | pending | 60/100

