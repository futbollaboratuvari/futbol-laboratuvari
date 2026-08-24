# State

2026-08-24

Main focus: Özel Analiz kuponunda “Seçim yok” belirsizliği ve kupon uygunluk tutarsızlığının giderilmesi.

Current premium decision state:
- Güncel ve tanımlı PRO marketi model gücü 60 altında kaldığında market artık kaybolmaz; “İzleme görüşü” olarak market, oran, model gücü ve olasılık ile gösterilir.
- Gerçek veri/market oluşmayan durum “Görüş oluşmadı” olarak ayrılır; izleme görüşü ile veri yokluğu aynı metin altında birleştirilmez.
- Kupon ayağı yalnız `include_in_coupon=true`, bağımsız kanıt, model gücü en az 65, veri kapsamı en az 45, tahmini olasılık en az %42 ve yüksek olmayan risk birlikte doğrulandığında hesaba girer.
- Kupon özeti “Robot görüşü” ve “Kupona uygun” sayılarını ayrı gösterir. İzleme görüşleri toplam oran ve birleşik olasılık hesabına katılmaz.
- Son otomatik veri yenilemesi sonrasında 9 yaklaşan/PRO eşleşme, 8 görünür robot görüşü, 1 doğrulanmış kupon adayı, 7 izleme görüşü ve 1 veri yetersiz kayıt doğru ayrıldı.
- Özel Analiz, PRO indeks, performans, sonuç ve Spor Toto regresyon testleri; JavaScript sözdizimi, çatışma kontrolü ve üretim paketi başarılıdır.
- Bülten verisi, günlük maç widget'ı, Kuponum, üyelik hakkı, ödeme, workflow, CNAME ve DNS değiştirilmedi.

2026-08-24

Main focus: Spor Toto haftalık 15 maç akışının bağlantı kesintisi sonrası tamamlanması ve kanıt etiketlerinin doğrulanması.

Current Spor Toto state:
- 2026/2027 3. Hafta programı 15 maç ve doğru sıra ile korunur; veri üretimi `spor_toto_weekly_program.json` üzerinden çalışır.
- Küçük `spor_toto_archive_analysis.json` cache'i otomatik akışta üretilir ve Vercel/GitHub Pages çıktısından önce bültene yeniden uygulanır.
- Mevcut hafta için iki takımda da en az üç sonuç örneği sağlayan maç yoktur; tek maçlık örnekler artık yanlış biçimde bağımsız arşiv kanıtı sayılmaz.
- 15 kart boş değildir ancak tamamı yalnız haftalık oynanma dağılımı tabanındadır; model olasılığı veya doğrulanmış piyasa verisi gibi sunulmaz, güven 54 altında ve risk Yüksek tutulur.
- Güncel kupon çalışma listesi 13 tek + 2 çifte seçimden 4 kolon üretir; kesin sonuç veya kazanç garantisi verilmez.
- Spor Toto arayüzü arşiv, dağılım ve piyasa kaynak sayılarını ayrı gösterir; dağılım yüzdelerini detay ekranında açıkça adlandırır.
- Spor Toto arşiv, market ve haftalık bütünlük testleri; JSON çatışma kontrolü ve Vercel üretim paketi başarılıdır.

2026-08-24

Main focus: Özel Analiz PRO 13 açıklanabilir olasılık ve veri kalitesi yükseltmesi.

Current PRO analysis state:
- `model_score` artık 0–100 sinyal gücüdür ve sonuç olasılığı olarak sunulmaz; `estimated_probability`, `market_probability`, `edge_percent` ve `data_completeness` ayrı alanlardır.
- 1X2, gol ve KG sinyalleri markete özel hesaplanır; yüksek oran eşitlik bozucu değildir. Tam marketlerde bahis marjı temizlenmiş piyasa olasılığı kullanılır.
- Proxy/orandan türetilmiş metrik bağımsız kanıt sayılmaz. Bağımsız form/gol örneği yoksa model puanı 64 ile sınırlanır, risk Yüksek ve veri niteliği Sınırlı olur; değer veya otomatik kupon adayı üretilmez.
- Takım ve lig arşivi tek geçişli indekslerle okunur. Güncel denetim süresi yaklaşık 80 saniyeden 1,5 saniyeye düştü.
- Ana sayfa büyük robot-analysis.json yerine yaklaşık 104 KB `data/pro-analysis-index.json` dosyasını yükler.
- Sonuç ekranı model gücü, tahmini olasılık, piyasa olasılığı, model–piyasa farkı, veri kapsamı, kanıt modu ve geçmiş doğrulama durumunu ayrı gösterir.
- Kupon görünümü birleşik tahmini olasılığı çarpar, bağımsızlık varsayımını açıklar ve seçim yok ayaklarını yüksek risk sayar.
- Yeni olasılık örnekleri sonuçlandıkça Brier skoru ve kalibrasyon kovaları otomatik oluşur; eski model skorları olasılık örneği sayılmaz.
- Araştırma ve mimari raporu `docs/OZEL_ANALIZ_PRO13_ARASTIRMA_VE_MIMARI.md` dosyasındadır.
- Bülten JSON dosyaları, günlük maç widget'ı, üyelik hakkı tüketimi, ödeme, Kuponum, workflow, CNAME ve DNS değiştirilmedi.

2026-08-24

Main focus: sonuç arşivi ve performans alanlarının mobil/ağ kesintilerine dayanıklı yüklenmesi.

Current results state:
- Ana sayfa sonuç ve performans için 30 kayıtlık `data/results-summary.json` dosyasını öncelikli okur; büyük analiz dosyası yedek kaynak olarak korunur.
- Sonuç özeti üç kez denenir ve beş dakikalık veri sürüm anahtarıyla eski CDN kaydına takılmaz.
- Son geçerli doğrulanmış sonuç özeti tarayıcıda yedi gün korunur; geçici ağ hatasında yanlış `%0` veya boş tablo yerine bu kayıt gösterilir.
- İlk açılış HTML'i boş alan yerine açık bir yükleniyor durumu taşır.
- Futbol Bülteni, Kuponum, Analiz Et, üyelik, ödeme, workflow ve veri ayrımı değiştirilmedi.

2026-08-23

Main focus: ana sayfa açılış performansı ve Özel Analiz V3 sürekliliği.

Current performance state:
- Ana sayfa artık yaklaşık 4,9 MB boyutundaki robot-analysis.json dosyasını yalnız yönetim/tahmin tabloları gerçekten varsa ister.
- learning-visibility ve learning-output-visibility katmanları ana sayfa başlangıcında otomatik yüklenmez.
- Günlük maç widget'ı önce full-bulletin.json ve live-matches.json dosyalarını okur; two-day-bulletin.json yalnız ana bülten boş veya erişilemezse yedek olarak çağrılır.
- Aynı JSON dosyasına eş zamanlı erişen ana sayfa bölümleri 15 saniyelik kısa bir ortak istek penceresi kullanır; bu pencere yalnız yinelenen çağrıları birleştirir, dakikalık güncellemeleri engellemez.
- Ana sayfada fixtures-list bulunmadığı için kullanılmayan fixtures.json dosyası başlangıçta indirilmez.
- Özel Analiz V3, günlük widget'ın hazırladığı yaklaşan maç listesini yeniden kullanır ve gereksiz ikinci bülten indirmesini önler.
- Yeni flw günlük maç paneliyle uyumsuz eski daily-toggle, daily-past-filter ve daily-live-score-presenter eklentileri başlangıç zincirinden çıkarıldı.
- Üyelik/ödeme betikleri yalnız Üyelik paneli açıldığında yüklenir; rehber ve görsel yardımcılar boş zamanda başlatılır.
- Veri üretim iş akışları, bülten JSON dosyaları, CNAME/DNS ve ödeme yapılandırması değiştirilmedi.

Current special analysis state:
- Özel Analiz artık statik olarak HTML içinde bulunur ve Maç → Analiz → Sonuç olmak üzere üç adımda ilerler.
- Varsayılan mod Tek Maçtır; Kupon modu en fazla 10 yaklaşan maç kabul eder.
- Ana seçenekler Robot Önerisi, Maç Sonucu ve Gol Analizidir; gelişmiş marketler ayrı bir açılır alandadır.
- Sonuç kartı seçim, güven, risk, üç kısa gerekçe, veri detayları ve kesin sonuç garantisi olmadığını belirten uyarıyı birlikte gösterir.
- Maç kaynağı full-bulletin.json, güvenli yedek kaynak two-day-bulletin.json dosyasıdır. Canlı, bitmiş, iptal veya ertelenmiş maçlar Özel Analiz listesine alınmaz.
- Üyelik kodu ve analiz hakkı server-membership-guard.js üzerinden sunucuda kontrol edilir; kalan hak üst çipte gösterilir.
- Eski premium panel katmanları geri dönüş için repoda korunur ancak ana sayfada ve dinamik yönlendirmede yüklenmez.
- Günlük maç widget'ının görünümü ve Kuponum davranışı korundu; yalnız ağ istekleri birleştirildi ve iki günlük büyük dosya yedek koşuluna bağlandı.

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
