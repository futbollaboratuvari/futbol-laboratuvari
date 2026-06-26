# 2026-06-26 Yeni Sayfa Devam Özeti

Bu kayıt, bu sayfada yapılan çalışmaların yeni sohbette devam etmek için tek dosyalık özetidir.

---

## 1. Ana Durum

- Canlı domain çalışıyor: `https://futbollaboratuvari.org/`
- GitHub Pages / HTTPS tarafı tamamlandı.
- Ana sorun artık domain değil; canlı veri, analiz ve kartların siteye doğru yansıması.
- Kullanıcı tercihi net: Codex talimatı istemiyor; mümkün olduğunda doğrudan GitHub/repo üzerinde çalışılacak.

---

## 2. Canlı Veri Akışı

### Tespit

Site canlı sistem gibi görünse de GitHub reposundaki JSON dosyalarını okuyor. Robot bu JSON dosyalarını güncellemezse site güncel maç göstermez.

Ana dosyalar:

- `data/fixtures.json`
- `data/live-matches.json`
- `data/robot-analysis.json`
- `data/daily-coupons.json`
- `data/analiz_sonuclari.json`

### Yapılan iş

`.github/workflows/auto-relaxed-analysis.yml` dosyası 30 dakikada bir tam zinciri çalıştıracak şekilde güncellendi.

Yeni çalışma mantığı:

- `workflow_dispatch`
- `cron: */30 * * * *`
- `npm run update:all`

---

## 3. 5 JSON Kontrolü

Kontrol edilen dosyalar:

- `data/fixtures.json`
- `data/live-matches.json`
- `data/robot-analysis.json`
- `data/daily-coupons.json`
- `data/analiz_sonuclari.json`

Son tespit:

- `fixtures.json`: kısmen dolu, güncel maç listesi var.
- `live-matches.json`: dolu, 55 maç / 55 aktif analiz / 17 izleme adayı / 0 kupon adayı göründü.
- `robot-analysis.json`: dolu ama kupon adayı üretimi zayıf.
- `daily-coupons.json`: resmi kuponlar boş, `selected_matches: []`, `is_available: false`.
- `analiz_sonuclari.json`: köprü sonrası `active_items` doldu.

---

## 4. Analiz Sonuçları Köprüsü

### Sorun

`data/robot-analysis.json` doluydu ama site `data/analiz_sonuclari.json` dosyasından okuduğu için analizler siteye yansımıyordu.

### Yapılan iş

Yeni dosya eklendi:

- `scripts/sync-analysis-results.js`

Bu dosya:

1. `data/robot-analysis.json` okur.
2. Gerekirse `data/live-matches.json` kullanır.
3. Robot analizlerini `active_items` formatına çevirir.
4. `data/analiz_sonuclari.json` içine yazar.
5. `completed_items` geçmişini korur.

`package.json` içinde şu zincirlere bağlandı:

- `export:live`
- `update:all`

Son kontrol:

- `data/analiz_sonuclari.json` içinde `active_item_count: 55` oldu.
- `coupon_candidate_count: 0`
- `watch_candidate_count: 0` görünmüştü; sonraki live-matches kontrolünde 17 izleme adayı görüldü.

---

## 5. 55 Kayıt Siteye Yansıma ve Aday Sorunu

### Tespit

55 aktif kayıt siteye yansıyabilecek formatta geldi. Ancak “Değerli market yok / Oynama / 0%” gibi kayıtların Günün Seçimi olarak görünme riski vardı.

### Yapılan iş

`script.js` içinde görünür analizler ve gerçek adaylar ayrıldı.

Yeni mantık:

- `visibleItems`: Maç Yorumları bölümünde gösterilecek robot kayıtları.
- `candidateItems`: Günün Seçimi / kupon adayı olabilecek gerçek adaylar.

Sonuç:

- 55 kayıt Maç Yorumları bölümünde görünebilir.
- Güçsüz kayıtlar Günün Seçimi olarak basılmaz.
- Aday yoksa açık mesaj gösterilir.

---

## 6. Ham Maç Metrik Zenginleştirme

### Sorun

Robot skor motoru form ve gol metrikleri eksik olduğu için kupon/izleme adayı üretmekte zorlanıyordu.

Gerekli metrikler:

- `homeScoredLast10`
- `awayScoredLast10`
- `homeConcededLast10`
- `awayConcededLast10`
- `bttsPercent`
- `over25Percent`
- `over35Percent`
- `firstHalfGoalTrend`
- `secondHalfGoalTrend`
- `leagueGoalAverage`

### Yapılan iş

Yeni dosya eklendi:

- `scripts/enrich-fixture-metrics.js`

Bu dosya:

1. `data/fixtures.json` okur.
2. `data/robot_match_archive.json` arşivini kontrol eder.
3. Arşiv varsa takım/lig form metrikleri üretir.
4. Arşiv yoksa oran sinyalinden proxy metrik üretir.
5. Mevcut gerçek alanları ezmeden sadece eksik alanları tamamlar.

`package.json` içine eklendi:

- `enrich:metrics`

`update:all` sırasına eklendi:

1. `update-fixtures.js`
2. `enrich-fixture-metrics.js`
3. `update-analysis-report.js`
4. `export-high-value-json.js`
5. `ensure-live-json.js`
6. `sync-analysis-results.js`
7. `learning-result-sync.js`
8. `learning-output-check.js`

---

## 7. Kupon Merkezi Veri Akışı

### Kullanıcı ekran tespiti

Kupon Merkezi ekranda boş görünüyordu:

- Güncel Liste: Oranlı analiz bekleniyor
- Maç Sayısı: -
- Seçenek Sayısı: 0
- Durum: PRO analiz bekleniyor
- Dengeli / Yüksek Oranlı / Riskli kupon kutuları boş

### Repo tespiti

`data/live-matches.json` içinde veri vardı:

- `current_window: 55`
- `active_analysis: 55`
- `watch_candidates: 17`
- `coupon_candidates: 0`

Ama `data/daily-coupons.json` hâlâ resmi kupon üretmiyordu:

- `selected_matches: []`
- `is_available: false`

### Yapılan iş

Yeni yedek veri akışı eklendi:

- `kupon-center-fallback.js`

Bu dosya şunları okur:

- `data/live-matches.json`
- `data/analiz_sonuclari.json`
- `data/daily-coupons.json`

Resmi kupon yoksa izleme listesi gösterir:

- Dengeli İzleme Listesi
- Yüksek Oran İzleme Listesi
- Riskli Laboratuvar İzleme Listesi

Ayrıca `site-human-language.js` içine Kupon Merkezi yedek akış mantığı da eklendi.

Kural:

- Sahte kesin kupon gösterilmeyecek.
- Resmi kupon yoksa izleme adayı dili kullanılacak.
- Son karar kullanıcıya ait kalacak.

---

## 8. Özel Analiz Maç Listesi Düzenleme

### Kullanıcı ekran tespiti

Özel Analiz panelinde maç listesi eski çoklu seçim kutusu gibi görünüyordu. Satırlar tek satıra sıkışıyor, lig/saat/takım/öneri/skor okunmuyordu.

### Yapılan iş

`site-human-language.js` içine maç listesi kart düzeni eklendi.

Yeni görünüm:

- Saat
- Lig
- Takımlar
- Analiz sistemi önerisi
- Güven skoru

Arkadaki gerçek seçim kutusu korunur. Yeni kart görünümü sadece görsel katmandır. Kart tıklanınca gerçek `select[data-pa-match]` seçimi güncellenir.

Korunan özellikler:

- Arama
- Sadece kupon adaylarını göster filtresi
- En güçlü 5 butonu
- Özel analiz başlatma

---

## 9. Ana Sayfa Widget / Buton Bağlantısı

### Kullanıcı tespiti

Ana sayfadaki widget alanlarından Maç Yorumları ve Özel Analiz alanlarına geçiş için yeterli buton / bağlantı olmadığı belirtildi.

### Kayıt edilen hedefler

Sayfa içi geçiş hedefleri:

- `#robot-analizleri` → Kupon Merkezi
- `#son-analizler` → Maç Yorumları
- `#premium-analysis-panel` → Özel Analiz

Bu bağlantı konusu bir sonraki sayfada kontrol edilip gerekirse ana widgetların yanına görünür butonlar olarak eklenecek.

---

## 10. Önemli Commitler

- Canlı veri workflow zinciri: `562ea5291543aeef66737bc70cb6445d07b59e07`
- Analiz sonuç köprüsü dosyası: `d2f5a53af500d532cb11e06ee4423e382dc9ea6f`
- Analiz sonuç köprüsü package bağlantısı: `7348ce7e781462173048801039d58beaa952fe68`
- Active items kontrol kaydı: `9004d9e66bc204718db95350492803d0a87d7125`
- 55 kayıt yansıma düzeltmesi: `f026801c7cf2574c07512cc5c51572e13078fcbd`
- Ham metrik zenginleştirme dosyası: `608e0bed5268615a59571a13f2a8772b0e4ceb4f`
- Metrik zincir bağlantısı: `10655e2af2f47788b3cfb729aee04adcbb1439cb`
- Kupon merkezi yedek akış dosyası: `42c2203f14a5e8a2af503ccd71f133f819678bd9`
- Kupon merkezi site dil/yedek akış bağlantısı: `fd91684ae6aa11b3c19d6b5ff695bfa9733951b0`
- Özel Analiz maç listesi kart düzeni: `5814b69407ef22b31146e17fd10c47e1085fdc89`
- Ana sayfa widget buton bağlantısı kayıt dosyası: `7ed3c5b3afd3d1f2b179e610b1c5ed75b56cf0f7`

---

## 11. Yeni Sayfada Devam Edilecek Net İşler

1. Ana sayfa widgetlarının yanına görünür butonlar eklenip kontrol edilecek.
   - Maç Yorumlarına Git
   - Özel Analize Git
   - Kupon Merkezine Git

2. Kupon Merkezi canlı sayfada tekrar kontrol edilecek.
   - Maç sayısı 55 / güncel sayı geliyor mu?
   - Seçenek sayısı 17 / güncel izleme adayı geliyor mu?
   - Boş kutular yerine izleme listeleri görünüyor mu?

3. Özel Analiz maç listesi yenilendikten sonra kontrol edilecek.
   - Tek satırlı eski select yerine kart/kutu görünümü geliyor mu?
   - Arama, filtre, En güçlü 5 ve seçim çalışıyor mu?

4. Actions tekrar kontrol edilecek.
   - `npm run update:all` zinciri sorunsuz çalışıyor mu?
   - `fixtures.json` metriklerle zenginleşiyor mu?
   - `robot-analysis.json` izleme/kupon adaylarını artırıyor mu?
   - `analiz_sonuclari.json` siteye doğru yansıyor mu?

5. `daily-coupons.json` resmi kupon üretimi ayrı aşamada güçlendirilecek.

---

## 12. Devam Kuralı

Yeni sayfada önce bu dosya okunacak. Gereksiz tekrar yapılmayacak. Kullanıcıya Codex talimatı verilmeden önce doğrudan GitHub/repo üzerinden yapılabilecek işlem kontrol edilecek.

Öncelik sırası:

1. Ana widgetlara görünür buton ekleme.
2. Kupon Merkezi yedek akışını canlıda kontrol etme.
3. Özel Analiz maç listesi kart görünümünü canlıda kontrol etme.
4. Actions ve JSON üretimini kontrol etme.
5. Resmi kupon üretimini güçlendirme.
