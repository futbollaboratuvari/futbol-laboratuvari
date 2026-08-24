# Özel Analiz PRO 13 — Araştırma, Denetim ve Mimari Kararlar

Tarih: 2026-08-24  
Model sürümü: `pro13-market-conditioned-v1`

## Amaç

Özel Analiz'i yalnızca yüksek görünen bir “güven yüzdesi” üreten panel olmaktan çıkarıp; veri niteliğini, tahmini olasılığı, piyasa beklentisini, aradaki farkı ve geçmiş doğrulamayı ayrı ayrı gösteren açıklanabilir bir karar sistemi yapmak.

## Araştırmadan çıkan ana ilkeler

1. Futbol tahmini düşük skorlu yapısı ve zamanla değişen takım gücü nedeniyle tek bir sabit puanla açıklanamaz. Gol sayısı için Poisson ailesi ve takım gücünün zaman içinde güncellenmesi futbol modellemesinde yerleşik yaklaşımlardır. Kaynak: [Dixon–Coles futbol skor modeli](https://academic.oup.com/jrsssd/article/51/2/157/7120674), [Bayesçi durum-uzayı futbol modelleri](https://academic.oup.com/jrsssc/article/74/3/717/7929974).
2. xG bir şutun gol olma olasılığını bağlamsal değişkenlerle ölçer; gerçek xG/form verisi ile orandan türetilmiş proxy metrik aynı kanıt düzeyinde sayılamaz. Kaynak: [Stats Perform xG açıklaması](https://www.statsperform.com/insights/expected-goals-xg-the-football-metric-changing-analysis-betting-and-fan-engagement/), [xG modellerinin performans karşılaştırması](https://pmc.ncbi.nlm.nih.gov/articles/PMC10075453/).
3. Model puanı ile olay olasılığı aynı kavram değildir. Olasılık tahminleri sonuçlarla ayrıca kalibre edilmeli ve uygun bir skorla izlenmelidir. PRO 13 bu nedenle model gücünü 0–100 sinyal tutarlılığı, tahmini olasılığı ise ayrı yüzde olarak saklar.
4. Piyasa oranı, marj temizlenmeden olasılık değildir. Tam 1X2 veya iki yönlü market bulunduğunda `1/oran` değerleri toplamlarına bölünerek marjı temizlenmiş piyasa olasılığı oluşturulur.
5. Bir kuponun yaklaşık ortak olasılığı ayak olasılıklarının çarpımıdır. Bu hesap maçların bağımsızlığı varsayımını taşır; sonuç ekranında bu sınırlama açıkça yazılır.
6. Dinamik ve bağlama uygun sorumlu kullanım hatırlatmaları, sabit uyarılardan daha görünür olabilir. Bu nedenle her üçüncü analizde bütçe ve süre sınırı hatırlatılır. Kaynak: [Sorumlu kumar pop-up mesajları meta-analizi](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2020.601800/full).

## Mevcut sistem denetiminde bulunan kök hatalar

- Gol ve KG sinyalleri MS 1/X/2 adaylarının puanına da ekleniyordu. Marketler arasında kanıt sızıntısı vardı.
- Eşit puanlı adaylar yüksek orana göre sıralanıyordu. Bu, favori yerine veriyle desteklenmeyen uzun oranlı dış saha sonucunu seçebiliyordu.
- `confidence`, `lab_probability` ve analiz skoru aynı değer gibi kullanılıyordu; sinyal gücü kazanma olasılığı izlenimi veriyordu.
- Orandan türetilen proxy gol metrikleri bağımsız form verisi gibi tekrar modele giriyordu.
- Arşiv her takım/lig sorgusunda baştan taranıyordu. Güncel 76 maçlık denetim yaklaşık 80 saniye sürüyordu.
- Eski performans kaydında 237 ölçülmüş tahminde 70 doğru, 167 yanlış ve yaklaşık `%30` başarı bulunmasına rağmen model puanı kovaları kalibre bir olasılık değildi.

## PRO 13 karar mimarisi

### 1. Piyasa tabanı

- Tam markette marj temizlenmiş olasılık hesaplanır.
- Bağımsız form/gol örneği yoksa sonuç `market_baseline` olarak işaretlenir.
- Proxy metrik bağımsız kanıt sayılmaz.
- Model gücü en fazla `64/100` olabilir.
- Veri eksikliği riski `Yüksek`, veri niteliği `Sınırlı` olur.
- Model–piyasa farkı yoksa “Değerli” veya “Yüksek Değer” etiketi verilmez.
- Bu kayıt otomatik kupon adayı olamaz.

### 2. Piyasa + bağımsız kanıt

- En az üçer takım sonucu varsa form olasılığı ve küçültülmüş Poisson gol modeli kullanılabilir.
- Doğrulanmış doğrudan metrikler markete özel eklenir: gol verisi yalnız gol marketine, KG verisi yalnız KG marketine, form verisi yalnız 1X2 marketine etki eder.
- Piyasa ve bağımsız tahmin, veri güvenilirliğine göre ağırlıklı birleştirilir.
- Veri kapsamı; tam oran seti, takım geçmişi, bağımsız model ve yeterli geçmiş market örneğinden oluşur.

### 3. Eşikler

| Karar | Kural |
|---|---|
| Özel Analiz robot seçimi | Güncel kayıt, model gücü ≥ 60, veri kapsamı ≥ 35 |
| Seçim yok | Eski kayıt, bilinmeyen market, düşük model gücü veya düşük veri kapsamı |
| Değerli | Bağımsız kanıt, fark ≥ 3 puan, veri kapsamı ≥ 45 |
| Yüksek Değer | Bağımsız kanıt, fark ≥ 7 puan, veri kapsamı ≥ 60, tahmini olasılık ≥ %45 |
| Kupon adayı | Model gücü ≥ 65, veri kapsamı ≥ 45, tahmini olasılık ≥ %42 ve bant riski yüksek değil |
| Veri güncelliği | PRO indeks yaşı en fazla 6 saat |

## Sonuç ekranı semantiği

- **Model gücü:** Sinyallerin tutarlılığı; kazanma olasılığı değildir.
- **Tahmini olasılık:** Seçilen olay için model tahmini.
- **Piyasa olasılığı:** Oran marjı temizlendikten sonra piyasanın seçime verdiği pay.
- **Model–piyasa farkı:** Tahmini olasılık eksi piyasa olasılığı.
- **Veri kapsamı:** Kullanılabilir ve güvenilir katmanların kapsama puanı.
- **Kanıt modu:** Piyasa tabanı veya piyasa + bağımsız veri.
- **Geçmiş doğrulama:** Eski skorlar olasılık gibi kullanılmaz; yeni PRO olasılık örneği en az 30 sonuca ulaştığında Brier skoru görünür.

## Üretim verisi doğrulaması

2026-08-24 üretim benzeri çalıştırmada:

- 66 güncel maç kompakt indekse girdi.
- 8 maç seçim eşiğini piyasa tabanında geçti; tamamı `Sınırlı veri / Yüksek risk` olarak işaretlendi.
- Bağımsız sonuç örneği: 0.
- Yanlış değer etiketi: 0.
- Otomatik kupon adayı: 0.
- Önceki örnekte `MS 2 @ 5.70` seçilen Brondby–Silkeborg maçı yeni modelde `MS 1`, piyasa tabanı, sınırlı veri ve yüksek risk olarak düzeldi.
- Büyük `robot-analysis.json` yaklaşık 1,68 MB; tarayıcıya verilen `pro-analysis-index.json` yaklaşık 104 KB.
- Arşiv sorguları takım/lig indeksleriyle tek geçişe alındı; aynı 76 maçlık yerel denetim yaklaşık 80 saniyeden 1,5 saniyeye düştü.

## Bilinen veri açığı ve güvenli davranış

Mevcut kalıcı takım arşivinde çok sayıda maç kaydı bulunmasına rağmen final skor alanlarının çoğu boş. Günlük fikstürdeki form/gol alanları da `odds_proxy_pending_form_archive` kaynağından geliyor. Sistem bu açığı gizlemez:

- proxy veriyi bağımsız kanıt saymaz,
- olasılık geçmişi oluşmadan kalibrasyon iddiasında bulunmaz,
- yeterli veri yoksa “Seçim yok” üretir,
- yüksek oranı tek başına değer olarak kabul etmez.

Bir sonraki veri geliştirme önceliği, lisanslı/doğrulanabilir final skor ve gerçek takım formu akışını kalıcı arşive bağlamak; ardından lig ve market bazlı zaman ayrımlı geri test yapmaktır.

## Korunan alanlar

Bu geliştirmede ana bülten kaynağı, üyelik hakkı tüketimi, ödeme alanı, gizli uyumluluk seçicisi ve mevcut Kuponum erişim akışı değiştirilmedi. Yeni kompakt indeks mevcut robot çıktısından türetilir ve büyük yönetim verisini ana sayfaya indirmez.
