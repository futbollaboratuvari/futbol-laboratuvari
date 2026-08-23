# State

2026-08-23

Main focus: Özel Analiz V3 kullanıcı akışı.

Current special analysis state:
- Özel Analiz artık statik olarak HTML içinde bulunur ve Maç → Analiz → Sonuç olmak üzere üç adımda ilerler.
- Varsayılan mod Tek Maçtır; Kupon modu en fazla 10 yaklaşan maç kabul eder.
- Ana seçenekler Robot Önerisi, Maç Sonucu ve Gol Analizidir; gelişmiş marketler ayrı bir açılır alandadır.
- Sonuç kartı seçim, güven, risk, üç kısa gerekçe, veri detayları ve kesin sonuç garantisi olmadığını belirten uyarıyı birlikte gösterir.
- Maç kaynağı full-bulletin.json, güvenli yedek kaynak two-day-bulletin.json dosyasıdır. Canlı, bitmiş, iptal veya ertelenmiş maçlar Özel Analiz listesine alınmaz.
- Üyelik kodu ve analiz hakkı server-membership-guard.js üzerinden sunucuda kontrol edilir; kalan hak üst çipte gösterilir.
- Eski premium panel katmanları geri dönüş için repoda korunur ancak ana sayfada ve dinamik yönlendirmede yüklenmez.
- Günlük maç widget'ı, bülten JSON dosyaları, Kuponum ve veri üretim iş akışları değiştirilmedi.

2026-07-03

Main focus: bulletin stability.

matches = main list
live_matches = live list
coupon panel = protected
analysis button = protected

Latest fix focus:
- Futbol Bulteni data window now targets today full day + tomorrow full day.
- Tomorrow cutoff is now 23:59 instead of 08:00 in the full bulletin build and final output check path.
- Build flow keeps started/past matches out of matches and separates live matches into live_matches.
- If no usable scheduled/live bulletin data is produced, build-full-bulletin.js does not overwrite data/full-bulletin.json with an empty bulletin.
- Direct site/widget/admin/workflow/domain files were not changed.
