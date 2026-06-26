# 2026-06-26 55 Kayıt Yansıma ve Aday Sorunu Kaydı

## Kontrol

`data/analiz_sonuclari.json` kontrol edildi.

Son durum:

- `status`: `active`
- `fixture_count`: `55`
- `scored_match_count`: `55`
- `active_item_count`: `55`
- `coupon_candidate_count`: `0`
- `watch_candidate_count`: `0`

## Siteye yansıma tespiti

Ana site `script.js` içinde `data/analiz_sonuclari.json` dosyasını okuyor ve `active_items` içindeki kayıtları `#analysis-list` alanına basıyor.

Tespit:

- 55 kayıt siteye yansıyabilecek formatta geliyor.
- Kayıtlar `market`, `score/confidence` ve `signals/pro_signals` alanlarını taşıdığı için görünür analiz kartı filtresinden geçiyor.
- Ancak eski mantıkta `strongest-pick-card` ilk kaydı otomatik Günün Seçimi gibi gösterebilirdi.

## Yapılan bağlantı düzeltmesi

`script.js` kırılmadan güncellendi.

Yeni ayrım:

1. `visibleItems`: Maç yorumlarında gösterilecek bütün robot kayıtları.
2. `candidateItems`: Kupon / İzleme eşiğini geçen gerçek adaylar.

Böylece:

- 55 kayıt Maç Yorumları bölümüne yansıyabilir.
- `Değerli market yok / Oynama / 0%` gibi kayıtlar Günün Seçimi olarak gösterilmez.
- Gerçek aday yoksa Günün Seçimi alanında açık mesaj gösterilir: kayıt var ama kupon/izleme eşiğini geçen güçlü aday yok.

Commit:

- `f026801c7cf2574c07512cc5c51572e13078fcbd`

## Neden kupon/izleme adayı çıkmıyor?

Robot skor motoru çok sıkı çalışıyor.

Sebep:

- Mevcut ham verilerde çoğunlukla oran ve maç adı var.
- Form, son 10 maç gol atma/yeme, KG yüzdesi, üst yüzdesi, lig gol ortalaması, ilk yarı/ikinci yarı gol eğilimi gibi metrikler eksik.
- `robot-exact-scoring.js` eksik veri için puan düşürüyor.
- Aday üretmek için skor en az 40 üstüne çıkmalı.
- Kupon için çoğunlukla 65+ skor gerekiyor.

Sonuç:

- `active_items` doluyor.
- Siteye analiz kartı olarak yansıyabilecek hale geldi.
- Ama analiz kalitesi ve aday üretimi için veri zenginleştirme gerekiyor.

## Sıradaki aşama

Kupon/izleme adayı üretmek için robotun ham maç verisine şu metrikleri eklemesi gerekiyor:

- Takımların son 10 maç gol attı/yedi bilgisi
- KG Var yüzdesi
- 2.5 Üst yüzdesi
- 3.5 Üst yüzdesi
- İlk yarı gol eğilimi
- İkinci yarı gol eğilimi
- Lig gol ortalaması

Bu metrikler gelmeden kupon üretimini zorlamak yerine, şimdilik kayıtları analiz/yansıtma katmanında göstermek daha güvenlidir.
