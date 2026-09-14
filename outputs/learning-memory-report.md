# Robot Öğrenme Hafızası Raporu

Oluşturma: 14.09.2026 06:44:42

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1111
- Kazanan tahmin: 205
- Kaybeden tahmin: 184
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

- 2.5 Alt: toplam 602, bekleyen 457, başarı %59, düz getiri %0, ağırlık 1
- MS 1: toplam 509, bekleyen 399, başarı %52, düz getiri %-11, ağırlık 1
- 2.5 Üst: toplam 170, bekleyen 96, başarı %51, düz getiri %-9, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %20, ağırlık 1
- KG Var: toplam 15, bekleyen 1, başarı %50, düz getiri %-6, ağırlık 1
- MS 2: toplam 200, bekleyen 156, başarı %36, düz getiri %-30, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-14 | Honduras Ulusal Lig Apertura | Atlético Indep - Juticalpa | MS 1 | pending | 55/100
- 2026-09-14 | El Salvador Primera Lig Apertura | Firpo - Isidro Metapan | 2.5 Üst | won | 69/100
- 2026-09-14 | Guatemala Ulusal Lig Apertura | Antigua Guatem - Suchitepequez | 2.5 Alt | pending | 51/100
- 2026-09-14 | Romanya 1.Lig | Universitatea - Otelul Galati | 2.5 Üst | pending | 54/100
- 2026-09-14 | İngiltere Premier Lig | Leeds Utd - Newcastle Utd | 2.5 Alt | pending | 70/100
- 2026-09-14 | Norveç 3.Lig Grup 4 | Viking B - Varhaug | 2.5 Alt | pending | 48/100
- 2026-09-14 | Letonya 1.Lig | Rigas Fs Ii - Skanste | 2.5 Alt | pending | 49/100
- 2026-09-14 | Norveç 3.Lig Grup 3 | Asane Ii - Brann Ii | 2.5 Alt | pending | 48/100
- 2026-09-14 | Irak Premier Lig | Erbil Sc - Al Karma | 2.5 Alt | pending | 56/100
- 2026-09-14 | Arjantin Primera C | Ca Fenix - C Espanol | MS 2 | pending | 49/100
- 2026-09-14 | AFC Şampiyonlar Ligi Elite Batı Grubu | Esteghlal - Al Sadd | 2.5 Alt | pending | 54/100
- 2026-09-14 | İspanya 2.Lig | Celta Vigo Ii - Eibar | 2.5 Alt | pending | 56/100
- 2026-09-14 | Arjantin Ulusal Primera Lig | D Belgrano - Deportivo Madry | MS 1 | pending | 48/100
- 2026-09-14 | Fransa Ligue 2 | Red Star Paris - Metz | 2.5 Alt | pending | 56/100
- 2026-09-14 | İrlanda Premier Lig | Shelbourne - Drogheda | MS 1 | pending | 52/100

