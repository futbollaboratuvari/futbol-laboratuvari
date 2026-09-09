# Robot Öğrenme Hafızası Raporu

Oluşturma: 10.09.2026 00:47:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1113
- Kazanan tahmin: 215
- Kaybeden tahmin: 172
- Lig sayısı: 255
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 233, bekleyen 148, başarı %62, düz getiri %9, ağırlık 1
- MS 1: toplam 491, bekleyen 381, başarı %56, düz getiri %-9, ağırlık 1
- 2.5 Alt: toplam 558, bekleyen 421, başarı %53, düz getiri %-12, ağırlık 1
- MS 2: toplam 212, bekleyen 160, başarı %50, düz getiri %-12, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-10 | Paraguay Intermedia Lig | 12 De Junio Vh - Atlético Tembet | MS 1 | pending | 54/100
- 2026-09-10 | Arjantin Primera C | Club Mercedes - Dyc Espanol | 2.5 Alt | pending | 56/100
- 2026-09-10 | Brezilya Serie B | Sao Bernardo - Londrina | 2.5 Alt | pending | 64/100
- 2026-09-10 | Brezilya Serie B | Vila Nova - Goias | 2.5 Alt | pending | 71/100
- 2026-09-10 | Venezuela Kupa 1.Tur Grup D | Deportivo Lara - Trujillanos | 2.5 Alt | pending | 57/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Malacateco - Antigua Guatema | 2.5 Alt | pending | 56/100
- 2026-09-10 | Nikaragua Premier Lig Apertura | Managua - Real Esteli | MS 1 | pending | 46/100
- 2026-09-10 | Copa Libertadores Çeyrek Final | Indep. Jose Te - Flamengo | 2.5 Alt | pending | 49/100
- 2026-09-10 | Copa Sudamericana Çeyrek Final | Cienciano - Torque | 2.5 Üst | pending | 62/100
- 2026-09-10 | Kolombiya Primera A Clausura | Los Millionari - Deportivo Cali | 2.5 Alt | pending | 55/100
- 2026-09-10 | Meksika Ascenso MX Apertura | Alebrijes - Durango | 2.5 Alt | pending | 62/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Xelaju - Coban Imperial | MS 1 | pending | 72/100
- 2026-09-10 | Meksika Liga MX Apertura | Pumas Unam - Club Leon | 2.5 Alt | pending | 61/100
- 2026-09-10 | Paraguay Intermedia Lig | Sportivo Carap - Benjamin Aceval | MS 2 | pending | 50/100
- 2026-09-10 | Cezayir 1.Lig | Usm Alger - Js El Biar | 2.5 Alt | pending | 54/100

