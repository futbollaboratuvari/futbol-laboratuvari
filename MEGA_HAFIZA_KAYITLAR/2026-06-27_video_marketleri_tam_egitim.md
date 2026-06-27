# 2026-06-27 Video Marketleri Tam Egitim + Veri Akisi

Bu tek mega hafiza dosyasi video marketleri, veri akisi, robot egitimi ve detay market secimi calismasini bir arada tutar.

## Market Kapsami

HND, IY/MS, MS+Alt/Ust, MS+KG, 0.5/1.5/3.5/4.5 Alt-Ust, gol araliklari, ilk yari/mac skoru, dogru skor, 1Y/2Y KG, tek/cift, korner, kart ve takim sut marketleri sisteme dahil edildi.

## Tamamlanan Dosyalar ve Commitler

1. `premium-analysis-extra-markets.js`
   - Commit: `b4774bd153fddd7e3175e599bad81d00fcdfe488`
   - Premium panel market listesi genisletildi.

2. `premium-robot-engine.js`
   - Commit: `cccf954d767be02d59defb9897db102a0eed1d62`
   - Robot yeni market adlarini veri anahtarlarina eslestirir hale geldi.

3. `pro12-2-wide-market-engine.js`
   - Commit: `d6e3908468648411a184fa15996bbc1c6bc7e1ed`
   - Pro 12.2 genis market skorlayiciya yeni market gruplari ogretildi.

4. `cache-version.js`
   - Eski detay okuma commit: `b55f13b53f985c5390fcc9654fe87d5a84c1ce5c`
   - Yeni detay secim commit: `f4e11ea89920dd378e0bd4e4cb04d890630e6ce7`
   - Detay alaninda veri gelen genis market kartlari tiklanabilir hale getirildi.
   - Tiklanan detay marketi sag Kuponum paneline eklenir.
   - Detay market secimleri Analiz Et ile Pro 12.2 genis market mantigiyla skorlanir.

5. `site-visible-fix.js`
   - Commit: `95a2265eec404e9b55683deefdaa9bf43208c1c0`
   - Detay temizleme filtresi HND, skor, dogru skor gibi yeni gruplari silmeyecek hale getirildi.

6. `scripts/update-fixtures.js`
   - Commit: `85ed98d3eb92a0ec5e9b131212e11cbaf9a8ed85`
   - Mackolik satirindaki ana oranlardan sonra gelen ek sayisal oranlar genis market sirasina tasinir.
   - `raw_odds_sequence`, `raw_market_guess_odds`, `raw_market_labels`, `available_odds`, `raw_market_value_count` alanlari korunur.

7. `scripts/ensure-live-json.js`
   - Commit: `01e2cb80632e20d9a3b85a6e99c306be6418a098`
   - Canli veri JSON akisi genis market oran envanterini korur.

8. `scripts/build-full-bulletin.js`
   - Commit: `7f9c9677221d9a064b5b6ab59927bf3ad880f3f7`
   - Tam bulten genis market oranlarini korur.

9. `scripts/enrich-fixture-metrics.js`
   - Commit: `85a360050ac906d5b4f626688337fd1dc62af27b`
   - Robot metrik zenginlestirme genis oran envanterini ogrenme verisine ekler.

## Guncel Akis

`update-fixtures.js` kaynak satirdaki oranlari toplar. `fixtures.json` ve `available_odds` genis market envanterini tasir. `build-full-bulletin.js` tam bultene aktarir. `ensure-live-json.js` canli JSON icinde korur. `cache-version.js` detay alaninda veri gelen marketleri tiklanabilir yapar. Secilen detay marketleri sag panelde analiz edilir.

## Not

Sistem oran uydurmaz. Kaynakta HND, IY/MS, skor, korner, kart veya sut orani yoksa site bos gosterir. Oran kaynakta geldigi anda mevcut veri akisi ve detay secim sistemi o marketi gostermeye ve analiz etmeye hazirdir.
