# Futbol Laboratuvari V1 - Veri Kaynaklari

Arastirma tarihi: 2026-06-18

Bu dokuman Futbol Laboratuvari V1 icin mac sonuclari, fikstur, takim istatistikleri, lig puan durumu, son 5 mac formu ve gol istatistikleri acisindan kullanilabilecek veri kaynaklarini karsilastirir.

## Kisa Degerlendirme

V1 icin en pratik yaklasim:

1. Ilk prototipte `football-data.co.uk` ve `openfootball` gibi dosya tabanli kaynaklarla gecmis mac verisi topla.
2. Canliya yakin fikstur, puan durumu ve takim verileri icin `API-Football` veya `football-data.org` kullan.
3. Gol, KG Var, Ust/Alt, korner ve kart gibi bahis odakli istatistikler icin `FootyStats` daha uygun bir ikinci kaynak olarak degerlendir.
4. Ucretsiz, anahtarsiz ve basit denemeler icin `OpenLigaDB` ve `TheSportsDB` yardimci kaynak olarak kullanilabilir.

## Veri Kaynaklari Tablosu

| Kaynak adi | Ucretsiz mi? | API var mi? | Guncellik seviyesi | Cekilebilecek veriler | Avantajlari | Dezavantajlari |
|---|---|---|---|---|---|---|
| API-Football | Evet, ucretsiz plan var; ucretsiz planda gunluk 100 istek siniri bulunur. | Evet, JSON API. | Yuksek; livescore, fikstur ve istatistik odakli guncel veri sunar. Kapsam sayfasinda son guncelleme tarihi yayinlanir. | Mac sonuclari, fikstur, ligler, puan durumu, takimlar, kadrolar, oyuncular, sakatliklar, line-up, mac olaylari, takim/mac istatistikleri, head-to-head, bahis oranlari, tahminler. | V1 hedeflerinin cogunu tek API ile karsilar. Fikstur, puan durumu, takim istatistikleri ve gol verileri icin guclu aday. Ucretsiz planda tum endpointler mevcut, kredi karti gerektirmez. | Ucretsiz istek limiti dusuk. Ucretsiz planda sezon gecmisi sinirli olabilir. Ticari veya yogun kullanimda ucretli plana gecmek gerekir. |
| FootyStats API | Evet, sinirli ucretsiz paket var; ucretsiz paket Premier League ile sinirli gorunur. | Evet, JSON API. | Yuksek; sonuclarin yaklasik 20 dakikada bir guncellendigini belirtir. | Mac sonuclari, fikstur, lig istatistikleri, takim istatistikleri, oyuncu istatistikleri, Ust/Alt, KG Var, korner, kart, gol ortalamalari, tarih bazli lig istatistikleri. | Bahis analizi icin cok uygun. KG Var/Yok, Ust/Alt, gol, korner ve kart gibi V1 sinyallerini dogrudan besler. Veri noktalari zengin. | Ucretsiz kapsam dar. Cok ligli sistem icin ucretli paket gerekir. Kaynak bagimliligi yuksek olursa maliyet artabilir. |
| football-data.org | Evet, ucretsiz veya dusuk seviye erisim vardir; daha genis kapsam planlara baglidir. | Evet, REST/JSON API. | Orta-yuksek; maclar, takim maclari ve puan durumu icin guncel API sunar. | Ligler, takimlar, mac sonuclari, fikstur, puan durumu, takim maclari, head-to-head, skorlar, hakem ve bazi mac detaylari. | Temiz API yapisi, iyi dokumantasyon, puan durumu ve fikstur icin guvenilir baslangic kaynagi. Takimlarin son maclari cekilerek son 5 form hesaplanabilir. | Bazi endpointler ve ligler plan seviyesine bagli olabilir. Bahis odakli KG Var/Ust-Alt verilerini hazir metrik olarak vermekten cok ham mac verisi saglar. |
| Football-Data.co.uk | Evet, CSV ve Excel dosyalari ucretsiz indirilebilir. | Hayir, klasik API yok; dosya indirme mantigi var. | Orta; daha cok gecmis mac sonuclari ve oran dosyalari icin uygundur. Canli veri kaynagi gibi dusunulmemeli. | Gecmis mac sonuclari, lig bazli sezon dosyalari, bahis oranlari, kapanis/acilis oranlari, bazi mac istatistikleri. | Model gelistirme ve backtest icin cok kullanisli. CSV formatinda oldugu icin V1 veri isleme katmanina kolay girer. Bahis orani analizi icin degerli. | Fikstur ve canli guncellik icin ideal degil. Takim istatistikleri, son 5 form ve lig metrikleri sistem tarafinda hesaplanmali. |
| OpenFootball / football.json | Evet, public domain veri olarak sunulur. | Klasik API degil; GitHub raw JSON dosyalari uzerinden kullanilabilir. | Orta; topluluk ve repo guncellemelerine baglidir. 2025-26 gibi guncel sezon klasorleri bulunur. | Mac fiksturu, mac sonuclari, tarih, takimlar, skorlar, sezon ve lig dosyalari. | Tamamen acik, API anahtari gerektirmez, JSON formatinda kolay islenir. Prototip ve test verisi icin cok pratik. | Kapsam ve guncellik topluluk katkilarina baglidir. Puan durumu, takim istatistikleri, KG Var ve Ust/Alt gibi metrikler ham veriden hesaplanmalidir. |
| OpenLigaDB | Evet, ucretsiz topluluk projesi; veri cekmek icin kimlik dogrulama gerekmez. | Evet, JSON API. | Orta-yuksek; ozellikle Almanya merkezli liglerde ve toplulukca girilen liglerde guncel olabilir. | Mac sonuclari, fikstur, lig/sezon/mac gunu verileri, puan durumu, takimlar, gol kralligi gibi temel bilgiler. | Ucretsiz, anahtarsiz, basit entegrasyon. Deneme, prototip ve Bundesliga odakli senaryolar icin iyi. | Kapsam global profesyonel API'lere gore sinirli ve topluluk kalitesine bagli. Bahis odakli ayrintili takim istatistikleri sinirli. |
| TheSportsDB | Evet, ucretsiz spor API'si vardir; ucretli destekci planinda ayrilmis production key ve V2 ozellikleri bulunur. | Evet, API var. | Orta; genel spor verisi ve medya/metadata icin daha uygun. Premium tarafta livescore gibi daha guncel ozellikler olabilir. | Takim bilgileri, ligler, sezonlar, mac/event verileri, skorlar, bazi fikstur bilgileri, logo ve gorseller, video/highlight baglantilari. | Takim ve lig metadata'si icin kullanisli. Logo, arma, lig/takim bilgileri gibi arayuz verilerini zenginlestirir. | Derin bahis istatistikleri, KG Var/Ust-Alt ve ciddi modelleme verisi icin tek basina yeterli degil. Uretim kullaniminda ucretli plana ihtiyac olabilir. |
| Sportmonks Football API | Sinirli deneme veya ucretli plan odakli degerlendirilmeli. | Evet, kapsamli REST API. | Yuksek; profesyonel futbol API'si olarak canli mac, fikstur ve istatistik odaklidir. | Fikstur, mac sonuclari, livescore, ligler, takimlar, oyuncular, istatistikler, puan durumu, oranlar, tahminler ve genis futbol entity'leri. | Profesyonel urun icin guclu ve genis kapsamli kaynak. Include/filter yapisi sayesinde tek istekte zengin veri alinabilir. | V1 hobi/prototip asamasinda maliyet ve entegrasyon karmasikligi yuksek olabilir. Ucretsiz kullanim kosullari netlestirilmeden ana kaynak yapilmamali. |
| Kaggle futbol veri setleri | Genellikle evet; veri setine gore degisir. | Hayir, Kaggle API ile dosya indirilebilir ama futbol verisi icin canli API degildir. | Dusuk-orta; veri setinin son guncellemesine baglidir. | Gecmis mac sonuclari, takim/oyuncu verileri, lig tablolarindan turetilmis veri setleri, bazi istatistik dosyalari. | Model egitimi, deneme, backtest ve ornek veri icin kullanisli. Baslangicta API bagimliligi olmadan calismayi saglar. | Guncel fikstur ve canli puan durumu icin uygun degil. Lisans ve veri kalitesi her veri setinde ayri kontrol edilmeli. |

## V1 Onceliklerine Gore Uygunluk

| Oncelik | En uygun kaynaklar | Not |
|---|---|---|
| Mac sonuclari | API-Football, football-data.org, Football-Data.co.uk, OpenFootball, OpenLigaDB | Gecmis veri icin CSV/JSON kaynaklari yeterli; guncel veri icin API gerekir. |
| Fikstur | API-Football, football-data.org, OpenLigaDB, Sportmonks | Uretim senaryosunda API tabanli kaynak tercih edilmeli. |
| Takim istatistikleri | FootyStats, API-Football, Sportmonks | Bahis sinyalleri icin FootyStats daha dogrudan metrikler sunar. |
| Lig puan durumu | API-Football, football-data.org, OpenLigaDB, Sportmonks | Puan durumu V1 icin dogrudan API'den alinabilir. |
| Son 5 mac formu | football-data.org, API-Football, OpenFootball, Football-Data.co.uk | Genellikle kaynakta hazir alan yerine takim maclari cekilip sistem icinde hesaplanmali. |
| Gol istatistikleri | FootyStats, API-Football, Football-Data.co.uk, OpenFootball | KG Var ve Ust/Alt icin ham skor verisinden de hesaplama yapilabilir. |

## V1 Icin Onerilen Kaynak Stratejisi

### Minimum Maliyetli Baslangic

| Katman | Kaynak | Kullanim |
|---|---|---|
| Gecmis mac verisi | Football-Data.co.uk | CSV ile mac sonuclari ve oran gecmisi alinir. |
| Test ve ornek JSON verisi | OpenFootball | JSON formatinda mac sonuclari ve fikstur islenir. |
| Puan durumu/fikstur denemesi | OpenLigaDB | Ucretsiz ve anahtarsiz API ile prototip yapilir. |
| Takim/lig gorsel metadata | TheSportsDB | Takim adi, logo, lig bilgisi gibi yardimci veriler alinir. |

### Daha Guclu V1

| Katman | Kaynak | Kullanim |
|---|---|---|
| Ana API | API-Football | Fikstur, sonuc, puan durumu, takim, istatistik ve oran verileri alinir. |
| Bahis istatistikleri | FootyStats | KG Var, Ust/Alt, gol, korner ve kart sinyalleri desteklenir. |
| Backtest | Football-Data.co.uk | Gecmis sonuclar ve oranlarla kupon motoru test edilir. |

## Kaynak Secim Notlari

- Son 5 mac formu, KG Var/Yok ve Ust/Alt 2.5 metrikleri kaynakta hazir gelmese bile mac skorlarindan sistem icinde hesaplanabilir.
- V1 icin en kritik veri alanlari: `match_date`, `home_team`, `away_team`, `home_goals`, `away_goals`, `league`, `season`, `match_status`.
- Bahis orani analizi yapilacaksa Football-Data.co.uk ve API-Football birlikte degerlendirilmelidir.
- Ucretsiz API limitleri nedeniyle veri cekme katmaninda cache mekanizmasi kurulmalidir.
- Kaynak lisanslari ve ticari kullanim kosullari proje yayinlanmadan once yeniden kontrol edilmelidir.

## Kaynak Baglantilari

- API-Football pricing: https://www.api-football.com/pricing
- API-Football coverage: https://www.api-football.com/coverage
- FootyStats API: https://footystats.org/api
- football-data.org documentation: https://www.football-data.org/documentation/quickstart
- Football-Data.co.uk: https://www.football-data.co.uk/
- OpenFootball football.json: https://github.com/openfootball/football.json
- OpenLigaDB: https://www.openligadb.de/
- TheSportsDB API: https://www.thesportsdb.com/api.php
- Sportmonks Football API docs: https://docs.sportmonks.com/v3
- Kaggle European Soccer Database: https://www.kaggle.com/datasets/hugomathien/soccer

