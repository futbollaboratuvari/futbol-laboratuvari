# Dokunulmaz Dosyalar ve Koruma Kurallari

Bu dosya calisan alanlari korumak icindir. Yeni is yaparken once bu dosya okunur.

## Ana kaynak ve calisma sozlesmesi

1. Futbol Laboratuvari sisteminin ana ve kalici kaynak deposu GitHub'dir: `futbollaboratuvari/futbol-laboratuvari`.
2. Kod, veri akislarinin tanimi, workflow'lar, PRO Robot gelistirmeleri ve koruma kurallari icin tek kaynak gercegi GitHub `main` dalidir.
3. Her inceleme, hata arama, gelistirme veya duzeltme isinde once bu repo ve bu `DONT_TOUCH.md` dosyasi okunur. Kullaniciya GitHub'a tasindigini tekrar sordurmak veya hatirlatmak gerekmez.
4. Vercel yalnizca deploy, runtime, domain ve canli servis dogrulamasi icin kullanilir. Vercel'deki eski bir production/preview deploy'u kaynak kodun guncel durumunun yerine gecmez.
5. Canli sitede bir sorun gorulurse once GitHub `main` dalindaki guncel kod ve veri akisi kontrol edilir; sonra deploy/runtime ile karsilastirilir.
6. Kalici kod degisiklikleri GitHub uzerinden yapilir. Kullanici acikca farkli bir yol istemedikce canli ortama GitHub disindan elle yama uygulanmaz.
7. Yeni PRO Robot gelistirmeleri mevcut motoru bozmayacak sekilde ayrik, geri alinabilir katmanlar halinde eklenir; test edilmeden `main`e alinmaz.
8. Kullanici sadece salt okunur kontrol/rapor istediyse GitHub dosyalari degistirilmez.
9. GitHub Pages canli on yuz yayincisidir; Vercel `futbol-laboratuvari.vercel.app` korumali API/backend runtime'idir. Bu iki rol birbirine karistirilmaz.
10. Vercel backend kodu yalniz GitHub `main` backend degisikliklerinden otomatik deploy edilir. Salt `data/` veya rapor commitleri Vercel deployment tetiklemez.
11. `data/pro-analysis-index.json` uyelik korumali projection oldugu icin public GitHub reposuna commit edilmez. PRO API, uyelik dogrulandiktan sonra GitHub `main` icindeki guncel `data/robot-analysis.json` ve sonuc hafizasindan projection'i sunucu tarafinda olusturur.
12. GitHub canli veri okumasi gecici olarak basarisiz olursa Vercel deployment icindeki son saglam PRO index fallback olarak kullanilir; bu fallback ana kaynak sayilmaz ve GitHub erisimi duzelince otomatik olarak guncel veriye donulur.
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
12. Canliya alinan kritik degisiklikte GitHub `main`, Vercel backend ve ilgili veri workflow'u uygun oldugu olcude kontrol edilir. Yalniz kod commit'i canli dogrulama yerine gecmez.
13. Uyenin satin aldigi PRO davranisini etkileyen esik veya market degisikligi kayit altina alinmadan sessizce degistirilmez.
14. Dusuk oran filtresi korunur. 1.26-1.30 gibi dusuk oranlar PRO kupon seciminde kullanilmaz. Mevcut kupon motorunun alt oran esigi `1.45`tir; bu deger ancak bilincli bir gelistirme ile degistirilir ve degisiklik bu sozlesmeye kaydedilir.
15. PRO Robotun hedef market kapsami su an icin en az: KG Var/Yok analizi, 2.5 Alt/Ust, 3.5 Alt/Ust, 6+ Gol, Ilk Yari KG, Ikinci Yari KG, Ilk Yari/Mac Sonucu ve ozellikle 1/1, 1/2, 2/1 surpiz kombinasyonlari. Bir market devre disi kalirsa nedeni gunluge yazilir.
16. Analizde mumkun oldugu olcude guncel sezon formu, sakat/cezali oyuncular, kadro/ilk 11, transfer etkisi, takim ve rakip eslesmesi, sonuc hafizasi ve dogrulanmis oran verisi kullanilir. Veri yoksa robot bunu veri varmis gibi uydurmaz; risk/veri eksigi belirtilir.
17. PRO Robot islem gunlugu silinmez veya geriye donuk kayit kaybettirecek sekilde yeniden yazilmaz. Yanlis bir kayit varsa silmek yerine duzeltme kaydi eklenir.
18. Kupon uygunlugunda oran tek basina kalite sinyali sayilmaz. Model olasiligi, piyasa olasiligi, edge ve beklenen deger birlikte kontrol edilir. Edge kaydi ile olasiliklardan turetilen edge belirgin bicimde celisirse secim kupona giremez.
19. `pro-goal-market-bridge` tarafinda bagimsiz gol modeli farki ile kullaniciya gosterilen nihai olasilik farki ayni edge kavrami degildir. Kupon/value kapisinda kanonik edge her zaman `estimated_probability - market_probability` olur. Goal bridge eski/bagimsiz edge tasiyorsa kupon kapisi bunu nihai olasilik edge'ine normalize eder; diger marketlerde 1.5 puanlik tutarsizlik freni devam eder.

## PRO Robot Islem Gunlugu

### 2026-09-18 - Tek scheduled veri yazari / concurrency starvation duzeltmesi

- Kok neden: `Update fixtures and High Value Engine`, `Live Data Trigger`, `Derived Data Pipeline` ve `Auto relaxed analysis` ayni `futbol-main-data-writer` concurrency grubunda birbirine yakin cronlarla calisiyordu. GitHub ayni grupta bir calisan ve bir bekleyen run tuttugu icin yeni pending run geldikce eski pending writer job baslamadan iptal olabiliyordu; T60/T30/T10 canli veri dogrulamasi bu nedenle baslayamadi.
- Mimari duzeltme: Tek otomatik zamanlayici `Update fixtures and High Value Engine` olarak birakildi ve 15 dakikada bir calisir. Live Data, Derived Data ve Auto Relaxed workflow'larinin `schedule` bloklari kaldirildi; `workflow_dispatch`/trigger dosyasi fallback yollari korunur.
- Yazma guvenligi: Dort writer da ayni `futbol-main-data-writer` concurrency grubunda ve `cancel-in-progress: false` kalir. Manuel fallback tetiklenirse ana writer ile ayni anda veri yazamaz; ayri concurrency gruplarina bolunerek veri yarisi yaratilmadi.
- Ana writer kapsami: Mackolik erken pencere ve tam Python kaynak toplayici, fixture/bulten yenileme, player intelligence, acik haber, kadro/ilk 11, source consensus, ic-dis saha, puan/momentum, lig yapisi, istatistik hafizasi, takim stili, T60/T30/T10 final kontrolu, team-status apply, band/card sinyalleri, market provenance guard, PRO export, goal market specialist, sonuc/ogrenme ve Spor Toto finalizasyonu tek seri akis icinde korunur.
- Provenance: Tahmini/etiketsiz ham market yasagi degismedi. `market-provenance.test.js` ve `market-provenance-guard.js` ana writer icinde PRO exportundan once zorunlu calisir.
- Market etkisi: Market esikleri veya model olasiliklari degistirilmedi. Bu is workflow orkestrasyonu ve veri tazeligi duzeltmesidir; T60/T30/T10 ve mevcut value/market uzman kurallari aynen korunur.
- Test: Gecici `Writer Concurrency CI` tek scheduled writer oldugunu, tum fallback writer'larin ortak concurrency grubunda kaldigini ve ana writer'in full Python collector, source consensus, T60/T30/T10, provenance ve market-specialist adimlarini icerdigini dogruladi. Ayrica market-provenance, pre-match, value, 3.5/6+, market-specialist, team intelligence, matchup ve source-consensus regresyonlari basarili.
- Gelistirme dali: `fix/data-writer-concurrency-starvation`.
- Canli dogrulama: Merge sonrasi `ops/update-fixtures-trigger.txt` ile tek ana writer gercek `main` uzerinde tetiklenecek; job completion ve `data/pre-match-final-check.json` ciktisi dogrulandiginda bu kayit final run/commit bilgisiyle guncellenecek.
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
