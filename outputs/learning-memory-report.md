# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 20:11:55

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1161
- Kazanan tahmin: 183
- Kaybeden tahmin: 156
- Lig sayısı: 277
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 221, bekleyen 141, başarı %63, düz getiri %9, ağırlık 1
- MS 1: toplam 494, bekleyen 397, başarı %57, düz getiri %-9, ağırlık 1
- MS 2: toplam 230, bekleyen 185, başarı %56, düz getiri %-2, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 548, bekleyen 434, başarı %46, düz getiri %-26, ağırlık 0.94
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | Japonya J1 Lig | Vissel Kobe - Kashima | 2.5 Üst | pending | 67/100
- 2026-09-11 | Meksika Kadınlar Liga MX Apertura | Cruz Azul (K) - Pumas Unam (K) | MS 2 | pending | 45/100
- 2026-09-11 | Meksika Kadınlar Liga MX Apertura | Atlas (K) - Atlante (K) | MS 1 | pending | 49/100
- 2026-09-11 | İrlanda Premier Lig | Drogheda - Sligo Rovers | 2.5 Alt | pending | 50/100
- 2026-09-11 | Kuzey İrlanda Premiership | Coleraine - Ballymena | 2.5 Alt | pending | 45/100
- 2026-09-11 | İtalya Serie C Grup C | Team Altamura - Bari | 2.5 Alt | pending | 54/100
- 2026-09-11 | İtalya Serie A | Unione V. - Fiorentina | MS 2 | pending | 45/100
- 2026-09-11 | Almanya Bölgesel Lig Kuzey Doğu | Erfurt - Rsv Eintracht | MS 1 | pending | 56/100
- 2026-09-11 | Letonya 1.Lig | Rezekne / Bjss - Super Nova Ii | MS 2 | pending | 57/100
- 2026-09-11 | Sırbistan Süper Lig | Zeleznicar Pan - Macva | 2.5 Alt | pending | 47/100
- 2026-09-11 | Polonya 2.Lig | Resovia Rzeszo - Falubaz Zielona | 2.5 Alt | pending | 46/100
- 2026-09-11 | İtalya Primavera Şampiyonası 1 | Parma U20 - Genoa U20 | 2.5 Alt | pending | 49/100
- 2026-09-11 | Polonya 1.Lig | Polonia Varşov - Polonia Bytom | 2.5 Alt | pending | 45/100
- 2026-09-11 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | As Sobemap (1) - (1) Enugu Rangers | MS 2 | pending | 55/100
- 2026-09-11 | Estonya Esiliiga B | Narva Trans Ii - Tallinna Infone | MS 1 | pending | 55/100

