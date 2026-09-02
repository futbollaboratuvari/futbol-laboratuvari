# State

2026-09-01

Main focus: PRO robotun resmî yarı marketleri ve gerçek gerekçeli İY/MS analizleriyle genişletilmesi.

Current half-scenario state:
- Resmî İddaa akışındaki İlk Yarı/Maç Sonucu dokuzlu oran seti ile ilk ve ikinci yarı Karşılıklı Gol Var/Yok çiftleri kanonik PRO oranlarına bağlandı.
- Robot 1/1, 1/2, 2/1 ile mevcut X/1 ve 2/2 marketlerini; takım sonuç hafızasından üretilen tam maç Poisson lambdalarını yarılara bölüp bütün devre/maç skor yollarını toplayarak analiz eder.
- İlk ve ikinci yarı KG Var olasılıkları ayrı yarı lambdalarından hesaplanır. Proxy metrikler yarı dağılımını yönlendiremez; doğrulanmış yarı metriği yoksa ihtiyatlı %45/%55 zaman payı kullanılır.
- Özel market görüşü yalnız tam resmî oran seti, marjı temizlenmiş piyasa olasılığı, en az iki takım için yeterli sonuç örneği, bağımsız yarı Poisson kanıtı ve en az 45/100 veri kapsamı varsa yayımlanır. Ham tahmin oranı veya tek taraflı oran yorum üretmez.
- Özel Analiz menüsüne İY/MS 1/2 ve 2/1 eklendi; eski taraf-marketinden türetilen sahte İY/MS senaryosu kaldırıldı. Güçlü eşiği aşmayan gerçek analiz ayrı “İzleme görüşü” olarak kalır ve kupona eklenmez.
- AI Şeffaflık Merkezi en fazla 10 maç gösterir. Seçili maçta doğrulanmış yarı/İY-MS görüşleri resmî oran, model olasılığı, veri kapsamı ve gerçek gerekçeleriyle gösterilir; veri yoksa yorum uydurulmadığı açıkça yazılır.
- PRO, Özel Analiz, İddaa, güvenlik, takım istihbaratı ve üretim paketi testleri başarılıdır. Güvenli Vercel çıktısı 249 dosya/19.85 MB üretildi ve özel PRO indeksinin statik pakette bulunmadığı doğrulandı.
- Bülten veri dosyaları, Kuponum, üyelik/ödeme, workflow, CNAME, DNS ve Supabase verisi değiştirilmedi. Kullanıcı onayıyla yalnız `codex/pro-robot-v14` önizleme dalı ve PR #29 güncellendi; `main` ve canlı üretim değiştirilmedi.

2026-08-30

Main focus: üyelik kodunun Özel Analiz alanında anlaşılır, kalıcı ve hak tüketmeyen doğrulama akışına dönüştürülmesi.

Current membership-code state:
- “Üyelik Kodum Var” bağlantısı ana menüye eklendi; üyelik kodu kartı Özel Analiz PRO başlığının hemen altında ve maç seçiminden önce sürekli görünür.
- Kod doğrulama ile analiz oluşturma kesin olarak ayrıldı. “Kodu Doğrula” yalnız korumalı sunucu doğrulamasını yapar; analiz hakkı ancak kullanıcı maç seçip “Analizi Oluştur” dediğinde tüketilir.
- Aktif üyelik kartı paket adını, kalan analiz hakkını ve kodun yalnız son dört karakterini gösterir. “Analize Başla” ve “Kodu Değiştir” ayrı işlemlerdir.
- Kod göster/gizle kontrolü, klavyede Enter ile doğrulama, yükleme/hata durumları ve mobil tek sütun görünümü eklendi.
- Ödeme onayından sonra “Kodu Kullan ve Özel Analize Git” düğmesi kodu URL'ye yazmadan aynı doğrulama bileşenine aktarır.
- Menü, doğrudan hash ve ödeme sonrası geçişler önce Özel Analiz ana panelini açıp ardından kod kartına kaydırır; panel kapalıyken görünmez hedefe gitme durumu engellendi.
- Supabase'in snake_case üyelik yanıtları ortak istemci biçimine dönüştürülür; kalan hak iki kez düşmez. Hakkı bitmiş üyelik kodu `/api/pro-analysis` üzerinden korumalı PRO verisini alamaz.
- Bülten, canlı maç, kupon, Spor Toto ve otomatik veri üretim dosyaları değiştirilmedi. Güvenlik, premium, performans ve üretim paketi kontrolleri başarılıdır.

2026-08-29

Main focus: canlı site denetiminde bulunan veri bütünlüğü, ücretli içerik koruması, ödeme/yasal uyum, çerez ve performans açıklarının kapatılması.

Current completion state:
- Canlı ve bitmiş statüsü yalnız sağlayıcı statüsü/skor kanıtıyla oluşur; saat karşılaştırmasıyla sahte canlı veya sonuç üretilmez. Analiz/kupon nesneleri maç sonuç akışından ayrılmıştır.
- Kupon kartları tek merkezi uygunluk kuralını kullanır; uygunsuz ayaklar, tekrar eden dengeli kupon ve aday yokken yayımlanan kupon engellenir.
- `data/pro-analysis-index.json` artık Git'te ve statik Vercel çıktısında yayımlanmaz. Geçerli üyelik kodu olmadan veri döndürmeyen `/api/pro-analysis` katmanı kullanılır; PRO veri açılmadan analiz hakkı tüketilmez.
- Kamuya açık `live-matches.json` üretim çıktısı analiz, öneri, model puanı ve robot gerekçesinden arındırılır; robot, analiz, üyelik ve kullanım dosyaları statik pakete kopyalanmaz. Sonuçlar yalnız kompakt `results-summary.json` ile gösterilir.
- Üyelik paneli sayfa açılışında güvenli sırayla hazırlanır; doğrudan hash ve normal gezinme aynı sonucu verir.
- Ödeme talebi yalnız eksiksiz satıcı profili, ön bilgilendirme, mesafeli satış, KVKK ve hemen ifa onaylarıyla aynı alan adlı sunucu API'sinden oluşturulur. Satıcı unvanı/adresi/vergi/telefon ortam değişkenleri eksikse ücretli satış güvenli biçimde kapalı kalır.
- Ön bilgilendirme, mesafeli satış, iptal/iade ve KVKK sayfaları eklendi. AdSense ilk ziyarette yüklenmez; kabul, ret ve tercihler eşit görünür kontrollerle yönetilir.
- Bülten ilk 30 maçı gösterir ve istekle devam eder; sahte “oynanabilir” skoru kaldırılıp yalnız ham piyasa oran karşılığı açıklandı. Model gücü, olasılık ve veri kapsamı ayrı adlandırılır.
- HSTS, CSP, çerçeve/izin/referrer güvenlik başlıkları, favicon ve web manifest eklendi; tek-u alan adı için Vercel host yönlendirme kuralı hazırlandı.
- PRO, kupon, durum, sonuç, performans, güvenlik/yasal ve üretim derleme kontrolleri başarılıdır. Canlı yayın doğrulaması bu kaydın ardından yapılacaktır.

2026-08-27

Main focus: yarım kalan canlı güç, otomatik veri yazıcıları ve en güçlü tahmin uygunluk zincirinin GitHub `main` üzerinde tamamlanması.

Audit sonucu:
- A / tamamlanmış ve yalnız regresyonu doğrulanan alanlar: Özel Analiz V3, üyelik hakkı, Kuponum, ödeme, günlük maç widget'ı, sonuç/performance, AI Şeffaflık Merkezi ve 15 maçlık Spor Toto üretim sözleşmesi.
- B / tamamlanan gerçek eksikler: ücretsiz canlı istatistik sağlayıcı zinciri, eksik metriklerin gerçek sıfırdan ayrılması, son snapshot koruması, veri-yazıcı boyut/push güvenliği, ortak PRO kupon uygunluk kuralı ve transfer olmuş oyuncunun eski takım eksiklerinde kalması.
- C / harici veriye bağlı durum: koşu anında site fikstürüyle eşleşen doğrulanmış canlı istatistik yoksa sistem veri üretmez; `no_matching_verified_stats`/bekleme durumu, boş snapshot ve güvenli kullanıcı mesajı korunur.

Current completion state:
- Canlı güç kolektörü ESPN Scoreboard içindeki gözlenmiş istatistikleri öncelikle, ESPN Core/Summary ve resmi TheSportsDB event stats uçlarını birbirinden bağımsız fallback olarak kullanır. xG yalnız kaynak sağlarsa taşınır; eksik metrik sıfır yapılmaz; coverage ayrıca yayımlanır.
- Canlı snapshot yalnız gözlenmiş dakikada `observed: true`, `interpolated: false` olarak oluşur. Aynı dakika çoğaltılmaz ve geçici sağlayıcı hatası son geçerli/recent maç kayıtlarını silmez.
- `include_in_coupon` artık tek başına sıralama bonusu değildir. Ortak kural modülü bağımsız kanıt, model skoru, veri kapsamı, tahmini olasılık, market ve kadro/ilk 11 riskini hem builder hem UI için aynı biçimde doğrular. Üçüncü kademe açıkça `İzleme görüşü · Kupona uygun değil` etiketlidir.
- Otomatik writer'lar ortak concurrency grubunda, rebase/autostash, çıktı doğrulama, sınırlı retry ve dosya-kapsamlı staging ile çalışır. 100 MiB GitHub sınırını aşan robot arşivi kayıpsız kompakt yazılır ve 95 MiB policy sınırıyla erken reddedilir.
- GitHub Actions Live Power koşusu `33036466175` başarılıdır; test, collector, JSON validation, commit, rebase ve push adımları yeşildir. Koşu anında 4 ESPN canlı event, 0 site eşleşmesi ve 0 doğrulanmış snapshot vardı; bu nedenle canlı veri aktifmiş gibi raporlanmaz.
- İzole Fixtures koşusu `33064982178`: üretim, takım/futbolcu, Spor Toto finalizer, JSON/boyut kontrolü ve commit/rebase/push dahil başarılı.
- İzole Live Data koşusu `33065258620`: collector, robot importu, PRO/canlı/Spor Toto çıktıları ve commit/rebase/push dahil başarılı.
- Yerel regresyon paketi: 15 test dosyası başarılı; 637 JSON parse edildi; değişen JavaScript dosyalarında `node --check`, conflict marker taraması ve statik production build başarılıdır.
- Production: `https://futbollaboratuuvari.org/` ve gerekli JS/JSON uçları HTTP 200; ortak uygunluk modülü, izleme etiketi, 15 Spor Toto kartı ve 320/360/390/430 px taşmasız mobil render doğrulandı. Son veri Pages koşusu `33065462579` başarılıdır.

Main commits:
- `f44bed31f55d69d7fdabc94afc9a6f0139e9e445` canlı güç kaynak zinciri.
- `ac2e7de3b5923ada8515e2eb21ae59c5ac8d75fc` ortak en güçlü tahmin uygunluğu.
- `12952704de13724fdb54c2ece97d28ff4a51c8ee` transfer/eksik oyuncu regresyonu.
- `35a8aef591d281cb89d7aec95c61a3030d56ac61` otomatik veri writer güvenliği.

2026-08-26

Main focus: otomatik takım ve futbolcu analizinin robot karar zincirine tamamlanması.

Current team/player intelligence state:
- `scripts/player-intelligence-api.js` API-Football üzerinden maç eşlemesi, isimli sakat/cezalı/şüpheli oyuncu, doğrulanmış ilk 11, kadro pozisyonu ve son transfer hareketlerini önbellekli ve günlük istek bütçeli biçimde toplar.
- Google News RSS verisi yapılandırılmış oyuncu gerçeği gibi sunulmaz; haber sinyali, manuel doğrulama ve API kaydı ayrı veri statülerinde korunur.
- Veri yokluğu artık “Düşük” riske çevrilmez. Bilinmeyen kadro için ihtiyat payı, yüksek kadro/ilk 11 riski için daha güçlü puan indirimi ve kupon engeli uygulanır.
- `band-signals.json` maç anahtarları artık `home VS away` ve tarih ile doğru oluşur; eski `"-"` anahtar hatası giderildi.
- Takım/futbolcu etkisi `robot-analysis.json`, `live-matches.json`, `pro-analysis-index.json` ve `full-bulletin.json` zincirine taşınır; isimli eksikler, transferler ve ilk 11 durumu maç detayında görünür.
- Günlük bülten detayı “Takım ve Futbolcu Analizi” kartını, Özel Analiz sonucu da kadro/futbolcu özetini gösterir.
- PRO indeksi yalnız yaklaşan maçları ve en fazla üç gerekçeyi taşır; kompakt üretim yaklaşık 109 KB ile 150 KB performans sınırının altındadır.
- Birim, PRO, performans, sonuç, Spor Toto, sözdizimi ve JSON bütünlük testleri başarılıdır. Üretim entegrasyon testi otomatik ana veri işinde gerçek çıktıları birlikte doğrular.
- `matches` / `live_matches` ayrımı, Kuponum, üyelik/ödeme, CNAME ve DNS kuralları korunur.

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

2026-08-29

Main focus: GitHub Pages arayüzü ile Vercel korumalı API katmanının güvenli bağlanması.

Current hosting and security state:
- Özel alan adı GitHub Pages üzerinden arayüzü, `futbol-laboratuvari.vercel.app` ise korumalı analiz ve sipariş API'lerini sunar.
- İstemci yalnız yerel/Vercel ortamında aynı origin'i; GitHub Pages alan adında sabit Vercel üretim origin'ini kullanır.
- PRO ve banka API'leri yalnız doğru iki üretim origin'ine CORS izni verir; yabancı origin ve geçersiz preflight istekleri reddedilir.
- GitHub Pages iş akışı artık depoyu doğrudan yayımlamaz; güvenli `public/` artifact'ini üretir ve robot analizi, tam sonuç arşivi, üyelik kodu, kullanım günlüğü ile ham havuz dosyalarını fiziksel olarak artifact dışında bırakır.
- Eski kullanım günlüğü API'sinin anonim GET erişimi kapatıldı; yönetici anahtarı olmadan kayıt dönmez.
- GitHub Pages üzerinde CSP meta politikası, Vercel üzerinde CSP/HSTS ve diğer güvenlik başlıkları uygulanır.
- Satıcı profili eksik kaldığı sürece ücretli sipariş hem arayüzde hem sunucuda kapalıdır; ücretsiz deneme ve mevcut üyelik doğrulaması ayrı Supabase akışında kalır.

## 2026-08-30 — Üyelik kodu canlı etkileşim düzeltmesi

- Üyelik kodu kartındaki `Göster/Gizle`, `Kodu Doğrula`, `Analize Başla` ve `Kodu Değiştir` eylemleri doğrudan düğmelere bağlandı.
- Kart eylemleri artık panel ve güvenlik katmanlarının olay kabarcıklanmasına bağlı değil.
- Canlı sürüm işareti `20260830-membership-code-ux-v3` olarak güncellendi.

## 2026-08-30 — Admin/kod sonrası PRO merkez eşlemesi

- Korumalı PRO indeksinin `fl:pro-analysis-ready` olayı artık ana sayfadaki “Bugünün en güçlü adayı” ve “Maç bazlı detaylı değerlendirmeler” alanlarını da doldurur.
- Yalnız başlamamış ve gerçek PRO sinyali bulunan kayıtlar gösterilir; kupona uygun kayıtlar önce, ardından model gücüne göre sıralanır.
- Kod değiştirildiğinde veya erişim temizlendiğinde korumalı içerik de ana sayfadan kaldırılır.
- Supabase `founder` üyeliği aktif ve 9999 hakla doğrulandı; veri tabanında üyelik kaydı değiştirilmedi.

## 2026-09-01 — PRO Robot 13.4 resmi oran ve kadro zekâsı

- Taze resmi İddaa oranları, en fazla 18 saatlik sakatlık/ceza/ilk 11 ve doğrulanmış takım verisiyle güvenli biçimde birleştirilir; resmi oran daima önceliklidir.
- Korumalı PRO indeksinde isimli futbolcu ve kaynak doğrulama bilgileri artık sıkıştırma sırasında kaybolmaz.
- Resmi akışta kupon uygunluğu ortak model gücü, veri kapsamı, olasılık, risk ve bağımsız kanıt kurallarıyla yeniden hesaplanır.
- Yüksek kadro veya ilk 11 riski robot puanını düşürür ve kuponu kapatır; KG modeli takım riskinden etkilenir fakat başka bir markete dönüşmez.
- Resmi sağlayıcının boş yanıtı güvenli hata sayılır ve son korumalı indeks yedeği kullanılır.
- Bülten verileri, üyelik/ödeme akışı, workflow, CNAME, DNS ve Supabase şeması değiştirilmedi.

## 2026-08-30 — PRO merkez kart tasarımı

- “Bugünün en güçlü adayı” tek, geniş ve lacivert-altın PRO vitrin kartına dönüştürüldü.
- Güçlü aday kartında lig/saat, önerilen seçenek, oran, tahmini olasılık, veri kapsamı, model gücü ve risk ayrı görsel alanlarda sunulur.
- Maç bazlı değerlendirmeler masaüstünde üç, tablette iki, mobilde tek sütunlu okunabilir kart düzenine geçirildi.
- Model gücünün sonuç olasılığı olmadığı kart üzerinde açıkça korunur; üyelik doğrulama, hak tüketimi ve korumalı veri akışı değiştirilmedi.
