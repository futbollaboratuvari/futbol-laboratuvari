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

## Robot Sistemi Sabit Envanteri

Bu bolum Futbol Laboratuvari robot mimarisinin guncel ve sabit envanteridir. Yeni robot eklenmedikce toplam uzman robot sayisi degismez. Robotlarla ilgili yeni gelistirmelerde once bu bolum okunur.

### Toplam robot sayisi: 5

Ilk dort robot mac oncesi PRO uzmanlaridir. Besinci robot `Canli Mac Analiz Robotu`dur ve yalniz gercekten baslamis maclarda calisir. Ortak PRO cekirdegi ve `robot-specialist-orchestrator-v3` ayri bir tahmin robotu sayilmaz; ilk dort uzmani ayni dogrulanmis veri altyapisinda birlestiren ortak beyin/orkestrasyon katmanidir.

1. **KG Uzmani (`btts`)**
   - Gorevi: Karsilikli Gol marketlerini analiz etmek.
   - Kapsam: KG Var, KG Yok, Ilk Yari KG Var/Yok, Ikinci Yari KG Var/Yok ve dogrulanmis yari KG kombinasyonlari.
   - Temel kontrol: Dogrulanmis market kimligi, takim gol/yeme egilimleri, ilgili veri kapsamı ve uzman kalite kapilari.

2. **Gol Uzmani (`goals`)**
   - Gorevi: Toplam gol ve yuksek gol marketlerini analiz etmek.
   - Kapsam: 2.5 Alt/Ust, 3.5 Alt/Ust ve 6+ Gol.
   - Temel kontrol: Poisson/toplam gol beklentisi, gecmis gol egilimleri, KG ve 2.5 gibi komsu marketlerle capraz mutabakat, veri kapsamı ve V4 fail-closed kalite kurallari.

3. **IY/MS Uzmani (`htft`)**
   - Gorevi: Ilk Yari / Mac Sonucu senaryolarini analiz etmek.
   - Kapsam: Ozellikle 1/1, 1/2 ve 2/1; altyapi dogrulanmis diger IY/MS kombinasyonlarini da yonlendirebilir.
   - Ozel feed: Dogrulanmis High Odds HTFT akisi mevcutsa `odds_verified:true` resmi Iddaa 1/2 ve 2/1 adaylari bu uzmana beslenir.
   - Temel kontrol: Resmi oran, dogrulanmis ilk yari yonu, senaryo olasiligi, ilk yari yon olasiligi, mac sonu yon olasiligi, kimlik/tarih eslesmesi, kadro ve veri riskleri.
   - Kural: Dogrulanmis upstream veri yoksa 1/1, 1/2 veya 2/1 uydurulmaz.

4. **Taraf Uzmani (`match_result`)**
   - Gorevi: Mac sonucu/taraf marketlerini analiz etmek.
   - Kapsam: MS 1, MS X ve MS 2.
   - Temel kontrol: Ana model sinyali, dogrulanmis market/oran verisi, veri kapsamı, kaynak ve risk kontrolleri.

5. **Canli Mac Analiz Robotu (`live-match-analysis`)**
   - Gorevi: Yalniz gercekten canli olan maclari anlik saha ici verilerle analiz etmek.
   - Kapsam: Mac yonu, sonraki gol egilimi, gol baski seviyesi, Team Power, Goal Power, momentum ve tek ana canli tahmin.
   - Veri kaynagi: Supabase Edge Function `fl-live-match-analysis` merkezi olarak ESPN canli scoreboard istatistiklerini toplar. GitHub saniyelik veri kaynagi degildir.
   - Calisma sikligi: Supabase Cron hedefi 10 saniyedir. Atomik collector kilidi ayni anda gereksiz cift provider sorgusunu engeller.
   - Realtime: Son durum `public.live_match_state` tablosunda tutulur; `realtime.send` ile public `live-match-analysis` Broadcast kanalina kompakt snapshot delta yayini yapilir. Site Broadcast'i dinler; 30 saniyelik Supabase REST kontrolu ve 30 dakikalik GitHub statik snapshoti yalniz fallback'tir.
   - Fail-closed kurali: Kaynak dogrulanmamis, snapshot gercek gozlem degil/interpolate edilmis, dakika cok erken, veri eski veya ortak istatistik kapsami yetersizse tahmin verilmez; kullaniciya bekleme nedeni gosterilir.
   - Model guveni: Sonuc olasiligi degildir. Canli sinyallerin tutarlilik/veri guvenidir.
   - Guvenlik: Browser yalniz publishable key + RLS ile current state okur; tabloya anon/authenticated yazma yetkisi yoktur. Collector yazimi Supabase backend secret key ile yapilir.

### Ortak beyin ve veri katmani

- **PRO ortak cekirdegi:** Takim formu, mac intelligence, sakat/cezali-kadro verisi mevcutsa takim durumu, transfer/sezon etkileri, sonuc hafizasi, resmi/dogrulanmis oranlar, olasilik ve value/edge hesaplari gibi ortak girdileri hazirlar.
- **Specialist Orchestrator V3:** Market adayini uygun uzmana yollar; uzman kararlarini kompakt bicimde saklar; block edilen marketin baska ham kaynaktan geri sizmasini engeller; uzmanlarin sonucunu tekrar tek PRO akisinda toplar.
- **Supabase `fl-pro-analysis`:** Uyelik korumali PRO projection katmanidir. Uzman kararlarini koruyarak canli PRO verisini sunar.

### Robot sayisina dahil olmayan ancak robot sistemine bagli moduller

- **AI Seffaflik Merkezi:** Robot degildir. Uzman robotlarin dogrulanmis analiz seceneklerini kullaniciya cesitli marketlerle gosteren gorunum/tuketici katmanidir.
- **Canli Guc Motoru (Team Power + Goal Power):** Robot degildir; 5. Canli Mac Analiz Robotuna gozlenen saha ici sinyalleri saglayan veri/gorsellestirme motorudur.
- **Spor Toto sistemi:** Haftalik 15 maclik ayri tahmin/veri akisidir. Uzman PRO robot sayisina dahil edilmez.
- **High Odds HTFT generator/feed:** Ayrica altinci robot sayilmaz. IY/MS Uzmanini dogrulanmis resmi 1/2 ve 2/1 adaylariyla besleyen ozel veri/aday uretim katmanidir.

### Mimari sayim kurali

- Resmi toplam robot sayisi: **5**.
- Mac oncesi PRO uzman robotlari: **4** (KG, Gol, IY/MS, Taraf).
- Gercek zamanli canli robot: **1** (Canli Mac Analiz Robotu).
- PRO ortak cekirdek + orkestrator: **1 ortak beyin katmani**, robot sayisina dahil degil.
- Canli Guc Motoru, Spor Toto ve AI Seffaflik: veri/motor/gorunum katmanlaridir; ayrica robot sayilmaz.
- Yeni bir uzman robot eklenecekse bu toplam sayi, gorev tanimi, market kapsami, veri kaynagi, test ve canli dogrulama bilgisi bu dosyada guncellenmeden is tamamlanmis sayilmaz.

## Canli Mac Analiz Robotu Islem Gunlugu

### 2026-09-18 - Realtime CSP ve dogru baglanti durumu V3

- Canli test bulgusu: Pages v2 run `35387486718` build ve deployment adimlarini basariyla tamamladi ancak gercek Chromium kontrolu fail etti. Ayri browser diagnostic run `35392161077` canli DOM ve console ciktisini dogruladi.
- Kok neden 1: `index.html` CSP `script-src` kurali `https://cdn.jsdelivr.net` kaynagini izinli saymadigi icin pinli `@supabase/supabase-js@2.107.0/+esm` dinamik importu browser tarafinda engelleniyordu. Console kaniti CSP ihlali ve `Failed to fetch dynamically imported module` hatasidir.
- Kok neden 2: CSP `connect-src` icinde proje WebSocket adresi `wss://lnngvkitcwwgrljtjwsd.supabase.co` acikca yoktu.
- Kok neden 3: REST current state yuklendiginde `applyRealtimePayload` yanlis bicimde `realtimeReady=true` yapiyor ve WebSocket gercekte baglanmasa bile UI `Akış: Supabase Realtime` gosterebiliyordu.
- Metin hatasi: Genel `site-human-language.js` donusumu Canli Guc alaninda `Robotu` kelimesini `Analiz sistemiu` biciminde bozuyordu. Canli robot bolumu generic humanizer kapsamindan cikartildi.
- Duzeltme: CSP script kaynagina yalniz `cdn.jsdelivr.net`, connect kaynagina yalniz proje Supabase WSS adresi eklendi; REST state artik Realtime flag acmaz; flag yalniz channel `SUBSCRIBED` durumunda acilir. Canli robot metni generic humanizer tarafindan degistirilmez.
- Regresyon: Statik test CSP CDN/WSS izinlerini, live center humanizer muafiyetini ve REST payloadin Realtime flag acmamasini kilitler. Pages browser testi exact robot basligi/karti + `Akış: Supabase Realtime` + console CSP/fallback hatasi yoklugunu zorunlu tutar.
- Canli test dayanikliligi: Tek Chromium acilisinda WebSocket aboneligi ile DOM dump arasinda zamanlama yarisi gorulebildigi icin Pages dogrulamasi en fazla 3 bagimsiz cache-busted browser oturumu kullanir. Her denemede gercek `Akış: Supabase Realtime`, robot karti ve temiz console zorunludur; `yedek snapshot` hicbir denemede basari sayilmaz.
- Cache/release: `20260918-live-realtime-v3`.
- Final kapanis: `fix/live-realtime-csp-truth-v3-20260918`, PR #88, Live Match Analysis CI run `35392775663` Node 20/24 `success`, merge commit `1f895d3193d800fa3193b34162ef5153ab84156d`. Sonraki main/data commitleriyle yeniden deploy edilen GitHub Pages run `35393816050` `success` tamamlandi. Gercek Chromium custom-domain testi ilk denemede `Akış: Supabase Realtime`, Canli Mac Analiz Robotu karti ve temiz console sartlarini gecti; test aninda ESPN canli=4, orneklenen=3, robot-ready=3 idi. PR #83 eski/cakismali ilk dal ve PR #86 gecici diagnostic dali merge edilmeden kapatildi.

### 2026-09-18 - Realtime abonelik durumunun UI'ya aninda yansitilmasi V2

- Canli test bulgusu: PR #84 merge commit `82a831f0fad6728fa7921d82302fcf1129ac1ac5` basariyla deploy edildi; build, artifact ve Pages deployment adimlari gecti. Ancak Pages run `35386824260` gercek Chromium dogrulamasinda `Akış: Supabase Realtime` etiketi gorulmedigi icin bilerek fail etti.
- Kok neden: Supabase channel callback'i `SUBSCRIBED` durumunda `state.realtimeReady=true` yapiyor fakat `render()` cagirmiyordu. Bu nedenle WebSocket baglantisi kurulsa dahi UI etiketi ancak sonraki Broadcast paketi geldikten sonra guncellenebiliyordu.
- Duzeltme: `SUBSCRIBED` aninda UI yeniden render edilir. `CHANNEL_ERROR`, `TIMED_OUT` veya `CLOSED` durumlarinda realtime flag kapatilir ve UI aninda fallback durumunu gosterir.
- Regresyon: `tests/live-power-center-static.test.js` SUBSCRIBED -> realtimeReady -> render ve kanal hata -> fallback render zincirlerini statik olarak kilitler.
- Cache: Canli UI surumu `20260918-live-realtime-v2` olarak artirildi. Pages gercek browser testi gevsetilmedi; custom domainde `Akış: Supabase Realtime` gorulmeden canli dogrulama basarili sayilmaz.
- Etkilenen dosyalar: `live-power-center-v1.js`, `tests/live-power-center-static.test.js`, `index.html`, `cache-version.js`, `.github/workflows/deploy-pages.yml`, `DONT_TOUCH.md`.
- Geri alma: Bu duzeltme yalniz Realtime baglanti durumunun UI render zamanlamasini degistirir; Supabase collector, Cron, robot skoru ve mevcut 30 dakikalik GitHub fallback mantigi degismez.

### 2026-09-18 - Supabase Realtime Canli Mac Analiz Robotu V1

- Amac: Canli Guc Motorunu yalniz grafik gosteren bir modul olmaktan cikarip, canli maclari ayri bir robotla analiz eden profesyonel gercek zamanli sisteme donusturmek.
- Mimari: GitHub saniyelik runtime'dan cikarildi. GitHub Pages kod/deploy ve 30 dakikalik statik fallback icin kullanilir. Asil runtime Supabase Edge Function + Postgres state + Cron + Realtime Broadcast'tir.
- Collector: `fl-live-match-analysis` Edge Function tek merkezi ESPN soccer scoreboard istegiyle gercekten canli maclari ve mevcut embedded istatistikleri toplar. Mac basina provider polling yapmaz.
- Sikilik: Supabase Cron `fl-live-analysis-10s` her 10 saniyede collector'u cagirir. `claim_live_collect_slot` atomik kilidi cift/erken calismalari engeller.
- State/Realtime: `public.live_match_state` tek current state kaydini tutar. Anon/authenticated yalniz SELECT yapabilir. Backend update sonrasi private trigger `realtime.send(..., 'snapshot', 'live-match-analysis', false)` ile kompakt delta yayini yapar.
- Robot ciktilari: mac yonu, sonraki gol egilimi, gol baskisi, Team Power, Goal Power, momentum, ana canli tahmin, evidence/model guveni ve aciklayici sinyaller.
- Fail-closed: minimum 8. dakika, minimum 3 ortak metrik / %37.5 kapsama, gercek observed snapshot ve taze veri zorunludur. Kosullar saglanmazsa `insufficient_data` / bekle sonucu uretilir.
- UI: `live-power-center-v1.js` once Supabase REST current state'i yukler, sonra public Realtime Broadcast'i dinler. Realtime paket yuklenemezse 30 saniyelik Supabase REST safety refresh; Supabase de kullanilamazsa GitHub statik `live-power-series.json + live-match-analysis.json` fallback'i kullanilir.
- Guvenlik: Browserda yalniz modern Supabase publishable key bulunur. Secret key kaynak koda girmez; Edge Function `SUPABASE_SECRET_KEYS` ortam degiskeninden admin client olusturur. Collector endpointi publishable-key kontrolu, server-only POST ve DB collector kilidi uygular.
- Supabase production ilk kanit: `live_match_state` collector_version=`fl-live-match-analysis-v1`, status=`ok`, 31 ESPN canli event icinden 12 mac orneklendi ve ilk kontrolde 12/12 robot-ready oldu. Cron kosulari 10 saniyelik aralikta `succeeded` kaydi verdi.
- Kaynak dosyalari: `supabase/functions/fl-live-match-analysis/index.ts`, `supabase/functions/fl-live-match-analysis/deno.json`, `supabase/sql/live-match-realtime-schema.sql`, `supabase/sql/live-match-realtime-cron.sql`, `scripts/live-match-analysis-robot.js`, `scripts/validate-live-match-analysis.js`, `live-power-center-v1.js`, `.github/workflows/live-power-series.yml`, `.github/workflows/live-match-analysis-ci.yml`, ilgili testler ve cache/deploy sozlesmesi.
- Kapanis referansi: Ilk implementasyon daha sonra temiz final PR #84 ve Realtime V2/V3 kok duzeltmeleriyle productiona alindi. Nihai custom-domain Realtime kaniti yukaridaki V3 kapanis kaydidir.
- Geri alma: Realtime UI/collector katmani ayriktir. Supabase Realtime gecici kullanilamazsa 30 dakikalik mevcut GitHub snapshot sistemi kullanici ekranini veri yokmus gibi birakmadan fallback olarak devam eder.

## PRO Robot Islem Gunlugu

### 2026-09-19 - PRO kaynak kapasitesi 32 MiB ve canli sifir-veri hatasi

- Kok neden: Resmi market zenginlestirme + Specialist Orchestrator V3 sonrasinda `data/robot-analysis.json` 23.44 MiB oldu. Eski `12 MiB` validator ve Supabase `fl-pro-analysis` kaynak tavanı workflow'u `validate-pro-source-size.js` adiminda durdurdu; canli health 200 olsa da 0 mac / 0 analiz secenegi dondu.
- Duzeltme: Hem `scripts/validate-pro-source-size.js` hem `supabase/functions/fl-pro-analysis/index.ts` icindeki korumali robot kaynak tavani 32 MiB'a cikarildi. Iki taraf ayni sabiti kullanir; limit hala sonlu ve fail-closed'dur.
- Kapsam: Yalniz kaynak tasima/okuma kapasitesi degisti. Model skoru, market esikleri, kupon kurallari, uyelik dogrulama, oran filtresi ve uzman karar mantigi degismedi.
- Test: `tests/pro-analysis-supabase-sync.test.js` Edge Function ve validator tarafinda 32 MiB sabitinin ayni olmasini zorunlu tutar.
- Canli tamamlama kriteri: CI yesil, PR main'e merge, Supabase Edge Function ayni kaynakla ACTIVE, `Update fixtures and High Value Engine` basarili, health >0 mac ve >0 analiz secenegi, ilgili market aileleri gorunur, ardindan canli site uye akisi tarayici ile test edilmis olacak.


### 2026-09-18 - AI Seffaflik IY/MS gorunurluk onceligi duzeltmesi

- Kok neden: Productionda IY/MS Uzmani dogrulanmis 1/2 ve 2/1 adaylari uretiyordu; ancak `analysis-insights-v1.js` market siniflandirmasi slash temizlendikten sonra `1 2` / `2 1` bicimini ayri HTFT ailesi olarak tanimadigi icin bu secimler `other` ailesine dusuyor ve 10 kartlik AI Seffaflik cesitlilik gecisinde garanti oncelik alamiyordu.
- Duzeltme: AI Seffaflik market siniflandirmasina ayri `htft` ailesi eklendi. IY/MS ailesine `familyBonus=1075`, aile kotasi `2` verildi ve `preferredOrder` icinde half-BTTS sonrasina yerlestirildi. Boylece uygun/dogrulanmis IY/MS adayi varsa ilk cesitlilik gecisinde en az bir HTFT karti secilmeye aday olur; veri yoksa market uydurulmaz.
- Kapsam: 1/1, 1/X, 1/2, X/1, X/X, X/2, 2/1, 2/X, 2/2 gibi kanonik IY/MS desenleri routing seviyesinde `htft` ailesine girer. Mevcut resmi High Odds feed yalniz dogrulanmis 1/2 ve 2/1 adaylarini beslemeye devam eder.
- Korunan kurallar: `odd < 1.45`, `specialist_eligible:false`, `specialist_decision=block`, bagimsiz kanit yoklugu ve model skoru alt siniri filtreleri degismedi. IY/MS yalniz mevcut uygun adaylardan secilir; secim sayisini doldurmak icin sahte market olusturulmaz.
- Etkilenen dosyalar: `analysis-insights-v1.js`, `tests/transparency-market-options.test.js`, `DONT_TOUCH.md`.
- Regresyon: `transparency-market-options.test.js` artik AI Seffaflik kaynak kodunda HTFT ailesi, bonus, aile kotasi ve `preferredOrder` kilidini kontrol eder.
- Gelistirme dali / PR / CI / canli: `fix/transparency-htft-priority-20260918`, PR #80. PRO Market Specialist CI run `35383256869` Node 20 ve Node 24 matrislerinde `success` tamamlandi. PR squash merge commit `e45b2fd9a60e23f989f00f18dead082296a0f75e` ile `main`e alindi. GitHub Pages run `35383518152` `success` tamamlandi ve custom domain gercek tarayici dogrulama adimi basarili gecti.
- Geri alma: Yalniz AI Seffaflik siniflandirma/siralama katmani degisir; PRO model olasiliklari, uzman gate'leri, Supabase projection, uyelik ve kupon motoru degismez.


### 2026-09-18 - IY/MS uzman robotu production dogrulama kapanisi

- Sonuc: V2 ile baslayan dogrulanmis HTFT feed baglantisi productionda tamamlandi; sonraki kompakt persistence gelistirmesiyle orkestrator `robot-specialist-orchestrator-v3` olarak calismaya devam ediyor.
- CI: PR #76 specialist regresyon matrisi Node 20 ve Node 24 kosularinda basarili tamamlandi; PR main'e merge edildi.
- Production HTFT: High Odds HTFT Daily Scan run `35367216264` basarili. 199 mac tarandi, 3 dogrulanmis resmi Iddaa IY/MS karti uretildi; V4 HTFT specialist 37 adayi kontrol etti, 19 adayi reddetti, 3 kart yayina uygun kaldi.
- Orkestrator production sonucu: Ana writer run `35372171761` basarili. `robot-specialist-orchestrator-v3` 193 mac icinde HTFT icin `candidate_count=3`, `eligible_count=3`, `ready_match_count=3`, `supplemental_candidate_count=3` raporladi. Feed `status=ready`, `verified_pick_count=3`.
- Diger uzmanlar ayni production kosusunda calismaya devam etti: BTTS 391 aday / 391 eligible, goals 280 aday / 263 eligible, match_result 551 aday / 551 eligible. HTFT entegrasyonu diger market ailelerini sifirlamadi.
- Canli yayin: Sonraki GitHub Pages workflow kosulari basarili tamamlandi; ana veri writer ve HTFT workflow ciktisi main'e yazildi.
- Supabase: `fl-pro-analysis` ACTIVE ve kompakt specialist kararlarini okuyan production projection surumunde. Specialist kararlar protected projection akisini beslemeye devam ediyor.
- Guvenlik/provenance: Yalniz `odds_verified:true` resmi Iddaa 1/2 ve 2/1 feed adaylari kullanilir; tarih/kimlik uyusmazliginda feed baglanmaz. Dogrulanmis upstream 1/1 verisi yoksa 1/1 uydurulmaz.
- Kapanis: Daha once 'tamamlanmamis tek bolum' olarak raporlanan HTFT PR/CI -> main -> production dogrulama zinciri TAMAMLANDI.


### 2026-09-18 - Uzman robot persistence kompaktlastirma / Supabase stale-cache kok duzeltmesi

- Kok neden: IY/MS V2 canli kosusu basarili olup 221 macta HTFT havuzunu 0'dan 3 dogrulanmis adaya cikardi; ancak uzman ciktisi her mac icinde `analysis_options` verisini `specialist_outputs.candidates` altinda tam detayli ikinci kez kopyaladigi icin `data/robot-analysis.json` Supabase `fl-pro-analysis` kaynak koruma siniri olan 12 MiB'nin ustune cikti. Supabase yeni GitHub kaynagini okuyamayinca eski `pro_analysis_cache` last-good verisine dustu; bu nedenle canli projection HTFT yeniligini goremedi.
- Mimari duzeltme: `robot-specialist-orchestrator-v3` detayli aday kopyalarini kalici JSON'dan kaldirir. Her mac icin yalniz kompakt `specialist_market_decisions` (market, robot, karar, uygunluk, kalite, kaynak) ve ozet `specialist_outputs` sayaçlari saklanir. Mevcut `analysis_options` / `goal_market_candidates` satirlari yalniz kompakt specialist karar alanlariyla isaretlenir. Dogrulanmis High Odds 1/2-2/1 supplemental adayi gerekli alanlarla `analysis_options` icine tek kez eklenir.
- Fail-closed davranis: Supabase protected projection V3 kompakt karar haritasini authoritative kabul eder; `block` / `eligible:false` market ham analysis_options, goal candidate veya primary satirindan tekrar giremez. Rolling deployment icin eski V2 `specialist_outputs.candidates` bicimi de gecici fallback olarak okunabilir.
- Kaynak boyutu kapisi: `scripts/validate-pro-source-size.js` `data/robot-analysis.json` icin 12 MiB hard limit uygular. Ana writer, High Odds HTFT publish retry, package export/update akisları ve Node 20/24 specialist CI bu kontrolden gecmeden veri yayinlayamaz. Limit yukseltilerek sorun ortulmez.
- Health gozlemlenebilirligi: Supabase health market ailelerine `htft` tanimi eklendi; korumali projection kompakt specialist kararlarini okuyarak 1/2 ve 2/1 seceneklerini tasir.
- Etkilenen dosyalar: `scripts/robot-specialist-orchestrator.js`, `scripts/validate-pro-source-size.js`, `tests/robot-specialist-orchestrator.test.js`, `tests/pro-analysis-supabase-sync.test.js`, `supabase/functions/fl-pro-analysis/index.ts`, `.github/workflows/update-fixtures.yml`, `.github/workflows/high-odds-htft.yml`, `.github/workflows/pro-market-specialist-ci.yml`, `package.json`, `DONT_TOUCH.md`.
- Onceki canli kanit: PR #76 merge commit `5d17b8f14deb4d71621538dc236b3a794b4b3c9d`; High Odds HTFT run `35367216264` success: 199 mac tarandi, 3 dogrulanmis kart uretildi; orchestrator V2 `htft candidate_count=3`, `eligible_count=3`, `ready_match_count=3`, `supplemental_candidate_count=3` raporladi ve `717a6de51fdbd3085ba282521cc1c70e1eddbedc` veri commitini main'e yazdi.
- Stale-cache kaniti: Production Supabase health 200 donmesine ragmen `pro_analysis_cache` source_generated_at `2026-09-18T13:11:50.928Z`, HTFT option count 0 olarak kaldi; GitHub main ise daha yeni V2 verisini tasiyordu. Bu fark source boyut korumasinin last-good cache'e dusurdugunu ortaya cikardi.
- Test/canli dogrulama: Bu kayit V3 PR CI, gercek data size sonucu, main merge, High Odds/main writer ve Supabase fresh health/cache dogrulamasindan sonra final run/commit bilgileriyle tamamlanacak.
- Geri alma: Kompakt persistence yalniz uzman meta verisinin saklama bicimini degistirir; ana model olasiliklari, resmi oran kaynagi, market gate esikleri ve UI sozlesmesi degismez. Gerekirse V3 persistence commit'i geri alinabilir ancak 12 MiB kaynak kapisi stale-cache tekrarini onlemek icin korunmalidir.


### 2026-09-18 - IY/MS uzman robotuna dogrulanmis HTFT feed baglantisi V2

- Kok neden: Orkestrator V1 canli ana writer kosusunda 221 mac / 1354 uzman adayi uretmesine ragmen `htft` havuzu sifir kaldi. Ayrik `data/high-odds-htft.json` akisinda ayni gun icin dogrulanmis resmi Iddaa 1/2 ve 2/1 adaylari bulunuyordu; bu veri ana `robot-analysis.json` uzman ciktisina geri bagli degildi.
- Degisiklik: `robot-specialist-orchestrator-v2`, `data/high-odds-htft.json` icindeki yalniz `odds_verified:true` ve 1/2 veya 2/1 secimlerini resmi etkinlik kimligi / ortak mac kodu / ayni tarih + takim kimligi ile eslestirip `verified_high_odds_htft` kaynagiyla IY/MS uzman havuzuna ekler. Tarih uyusmazsa feed kullanilmaz. Ayni markette dogrulanmis HTFT feedi ham adaya onceliklidir.
- 1/1 kapsami: IY/MS uzman modulu 1/1 ve diger IY/MS kombinasyonlarini routing seviyesinde desteklemeye devam eder; ancak bu ek feed yalniz mevcut resmi yuksek oranli ters-sonuc kaynaginin 1/2 ve 2/1 marketlerini besler. Dogrulanmis upstream 1/1 verisi yoksa 1/1 uydurulmaz.
- Workflow guvenligi: `high-odds-htft.yml` feedi ureterek HTFT V4 gate'inden gecirdikten sonra orkestratoru calistirir. Publish retry dongusu her denemede once en guncel `origin/main` robot verisini alir, sonra dogrulanmis HTFT feedini yeniden uygular; yavas bir HTFT kosusu daha yeni ana writer `robot-analysis.json` snapshot'ini ezemez.
- Etkilenen dosyalar: `scripts/robot-specialist-orchestrator.js`, `tests/robot-specialist-orchestrator.test.js`, `.github/workflows/high-odds-htft.yml`, `DONT_TOUCH.md`.
- Test sozlesmesi: Sentetik dogrulanmis 2/1 feed adayi ayni maca eklenmeli; `specialist_source=verified_high_odds_htft` olmali; eski tarihli feed ayni maca tasinmamali; dogrulanmamis mevcut 1/2 adayi fail-closed bloklu kalmali. PRO Market Specialist CI Node 20/24 basarisi olmadan main'e alinmaz.
- Canli dogrulama kriteri: Merge sonrasi High Odds HTFT workflow'u basarili bitmeli ve orkestrator V2 logunda `htft` / `supplemental_candidate_count` dogrulanmis feed varsa sifirdan buyuk olmali. Feed o kosuda yeterli resmi aday bulamazsa sistem market uydurmayacak ve sifir degeri guvenli sonuc sayilacaktir.
- Geri alma: Supplemental HTFT feed okuma ve high-odds workflow merge adimi ayriktir. Geri alindiginda V1 ana market routing davranisi korunur; KG, gol ve taraf uzmanlari etkilenmez.


### 2026-09-18 - Ortak cekirdek + ayri uzman robot orkestrasyonu V1

- Amac/kok neden: PRO motorunda KG, gol, IY/MS ve taraf marketleri ayni ana skorlayicida birlikte uretiliyor; gol ve ters IY/MS icin ayri uzman kapilari zaten bulunuyordu. Mimariyi buyuturken tek dev robotta degisikliklerin birbirini bozmasini azaltmak ve her market ailesini bagimsiz test edilebilir hale getirmek.
- Mimari: Ana veri toplama, takim/match intelligence, dogrulanmis oran/provenance ve ana olasilik motoru ortak cekirdek olarak korunur. Bunun ustune `KG Uzmani`, `Gol Uzmani`, `IY/MS Uzmani` ve `Taraf Uzmani` ayri moduller olarak calisir. `robot-specialist-orchestrator-v1` mevcut `analysis_options`, `goal_market_candidates` ve ana secimi kanonik market ailelerine yonlendirir, uzman sonuclarini tekrar tek match nesnesinde `specialist_outputs` altinda toplar.
- Degismezlik kurali: Orkestrator ana `recommended_market` veya model olasiligini kendiliginden yukselterek yeniden yazmaz. Uzman katman yalniz mevcut V4 gate kararlarini uygular; `block` edilen bir aday ham analysis_options satirindan tekrar PRO projection'a sizamaz.
- Fail-closed projection kilidi: Supabase projection specialist `block` kararlarini kanonik market tombstone setine yazar; ayni market `analysis_options`, `goal_market_candidates` veya primary satirindan yeniden giremez. Bu kilit `tests/pro-analysis-supabase-sync.test.js` ile statik regresyon olarak korunur.
- Uzmanlar: `btts` -> KG Var/Yok + Ilk Yari KG + Ikinci Yari KG; `goals` -> 2.5/3.5/6+; `htft` -> 1/1, 1/2, 2/1 ve diger IY/MS kombinasyonlari; `match_result` -> MS 1/X/2. Canli Guc Motoru ve Spor Toto kendi mevcut veri akislarinda bagimsiz kalir; AI Seffaflik/Supabase projection uzman ciktilarini birlestiren tuketici katmandir.
- Veri/provenance: `raw_market_guess_odds` kaynakli adaylar uzman havuzuna alinmaz. 3.5/6+ mevcut goal specialist fail-closed kurallarini, 1/2 ve 2/1 mevcut HTFT V4 dogrulanmis ilk yari/oran kurallarini kullanir. Dusuk oran 1.45 ve ortak value gate kurallari degismedi.
- Etkilenen dosyalar: `scripts/robot-specialist-orchestrator.js`, `scripts/robot-specialists/shared.js`, `scripts/robot-specialists/btts-specialist.js`, `scripts/robot-specialists/goals-specialist.js`, `scripts/robot-specialists/htft-specialist.js`, `scripts/robot-specialists/match-result-specialist.js`, `tests/robot-specialist-orchestrator.test.js`, `package.json`, `.github/workflows/update-fixtures.yml`, `.github/workflows/pro-market-specialist-ci.yml`, `supabase/functions/fl-pro-analysis/index.ts`.
- Korunan dosyalar: `index.html`, `daily-matches-widget.js`, uyelik/odeme akisi ve mevcut kupon uretim sozlesmesi bu degisiklikte yeniden yazilmadi.
- Test: Gelistirme dali acildi; hedef unit/regresyon ve Node 20/24 CI sonucu PR acildiktan sonra bu kayda islenecek. Test basarisizsa main'e alinmayacak.
- Canli dogrulama: Main merge, ana writer veri uretimi, Supabase protected projection ve GitHub Pages kullanici akisi dogrulanmadan tamamlandi sayilmayacak.
- Gelistirme dali: `feat/specialist-robot-orchestrator-20260918`.
- Geri alma: Yeni orkestrator ve uzman wrapper dosyalari ayrik katmandir. Workflow adimi ve Supabase specialist-first projection baglantisi geri alindiginda mevcut V4 gate/ana PRO motoru aynen calismaya devam eder.


### 2026-09-18 - Resmi Iddaa coklu market senkronunun ana veri hattina baglanmasi

- Amac/kok neden: AI Seffaflik ve PRO projection coklu marketleri okuyabiliyordu ancak guncel fixture hattinda KG, Ilk Yari KG, Ikinci Yari KG, IY/2Y KG, 3.5 ve 6+ icin dogrulanmis resmi fiyatlar tutarli sekilde tasinmiyordu. Ayrica 6+ etiketi normalize edilirken `+` isareti kayboldugu icin guvenli parser gercek `6+` secimini kacirabiliyordu.
- Yapilan degisiklik: `scripts/sync-iddaa-markets.js` resmi Iddaa ana bultenini fixture'larla fail-closed eslestirir; en yakin 24 eslesen mac icin etkinlik detayindan 2Y KG, IY/2Y KG ve 6+ dahil genis marketleri tamamlar. `6+` outcome'u normalize edilmeden once `plus` semantigine cevrilir; yalniz `6` etiketi 6+ sayilmaz.
- Etkilenen akislar/dosyalar: `scripts/sync-iddaa-markets.js`, `scripts/iddaa-data-source.js`, `tests/iddaa-market-sync.test.js`, `tests/iddaa-data-source.test.js`, `.github/workflows/update-fixtures.yml`, `.github/workflows/pro-market-specialist-ci.yml`, `package.json`.
- Etkilenen marketler: KG Var/Yok, Ilk Yari KG, Ikinci Yari KG, IY/2Y KG kombinasyonlari, 3.5 Alt/Ust ve 6+ Gol. Mevcut 1.45 minimum oran, value gate ve specialist fail-closed kurallari degismedi.
- Provenance: Yalniz acik isimli resmi Iddaa outcome'lari canonical alana tasinir. Belirsiz/coklu kimlik eslesmesinde veri baglanmaz; `raw_market_guess_odds` dogrulanmis sayilmaz.
- Test: `iddaa-data-source.test.js` gercek `6+` etiketinin 6+ olarak tutulmasini ve yalniz `6` etiketinin reddedilmesini kilitler. `iddaa-market-sync.test.js` fixture eslestirme, yarim KG, 3.5 ve 6+ tasimasini ve eslesmeyen maca veri sizmamasini test eder. PRO Market Specialist CI Node 20/24 matrisiyle calistirilir.
- Canli dogrulama kriteri: PR merge sonrasi ana veri workflow'u basarili bitmeli; fixture/robot ciktisinda dogrulanmis ilgili market sayilari sifirdan buyukse Supabase PRO health ve AI Seffaflik market ailelerine yansimasi kontrol edilmelidir.
- Gelistirme dali / PR: `feat/official-iddaa-market-sync-20260918`, PR #71. Dal guncel `main` uzerine temizce yeniden oturtuldu.
- Geri alma: Senkron adimi ayri ve `continue-on-error` katmanidir; yeni script/workflow adimi geri alinabilir. Mevcut PRO motoru ve korunan UI dosyalari yeniden yazilmaz.

### 2026-09-18 - Supabase gecisi sonrasi Pages guvenlik testi duzeltmesi

- Kok neden: GitHub Pages buildindeki `tests/security-legal.test.js`, eski mimariden kalan Vercel domaini ve `SECURE_API_ORIGIN` sabitini zorunlu tutuyordu. Supabase gecisi dogru oldugu halde build bu eski beklenti nedeniyle fail oluyordu.
- Duzeltme: Guvenlik testi artik aktif `fl-pro-analysis` Supabase endpointini ve `PRO_ANALYSIS_ENDPOINT` sabitini zorunlu tutar; premium runtime icinde `futbol-laboratuvari.vercel.app` bulunmasini acikca reddeder. Test PRO Market Specialist CI matrisine eklendi.
- Etki: Robot tahmin mantigi, uyelik, odeme, oran veya market esikleri degismedi. Yalniz canli build guvenlik sozlesmesi yeni mimariye esitlendi.


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
