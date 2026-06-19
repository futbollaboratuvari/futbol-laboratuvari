# API Veri Kaynaklari Karsilastirmasi

## Tarih

2026-06-18

## Amaç

football-data.org ucretsiz planinda mac sayisi ve competition erisimi sinirli kaldigi icin Futbol Laboratuvari V1 icin alternatif futbol veri kaynaklari karsilastirildi.

Karsilastirilan servisler:

- API-Football
- SportMonks
- TheSportsDB
- API-Sports Football

Not: API-Football, API-SPORTS ekosisteminin futbol urunu olarak gorunuyor. Bu nedenle API-Football ve API-Sports Football satirlari pratikte cok benzer/ayni kaynak olarak ele alinmalidir.

## Karsilastirma Tablosu

| Servis | Ucretsiz plan var mi? | Gunluk / saatlik limit | Lig sayisi | Mac sayisi / kapsam | Ilk yari skorlari | Ikinci yari skorlari | KG Var analizi uygunlugu | Ust/Alt analizi uygunlugu | Fiyat |
|---|---|---|---:|---|---|---|---|---|---|
| API-Football | Evet | Free: 100 istek/gun. Pro: 7.500/gun. Ultra: 75.000/gun. Mega: 150.000/gun. | 1.233 lig/kupa | Fixture, livescore, events, lineups, statistics, odds, predictions. Tum planlarda tum competition/endpoints var; free sezonda sinirli. | Var | Var; full-time ve devre skorlariyla ikinci yari hesaplanabilir. | Cok uygun | Cok uygun | Free $0. Pro $19/ay, Ultra $29/ay, Mega $39/ay |
| SportMonks Football API | Free trial var | Starter: 2.000 API call/entity/saat. Growth: 2.500/entity/saat. Pro: 3.000/entity/saat. Enterprise: 5.000/entity/saat. | 2.500+ lig; plana gore 5, 30, 120 veya tum ligler | Fixture, livescore, events, standings, lineups, statistics, xG/odds/predictions add-on yapisi. | Var | Var; score/event yapisindan devre ve mac sonu ayrilabilir. | Cok uygun | Cok uygun | Starter 29 EUR/ay, Growth 99 EUR/ay, Pro 249 EUR/ay, Enterprise custom. 14 gun trial |
| TheSportsDB | Evet | Free: 30 istek/dakika. Premium: 100/dakika. Business: 120/dakika. | All leagues endpoint free limit 10, premium 3000 donus siniri; toplam futbol lig kapsami daha az/degisken. | Genel spor API. Mac arama, gunluk program, event lookup, lig fiksturu var; free endpoint donusleri cok kisitli. | Genelde yok / guvenilir degil | Genelde yok / guvenilir degil | Sinirli; sadece final skorla basit KG Var hesaplanabilir | Sinirli; sadece final skorla basit Ust/Alt hesaplanabilir | Free $0. Premium $9/ay. Business $20/ay |
| API-Sports Football | Evet | API-Football ile ayni paket mantigi: Free 100/gun, Pro 7.500/gun, Ultra 75.000/gun, Mega 150.000/gun | API-Football kapsamiyla ayni/benzer: 1.233 lig/kupa | API-SPORTS futbol dokumani API-Football v3 ile ayni ekosistemi isaret eder: fixture, livescore, events, statistics, odds, predictions. | Var | Var; full-time ve devre skorlarindan hesaplanabilir. | Cok uygun | Cok uygun | API-Football fiyatlariyla ayni kabul edilmeli: Free $0, Pro $19/ay, Ultra $29/ay, Mega $39/ay |

## Kaynak Bazli Degerlendirme

### API-Football

Guclu taraflari:

- Ucretsiz plani var.
- 1.233 lig/kupa kapsami oldukca genis.
- Tum planlarda tum endpoints ve competitions acik; free plan sezonsal olarak sinirli.
- Fixture, livescore, events, lineups, statistics, predictions ve odds alanlari mevcut.
- KG Var ve Ust/Alt modelleri icin final skor, devre skor, events ve istatistik verileri uygun.
- Fiyat/limit dengesi Futbol Laboratuvari V1 icin oldukca iyi.

Zayif taraflari:

- Free plan 100 istek/gun ile hizli tukenir.
- Cok ligli tarama icin Pro plan pratikte gerekir.

### SportMonks

Guclu taraflari:

- Veri kalitesi ve profesyonel kapsam guclu.
- 2.500+ lig kapsami var.
- Rate limit entity bazli ve saatlik; buyuk uygulamalar icin daha esnek.
- Fixtures, livescores, standings, season statistics, lineups, advanced statistics, xG ve odds gibi gelismis moduller var.
- KG Var, Ust/Alt, xG ve ileri tahmin motorlari icin cok iyi temel saglar.

Zayif taraflari:

- Gercek ucretsiz plan yerine trial modeli var.
- Baslangic fiyati API-Football'a gore yuksek.
- Starter planda sadece 5 lig secimi var; Futbol Laboratuvari genis lig tarayacaksa Growth veya Pro daha mantikli olur.

### TheSportsDB

Guclu taraflari:

- Gercekten ucretsiz giris seviyesi var.
- Premium fiyati dusuk: $9/ay.
- Basit fikstur, takim, lig ve final skor projeleri icin uygun.

Zayif taraflari:

- Free endpoint donus limitleri cok dusuk.
- Ilk yari / ikinci yari skor modellemesi icin uygun degil.
- KG Var ve Ust/Alt icin sadece basit final skor analizine yarar.
- Profesyonel bahis/kupon motoru icin yeterli veri derinligi zayif.

### API-Sports Football

Guclu taraflari:

- API-Football ile ayni ekosistem oldugu icin fiyat/limit/kapsam dengesi iyi.
- V1 icin hizli entegrasyon kolayligi yuksek.
- Devre skoru, final skor, fixture, statistics, events, odds ve predictions katmanlariyla mevcut motorlara dogrudan uygundur.

Zayif taraflari:

- API-Football'dan ayri bir kaynak gibi dusunulmemeli; veri cesitliligi bakimindan ayni yere bagimli kalma riski vardir.
- Free plan 100 istek/gun oldugu icin cok ligli tarama icin yetersizdir.

## Futbol Laboratuvari Icin Uygunluk Puani

| Servis | V1 uygunluk | Neden |
|---|---:|---|
| API-Football / API-Sports Football | 9/10 | En iyi fiyat/limit/kapsam dengesi. Mevcut motorlara en hizli entegre edilecek kaynak. |
| SportMonks | 8/10 | Veri kalitesi ve kapsam cok guclu; fiyat daha yuksek. Ileri surumler icin cok iyi. |
| TheSportsDB | 5/10 | Ucuz ve basit, ama devre skor/istatistik derinligi Futbol Laboratuvari hedefleri icin zayif. |

## Oneri

Futbol Laboratuvari V1 icin en uygun veri kaynagi:

**API-Football / API-Sports Football Pro plani**

Gerekce:

- $19/ay ile 7.500 istek/gun, V1 icin yeterli baslangic kapasitesi verir.
- 1.233 lig/kupa kapsami mevcut football-data.org sinirini ciddi sekilde asar.
- Ilk yari, mac sonu, fixture, events, statistics ve predictions katmanlari mevcut analiz motorlarina uygundur.
- KG Var, Ust/Alt, Form, Lig Gucu ve gelecekteki kupon motoru icin yeterli veri derinligi sunar.

Ikinci asama onerisi:

**SportMonks Growth veya Pro**

SportMonks, Futbol Laboratuvari daha profesyonel hale geldiginde, xG, gelismis istatistikler, daha derin tarihsel veri ve daha kaliteli lig kapsami icin daha iyi olabilir. Ancak V1 icin maliyet/kurulum dengesi API-Football tarafinda daha avantajli.

TheSportsDB ise sadece yardimci/kontrol kaynagi olarak kullanilmali; ana veri kaynagi olarak onerilmez.

## Kaynaklar

- API-Football Pricing: https://www.api-football.com/pricing
- API-Football Coverage: https://www.api-football.com/coverage
- API-Football Documentation: https://www.api-football.com/documentation-v3
- API-Sports Football Documentation: https://api-sports.io/documentation/football/v3
- SportMonks Football API: https://www.sportmonks.com/football-api/
- SportMonks Rate Limit Docs: https://docs.sportmonks.com/v3/api/rate-limit
- SportMonks Endpoints Docs: https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints
- TheSportsDB Free API: https://www.thesportsdb.com/api.php
- TheSportsDB Pricing: https://www.thesportsdb.com/pricing
- TheSportsDB Documentation: https://www.thesportsdb.com/documentation
