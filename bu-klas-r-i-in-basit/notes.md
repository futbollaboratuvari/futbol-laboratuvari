# Futbol Laboratuvari - Ilk Surum Plani

## Amac

Futbol Laboratuvari'nin ilk surumu; mac verilerini toplamak, takim ve lig seviyesinde analiz etmek, bu analizlerden anlamli sinyaller uretmek ve kontrollu kupon onerileri hazirlamak icin temel bir sistem kurmayi hedefler.

Bu surumun ana hedefi "dogru tahmin garantisi" vermek degil, karar verme surecini sistematik hale getiren, izlenebilir ve gelistirilebilir bir analiz altyapisi olusturmaktir.

## Ilk Surum Kapsami

Ilk surumda bes ana katman olacak:

1. Veri toplama katmani
2. Takim analizi katmani
3. Lig analizi katmani
4. Kupon uretim katmani
5. Gelecekteki yapay zeka katmani

Her katman once basit ve calisir sekilde kurulacak. Daha sonra veri kalitesi, modelleme ve otomasyon artirilacak.

## 1. Veri Toplama Katmani

Bu katman sistemin temelidir. Analizlerin guvenilir olmasi icin mac, takim, lig ve oran verilerinin duzenli toplanmasi gerekir.

### Toplanacak Veriler

- Mac programi
- Mac sonucu
- Ev sahibi ve deplasman takimi
- Lig bilgisi
- Sezon bilgisi
- Mac tarihi ve saati
- Ilk yari sonucu
- Mac sonu sonucu
- Atan goller
- Yenilen goller
- Korner, kart ve sut gibi ek istatistikler
- Bahis oranlari
- Oran acilis ve kapanis degerleri

### Ilk Surum Veri Kaynaklari

- Manuel CSV veya JSON dosyalari
- Ucretsiz futbol veri kaynaklari
- Daha sonra API entegrasyonuna uygun dosya yapisi

### Veri Klasoru Yapisi

`data/` klasoru asagidaki dosyalari barindirabilir:

- `matches.csv`: Mac sonuclari ve temel mac bilgileri
- `teams.csv`: Takim bilgileri
- `leagues.csv`: Lig bilgileri
- `odds.csv`: Bahis oranlari
- `fixtures.csv`: Gelecek mac programi

### Yapilacaklar

- Veri alanlarini standartlastir.
- Maclar icin benzersiz `match_id` belirle.
- Takimlar icin benzersiz `team_id` belirle.
- Ligler icin benzersiz `league_id` belirle.
- Eksik veri kontrolu ekle.
- Tarih formatini standart hale getir.
- Ev sahibi/deplasman ayrimini net tut.

## 2. Takim Analizi Katmani

Bu katman takimlarin formunu, gucunu ve mac davranislarini analiz eder.

### Temel Takim Metrikleri

- Son 5 mac formu
- Son 10 mac formu
- Ev sahibi performansi
- Deplasman performansi
- Mac basina atilan gol
- Mac basina yenilen gol
- Gol averaji
- Ilk yari performansi
- Geriye dusunce reaksiyon
- One gecince skoru koruma basarisi

### Bahis Odakli Takim Sinyalleri

- 2.5 ust egilimi
- 2.5 alt egilimi
- Karsilikli gol var egilimi
- Karsilikli gol yok egilimi
- Evinde gol bulma orani
- Deplasmanda gol bulma orani
- Evinde gol yeme orani
- Deplasmanda gol yeme orani
- Favori oldugunda kazanma orani
- Zayif taraf oldugunda direnme orani

### Takim Skoru

Ilk surumda her takim icin basit bir takim guc skoru uretilebilir:

- Form skoru
- Hucum skoru
- Savunma skoru
- Ic saha skoru
- Deplasman skoru
- Risk skoru

Bu skorlar 0-100 araliginda tutulabilir. Boylece kupon uretim katmani takimlari daha kolay karsilastirabilir.

## 3. Lig Analizi Katmani

Lig analizi, sadece takimlari degil, ligin genel karakterini anlamaya odaklanir.

### Lig Metrikleri

- Mac basina gol ortalamasi
- Ev sahibi kazanma orani
- Beraberlik orani
- Deplasman kazanma orani
- 2.5 ust orani
- 2.5 alt orani
- Karsilikli gol var orani
- Kirmizi kart sikligi
- Favori kazanma orani
- Surpriz sonuc orani

### Lig Karakteri

Her lig icin basit etiketler uretilebilir:

- Gollu lig
- Dengeli lig
- Ev sahibi avantajli lig
- Surprize acik lig
- Dusuk tempolu lig
- Favorilerin guclu oldugu lig

### Lig Risk Seviyesi

Lig bazinda risk skoru hesaplanabilir:

- Cok degisken sonuclar yuksek risk olarak isaretlenir.
- Favorilerin sik kazandigi ligler daha dusuk riskli olabilir.
- Beraberlik orani yuksek liglerde mac sonucu bahisleri daha riskli sayilir.

## 4. Kupon Uretim Katmani

Bu katman analizlerden gelen sinyalleri kullanarak kupon onerileri uretir.

### Kupon Turleri

- Dusuk riskli kupon
- Orta riskli kupon
- Yuksek riskli kupon
- Tek mac onerisi
- Kombine kupon
- Sadece gol bahisleri kuponu
- Sadece mac sonucu kuponu

### Ilk Surum Kupon Kurallari

Baslangicta makine ogrenmesi yerine kural tabanli bir sistem kullanilabilir.

Ornek kurallar:

- Takimin son 5 mac gol ortalamasi yuksekse 2.5 ust sinyali uret.
- Iki takim da duzenli gol buluyorsa karsilikli gol var sinyali uret.
- Ev sahibi takim evinde guclu, deplasman takimi disarida zayifsa ev sahibi yenilmez sinyali uret.
- Lig beraberlik orani yuksekse mac sonucu bahislerinde risk puanini artir.
- Oran cok dusukse kupona alma veya deger skoru dusur.
- Oran yuksek ama analiz sinyali zayifsa risk seviyesini artir.

### Kupon Oneri Ciktisi

Her oneride su bilgiler yer almali:

- Mac
- Lig
- Tahmin tipi
- Onerilen bahis
- Oran
- Guven skoru
- Risk seviyesi
- Analiz gerekcesi
- Alternatif bahis

### Deger Skoru

Kupon uretirken sadece kazanma ihtimali degil, oran degeri de dikkate alinmali.

Basit deger skoru:

`deger_skoru = guven_skoru * oran`

Bu skor ilk surum icin kaba bir filtre olarak kullanilabilir.

## 5. Gelecekteki Yapay Zeka Katmani

Ilk surumda yapay zeka katmani tam otomatik karar verici olmak zorunda degildir. Once veri ve analiz altyapisi hazirlanmali, daha sonra yapay zeka bu altyapi uzerine eklenmelidir.

### Gelecek AI Ozellikleri

- Mac sonucu olasilik tahmini
- Gol sayisi tahmini
- Karsilikli gol olasiligi
- Kupon risk optimizasyonu
- Oran hareketlerinden anomali tespiti
- Takim form yorumlama
- Sakatlik ve haber etkisi analizi
- Dogal dilde mac analizi uretimi

### Gelecekte Eklenecek Ileri Analizler

Bu analizler V1 kapsaminda zorunlu degildir; ancak veri modeli ve loglama yapisi bu katmanlari ileride destekleyecek sekilde hazirlanmalidir.

| Analiz | Amac | Gerekli Veriler | Ilk Yaklasim |
|---|---|---|---|
| Transfer etkisi | Yeni gelen ve ayrilan oyuncularin takim performansina etkisini olcmek. | Transfer tarihleri, oyuncu mevkileri, oyuncu kalitesi, onceki takim katkisi, kadro degeri degisimi. | Transfer sonrasi ilk 5-10 mac performansini onceki donemle karsilastir. |
| Teknik direktor etkisi | Teknik direktor degisikliginin oyun, skor ve form uzerindeki etkisini analiz etmek. | Teknik direktor baslangic tarihi, onceki teknik direktor, mac sonuclari, gol ortalamalari, form serileri. | Hoca degisimi oncesi ve sonrasi puan/gol/form farkini hesapla. |
| Sakatlik etkisi | Eksik oyuncularin takim gucune ve mac riskine etkisini hesaplamak. | Sakat oyuncular, mevkiler, tahmini donus tarihi, oyuncu onem skoru, ilk 11 durumu. | Kritik oyuncu eksiginde takim guc skorunu ve guven skorunu dusur. |
| Motivasyon puani | Takimin maci ne kadar onemsedigini tahmin etmek. | Lig siralamasi, hedef durumu, dusme hattina uzaklik, sampiyonluk/Avrupa yarisi, kupa hedefi. | Sezon sonu, hedef maclari ve kritik puan farklarina gore 0-100 motivasyon skoru uret. |
| Derbi etkisi | Derbi ve rekabet maclarindaki farkli davranisi hesaba katmak. | Derbi etiketi, rekabet gecmisi, kart sayilari, gol ortalamalari, ev/deplasman derbi sonuclari. | Derbi maclarinda risk skorunu artir, kart ve KG Var sinyallerini ayri degerlendir. |
| Avrupa maci sonrasi performans | Avrupa kupasi sonrasi lig performansinda dusus veya rotasyon etkisini olcmek. | Avrupa mac tarihi, seyahat mesafesi, rotasyon bilgisi, sonraki lig maci sonucu. | Avrupa macindan sonraki 3-5 gun icindeki lig maclarini ayri risk grubuna al. |
| Ilk yari / ikinci yari gol modeli | Gollerin hangi devrede gelme egilimini tahmin etmek. | Ilk yari golleri, ikinci yari golleri, takim bazli devre performansi, mac temposu. | Takimlarin ilk/ikinci yari gol oranlarini birlestirerek devre bazli gol sinyali uret. |
| KG Var modeli | Iki takimin da gol atma olasiligini daha sistematik tahmin etmek. | Takim gol bulma orani, gol yeme orani, ev/deplasman ayrimi, lig KG Var ortalamasi. | Ev sahibi gol bulma ve deplasman gol bulma oranlarini savunma zaaflariyla birlikte puanla. |

### Ileri Analizler Icin Veri Hazirligi

- Oyuncu, teknik direktor ve sakatlik verileri ayri tablolarda tutulmalidir.
- Her mac icin `importance_score`, `derby_flag`, `post_european_match_flag` gibi ek alanlar planlanmalidir.
- Transfer ve teknik direktor etkisi icin tarih bazli degisim kaydi tutulmalidir.
- Ilk yari/ikinci yari ve KG Var modelleri icin ham skor verisi kaybolmadan saklanmalidir.
- Bu analizler kupon motoruna dogrudan karar olarak degil, once ek risk ve guven sinyali olarak dahil edilmelidir.

### AI Icin Hazirlik

- Gecmis mac verilerini temiz ve tutarli sakla.
- Tahmin sonuclarini kaydet.
- Onerilen kuponlarin basari durumunu takip et.
- Her tahmin icin gerekce ve metrikleri logla.
- Model egitimi icin ozellik tablolarini hazirla.

### Gelecek Model Yaklasimlari

- Kural tabanli baslangic modeli
- Lojistik regresyon
- Random forest
- Gradient boosting
- Zaman serisi form analizi
- LLM destekli yorumlama katmani

## V1 Gelistirme Asamalari

### Asama 1: Proje Iskeleti

- `data/`, `src/`, `tests/` klasorlerini hazirla.
- `README.md` dosyasina proje amacini yaz.
- `notes.md` icinde yol haritasini tut.

### Asama 2: Veri Semasi

- Mac verisi kolonlarini belirle.
- Takim verisi kolonlarini belirle.
- Lig verisi kolonlarini belirle.
- Oran verisi kolonlarini belirle.
- Ornek CSV dosyalari olustur.

### Asama 3: Veri Okuma Modulu

- CSV okuma fonksiyonlari yaz.
- Eksik veri kontrolleri ekle.
- Tarih ve takim isimlerini normalize et.
- Test verileriyle okuma surecini dogrula.

### Asama 4: Analiz Fonksiyonlari

- Takim form hesaplama fonksiyonu yaz.
- Gol ortalamasi hesaplama fonksiyonu yaz.
- Lig ortalamasi hesaplama fonksiyonu yaz.
- Ev/deplasman performansi hesaplama fonksiyonu yaz.

### Asama 5: Sinyal Uretimi

- 2.5 ust/alt sinyalleri uret.
- Karsilikli gol sinyalleri uret.
- Mac sonucu risk sinyalleri uret.
- Lig risk etkisini sinyallere dahil et.

### Asama 6: Kupon Oneri Motoru

- Sinyalleri puanla.
- Guven skoru hesapla.
- Risk seviyesi belirle.
- En uygun maclari sec.
- Kupon ciktisini okunabilir formatta uret.

### Asama 7: Test ve Degerlendirme

- Gecmis maclar uzerinde kupon onerilerini dene.
- Tahmin basari oranini olc.
- Yanlis tahminleri analiz et.
- Kurallari iyilestir.

## Basari Kriterleri

Ilk surum basarili sayilmak icin sunlari yapabilmeli:

- Mac verilerini okuyabilmeli.
- Takim bazli temel analiz uretebilmeli.
- Lig bazli temel analiz uretebilmeli.
- Her mac icin en az bir bahis sinyali uretebilmeli.
- Kupon onerisi icin guven ve risk skoru verebilmeli.
- Onerilerin neden uretildigini aciklayabilmeli.

## Ilk Surum Disinda Birakilanlar

- Gercek para ile otomatik bahis oynama
- Garanti kazanc iddiasi
- Canli bahis otomasyonu
- Ucretli API entegrasyonlari
- Tam otomatik yapay zeka karar sistemi

## Notlar

- Sistem sorumlu kullanim icin tasarlanmalidir.
- Kupon onerileri kesin sonuc degil, karar destek ciktisi olarak sunulmalidir.
- Her tahmin kaydedilmeli ve daha sonra performans analizi yapilmalidir.
- Veri kalitesi tahmin kalitesinden once gelir.
