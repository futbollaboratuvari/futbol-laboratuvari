# Session Log

2026-08-30

Üyelik kodu kullanıcı deneyimi tamamlama oturumu kaydedildi.

Summary:
- Kullanıcı onayıyla üyelik kodu alanı Özel Analiz başlığının altına, maç seçiminden önce kalıcı kart olarak taşındı; ana menüye “Üyelik Kodum Var” bağlantısı eklendi.
- Eski “Kodu Kontrol Et ve Analiz Et” birleşik işlemi kaldırıldı. Kod doğrulama PRO verisini güvenli sunucudan açar fakat analiz hakkı tüketmez; hak yalnız gerçek analiz oluşturulurken sunucuda düşer.
- Kod girişine göster/gizle kontrolü, doğrulama yükleme ve hata durumları eklendi. Aktif durumda paket adı, kalan hak, maskeli kod, “Analize Başla” ve “Kodu Değiştir” gösterilir.
- Ödeme onayı ekranına “Kodu Kullan ve Özel Analize Git” geçişi eklendi; kod URL veya statik sayfa kaynağına yazılmaz.
- Canlı ilk kontrolde yeni menü hedefinin Özel Analiz ana panelini açmadan gizli alt karta kaydığı görüldü. Menü/doğrudan hash ve ödeme geçişleri ana paneli önce açacak şekilde düzeltildi.
- Supabase snake_case üyelik alanları normalize edildi ve iki kez hak düşme riski giderildi. Hakkı sıfır olan üyelikte korumalı PRO yanıtı sunucu tarafından 403 ile engellenir.
- JavaScript sözdizimi, premium, kupon uygunluğu, performans, güvenlik/yasal ve tam üretim paketi kontrolleri geçti. Build sırasında yenilenen veri çıktıları geri alındı; bülten/robot/kupon verileri çalışmanın parçası olarak değiştirilmedi.

2026-08-27

Yarım kalan işleri kesin tamamlama oturumu kaydedildi.

Summary:
- Çalışma güncel GitHub `main` durumu üzerinden yürütüldü; tamamlanmış UI, üyelik/ödeme, Kuponum, DNS/CNAME ve veri ayrımı yeniden yazılmadı.
- Canlı güçte workflow'un yeşil olup snapshot üretememesinin kök nedeni ESPN Summary 403/404 bağımlılığı ve Scoreboard içindeki kullanılabilir istatistiklerin okunmamasıydı. Scoreboard gömülü istatistikleri, Core/Summary ve anahtarsız TheSportsDB event stats ayrı adaptörler olarak bağlandı.
- Eksik canlı metrikler `0` yapılmadı; xG/dangerous attacks tahmin edilmedi; metrik coverage yayımlandı; yalnız gerçek gözlem snapshot sayıldı ve geçici provider hatasında son doğrulanmış kayıtlar korundu.
- Live Power Actions koşusu `33036466175` test, collector, JSON validation, commit, rebase ve push dahil başarılı tamamlandı. Ağ koşusunda siteyle eşleşen canlı maç olmadığından 0 snapshot dürüst bekleme/no-stats sonucudur.
- Önceki fixtures koşusundaki son push hatasının concurrency değil, `data/robot_match_archive.json` dosyasının GitHub 100 MiB limitini 100.07 MiB ile aşması olduğu job loglarıyla kanıtlandı. Arşiv kayıpsız kompakt yazıma alınarak yaklaşık 56.1 MB'a indirildi; 95 MiB boyut policy testi eklendi.
- Ana veri writer workflow'larına ortak concurrency, pull/rebase/autostash, üretim sonrası JSON/boyut/test doğrulaması, sınırlı push retry ve yalnız kendi çıktılarını stage etme kuralları uygulandı. İzole Fixtures `33064982178` ve Live Data `33065258620` koşularının bütün adımları başarılıdır.
- En güçlü tahmin listesi için builder ve frontend'in kullandığı ortak uygunluk modülü eklendi. Kupon, PRO-ready ve izleme kademeleri kesin ayrıldı; izleme kartı kupon adayı dili kullanmıyor.
- Futbolcu intelligence regresyonunda, fikstürden önce başka kulübe transfer olmuş oyuncunun eski takım eksiklerinde kalması düzeltildi; gelecekteki transfer bugüne uygulanmıyor ve daha yeni giriş kaydı doğru takımı geri kurabiliyor.
- Özel Analiz, takım/futbolcu intelligence, PRO, Spor Toto, sonuç ve performance alanları mevcut tasarım korunarak regresyon testinden geçti. Spor Toto üretim testi tam 15 maç, doğru sıra ve boş kart olmadan geçti.
- Toplam 15 test dosyası, değişen JS sözdizimi, 637 JSON parse, conflict marker taraması ve production build başarılıdır.
- Production ana sayfa ve gerekli JS/JSON uçları HTTP 200 verdi; ortak uygunluk modülü, kupona uygun olmayan izleme etiketi, tam 15 Spor Toto kartı ve 320/360/390/430 px yatay taşmasız Özel Analiz/Canlı Güç/Spor Toto renderı doğrulandı. Son veri Pages koşusu `33065462579` başarılıdır.
- Kod tamamlanmıştır; harici sağlayıcı/site eşleşmesi olmayan saatlerde canlı doğrulanmış snapshot beklenir ve sistem aktif veri varmış gibi göstermez.

2026-06-28

Memory files were added.

Start every new task by reading the repo memory files.

2026-06-28

End logging rule added to WORKING_PROTOCOL.md: every work session must update SESSION_LOG.md. If project state changes, CURRENT_STATE.md must also be updated.

2026-06-28

START_HERE.md was added as the first gate for new chats. Trigger phrase: futbollaboratuvari proje calismasi.

2026-06-28

Chat memory confirmation session recorded.

Summary:
- User triggered Futbol Laboratuvari project work.
- START_HERE.md was found and read.
- Required memory files were read: PROJECT_MEMORY.md, WORKING_PROTOCOL.md, DONT_TOUCH.md, CURRENT_STATE.md, STATE.md, SESSION_LOG.md.
- LAST_WORK_REPORT.md was referenced in PROJECT_MEMORY.md but was not found in the repo.
- User confirmed repo memory files are the chat/project memory for this workspace.
- No site, data, bulletin, widget, workflow, coupon panel, or analysis button files were changed.
- Current project rule remains: keep bulletin stable, keep matches and live_matches separated, protect Kuponum and Analiz Et.

2026-06-28

Bulletin data flow repair session recorded.

Summary:
- User asked to find and fix the broken football bulletin data flow without breaking the existing robot structure.
- Diagnosis: site was reading the JSON files correctly, but full-bulletin/live data were empty because the data production layer was failing.
- Confirmed critical issue: robot-side ham_mac_havuzu.json was empty/invalid and Mackolik report showed JSON read failure, so the robot could find matches but could not safely write them into the robot data store.
- Added scripts/ensure-robot-raw-pool-json.js as a small guard that validates the robot data JSON and rebuilds a valid empty schema if needed.
- Hardened .github/workflows/update-fixtures.yml commit step so conflict-marker cleanup and JSON validation run after git pull --rebase --autostash and before committing outputs.
- Added .github/workflows/repair-robot-data.yml to repair the robot data JSON through GitHub Actions without touching site/widget files.
- Updated CURRENT_STATE.md with the repair focus.
- Did not change daily-matches-widget.js, index.html, Kuponum panel, Analiz Et button, matches/live_matches separation, or main bulletin rendering logic.
- Direct update/delete of bu-klas-r-i-in-basit/data/ham_mac_havuzu.json and ops/main-run.txt was blocked by safety filters; repair workflow was added as the safe path.

2026-06-28

Bulletin repair test session recorded.

Summary:
- User asked to test the fix and report on the existing robot structure.
- Live site HTML still shows 0 matches / preparing state.
- GitHub data files still show full-bulletin waiting, live-matches waiting, and site ham_mac_havuzu match_count 0.
- Robot-side bu-klas-r-i-in-basit/data/ham_mac_havuzu.json is still empty in main, so the repair has not yet been applied to the actual robot data file.
- Local scenario test of scripts/ensure-robot-raw-pool-json.js passed for missing file, valid file, and invalid file cases.
- Search confirmed conflict markers still exist in bu-klas-r-i-in-basit/outputs/mackolik_veri_cekme_raporu.md, while other hits are expected marker-handling scripts or memory notes.
- Current conclusion: guard script is correct, but main data flow is not fully recovered until the repair workflow/main workflow successfully runs and commits regenerated robot data.

2026-07-03

Full next-day bulletin window update recorded.

Summary:
- User asked to work on GitHub and update the Futbol Bulteni data flow without touching the site/widget/admin/coupon/analysis UI.
- Required memory files were read from GitHub: PROJECT_MEMORY.md, WORKING_PROTOCOL.md, DONT_TOUCH.md, CURRENT_STATE.md, STATE.md, SESSION_LOG.md, MEGA_HAFIZA.md and MEGA_HAFIZA_KAYITLAR/2026-06-28_baslayan_mac_bulten_filtresi_kaydi.md.
- LAST_WORK_REPORT.md was checked but is not present in the repo.
- Updated scripts/build-full-bulletin.js so the full bulletin window is today full day + tomorrow full day, with date_window.includes_next_day_until set to tomorrow 23:59.
- Replaced the old archive URL constant with the current Maçkolik İddaa page URL and normalized source naming to Maçkolik İddaa Futbol when Maçkolik/current robot data is used.
- Kept started/past matches out of matches and live matches in live_matches using the existing Turkey-time live window rule.
- Added a no-empty-overwrite guard so data/full-bulletin.json is not overwritten when no usable scheduled/live bulletin data is produced.
- Updated scripts/full-bulletin-output-check.js because the workflow runs it after build-full-bulletin.js and it still enforced the old tomorrow 08:00 cutoff.
- Did not change daily-matches-widget.js, index.html, admin panel, Kuponum panel, Analiz Et button, workflow/domain/CNAME/Pages settings, or data/full-bulletin.json manually.

2026-08-23

Organic promotion and SEO foundation prepared.

Summary:
- Added search and social sharing metadata to the home page: description, canonical, robots directives, Open Graph, Twitter Card and Schema.org WebSite/Organization JSON-LD.
- Added a 1200x630 social sharing image for clean link previews.
- Added robots.txt and sitemap.xml with only public pages; admin, payment administration, usage logs and backend/API paths remain excluded from crawling.
- Did not change bulletin data, match ordering, daily-matches-widget.js, protected coupon/analysis panels, workflows or runtime behavior.

2026-08-23

Instagram organic campaign media prepared.

Summary:
- Added a new 1080x1350 feed creative to content/instagram/media for the official Instagram publisher.
- The creative uses the current live domain and avoids guaranteed-win, money and betting-slip claims.
- Publishing was not triggered because the stored Instagram access token is expired; the media is ready for the next successful authorized run.
- Did not change match data, bulletin logic, widgets, payment flow or Instagram API credentials.

2026-08-23

IndexNow organic search discovery prepared.

Summary:
- Added a root verification key file for IndexNow ownership validation.
- Planned submission scope is limited to the seven public URLs already listed in sitemap.xml.
- No admin, payment administration, API, backend, match data or private operational URLs are included.
- Did not change bulletin logic, widgets, workflows or credentials.

2026-08-23

Canonical host alignment completed.

Summary:
- Live HTTP checks confirmed that www redirects permanently to the apex host.
- Updated homepage canonical, Open Graph URLs, structured data, robots sitemap URL and sitemap entries to https://futbollaboratuuvari.org/.
- Updated CANONICAL_DOMAIN.txt to document the actual final public host.
- CNAME and DNS settings were not changed.
- Did not change site layout, bulletin data, widgets, workflows or payment logic.

2026-08-23

Özel Analiz V3 mobile-first flow completed.

Summary:
- Replaced the conflicting multi-script premium panel runtime with one static, branded three-step flow: Maç, Analiz, Sonuç.
- Added separate Tek Maç and Kupon modes, upcoming-match search/date filters, a 10-match coupon limit and a mobile-safe sticky analysis action.
- Kept Robot Önerisi, Maç Sonucu and Gol Analizi as the three primary choices; moved advanced markets into a secondary disclosure.
- Added honest no-pick handling, confidence, risk, three concise reasons, expandable data details, copy/new-analysis actions and local history continuity.
- Connected the new interface to full-bulletin.json with two-day-bulletin.json fallback while excluding live, finished, cancelled and postponed matches.
- Preserved server-side membership consumption through server-membership-guard.js and replaced the legacy inline error with the V3 access drawer events.
- Stopped cache-version.js and nav-routing.js from reloading old premium usability/market layers over the V3 interface. Legacy files remain in the repository for rollback.
- Added Node tests for upcoming filtering, schema normalization, goal analysis, no-pick behavior, coupon calculations and Turkish search.
- JavaScript syntax checks, core tests, real-bulletin scenario checks, CSS/HTML structural checks and the static build completed successfully. The sparse local checkout caused the build to skip an unavailable optional bulletin merge module; no bulletin file was modified.
- Did not change daily-matches-widget.js, bulletin JSON data, Kuponum, workflows, CNAME, DNS or payment configuration.

2026-08-23

Homepage performance repair completed.

Summary:
- Measured the live startup graph and found repeated robot-analysis.json downloads (about 4.9 MB each), unconditional two-day-bulletin.json loading (about 1.5 MB), duplicated full bulletin reads and legacy panel scripts running against selectors that no longer exist.
- Gated robot-analysis.json, raw pool and report downloads behind the admin elements that actually consume them.
- Removed learning visibility, legacy wide-market, obsolete daily-row and coupon fallback chains from homepage startup while keeping their files in the repository for rollback.
- Added a short-lived shared JSON request layer so concurrent full bulletin, fixtures, live, coupon and history readers use one network request without blocking later refreshes.
- Stopped the unused fixtures.json request when the legacy fixtures list is not present on the homepage.
- Changed the daily widget to load two-day-bulletin.json only when full-bulletin.json is missing or empty, and exposed its normalized upcoming list to Özel Analiz V3.
- Deferred membership/payment code until the membership panel opens, and moved the guide/visual helpers to browser idle time.
- Debounced the site language mutation work and reduced repeated header cleanup frequency.
- Added performance regression tests covering shared requests, skipped 4.9 MB admin data and removal of obsolete startup chains.
- JavaScript syntax checks, Özel Analiz tests, performance tests and local/remote asset-reference validation passed.
- Did not change any bulletin JSON, workflow, CNAME/DNS, bank endpoint or payment configuration.

2026-08-24

Results and performance resilience repair completed.

Summary:
- Diagnosed the empty mobile sections: the page rendered an empty fallback before asynchronously downloading `data/analiz_sonuclari.json`; request failure or delay was silently converted into empty arrays and zero measurements.
- Added a generated `data/results-summary.json` containing only the latest 30 completed records and performance totals, reducing the primary results payload from about 634 KB to about 20 KB.
- Added three request attempts with a five-minute data version, a seven-day last-known-good public results cache and a full analysis payload fallback.
- Replaced initial empty/zero UI with explicit loading and unavailable states; a transport failure no longer appears as genuine 0% performance.
- Added regression coverage for summary failure, full-payload fallback, offline cached fallback, compact output size and summary schema.
- JavaScript syntax, performance loading, results pipeline and Özel Analiz V3 tests passed.
- Did not change daily-matches-widget.js, bulletin JSON files, Kuponum, Analiz Et, workflows, CNAME/DNS, membership or payment logic.

2026-08-24

Özel Analiz PRO 13 research and explainable model upgrade completed.

Summary:
- Audited the live robot, archive, fixture, result and V3 client flow. Found cross-market signal leakage, high-odds tie breaking, model-score/probability conflation and proxy metrics counted as independent evidence.
- Rebuilt robot scoring as a market-conditioned ensemble with de-vig market probabilities, market-specific evidence, optional form/Poisson signals, independent-evidence gates, explicit data coverage and conservative no-value behavior.
- Separated model strength, estimated probability, market probability and edge throughout robot output, learning memory, result tracking and UI persistence.
- Added a compact `data/pro-analysis-index.json` feed, automatic rebuild hooks and a browser join keyed by match code/date/teams. The feed is about 104 KB instead of the roughly 1.68 MB robot payload.
- Indexed archive team/league lookups once; production-like 76-match scoring fell from roughly 80 seconds to 1.5 seconds.
- Updated the mobile result card with model/market comparison, data quality, evidence mode, calibration status and responsible-use reminders. Coupon mode now shows compounded probability and no-pick count.
- Added PRO model, compact-index and client regression tests; all premium, performance and result pipeline tests passed.
- Added `docs/OZEL_ANALIZ_PRO13_ARASTIRMA_VE_MIMARI.md` with primary research sources, audit evidence, thresholds, limitations and next data priority.
- Did not modify bulletin JSON files, daily-matches-widget.js, Kuponum, membership consumption, payment, workflows, CNAME or DNS.

2026-08-24

Spor Toto weekly 15 continuation and evidence-label repair completed.

Summary:
- Resumed the interrupted Spor Toto work from the latest main branch and confirmed the background pipeline had already created the 15-match program plus the compact archive-analysis cache.
- Found the remaining failure: the generated cache was not yet reflected in the published bulletin at the interruption point, and the finalizer treated one-sided one-match samples as independent archive evidence.
- Reapplied the archive cache before finalization, producing 15 visible high-risk distribution-based cards, 13 singles, 2 doubles and 4 total working columns.
- Tightened `hasArchiveEvidence` so an explicit `archive_analysis.ready: false` cannot be overridden by one tiny form sample; all 15 current matches are now honestly counted as distribution-based, not archive-backed.
- Added regression coverage for the false archive-evidence case and verified that distribution-only cards never claim confirmed result-memory support.
- Updated the Spor Toto dashboard to label distribution percentages as playing distribution rather than model probabilities, and to show archive/distribution/market evidence counts.
- Updated the cache version so the corrected mobile and desktop dashboard loads without an old-script flash.
- Spor Toto archive, market and weekly tests, JavaScript syntax checks, JSON conflict validation and the Vercel production build passed.
- Did not change daily-matches-widget.js, the main bulletin separation rules, Kuponum, Analiz Et, membership, payment, CNAME or DNS.

2026-08-24

Özel Analiz kupon karar görünümü ve uygunluk doğrulaması tamamlandı.

Summary:
- Kullanıcının altı maçlık kuponunda beş marketin “Seçim yok” olarak gizlenmesi ve `include_in_coupon: false` olan bir maçın seçim gibi gösterilmesi birlikte incelendi.
- Kök nedenin tarayıcı karar çekirdeğinin eşik altı PRO marketini silmesi ve kupon uygunluk bayrağını hesapta kullanmaması olduğu doğrulandı.
- Eşik altı fakat tanımlı marketler “İzleme görüşü” olarak market ve oranıyla görünür tutuldu; gerçekten veri/market olmayan kayıt “Görüş oluşmadı” olarak ayrıldı.
- Kupon uygunluğu bağımsız kanıt, model gücü, veri kapsamı, tahmini olasılık, risk ve `include_in_coupon` bayrağıyla hem kompakt veri üretiminde hem tarayıcıda yeniden doğrulandı.
- İzleme görüşleri kupon ayağı, toplam oran veya birleşik olasılık hesabına katılmıyor; arayüz robot görüşü ve kupona uygun sayılarını ayrı gösteriyor.
- Ekrandaki altı maçlık örneği kapsayan regresyon testi eklendi: altı görüş görünür, sıfır doğrulanmış kupon ayağı, sıfır sahte toplam oran.
- Son otomatik veri yenilemesi alındıktan sonraki uçtan uca kontrolde 9 yaklaşan/PRO eşleşme, 8 robot görüşü, 1 kupon adayı, 7 izleme ve 1 veri yetersiz kayıt doğrulandı.
- PRO, performans, sonuç ve Spor Toto testleri; sözdizimi, çatışma kontrolü ve ayrı kopyadaki üretim paketi başarılıdır.
- Bülten JSON dosyaları, daily-matches-widget.js, Kuponum, üyelik, ödeme, workflow, CNAME ve DNS değiştirilmedi.

2026-08-26

Otomatik takım ve futbolcu analizi tamamlama oturumu kaydedildi.

Summary:
- Canlı veri zincirinde takım/futbolcu modüllerinin ayrı JSON ürettiği fakat robot kararına bağlanmadığı doğrulandı; `band-signals.json` içindeki bütün canlı maçların `match_name: "-"` olması temel eşleşme hatasıydı.
- API-Football için önbellekli ve günlük istek bütçeli oyuncu istihbaratı eklendi: maç kimliği, sakatlık, ceza, şüpheli durum, ilk 11, kadro pozisyonu ve transfer hareketleri tek şemada birleştirildi.
- Manuel doğrulama, yapılandırılmış API gerçeği ve açık haber sinyali birbirinden ayrıldı; veri yokluğu düşük risk veya sağlıklı kadro kanıtı sayılmadı.
- Kadro/ilk 11 riski robot puanına ihtiyat indirimi uygular; yüksek risk kupon uygunluğunu kapatır ve gerekçeyi robot sinyallerine ekler.
- Takım/futbolcu verisi tam bülten, canlı çıktı, robot çıktısı ve kompakt PRO indeksine bağlandı; günlük maç detayı ve Özel Analiz sonucu kullanıcıya isimli eksik, transfer ve ilk 11 özetini gösterir.
- Otomatik iş akışlarına oyuncu verisi, ilk 11 üretimi ve uçtan uca çıktı sözleşmesi testi eklendi. Yanlış `"-"` maç anahtarı ve veri yokken “Düşük” ilk 11 riski için regresyon testleri eklendi.
- PRO indeksi canlı/bitmiş maçları dışarıda bırakıp minify edilerek 108.553 bayta indirildi; 150 KB performans sınırı yeniden sağlandı.
- Takım istihbaratı, PRO, Özel Analiz, performans, sonuç, Spor Toto, JavaScript sözdizimi ve JSON çatışma kontrolleri başarılıdır.
- `matches` / `live_matches` ayrımı, Kuponum, üyelik/ödeme akışı, CNAME ve DNS değiştirilmedi.

2026-08-29

Canlı denetim bulgularının P0 → P2 uygulaması tamamlandı.

Summary:
- Saatten türetilen canlı/bitmiş statü kaldırıldı; yalnız sağlayıcı statüsü veya doğrulanmış skor kanıtı kabul edildi. Analiz ve kupon kayıtlarının sonuç listesine karışması engellendi.
- Ortak kupon uygunluk kuralı üretici ve arayüze bağlandı; tekrarlar ve çelişkili `include_in_coupon` ayakları kaldırıldı.
- PRO indeks statik yayından ve Git takibinden çıkarıldı; üyeliği doğrulayan `/api/pro-analysis` sunucu ucu ve hak tüketmeden önce veri açma sırası eklendi.
- Kamu canlı JSON'u öneri/model alanlarından arındırıldı; robot, tam analiz, üyelik kodu ve kullanım kayıtları Vercel statik çıktısından çıkarıldı.
- Üyelik yükleme yarışı giderildi. Ödeme için eksiksiz satıcı profili ve dört ayrı güncel yasal onay zorunlu kılındı; profil eksikse sipariş sunucu tarafından 503 ile güvenli biçimde durdurulur.
- Ön bilgilendirme, mesafeli satış, iptal/iade ve KVKK sayfaları ile dinamik satıcı profili eklendi. AdSense açık çerez onayından önce yüklenmez; kabul/ret/tercih yönetimi eklendi.
- Bülten 30 kayıtlık artımlı gösterime geçirildi; sahte oran skoru ve “oynanabilir” dili kaldırıldı. Model gücü, olasılık ve veri kapsamı ayrıştırıldı.
- CSP, HSTS ve diğer güvenlik başlıkları; favicon, web manifest, sitemap ve yanlış host yönlendirme kuralı eklendi.
- Birim/regresyon testleri, JavaScript sözdizimi, JSON yapılandırması ve güvenli Vercel statik üretim çıktısı başarılıdır. Satıcı ortam değişkenleri dış yapılandırmada tamamlanmadan ücretli satış açılmaz.

2026-08-29

GitHub Pages / Vercel çift yayın güvenlik tamamlaması yapıldı.

Summary:
- İlk üretim dağıtımından sonra özel alan adının Vercel değil GitHub Pages tarafından sunulduğu canlı HTTP başlıklarıyla tespit edildi.
- Korumalı PRO ve ödeme istemcileri sabit Vercel üretim API origin'ine geçirildi; iki doğru site origin'i için dar CORS, OPTIONS ve yabancı-origin reddi eklendi.
- `.nojekyll` kaldırıldı; Pages iş akışı `npm run build` ile güvenli `public/` artifact'i üretip yalnız bu dizini yayımlayacak şekilde değiştirildi. Özel analiz, tam sonuç, ham havuz, üyelik ve kullanım verileri artifact'e hiç girmez.
- Eski `/api/verify-code` kullanım günlüğü GET'i yönetici anahtarı olmadan 401 dönecek şekilde kapatıldı; herkese açık CORS kaldırıldı.
- GitHub Pages için erken CSP meta politikası, değişen betikler için yeni önbellek sürümü ve Vercel CSP bağlantı izni eklendi.
- Doğrulanmış statü, PRO model/indeks, sonuç zinciri, takım istihbaratı, güvenlik/yasal, performans, Özel Analiz V3 ve kupon uygunluk regresyonları birlikte geçti.
- Supabase şeması veya verisi değiştirilmedi; mevcut doğrulama, deneme, kullanım ve ödeme sağlayıcı akışları korunarak yalnız Vercel proxy sınırı düzenlendi.

## 2026-08-30 — Üyelik kodu canlı etkileşim kapanışı

- Canlı tarayıcı kontrolünde üyelik kodu kartının görünür olduğu, ancak `Göster` düğmesinin olay kabarcıklanması üzerinden çalışmadığı görüldü.
- Üyelik kodu kartındaki dört kullanıcı eylemi doğrudan düğme dinleyicilerine taşındı.
- Statik güvenlik testi yeni doğrudan bağlama sözleşmesini kontrol edecek şekilde genişletildi.
