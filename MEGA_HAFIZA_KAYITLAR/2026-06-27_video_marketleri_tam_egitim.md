# 2026-06-27 Video Marketleri Tam Egitim + Veri Akisi

Bu tek mega hafiza dosyasi video marketleri, veri akisi, robot egitimi, detay market secimi ve Mackolik detay tiklama robotu calismasini bir arada tutar.

## Zorunlu Calisma Anlasmasi

Kullanici ile net anlasma:

1. Kullanici ne istiyorsa sadece o yapilacak.
2. Kullanici istemedigi dosyaya dokunulmayacak.
3. Yeni dosya veya klasor acilmayacak; ancak kullanici acikca isterse acilacak.
4. Kafaya gore tasarim, robot, veri akisi, analiz veya ekstra ozellik eklenmeyecek.
5. Isleme baslamadan once hangi dosyada calisilacagi soylenir.
6. Sadece soylenen dosya icinde islem yapilir.
7. Is bitince kisa rapor verilir: dosya adi, commit ve ne degisti.
8. Sitede gorunmeyen is tamamlandi sayilmaz.
9. Kullanici bir alan isterse sadece o alan duzenlenir; baska alana girilmez.
10. Oncelik: mevcut dosyalarda kucuk ve kontrollu duzenleme.

Bu kural Futbol Laboratuvari calismalarinda en ust kuraldir.

## Market Kapsami

HND, IY/MS, MS+Alt/Ust, MS+KG, 0.5/1.5/3.5/4.5 Alt-Ust, gol araliklari, ilk yari/mac skoru, dogru skor, 1Y/2Y KG, tek/cift, korner, kart ve takim sut marketleri sisteme dahil edildi.

## Detay Market Gelmeme Notu

Detay marketlerin gelmemesinin ana nedeni: statik HTML parser ana satir oranlarini topluyor fakat video gibi acilan detay panelini ancak tarayici robotu acabilir. `scripts/update-fixtures.js` icine bu tarayici robotu eklendi. `package.json` icine `playwright` ve `postinstall: playwright install chromium` eklendi. GitHub Actions workflow icine paket kurulum adimi ekleme denemesi guvenlik filtresine takildi. Bu yuzden cron ortaminda paketler kurulmazsa tarayici robotu devreye giremez ve detay marketler gelmez.

## Tamamlanan Dosyalar ve Commitler

1. `premium-analysis-extra-markets.js` commit `b4774bd153fddd7e3175e599bad81d00fcdfe488`.
2. `premium-robot-engine.js` commit `cccf954d767be02d59defb9897db102a0eed1d62`.
3. `pro12-2-wide-market-engine.js` commit `d6e3908468648411a184fa15996bbc1c6bc7e1ed`.
4. `cache-version.js` commit `f4e11ea89920dd378e0bd4e4cb04d890630e6ce7`.
5. `site-visible-fix.js` commit `95a2265eec404e9b55683deefdaa9bf43208c1c0`.
6. `scripts/update-fixtures.js` genis market commit `85ed98d3eb92a0ec5e9b131212e11cbaf9a8ed85`; Mackolik detay tiklama commit `2a5ea0da961acba6df536aaa5637d6fac07ce881`.
7. `package.json` Playwright commit `3388d91c154223fdf998bbdf1ec3dced04784cc1`; postinstall Chromium commit `beda174e1512bbe19f13cf70947a2a788e625bb3`.
8. `scripts/ensure-live-json.js` commit `01e2cb80632e20d9a3b85a6e99c306be6418a098`.
9. `scripts/build-full-bulletin.js` commit `7f9c9677221d9a064b5b6ab59927bf3ad880f3f7`.
10. `scripts/enrich-fixture-metrics.js` commit `85a360050ac906d5b4f626688337fd1dc62af27b`.

## Guncel Akis

`update-fixtures.js` once satir oranlarini toplar. Playwright kuruluysa Mackolik satir detaylarini acmayi dener. Acilan detay bloklari `raw_market_blocks` olarak saklanir ve eslesen market oranlari `available_odds` icine tasinir. Playwright yoksa eski statik akisa duser.

## Kalan Kritik Is

Cron/Actions tarafinda paket kurulumu calismali. Paket kurulumu calismazsa Playwright modu devreye girmez. Manuel PC calistirmada `npm install` bir kez yapildiktan sonra detay robotu devreye girebilir.
