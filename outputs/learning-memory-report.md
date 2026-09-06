# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 13:45:00

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1230
- Kazanan tahmin: 144
- Kaybeden tahmin: 126
- Lig sayısı: 222
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
- 2.5 Üst: toplam 232, bekleyen 174, başarı %60, düz getiri %4, ağırlık 1
- 2.5 Alt: toplam 532, bekleyen 440, başarı %60, düz getiri %0, ağırlık 1
- MS 1: toplam 499, bekleyen 414, başarı %45, düz getiri %-25, ağırlık 0.94
- MS 2: toplam 234, bekleyen 201, başarı %42, düz getiri %-21, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-06 | Nikaragua Premier Lig Apertura | Export Sebaco - Managua | 2.5 Alt | pending | 49/100
- 2026-09-06 | Kosta Rika Premier Lig Apertura | Puntarenas Fc - Cs Cartagines | 2.5 Üst | pending | 60/100
- 2026-09-06 | CONCACAF Ligler Kupası Üçüncülük Maçı | Club Leon - Club America | 2.5 Alt | pending | 65/100
- 2026-09-06 | Venezuela Premier Lig Clausura | Deportivo La G - Academia Anzoat | 2.5 Alt | pending | 50/100
- 2026-09-06 | İtalya Serie C Grup A | Cittadella - Lumezzane | MS 1 | pending | 50/100
- 2026-09-06 | Arjantin Ulusal Primera Lig | San Miguel - Godoy Cruz | MS 1 | pending | 43/100
- 2026-09-06 | Andorra 1.Lig | Penya - Descaldes | 2.5 Üst | pending | 53/100
- 2026-09-06 | Yunanistan Süper Lig | Panathinaikos - Paok | 2.5 Üst | pending | 53/100
- 2026-09-06 | Brezilya Serie A | Remo - Flamengo | MS 2 | pending | 60/100
- 2026-09-06 | Slovakya Süper Lig | Ruzomberok - Spartak Trnava | 2.5 Alt | pending | 49/100
- 2026-09-06 | Rusya Premier Lig | Baltika Kalini - L.Moskova | 2.5 Alt | pending | 54/100
- 2026-09-06 | İspanya Primera Lig RFEF Grup 2 | Murcia - Teruel | MS 1 | pending | 51/100
- 2026-09-06 | İspanya Kadınlar Primera Lig | Logrono (K) - Athletic Club ( | 2.5 Alt | pending | 55/100
- 2026-09-06 | Türkiye Süper Lig | Trabzonspor - Gençlerbirliği | MS 1 | pending | 57/100
- 2026-09-06 | Portekiz 3.Lig Grup B | Louletano - Lusitano Evora | MS 2 | pending | 44/100

