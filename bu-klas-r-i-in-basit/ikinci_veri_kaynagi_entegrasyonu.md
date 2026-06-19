# Ikinci Veri Kaynagi Entegrasyonu Arastirmasi

## Tarih

2026-06-18

## Problem

football-data.org mevcut API anahtariyla Turkiye liglerini yeterli sekilde vermiyor. `/competitions` yanitinda Turkiye ligleri listelenmedi ve denenen olasi kodlarin buyuk kismi `404`, bazi Super Lig adaylari ise `403 restricted` dondurdu.

Futbol Laboratuvari'nin analiz havuzunu buyutmek icin otomatik ikinci veri kaynagi entegrasyonu gereklidir.

## Turkiye Ligleri Icin Hedef Kapsam

Oncelikli ligler:

1. Turkiye Super Lig
2. TFF 1. Lig
3. TFF 2. Lig
4. TFF 3. Lig

Gerekli veri alanlari:

- Fikstur
- Mac sonucu
- Ilk yari skoru
- Ikinci yari skoru veya ikinci yariyi hesaplatacak full-time/half-time skor
- Takim bilgisi
- Lig bilgisi
- Son mac gecmisi
- KG Var ve Ust/Alt analizi icin gol verisi

## Kaynak Karsilastirmasi

| Kaynak | Turkiye kapsami | Ucretsiz plan | Devre skoru uygunlugu | Alt lig uygunlugu | Entegrasyon onceligi |
|---|---|---|---|---|---|
| API-Football / API-Sports Football | Cok guclu. Coverage sayfasinda Turkey altinda 1. Lig, 2. Lig, 3. Lig gruplari, Super Lig ve Turkiye Kupasi gorunuyor. | Var, 100 istek/gun | Uygun | Cok uygun | 1 |
| SportMonks | Muhtemelen Super Lig ve bazi Turkiye kapsami var; public dokumanda alt lig detaylari API-Football kadar acik gorunmedi. | Trial var | Uygun | Dogrulama gerekli | 2 |
| TheSportsDB | Basit takim/lig/event verisi icin yardimci olabilir. | Var | Zayif | Zayif | 3 |
| TFF resmi sitesi | Turkiye ligleri icin birincil resmi kaynak olabilir; ancak standart public JSON API net degil. | Web uzerinden erisilebilir | Manuel parse gerekebilir | Uygun olabilir ama kirilgan | Yardimci/fallback |

## API-Football Neden En Uygun?

API-Football coverage sayfasinda Turkiye icin su ligler listeleniyor:

- 1. Lig
- 2. Lig
- 3. Lig - Group 1
- 3. Lig - Group 2
- 3. Lig - Group 3
- 3. Lig - Group 4
- 3. Lig - Play-offs
- Super Cup
- Super Lig
- Turkiye Kupasi

Bu liste Futbol Laboratuvari'nin Turkiye havuzu hedefiyle dogrudan uyumlu.

API-Football fiyat/limit bilgisi:

- Free: 100 istek/gun
- Pro: 7.500 istek/gun
- Ultra: 75.000 istek/gun
- Mega: 150.000 istek/gun

V1 icin Free plan test entegrasyonu yeterli olabilir; duzenli lig taramasi icin Pro plan daha mantiklidir.

## Onerilen Otomatik Fallback Mimarisi

### Veri Kaynagi Sirasi

1. `football-data.org`
   - Mevcut entegrasyon korunur.
   - PL, CL, WC gibi halihazirda calisan competition verileri icin kullanilir.

2. `API-Football / API-Sports Football`
   - Turkiye ligleri ve daha genis mac havuzu icin ikinci ana kaynak olur.
   - football-data.org 0 mac dondurdugunde veya lig desteklenmediginde otomatik devreye girer.

3. `TheSportsDB`
   - Sadece yardimci/ucuz kontrol kaynagi.
   - Final skor ve takim bilgisi icin kullanilabilir.

4. `TFF resmi kaynaklari`
   - Turkiye alt ligleri icin son care fallback.
   - HTML parse gerektirebilecegi icin dikkatli, cache'li ve testli kullanilmali.

### Otomatik Karar Akisi

```text
Lig istegi geldi
  |
  |-- football-data.org destekliyor mu?
  |      |-- Evet -> veri cek
  |      |-- Hayir / 0 mac / 403 / 404
  |
  |-- API-Football destekliyor mu?
  |      |-- Evet -> veri cek, normalize et
  |      |-- Hayir / limit doldu
  |
  |-- TheSportsDB veya TFF fallback dene
  |
  |-- Tum kaynaklari tek ortak mac semasina donustur
```

## Onerilen Yeni Moduller

| Modul | Amac |
|---|---|
| `src/veri_kaynagi_yoneticisi.py` | Hangi lig icin hangi API'nin kullanilacagina karar verir. |
| `src/api_football_client.py` | API-Football / API-Sports Football isteklerini yonetir. |
| `src/api_football_normalizer.py` | API-Football fixture yanitini Futbol Laboratuvari ortak mac semasina cevirir. |
| `src/kaynak_oncelik_haritasi.py` | Lig kodu -> tercih edilen kaynak sirasi eslemesini tutar. |
| `outputs/veri_kaynagi_secim_raporu.md` | Hangi lig icin hangi kaynak kullanildi raporu. |

## Ortak Mac Semasi

API-Football'dan gelen veriler mevcut motorlarla uyumlu olmak icin su alanlara normalize edilmeli:

| Alan | Aciklama |
|---|---|
| `source` | `api_football` |
| `source_match_id` | API-Football fixture id |
| `competition_code` | Yerel proje kodu |
| `competition_name` | Lig adi |
| `utc_date` | Mac tarihi |
| `status` | Mac durumu |
| `home_team_id` | Ev sahibi takim id |
| `home_team_name` | Ev sahibi takim adi |
| `away_team_id` | Deplasman takim id |
| `away_team_name` | Deplasman takim adi |
| `home_goals` | Mac sonu ev sahibi gol |
| `away_goals` | Mac sonu deplasman gol |
| `home_half_time_goals` | Ilk yari ev sahibi gol |
| `away_half_time_goals` | Ilk yari deplasman gol |
| `home_second_half_goals` | Full-time - half-time ile hesaplanir |
| `away_second_half_goals` | Full-time - half-time ile hesaplanir |

## Turkiye Ligleri Icin Kaynak Karari

| Lig | football-data.org | API-Football | Onerilen kaynak |
|---|---|---|---|
| Turkiye Super Lig | Mevcut hesapta yok/restricted | Coverage'da var | API-Football |
| TFF 1. Lig | Yok | Coverage'da var | API-Football |
| TFF 2. Lig | Yok | Coverage'da var | API-Football |
| TFF 3. Lig | Yok | Coverage'da grup bazinda var | API-Football |

## Uygulama Plani

### P14 - API-Football Test Entegrasyonu

1. API-Football anahtari icin `API_FOOTBALL_KEY` ortam degiskeni tanimla.
2. `src/api_football_client.py` olustur.
3. `/leagues?country=Turkey` endpointiyle Turkiye liglerini cek.
4. Lig id'lerini `data/api_football_turkiye_ligleri.json` dosyasina kaydet.
5. `/fixtures?league={id}&season={season}` ile fikstur/sonuc verisi cek.
6. Ilk yari ve full-time skor alanlarini test et.

### P15 - Normalizasyon

1. `src/api_football_normalizer.py` olustur.
2. API-Football fixture verisini mevcut `recent_results` formatina cevir.
3. Ilk yari/ikinci yari skorlarini ortak alanlara yaz.
4. KG Var, Ust/Alt ve devre KG motorlariyla uyumlulugu test et.

### P16 - Kaynak Yoneticisi

1. `src/veri_kaynagi_yoneticisi.py` olustur.
2. Her lig icin kaynak onceligi tanimla.
3. football-data.org basarisizsa API-Football'a otomatik gec.
4. Kaynak secim raporu uret.

## Sonuc

Futbol Laboratuvari icin ikinci veri kaynagi olarak en uygun secim:

**API-Football / API-Sports Football**

Sebep:

- Turkiye Super Lig, 1. Lig, 2. Lig ve 3. Lig gruplarini kapsiyor.
- Devre skoru ve mac sonu skoru Futbol Laboratuvari motorlari icin uygun.
- Free plan ile test edilebilir.
- Pro plan ile cok ligli gunluk tarama yapilabilir.

SportMonks daha kaliteli/profesyonel ikinci alternatif olabilir; ancak Turkiye alt ligleri icin public coverage bilgisi API-Football kadar acik degil ve maliyeti daha yuksek.

## Kaynaklar

- API-Football Coverage: https://www.api-football.com/coverage
- API-Football Pricing: https://www.api-football.com/pricing
- API-Football Documentation: https://www.api-football.com/documentation-v3
- API-Sports Football Documentation: https://api-sports.io/documentation/football/v3
- SportMonks Football Docs: https://docs.sportmonks.com/football
- TheSportsDB API: https://www.thesportsdb.com/api.php
