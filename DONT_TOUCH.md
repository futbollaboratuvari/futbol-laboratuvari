# Dokunulmaz Dosyalar ve Koruma Kurallari

Bu dosya calisan alanlari korumak icindir. Yeni is yaparken once bu dosya okunur.

## Ana kaynak ve calisma sozlesmesi

1. Futbol Laboratuvari sisteminin ana ve kalici kaynak deposu GitHub'dir: `futbollaboratuvari/futbol-laboratuvari`.
2. Kod, veri akislarinin tanimi, workflow'lar, PRO Robot gelistirmeleri ve koruma kurallari icin tek kaynak gercegi GitHub `main` dalidir.
3. Her inceleme, hata arama, gelistirme veya duzeltme isinde once bu repo ve bu `DONT_TOUCH.md` dosyasi okunur. Kullaniciya GitHub'a tasindigini tekrar sordurmak veya hatirlatmak gerekmez.
4. Canli on yuz GitHub Pages uzerinden, korumali PRO backend ise Supabase Edge Functions uzerinden calisir. Vercel bu proje icin kullanilmaz ve canli dogrulama olcutu sayilmaz.
5. Canli sitede bir sorun gorulurse once GitHub `main` dalindaki guncel kod ve veri akisi kontrol edilir; sonra deploy/runtime ile karsilastirilir.
6. Kalici kod degisiklikleri GitHub uzerinden yapilir. Kullanici acikca farkli bir yol istemedikce canli ortama GitHub disindan elle yama uygulanmaz.
7. Yeni PRO Robot gelistirmeleri mevcut motoru bozmayacak sekilde ayrik, geri alinabilir katmanlar halinde eklenir; test edilmeden `main`e alinmaz.
8. Kullanici sadece salt okunur kontrol/rapor istediyse GitHub dosyalari degistirilmez.
9. GitHub Pages canli on yuz yayincisidir; Supabase `fl-pro-analysis` korumali PRO API/backend runtime'idir. Canli kontrol dogrudan `futbollaboratuuvari.org` ve ilgili Supabase servis sagligi uzerinden yapilir.
10. Korumali PRO backend kaynak kodu `supabase/functions/fl-pro-analysis/index.ts` altinda GitHub'da tutulur. Backend degisikligi test edilmeden Supabase Edge Function'a alinmaz.
11. `data/pro-analysis-index.json` uyelik korumali projection oldugu icin public GitHub reposuna commit edilmez. PRO API, uyelik dogrulandiktan sonra GitHub `main` icindeki guncel `data/robot-analysis.json` ve sonuc hafizasindan projection'i sunucu tarafinda olusturur.
12. Supabase PRO servisi GitHub `main` robot verisini 60 saniyelik kisa sunucu cache'iyle okur. Kaynak okunamazsa eski deployment verisi uydurulmaz; servis fail-closed hata verir ve veri geri gelince otomatik guncel kaynaga doner.
13. Etiketi dogrulanmamis ham oran bloklarinda market; oran sayisindan, blok sirasindan veya oran degerinden tahmin edilmez. `raw_market_guess_odds` ve tahmini market adaylari PRO skoruna veya kupona kaynak olamaz. Ham bloklar yalniz teshis amaciyla tutulur; market secimi icin acik isimli/dogrulanmis oran alani gerekir.

## PRO Robot ana urun sozlesmesi

PRO Robot Futbol Laboratuvari'nin ucretli uyelik sisteminin ana analiz urunudur. Uyeler robotun analizlerine erisim icin odeme yaptigi icin robotla ilgili degisiklikler diger yardimci modullerden daha yuksek koruma seviyesinde ele alinir.

1. PRO Robot uzerinde yapilan HER islem bu dosyaya kaydedilir. Yeni ozellik, hata duzeltmesi, algoritma degisikligi, esik degisikligi, market ekleme/cikarma, veri kaynagi degisikligi, skor mantigi degisikligi, kupon uygunluk degisikligi, mail/canli site baglantisi, workflow degisikligi, test, guvenlik duzeltmesi ve geri alma islemleri buna dahildir.
2. Bir PRO Robot isi, kod tamamlanmis olsa bile bu sozlesmedeki `PRO Robot Islem Gunlugu` bolumune kaydi eklenmeden tamamlanmis sayilmaz.
3. Robotla ilgili yeni bir ise baslamadan once bu dosyanin tamami ve `PRO Robot Islem Gunlugu` okunur. Kullanici daha once yapilan islemleri tekrar hatirlatmak zorunda birakilmaz.
4. Her gunluk kaydinda en az su bilgiler bulunur: tarih, amac/kok neden, yapilan degisiklik, etkilenen dosyalar veya akislar, etkilenen marketler, veri kaynagi/provenance kurali, test sonucu, canli dogrulama sonucu, commit/PR bilgisi ve varsa geri alma notu.
5. Robot uzerinde belgesiz degisiklik yapilmaz. Acil duzeltme gerekiyorsa bile ayni islem tamamlanmadan once sozlesme kaydi eklenir.
6. Calisan marketler ve mevcut veri akislarinin davranisi gereksiz yere degistirilmez. Yeni gelistirme ayrik katman halinde eklenir ve mevcut davranis regresyon testleriyle korunur.
7. Market kimligi dogrulanmadan oran bir markete atanmaz. Oran sayisi, blok sirasi veya oran degeri market kimligi sayilmaz.
8. PRO skoruna ve kupona yalniz acik isimli/dogrulanmis market verisi veya sozlesmede onaylanmis guvenilir kaynak girebilir.
9. Ham ve belirsiz veri teshis icin saklanabilir ancak kupon karari, market secimi veya uyeye gosterilen kesin market orani icin kullanilamaz.
10. Robotun uyeye gosterdigi analiz ile mail, canli site ve kupon ciktisi ayni dogrulanmis market mantigini kullanir. Bir kanalda yasaklanan tahmini veri diger kanaldan sizamaz.
11. Her kritik robot degisikligi en az bir hedefli test ve uygun oldugunda mevcut PRO/kupon regresyon testleriyle dogrulanir. Test basarisizsa degisiklik tamamlandi diye raporlanmaz.
12. Canliya alinan kritik degisiklikte GitHub `main`, GitHub Pages, Supabase PRO backend ve ilgili veri workflow'u uygun oldugu olcude kontrol edilir. Yalniz kod commit'i canli dogrulama yerine gecmez.
13. Uyenin satin aldigi PRO davranisini etkileyen esik veya market degisikligi kayit altina alinmadan sessizce degistirilmez.
14. Dusuk oran filtresi korunur. 1.26-1.30 gibi dusuk oranlar PRO kupon seciminde kullanilmaz. Mevcut kupon motorunun alt oran esigi `1.45`tir; bu deger ancak bilincli bir gelistirme ile degistirilir ve degisiklik bu sozlesmeye kaydedilir.
15. PRO Robotun hedef market kapsami su an icin en az: KG Var/Yok analizi, 2.5 Alt/Ust, 3.5 Alt/Ust, 6+ Gol, Ilk Yari KG, Ikinci Yari KG, Ilk Yari/Mac Sonucu ve ozellikle 1/1, 1/2, 2/1 surpiz kombinasyonlari. Bir market devre disi kalirsa nedeni gunluge yazilir.
16. Analizde mumkun oldugu olcude guncel sezon formu, sakat/cezali oyuncular, kadro/ilk 11, transfer etkisi, takim ve rakip eslesmesi, sonuc hafizasi ve dogrulanmis oran verisi kullanilir. Veri yoksa robot bunu veri varmis gibi uydurmaz; risk/veri eksigi belirtilir.
17. PRO Robot islem gunlugu silinmez veya geriye donuk kayit kaybettirecek sekilde yeniden yazilmaz. Yanlis bir kayit varsa silmek yerine duzeltme kaydi eklenir.
18. Kupon uygunlugunda oran tek basina kalite sinyali sayilmaz. Model olasiligi, piyasa olasiligi, edge ve beklenen deger birlikte kontrol edilir. Edge kaydi ile olasiliklardan turetilen edge belirgin bicimde celisirse secim kupona giremez.
19. `pro-goal-market-bridge` tarafinda bagimsiz gol modeli farki ile kullaniciya gosterilen nihai olasilik farki ayni edge kavrami degildir. Kupon/value kapisinda kanonik edge her zaman `estimated_probability - market_probability` olur. Goal bridge eski/bagimsiz edge tasiyorsa kupon kapisi bunu nihai olasilik edge'ine normalize eder; diger marketlerde 1.5 puanlik tutarsizlik freni devam eder.

## PRO Robot Islem Gunlugu

### 2026-09-18 - Canli PRO akisinin Supabase'e tasinmasi ve analysis_options export kaybi duzeltmesi

- Amac/kok neden: Canli AI Seffaflik / Ozel Analiz akisi aktif `premium-analysis-v3.js` icinden eski Vercel `/api/pro-analysis` endpointine bagliydi. Ayrica robot skorlayici coklu market `analysis_options` uretmesine ragmen `scripts/export-high-value-json.js` bu alani `robot-analysis.json` yazarken dusuruyordu. Bu nedenle canli Seffaflik, motor gelistirilmis olsa bile MS/2.5 agirlikli gorunebiliyordu.
- Yapilan degisiklik: Korumali PRO endpointi Supabase Edge Function `fl-pro-analysis` olarak ayrildi. Uyelik kodu sunucu tarafinda `memberships` tablosundan hash ile dogrulanir; guncel `data/robot-analysis.json` GitHub main'den okunur ve yalniz kompakt PRO projection doner. Frontend aktif PRO istegi Supabase endpointine tasindi. Robot exportu `analysis_options`, uygun `goal_market_candidates` ve `goal_market_pick` alanlarini korur hale getirildi.
- Veri guvenligi/provenance: `raw_market_guess_odds` secenekleri ile specialist `block` / `specialist_eligible:false` adaylari exportta da reddedilir. PRO verisi uyelik dogrulamasi olmadan POST ile donmez. Health endpointi yalniz kaynak tarihi, sayilar ve market ailelerini verir; tahmin listesini acik etmez.
- Vercel politikasi: Bu proje icin aktif canli PRO akisi Vercel kullanmaz. On yuz GitHub Pages, korumali backend Supabase Edge Functions'tir. Eski Vercel dosyalari tarihsel/legacy kalabilir ancak aktif `premium-analysis-v3.js` akisi onlara cagri yapmaz.
- Etkilenen dosyalar/akislar: `premium-analysis-v3.js`, `scripts/export-high-value-json.js`, `supabase/functions/fl-pro-analysis/index.ts`, `tests/transparency-export.test.js`, `tests/pro-analysis-supabase-sync.test.js`, `package.json`, `.github/workflows/pro-market-specialist-ci.yml`, `ops/update-fixtures-trigger.txt`.
- Canli servis testi: Supabase `fl-pro-analysis` v1 ACTIVE. Veritabani icinden yapilan gercek HTTP health istegi 200 dondu; kaynak tarihi 2026-09-18, 246 mac ve 220 analiz secenegi okundu. Duzeltme oncesi health yalniz MS ve 2.5 Ust ailelerini gostererek export kaybini canli olarak dogruladi.
- Canli dogrulama tamamlama kriteri: Merge sonrasi update-fixtures robot verisini yeniden uretecek; health market ailelerinde dogrulanmis mevcut veriye gore IY KG / 2Y KG / 3.5 / 6+ aileleri gorulmesi ve GitHub Pages deploy basarisi kontrol edilecek. Veri kaynaginda dogrulanmis oran yoksa market uydurulmayacak.
- Geri alma: Frontend endpoint degisikligi ve export alanlari ayrik tutuldu. Gerekirse ilgili commit geri alinabilir; uyelik tablosu ve odeme akisina degisiklik yapilmadi.


### 2026-09-18 - AI Şeffaflık çoklu market ve çeşitlilik sözleşmesi

- Amaç/kök neden: AI Şeffaflık Merkezi maç başına yalnız `recommended_market` alanını gösterdiği için robot farklı marketleri analiz etse bile 10 kart aynı maç sonucu/taraf ailesine sıkışabiliyordu. Kullanıcı özellikle İlk Yarı KG, İkinci Yarı KG, İY KG / 2Y KG kombinasyon marketi, 2.5 Üst, 3.5 Üst ve 6+ Gol geliştirmelerinin her sürümde Şeffaflık bölümüne yansımasını istedi.
- Yapılan değişiklik: Resmî İddaa normalizasyonuna açık isimli 3.5 Alt/Üst, İlk Yarı KG, İkinci Yarı KG, İY/2Y KG dört kombinasyonu ve 6+ Gol canonical alanları eklendi. PRO ana skorlayıcı doğrulanmış marketlerden `analysis_options` üretir hale getirildi; İY/2Y KG kombinasyonları dört sonuçlu marj temizleme ve yarı eğilimleriyle ayrı analiz edilir. Korumalı PRO projection `analysis_options` ile uzman `goal_market_candidates` içindeki uygun 3.5 Üst / 6+ Gol seçeneklerini taşır. AI Şeffaflık runtime'ı bu çoklu seçenekleri okuyup market aileleri arasında çeşitlilik uygular; maç sonucu ailesi 10 kartın en fazla 2 tanesini işgal edebilir.
- Görünürlük politikası: Şeffaflıkta aynı maç yalnız bir kez listelenir fakat detay panelinde o maç için robotun gördüğü doğrulanmış seçenekler oran + tahmini olasılıkla gösterilir. Öncelik aileleri İY/2Y KG, İY KG, 2Y KG, 6+ Gol, 3.5 Üst, 2.5 Üst, KG ve son olarak MS şeklindedir. Yeterli doğrulanmış alternatif yoksa 10 kartı doldurmak için market uydurulmaz; daha az kart gösterilebilir.
- Etkilenen dosyalar/akışlar: `scripts/iddaa-data-source.js`, `scripts/robot-exact-scoring.js`, `scripts/build-pro-analysis-index.js`, `scripts/official-pro-analysis.js`, `analysis-insights-v1.js`, `tests/iddaa-data-source.test.js`, `tests/pro-analysis-index.test.js`, `tests/pro-index-from-github.test.js`, `tests/transparency-market-options.test.js`, `package.json`. `index.html`, `daily-matches-widget.js`, günlük kupon üreticisi ve üyelik doğrulama davranışı değiştirilmedi.
- Etkilenen marketler: İlk Yarı KG Var/Yok, İkinci Yarı KG Var/Yok, İY KG / 2Y KG Evet/Evet - Evet/Hayır - Hayır/Evet - Hayır/Hayır, KG Var/Yok, 2.5 Alt/Üst, 3.5 Alt/Üst, 6+ Gol ve MS 1/X/2 görünürlük katmanı. Ana kupon eşikleri ve düşük oran minimumu değiştirilmedi.
- Provenance: Yalnız açık isimli/doğrulanmış resmî market outcome'ları canonical alana çevrilir. `raw_market_guess_odds` Şeffaflık seçeneği olamaz. 6+ yalnız açık outcome etiketi veya mevcut doğrulanmış goal specialist candidate üzerinden taşınır. Specialist `block` veya `specialist_eligible: false` seçenekler Şeffaflık havuzuna alınmaz.
- Test: Yeni iddaa normalizasyon fixture'ı yarı KG, kombinasyon KG, 3.5 ve 6+ alanlarını kilitler. Yeni `transparency-market-options.test.js` skorlayıcının İY KG, 2Y KG, İY/2Y KG, 2.5 Üst ve 3.5 Üst seçeneklerini üretmesini ve raw tahmini marketi reddetmesini test eder. Protected projection ve runtime çeşitlilik sözleşmesi mevcut production build testine bağlandı. `PRO Market Specialist CI` run `35301901771` Node 20 ve Node 24 matrislerinde syntax + specialist + iddaa + transparency + projection regresyonlarının tamamını `success` bitirdi.
- Geliştirme dalı / PR: `feat/ai-transparency-market-diversity-20260918`, PR #66. Merge öncesi CI yeşil.
- Canlı doğrulama: Merge öncesi yapılmadı. Main'e alındıktan sonra GitHub Pages ve korumalı `/api/pro-analysis` projection üzerinden Şeffaflık kart market dağılımı ayrıca kontrol edilecek.
- Geri alma: Çoklu seçenek sözleşmesi projection/UI katmanında ayrık tutulur. Ana `recommended_market` ve kupon kararları değişmediği için ilgili commitler geri alınarak önceki tek-market Şeffaflık görünümüne dönülebilir.


### 2026-09-18 - Canlı analiz görünürlük ve AI Şeffaflık bağlantısı

- Amaç/kök neden: GitHub Pages güncel main commitini başarıyla yayımlamasına rağmen analysis-insights-v1.js hiçbir canlı runtime loader tarafından çağrılmıyordu; bu nedenle üst menüde AI Şeffaflık Merkezi bağlantısı varken hedef bölüm oluşturulmuyordu. Ayrıca ana analiz görünümündeki ortak PRO normalizasyonu eski market/score alanlarına bağımlıydı ve güncel korumalı projection'ın recommended_market/model_score/probability_source sözleşmesini doğrudan tanımıyordu.
- Yapılan değişiklik: nav-routing.js üzerinden mevcut AI Şeffaflık modülü yüklenir hale getirildi. script.js ortak PRO normalizasyonu recommended_market, model_score, analysis_score ve gerçek probability_source kanıtını tanıyacak şekilde geriye uyumlu genişletildi. Korumalı maç normalizasyonunda signals yoksa yalnız sunucudan gelen gerçek probability_source kanıtı fallback olarak kullanılabilir.
- Etkilenen dosyalar/akışlar: nav-routing.js, script.js, tests/pro-index-from-github.test.js. Akış: üyelik doğrulaması -> /api/pro-analysis korumalı projection -> fl:pro-analysis-ready -> Maç Yorumları / AI Şeffaflık görünümü. index.html, günlük bülten üreticisi ve robot olasılık motoruna dokunulmadı.
- Etkilenen marketler: Yeni market, eşik veya tahmin mantığı eklenmedi. Düzeltme tüm mevcut korumalı PRO marketlerinin canlı görünürlük/yorum katmanını etkiler; 2.5 Alt/Üst, 3.5 Alt/Üst, 6+ Gol, KG, İY KG, 2Y KG ve İY/MS dahil mevcut market kararları değiştirilmez.
- Provenance: Ham/tahmini market blokları açılmadı. raw_market_guess_odds veya anonim oran blokları görünürlük kanıtı sayılmaz. Yalnız üyelik doğrulaması sonrası sunulan korumalı PRO projection alanları ve onun gerçek signals/probability_source kanıtı kullanılır.
- Test: Dal üzerinde script.js, nav-routing.js, analysis-insights-v1.js ve güncellenen test dosyası V8 syntax compile kontrolünden geçti. Güncel protected projection örneğinde recommended_market=3.5 Üst, model_score=71 ve probability_source ile görünürlük sözleşmesi PASS oldu; AI runtime loader ve regresyon sözleşmesi PASS oldu.
- Canlı doğrulama: Değişiklik öncesi GitHub Pages run 35296028374, e0eb72fcd32ac0b27232633f78a0a01b56a14f08 için SUCCESS; bu, sorunun eski Pages yayını olmadığını doğruladı. PR #65 merge sonrası yeni Pages build/deploy sonucu ayrıca bu kayda işlenecek.
- Geliştirme dalı / PR: fix/live-analysis-visibility-20260918, PR #65. Bu kayıt anında merge bekleniyor.
- Geri alma: Görünürlük düzeltmesi yalnız runtime yükleme ve şema normalizasyon katmanındadır. Robot motoru/veri üretimi değişmediği için PR #65 değişiklikleri geri alınarak önceki görünüm davranışına dönülebilir.

### 2026-09-18 - Ayrı Uzman Robot V4: kanıt kapsamı ve fail-closed kalite puanı

- Amaç/kök neden: V3 uzman katmanında bazı eksik sinyaller kalite hesabında nötr/geçer davranabiliyor, ayrıca `downgrade/block` kararı verilmiş bir adayın specialist quality puanı bağımsız destek sayısı nedeniyle gereğinden yüksek kalabiliyordu. V4 bu iki açıklanabilirlik ve güvenlik açığını kapatır.
- Sürüm: `market-specialist-gates-v4`. Ana PRO olasılık motoru, kullanıcıya gösterilen tahmin olasılıkları ve mevcut value/edge hesabı değiştirilmedi; V4 ayrı market uzman gate/postprocess katmanıdır.
- Kanıt denetimi: Her uzman sinyali artık `available + ok` olarak ayrı izlenir. Eksik veri destek sayılmaz. Çıktılara `evidence_known_count`, `evidence_coverage_score`, `missing_evidence`, `support_count`, `support_total` ve `support_checks` tanıları eklendi.
- 6+ Gol fail-closed kuralı: Poisson, 3.5+ geçmiş eğilimi, veri kapsamı, doğrulanmış gol aralığı fiyat seti ve çapraz gol mutabakatı beş ayrı kanıt ailesidir. 3'ten az kanıt ailesi mevcutsa `block`; tüm kanıtlar mevcut değilse en az `downgrade`. Eksik çapraz mutabakat artık olumlu destek gibi davranamaz.
- 3.5 Üst kapsam kuralı: Beş kanıt ailesinden 2'den azı mevcutsa `block`; 4'ten azı mevcutsa en az `downgrade`. V3'teki lambda/geçmiş/çapraz mutabakat eşikleri korunur.
- İY/MS 1/2 - 2/1 kritik kanıtları: Resmî bookmaker oran değeri, senaryo olasılığı, ilk yarı yön olasılığı ve maç sonu yön olasılığı artık kritik ve açıkça zorunludur. Bu alanlardan biri yoksa uzman kartı fail-closed `block` olur. Türetilmiş ilk yarı yönü ve doğrulanmamış oran yine kullanılamaz.
- Kalite tavanı: `downgrade` kararında specialist quality en fazla 70, `block` kararında en fazla 40 olur. Orta kaynak/kadro riski tavanı 65, yüksek kaynak/kadro riski tavanı 35'tir. Böylece karar ile kalite puanı birbirini çürütmez.
- Yüksek oran güvenliği: Yüksek İY/MS oranı tek başına kalite sinyali değildir. V3'teki `value_ratio`, resmî oran, yön olasılığı ve senaryo olasılığı kuralları korunup eksik kanıt durumunda daha sert fail-closed hale getirildi.
- Etkilenen marketler: 3.5 Üst, 6+ Gol, 1/2 ve 2/1. KG, MS ve 2.5 genel uzman çelişki kuralları değiştirilmedi.
- Provenance: Yalnız açık isimli/doğrulanmış market alanları ve resmî İddaa sinyalleri kullanılabilir. `raw_market_guess_odds`, anonim ham oran blokları ve doğrulanmamış market kimlikleri uzman desteği sayılmaz.
- Etkilenen dosyalar: `scripts/market-specialist-gates.js`, `scripts/pro-market-specialist-postprocess.js`, `tests/market-specialist-gates.test.js`, `.github/workflows/high-odds-htft.yml`, `.github/workflows/pro-market-specialist-ci.yml`. Korunan bülten/UI dosyalarına dokunulmadı.
- Test: İlk V4 CI run `35293990610`, yeni zorunlu HTFT yön kanıtlarını içermeyen eski test fixture'ını yakalayıp güvenli biçimde kırmızı oldu; üretim kodu gevşetilmedi, fixture yeni sözleşmeye göre tamamlandı. Düzeltme sonrası run `35294162593` Node 20 ve Node 24'te syntax, market specialist, pro-goal-market-bridge, high-odds HTFT, value gate, pre-match final check ve official BTTS regresyonlarının tamamını başarıyla geçti.
- Geliştirme dalı / PR: `feat/pro-specialist-v4`, PR #63. Bu kayıt anında production'a merge edilmemiştir; canlı doğrulama merge sonrası aynı günlükte takip edilecektir.
- Geri alma: V4 yalnız ayrı specialist gate/postprocess ve CI katmanlarını genişletir. Ana PRO olasılık motoruna veya korunan bülten/UI akışına dokunmadan V3 kurallarına geri alınabilir.

### 2026-09-18 - Ayrı Uzman Robot V3: çapraz gol mutabakatı ve HTFT value uyumu

- Amaç: V2 uzman robotun 6+ Gol ve 1/2 - 2/1 seçimlerinde yalnız kendi market sinyallerine bakmasını engellemek; komşu doğrulanmış marketlerin genel maç resmiyle ve resmî uzun oran fiyatıyla tutarlılığı zorunlu kalite sinyali yapmak.
- Sürüm: `market-specialist-gates-v3`. Ana PRO olasılık motoru değiştirilmedi; V3 ayrı uzman gate/postprocess katmanıdır.
- 6+ Gol çapraz mutabakatı: Doğrulanmış `2.5 Üst/Alt` ve `KG Var/Yok` fiyat çiftlerinden marj içi göreli pay hesaplanır. 2.5 tarafı %65, KG tarafı %35 ağırlıkla `goalConsensus` üretir. Raw/tahmini market blokları kullanılmaz.
- 6+ Gol eşikleri: Çapraz gol mutabakatı 0.44 altındaysa `block`; 0.44-0.52 arasında `downgrade`; güçlü destek kontrolünde 0.56+ bağımsız destek sayılır. Poisson, 3.5+ hafızası, veri kapsamı ve gol aralığı fiyat seti kuralları aynen korunur.
- 3.5 Üst eşikleri: Çapraz mutabakat 0.38 altındaysa `block`, 0.38-0.48 arasında `downgrade`. 3.5 marketi 6+ kadar sert değildir; mevcut lambda/geçmiş/veri kapsamı freni korunur.
- HTFT yön doğrulaması: 1/2 ve 2/1 adaylarında mevcut resmî İY/MS oranı ve doğrulanmış ilk yarı yönü şartına ek olarak `first_half_direction_probability` ve `full_time_direction_probability` uzman gate'e bağlandı. Yönlerden biri %22 altındaysa `block`, %22-%28 aralığında `downgrade`.
- HTFT value uyumu: Resmî bookmaker oranından ima edilen olasılık `100 / oran` ile hesaplanır. Uzmanın mevcut senaryo olasılığı bunun %45'inden azsa `block`; %45-%70 aralığında `downgrade`; %70+ uzman kalite desteğidir. Bu kural yüksek oranı tek başına cazip sinyal saymaz.
- Olasılık politikası: V3 senaryo veya gol olasılığını yeniden yazmaz. Yalnız `keep / downgrade / block`, model sinyal gücü ve specialist quality skorunu etkiler.
- Çıktı tanıları: HTFT uzman sonucuna `value_ratio` ve `implied_probability` eklenir. Goal specialist kalite skoru çapraz mutabakatı da bağımsız destek olarak sayar.
- Etkilenen dosyalar: `scripts/market-specialist-gates.js`, `scripts/pro-market-specialist-postprocess.js`, `tests/market-specialist-gates.test.js`; canlı uyumluluk için `.github/workflows/high-odds-htft.yml` V3 sürüm kontrolüne yükseltildi.
- Etkilenen marketler: 3.5 Üst, 6+ Gol, 1/2 ve 2/1. KG/MS/2.5 genel uzman kuralları değiştirilmedi.
- Provenance: Çapraz gol hesabı yalnız `available_odds/odds` içindeki açık isimli market çiftlerinden gelir. `raw_market_guess_odds` ve anonim ham bloklar V3 uzman mutabakat kaynağı değildir.
- Test: Specialist V3 final CI run `35291237501` Node 20 ve Node 24'te syntax, market specialist, pro-goal-market-bridge, high-odds HTFT, value gate, pre-match final check ve official BTTS regresyonlarının tamamını başarıyla geçti. Önceki ara run `35291106566` de yeşildi; son missing-consensus freni bu final run ile yeniden doğrulandı.
- Geliştirme dalı: `feat/pro-specialist-v3`.
- Canlı doğrulama: PR #60 squash merge commit `f5d1f21650e7daf3ce71a53e350ecfc52afb2ee3`. High Odds workflow içindeki eski V2 sürüm kilidi ayrı uyumluluk düzeltmesiyle PR #61 / commit `af6d23f434372cb14dc41208b3df995b47d8d129` üzerinden V3'e yükseltildi. Ana High Odds HTFT run `35291448274` tamamen başarılı oldu ve `1e0d6ad49e10bc29c6a03aa9c60ce3380d9f893d` veri commitini yazdı: 230 maç tarandı, 43 doğrulanmış 1/2-2/1 adayı V3 tarafından kontrol edildi, 32 aday bloklandı, 11 aday uygun kaldı ve en iyi 3 kart yayınlandı. Seçilen kartlarda `market-specialist-gates-v3`, `value_ratio`, `implied_probability`, doğrulanmış ilk yarı yönü ve resmî İddaa oranı birlikte mevcut. Tek scheduled writer run `35291486525` 59/59 adımı başarıyla tamamladı; `Apply PRO market specialist gates` adımı yeşil geçti ve `91279d392d32cec2c210fbb12dfd4cab822f125b` veri commitini üretti. Bu canlı turda 3.5/6+ doğrulanmış aday sayısı 0 olduğu için uzman zorla aday üretmedi; `robot-analysis.json` üst seviye specialist sürümü `market-specialist-gates-v3`, `goal_candidates_checked: 0` olarak fail-closed kaldı. Vercel production deployment `dpl_6i5fXfmnMLXMtSbWFF6mwFnFBj6P` commit `91279d392d32cec2c210fbb12dfd4cab822f125b` ile READY oldu; production build içinde market specialist, high-odds HTFT, value, pre-match ve diğer PRO regresyonları başarılı geçti ve `futbol-laboratuvari.vercel.app` alias'ı bu deployment'a bağlandı.
- Geri alma: V3 yalnız specialist gate/postprocess girdilerini genişletir. Ana PRO olasılık motoruna, korunan bülten/UI dosyalarına veya market provenance yasağına dokunmadan V2'ye geri alınabilir.


### 2026-09-18 - Ayrı Uzman Robot V2: 6+ Gol ve İY/MS kalite motoru

- Amaç: Ana PRO Robot'tan ayrı çalışan ekstrem market uzmanını 3.5 Üst, 6+ Gol ve özellikle yüksek oranlı 1/2 - 2/1 İY/MS marketlerinde daha seçici, doğrulanabilir ve açıklanabilir hale getirmek.
- Sürüm: `market-specialist-gates-v2`; gol köprüsü `pro-goal-market-bridge-v3`; yüksek oran İY/MS üreticisi `Futbol Laboratuvarı Yüksek Oran İY/MS v4`.
- 6+ Gol kuralı: Tek Poisson sinyali yeterli değildir. Uzman; Poisson toplam gol beklentisi, takım hafızasındaki 3.5+ eğilimi, veri kapsamı ve doğrulanmış gol aralığı fiyat setini bağımsız destekler olarak sayar. 2'den az destek seçim için `block`; sınırdaki veri `downgrade`; güçlü ve uyumlu veri `keep` üretir.
- 3.5 Üst kuralı: 6+ kadar sert olmayan ayrı eşikler korunur. Çok düşük Poisson beklentisi blok sebebidir; sınırdaki lambda, düşük 3.5 geçmiş oranı veya zayıf veri kapsamı yalnız ihtiyat düşümü üretir.
- İY/MS 1/2 - 2/1 kuralı: Resmî İddaa İY/MS oranı zorunludur. Ayrıca gerçek/doğrulanmış ilk yarı yönü zorunludur; maç sonu yönünden türetilmiş ilk yarı sinyali uzman kartı olarak yayımlanamaz. Resmî İddaa bültenindeki `İlk Yarı Sonucu 1/0/2` marketi birincil doğrulanmış ilk yarı kaynağı olarak eklendi; yoksa yalnız doğrulanmış isimli detay market kullanılabilir.
- HTFT kalite sinyalleri: Açık oyun skoru, veri kapsamı, senaryo olasılığı, resmî maç kimliği eşleşme kalitesi, kaynak çelişkisi, kadro/ilk 11 riski ve T60/T30/T10 final kontrol kararı birlikte değerlendirilir. Karar `keep / downgrade / block` olur; senaryo olasılığı doğrudan değiştirilmez.
- Tam aday havuzu: Generator'ın ilk üç sırasıyla sınırlı kalınmaz. Tüm doğrulanmış yüksek oranlı HTFT adayları uzman V2'den geçirilir, bloklananlar ayrılır, kalanlar model gücü + uzman kalite skoru + senaryo olasılığı ile tekrar sıralanır ve en iyi 3 benzersiz maç seçilir. Böylece bloklanan üst sıra aday, daha kaliteli 4. adayı gölgeleyemez.
- Provenance güvenliği: `raw_market_guess_odds` ve `raw_market_blocks` 3.5/6+ uzman fiyat kaynağından çıkarıldı. `market_identity_verified:false`, `unlabeled_raw_block` ve `raw_market_guess` kaynakları uzman fiyatı/sinyali olamaz. HTFT yardımcı MS, 2.5 ve KG sinyallerinde de raw fallback kaldırıldı.
- Maç önü/kadro bağlantısı: High source conflict, high lineup/squad risk veya T60/T30/T10 `block` kararı ekstrem uzman seçimini bloklar. Orta risk/çelişki veya final-check downgrade uzman puanını ihtiyatla düşürür.
- Olasılık politikası: Uzman kapısı market olasılığını veya HTFT senaryo olasılığını yeniden icat etmez; yalnız model sinyal gücünü düşürür ve gerekirse seçimi kupona/karta kapatır.
- Çıktı tanıları: Goal adaylarında `specialist_decision`, `specialist_eligible`, `specialist_quality_score`; HTFT çıktısında ayrıca `rejected_picks`, checked/rejected/eligible sayaçları ve seçim politikası bulunur. Geçici tam aday havuzu final JSON'a sızdırılmaz.
- Workflow güvenliği: Branch testinde High Odds HTFT gerçek resmî veriyle çalıştırılır fakat generated-data commit adımı yalnız `main` ref'inde çalışır. Production build'e `tests/high-odds-htft.test.js` eklendi.
- Test: Specialist V2 Unit CI run `35284887759` Node 20 ve Node 24'te syntax + market specialist + goal bridge + high-odds HTFT + value gate + pre-match regresyonlarının tamamını başarıyla geçti. Önceki gerçek resmî İddaa branch run `35284573285`, 230 maçı taradı ve ilk fail-closed davranışını doğruladı. Resmî İddaa İlk Yarı Sonucu kaynağı bağlandıktan sonra run `35284875143` başarıyla tamamlandı: 230 maç tarandı, 44 doğrulanmış yüksek oranlı HTFT adayı uzman V2 tarafından kontrol edildi, 27 aday bloklandı ve en güçlü 3 specialist-eligible kart final doğrulamadan geçti.
- Etkilenen dosyalar: `scripts/market-specialist-gates.js`, `scripts/pro-goal-market-bridge.js`, `scripts/generate-high-odds-htft.js`, `scripts/pro-market-specialist-postprocess.js`, `tests/market-specialist-gates.test.js`, `tests/pro-goal-market-bridge.test.js`, `tests/high-odds-htft.test.js`, `package.json`, `.github/workflows/high-odds-htft.yml`.
- Geliştirme dalı: `feat/pro-specialist-v2`.
- Canlı doğrulama: PR #59 squash merge commit `05ae10d6834d7b12c3c0623e503a0d68cd0b96da`. Ana `PRO Goal Market Test` run `35285137695` başarılı. Ana `High Odds HTFT Daily Scan` run `35285137702` başarılı oldu ve `b8185807e278c0d7f2a77cd4aeadc3685a1cbbe3` veri commitini `main`e yazdı: 230 maç tarandı, 44 doğrulanmış HTFT adayı V2 tarafından kontrol edildi, 27 aday bloklandı, 17 aday uygun kaldı ve en iyi 3 kart yayınlandı. Canlı kartların tamamı `official_iddaa_first_half` kaynağından doğrulanmış ilk yarı yönü taşıyor. GitHub Pages run `35285321418` bu veri commitini başarıyla yayınladı. Ana writer 3.5/6+ çıktısı ve Vercel backend kontrolü tamamlandığında son run/deploy bilgileri bu kayda eklenecektir.
- Geri alma: V2 uzman mantığı ayrı gate/postprocess/bridge katmanlarında tutulur. Ana PRO olasılık motorunu veya korunan bülten/UI dosyalarını değiştirmeden ayrı olarak geri alınabilir.


### 2026-09-18 - T60/T30/T10 aktif ufuk ve dosya boyutu temizligi

- Kok neden: Canli single-writer dogrulamasinda `data/pre-match-final-check.json` dogru T60 karari uretmesine ragmen `fixtures.json` icinde gecmisten kalmis `scheduled` satirlari da final-check dosyasina yaziliyordu. Karar motoru bozulmuyordu ancak cikti gereksiz buyuyor ve aylar onceki `not_due` maclari tasiyordu.
- Degisiklik: `runPreMatchFinalCheck` artik status filtresinden sonra yalniz kickoff'a 0-75 dakika kalan, zamani parse edilebilir maclari final-check cikisina alir. Gecmis maclar, 75 dakikadan daha uzaktaki `not_due` maclar ve kickoff zamani bilinmeyen satirlar bu ozel dosyaya girmez.
- Snapshot guvenligi: T60 satiri 75 dakikalik aktif ufukta tutuldugu icin sonraki T30/T10 kosularinda `previous` dosyasindan snapshot zinciri korunur. Mac basladiktan sonra pre-match kaydi otomatik olarak cikistan dusurulur.
- Market/provenance etkisi: Market esikleri, +%8/+%12 oran hareketi kurallari, value gate ve tahmini raw market yasagi degismedi. Bu yalniz pre-match veri ufku/boyut temizligidir.
- Test: `tests/pre-match-final-check.test.js` eski bir macin ve 90 dakika uzaktaki bir macin cikisa girmedigini; 30 ve 60 dakika kalan maclarin T30/T60 olarak kaldigini kilitler. Mevcut kupon ve takim-istihbarati regresyonlari da birlikte calistirilir.
- Gelistirme dali: `fix/prematch-window-horizon`.
- Canli dogrulama: PR #57 merge commit `1f3a8b43e67ffd109865b2925c74e983dbe21e5d`. Ana writer run `35280763747` tum production adimlariyla `success` tamamlandi ve `682a1ee5c9e7b7e972cb2f4a1ce80b47992f71a9` veri commitini uretip `main`e push etti. `data/pre-match-final-check.json` `2026-09-17T22:19:06.039Z` zamaninda yalniz 1 aktif mac tuttu: Bucaramanga VS Independiente M, kickoff'a 40.9 dakika, `T30`, dogrulanmis `2.5 Ust` / `over25` orani `1.92` (`verified_named_field:over25`), kaynak guveni `5/100`, karar `downgrade`. Production commit karsilastirmasinda bu dosyada 505092 eski satir silinip 27 aktif satir yazildi; ayni commit `data/robot-analysis.json` ve `data/daily-coupons.json` dosyalarini da yeniden uretti. Kupon ciktisi `candidate_count: 0` ile fail-closed kaldi.
- Geri alma: Filtre `runPreMatchFinalCheck` icindeki tek ufuk kosuludur; T60/T30/T10 karar fonksiyonlari ve kupon kapisina dokunmadan geri alinabilir.


### 2026-09-18 - Tek scheduled veri yazari / concurrency starvation duzeltmesi

- Kok neden: `Update fixtures and High Value Engine`, `Live Data Trigger`, `Derived Data Pipeline` ve `Auto relaxed analysis` ayni `futbol-main-data-writer` concurrency grubunda birbirine yakin cronlarla calisiyordu. GitHub ayni grupta bir calisan ve bir bekleyen run tuttugu icin yeni pending run geldikce eski pending writer job baslamadan iptal olabiliyordu; T60/T30/T10 canli veri dogrulamasi bu nedenle baslayamadi.
- Mimari duzeltme: Tek otomatik zamanlayici `Update fixtures and High Value Engine` olarak birakildi ve 15 dakikada bir calisir. Live Data, Derived Data ve Auto Relaxed workflow'larinin `schedule` bloklari kaldirildi; `workflow_dispatch`/trigger dosyasi fallback yollari korunur.
- Ek starvation kapisi: Merge sonrasi canli kontrolde `Auto relaxed analysis` workflow'unun `package.json`, `scripts/**` ve kendi workflow dosyasina bagli genis `push` tetikleyicisinin de ayni concurrency kuyrugunu isgal edebildigi goruldu. Bu genis `push` tetikleyicisi kaldirildi; Auto Relaxed artik yalniz `workflow_dispatch` ile manuel fallback olarak calisir. Live/Derived tarafindaki dar ops/workflow trigger yollari degismedi.
- Yazma guvenligi: Dort writer da ayni `futbol-main-data-writer` concurrency grubunda ve `cancel-in-progress: false` kalir. Manuel fallback tetiklenirse ana writer ile ayni anda veri yazamaz; ayri concurrency gruplarina bolunerek veri yarisi yaratilmadi.
- Ana writer kapsami: Mackolik erken pencere ve tam Python kaynak toplayici, fixture/bulten yenileme, player intelligence, acik haber, kadro/ilk 11, source consensus, ic-dis saha, puan/momentum, lig yapisi, istatistik hafizasi, takim stili, T60/T30/T10 final kontrolu, team-status apply, band/card sinyalleri, market provenance guard, PRO export, goal market specialist, sonuc/ogrenme ve Spor Toto finalizasyonu tek seri akis icinde korunur.
- Provenance: Tahmini/etiketsiz ham market yasagi degismedi. `market-provenance.test.js` ve `market-provenance-guard.js` ana writer icinde PRO exportundan once zorunlu calisir.
- Market etkisi: Market esikleri veya model olasiliklari degistirilmedi. Bu is workflow orkestrasyonu ve veri tazeligi duzeltmesidir; T60/T30/T10 ve mevcut value/market uzman kurallari aynen korunur.
- Test: Gecici `Writer Concurrency CI` tek scheduled writer oldugunu, tum fallback writer'larin ortak concurrency grubunda kaldigini ve ana writer'in full Python collector, source consensus, T60/T30/T10, provenance ve market-specialist adimlarini icerdigini dogruladi. Ayrica market-provenance, pre-match, value, 3.5/6+, market-specialist, team intelligence, matchup ve source-consensus regresyonlari basarili.
- Gelistirme dali: `fix/data-writer-concurrency-starvation`.
- Canli dogrulama: PR #55 ile tek scheduled writer mimarisi `main`e alindi; PR #56 merge commit `6b407c0736ff6b66eb217c7d3363d38f92b1427a` ile Auto Relaxed'in genis `push` tetikleyicisi de kapatildi. `ops/main-run.txt` uzerinden tetiklenen run `35279198594` tum 29 production adimini `success` bitirip `45e7f3a976b6f2203d2b3241bbf1241ae7f68e87` veri commitini uretmis; ufuk temizligi sonrasi ikinci canli run `35280763747` de tam `success` bitirip `682a1ee5c9e7b7e972cb2f4a1ce80b47992f71a9` commitini uretmistir. Job baslamadan iptal olma/starvation davranisi canli kontrolde tekrar etmemistir.
- Geri alma: Yardimci writer'lar silinmedi; yalniz cronlari kapatildi. Gerektiginde manuel tetiklenebilir. Eski coklu cron davranisina donmek teknik olarak mumkun olsa da ayni concurrency grubunda starvation riski yeniden olusur.


### 2026-09-18 - Mac onu T60/T30/T10 final kontrol katmani

- Amac: Robotun erken saatte verdigi secime koru-koru baglanmasini engellemek; maca yaklasirken kadro/ilk 11, kaynak uzlasisi ve ayni dogrulanmis marketteki oran hareketini tekrar kontrol etmek.
- Degisiklik: `scripts/pre-match-final-check.js` eklendi. Yaklasik T60, T30 ve T10 pencerelerinde snapshot alir; karar `keep`, `downgrade` veya `block` olur. Mevcut 15 dakikalik veri akislari nedeniyle pencereler 46-75, 16-45 ve 0-15 dakika araliklarinda ilk uygun calismada yakalanir.
- Kadro/kaynak freni: Yuksek ilk 11/kadro riski veya yuksek kaynak celiskisi `block`; orta celiski, dusuk kaynak guveni, eski sinyal ve T10'da iki ilk 11'in birlikte dogrulanmamis olmasi `downgrade` uretir.
- Oran hareketi: Yalniz acik isimli/dogrulanmis market alanlari kullanilir; `raw_market_guess_odds` ve anonim ham bloklar son kontrol oran kaynagi olamaz. Ayni markette onceki snapshot'a gore +%8 veya daha fazla aleyhe oran hareketi `downgrade`; +%12 veya daha fazla hareket tek basina bloklamaz, ancak kadro/kaynak tarafinda da bozulma varsa `block` olur.
- Kupon etkisi: `pro-coupon-eligibility.js` final kontrolu `team_intelligence.pre_match_final_check` veya ust seviye alandan okur. `downgrade` kupon hesabinda model gucune -4, veri butunlugune -3 ihtiyat uygular; `block` secimi kupona kapatir. Tahmini olasilik yuzdesi dogrudan degistirilmez.
- Bant/akis baglantisi: `scripts/band-lite.js` final kontrol kararini bant notuna ve `band_extra` icine tasir. Derived Data Pipeline ve Live Data Trigger final kontrolu otomatik calistirir; live akis bunu High Value/PRO exportundan hemen once uygular.
- Etkilenen marketler: PRO kuponuna girebilen tum marketler. Oran hareketi ancak ayni kanonik market anahtariyla karsilastirilabilir durumdaysa uygulanir.
- Test: `tests/pre-match-final-check.test.js` T60/T30/T10 pencerelerini, raw oran reddini, %8/%12 hareket esiklerini, T10 ilk 11 freni, kaynak celiskisi, kupon downgrade/block etkisi ve olasiligin degismemesini test eder.
- Regresyon sonucu: Node 20 ve Node 24'te pre-match final check, value gate, 3.5/6+ goal bridge, market-specialist, official BTTS, team intelligence, matchup ve source-consensus testlerinin tamami basarili.
- Gelistirme dali: `feat/pro-prematch-final-check`.
- Canli dogrulama: PR #54 merge commit `3d8cb0087d88cb48497843a634c54ce7089da1df`. Ana `PRO Goal Market Test` run `35277584722` basarili. Vercel production deployment `dpl_2qgYHYqDR7gJrnhF6mHBYAcoH6VL` READY ve production build icinde `pre-match-final-check.test.js` ile PRO regresyonlari basarili. Ilk Live/Derived veri kosularinin job baslamadan iptal edilmesi ayri concurrency-starvation kaydiyla ele alindi.
- Geri alma: Katman `scripts/pre-match-final-check.js`, `band-lite` baglantisi ve `pro-coupon-eligibility.js` icindeki pre-match helper'lariyla ayrik tutulur; diger model olasilik motorlarina dokunmadan geri alinabilir.


### 2026-09-17 - Value gate / 3.5 ve 6+ edge uyumluluk duzeltmesi

- Kok neden: Akilli Value Quality Gate canli kontrolunde `PRO Goal Market Test` alarm verdi. 3.5 Ust ve 6+ Gol bridge'i `edge_percent` alaninda bagimsiz gol modelinin piyasa farkini tasirken value kapisi ayni alani nihai `estimated_probability - market_probability` olarak yorumluyordu. Iki farkli edge semantigi ayni alanda bulusmustu.
- Degisiklik: `pro-coupon-eligibility.js` goal-bridge adaylarini tanir. Bridge edge'i nihai olasilik edge'i ile 1.5 puandan fazla ayrisiyorsa `edge_percent` ve `value_label` kanonik nihai edge'e normalize edilir. Value/EV hesabinda ve yuksek gol guvenlik aginda ayni edge kullanilir.
- Guvenlik: Genel edge tutarsizlik freni gevsetilmedi. Goal bridge disindaki marketlerde kayitli edge ile olasiliklardan turetilen edge arasindaki fark 1.5 puani asarsa secim yine kupona giremez.
- Test: `tests/pro-coupon-eligibility.test.js` goal-bridge edge normalizasyonunu ve normal markette tutarsizlik reddini birlikte kilitliyor. `tests/pro-goal-market-bridge.test.js` 3.5 Ust ve 6+ Gol ciktisinin nihai edge ile tutarli oldugunu ve zayif kanonik edge'in kupona giremedigini test ediyor.
- Regresyon sonucu: Node 20 ve Node 24'te value gate, goal bridge, market-specialist ve official BTTS testlerinin tamami basarili.
- Gelistirme dali: `fix/value-goal-edge-consistency`.
- Kod merge commit: `79e359bbdc95b844f39b408743636456254dcb1b` (PR #53).
- Canli dogrulama: Ana `PRO Goal Market Test` run'i merge commitinde basarili oldu. Vercel production deployment `dpl_BXzHUtFwCtR2oMUhZmqCsiiZfH7F` READY oldu ve `futbol-laboratuvari.vercel.app` alias'i bu deployment'a gecti. Production build icinde `pro-coupon-eligibility.test.js`, official BTTS, market-specialist ve diger PRO regresyonlari basarili.
- Geri alma: Normalizasyon yalniz goal-bridge olarak isaretli adaylarda calisir; diger marketlerin value mantigina dokunmaz.

### 2026-09-17 - Akilli oran / Value Quality Gate

- Amac: Dusuk oranli favorilerin yalniz yuksek model puaniyla kupona girmesini ve yuksek oranli secimlerin sirf oran buyuk diye degerli kabul edilmesini engellemek.
- Degisiklik: `pro-coupon-eligibility.js` icine tum PRO kupon marketlerine uygulanan `valueQuality` katmani eklendi. Kupon karari artik model olasiligi, piyasa olasiligi, edge, gercek oran, model gucu ve beklenen degeri birlikte kontrol ediyor.
- Oran bantlari: `1.45-1.59` icin minimum edge 6 puan / EV 1.04 / model gucu 70; `1.60-1.89` icin 4 / 1.03 / 67; `1.90-2.49` icin 3 / 1.03 / 65; `2.50-3.49` icin 4 / 1.04 / 65; `3.50+` icin 5 / 1.06 / 68.
- Tutarlilik korumasi: Kayitli `edge_percent` ile `estimated_probability - market_probability` arasindaki fark 1.5 puandan buyukse secim stale/tutarsiz kabul edilip kupona alinmiyor. Goal bridge icin kanonik nihai edge normalizasyonu yukaridaki ayri gunluk kaydiyla tanimlanmistir. Iki genel edge degeri mevcutsa daha ihtiyatli olan kullanilir.
- Fail-closed davranis: Gercek oran, model olasiligi veya piyasa olasiligi eksikse secim analiz/watchlist tarafinda kalabilir ancak PRO kupona giremez.
- Etki alani: KG, MS, 2.5, 3.5, 6+ ve diger PRO kupon marketlerinin tamaminda ortak kupon uygunluk kapisi. 3.5 ve 6+ icin mevcut ozel market guvenlik kurallari ayrica korunuyor.
- Siralama: Value kapisini gecen secimlerde gercek edge ve pozitif EV, ayni kalite seviyesindeki secimler arasinda ek siralama sinyali olarak kullaniliyor.
- Test: `tests/pro-coupon-eligibility.test.js` yeni oran bantlari, dusuk oran freni, yuksek oran tuzagi, sifir edge, eksik fiyat ve edge tutarsizligini kapsayacak sekilde genisletildi. `tests/pro-analysis-index.test.js` yeni value sozlesmesine uyarlandi.
- Build kilidi: `package.json` production build zincirine `pro-coupon-eligibility.test.js` eklendi; bu davranis bozulursa Vercel production build basarisiz olacak.
- Regresyon sonucu: Node 20 ve Node 24'te hedef value testi, market-specialist, official BTTS ve PRO analysis index testleri basarili.
- Kod merge commit: `a998aa0e7b98ffcf51d0d9c11a36acbecdcbc9b1` (PR #52).
- Canli dogrulama: Vercel production deployment `dpl_EVsNwbMLF54z5rXcxkjapw7D2xre` READY oldu; production build icinde `pro-coupon-eligibility.test.js` ve diger PRO regresyonlari basarili. Auto relaxed analysis yeni kuralla basariyla veri uretti ve `300799b28e393752cec7a47e13e4fced1b165011` data commit'ini olusturdu. `data/daily-coupons.json` yeni filtre sonrasi `candidate_count: 0` ve uygun olmayan secimleri kupona sokmadi.
- Gelistirme dali: `feat/pro-value-quality-gate-v2`.
- Geri alma: Katman `pro-coupon-eligibility.js` icindeki `valueQuality/passesValueQuality` fonksiyonlari ve `meetsCouponCriteria` baglantisiyla ayrik tutuluyor; gerekirse diger robot motorlarina dokunmadan geri alinabilir.

### 2026-09-17 - Market kimligi/provenance guvenlik duzeltmesi

- Kok neden: Etiketsiz ham oran bloklari yalniz oran sayisi ve blok sirasina bakilarak KG, 2.5 Alt/Ust, 3.5 Alt/Ust, devre marketleri ve bazi diger marketlere tahminen eslenebiliyordu. Bu durum yanlis market/oran gosterme riski olusturuyordu.
- Degisiklik: `scripts/raw-block-lite.js` anonim ham bloklar icin market tahmini uretmeyecek sekilde degistirildi. Bu bloklar `Belirsiz market`, `market_identity_verified: false` ve `unlabeled_raw_block` kaynagiyla yalniz teshis verisi olarak tutuluyor.
- Koruma katmani: `scripts/market-provenance-guard.js` eklendi. Eski/stale `raw_market_guess_odds` ve tahmini market adaylari PRO exportundan once temizleniyor; acik isimli dogrulanmis oran alanlari korunuyor.
- Akis: `.github/workflows/live-data-trigger.yml` icinde provenance testi ve guard, High Value/PRO exportundan once zorunlu hale getirildi. `package.json` build ve `export:live` akislarinda ayni koruma kilitlendi.
- Test: `tests/market-provenance.test.js` eklendi. Iki ve uc oranli anonim bloklarin markete donusmemesi, eski tahminlerin temizlenmesi, dogrulanmis oranlarin korunmasi ve yalniz ham tahmin varsa PRO scorer'in secim uretmemesi test edildi.
- Regresyon: Node 20 ve Node 24 testleri; mevcut Iddaa, PRO, KG ve kupon regresyonlari basarili oldu.
- Canli dogrulama: Vercel production build basarili/READY oldu. Live Data Trigger icinde ham veri toplama, provenance guard, PRO export ve data commit adimlari basariyla tamamlandi.
- Kod merge commit: `dbb0f617744c751423d6aa89d9e38137163a0357`.
- Ilk otomatik veri commit'i: `529842b637a3bcec610b8a22e64c7afd6ab21401`.
- Live Data Trigger sonrasi veri commit'i: `9942c706f3c371c4e4d590f9c3d7fdd82d982592`.
- Kalici kural: Market kimligi dogrulanmiyorsa robot marketi tahmin etmez ve o ham orani PRO kupona sokmaz.

### 2026-09-17 - PRO Robot degisiklik kaydi zorunlulugu

- Amac: Kullaniciya daha once yapilan robot gelistirmelerini tekrar hatirlatma yukunu kaldirmak ve PRO Robot bilgisini repo icinde kalici hale getirmek.
- Degisiklik: Bu `PRO Robot ana urun sozlesmesi` ve `PRO Robot Islem Gunlugu` olusturuldu.
- Kalici kural: Bundan sonra PRO Robotla ilgili her gelistirme, degisiklik, hata duzeltmesi, test veya davranis degisikligi ayni islem icinde bu gunluge yazilacak. Kayit eklenmeden is tamamlanmis sayilmayacak.

## Kritik dosyalar

- daily-matches-widget.js
- data/full-bulletin.json
- data/live-matches.json
- data/full-bulletin-health.json
- data/full-bulletin-cache.json
- scripts/full-bulletin-output-check.js
- scripts/repair-bulletin-flow.js
- scripts/update-fixtures.js
- scripts/update-match-archive.js
- .github/workflows/update-fixtures.yml
- index.html

## Koruma kurallari

1. Futbol Bulteni calisiyorsa daily-matches-widget.js komple yeniden yazilmaz.
2. Tum Bulten ve Canli Bolum ayrimi bozulmaz.
3. Kuponum paneli kaldirilmaz.
4. Analiz Et butonu kaldirilmaz.
5. Veri dosyalari bos veriyle zorla ezilmez.
6. Eski tarihli sabit veri geri getirilmez.
7. Calisan workflow yeni ozellik icin kirilmaz.
8. Yeni ozellik once ayri ve kucuk baglanti ile denenir.
9. Kapsam genisletilmez.
10. Kullanici sadece kontrol isterse dosya degistirilmez.

## Bulten icin dogru ayrim

- full-bulletin.json matches: baslamayan maclar
- full-bulletin.json live_matches: canli maclar
- live-matches.json matches: canli destek verisi

Baslayan mac Tum Bulten listesine katilmaz.
