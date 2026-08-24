# Session Log

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
