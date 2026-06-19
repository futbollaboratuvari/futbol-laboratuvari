# Veri Buyutme Raporu

## Rapor Bilgisi

STATUS: api_key_missing
DATE_FROM: 2026-06-18
DAY_COUNT: 30
HAM_VERI_HAVUZU: C:\Users\Arıf\Documents\Codex\2026-06-18\bu-klas-r-i-in-basit\data\ham_mac_havuzu.json

## Durum

API_FOOTBALL_KEY tanimli olmadigi icin canli API-Football baglantisi calistirilamadi.

Canli league_id cekimi ve ham veri buyutme icin `API_FOOTBALL_KEY` ortam degiskeni tanimlanmali.

## Hazirlanan Akis

- `src/turkiye_ligleri_canli.py` olusturuldu.
- API anahtari tanimli oldugunda `/leagues?country=Turkey` endpointiyle Turkiye ligleri cekilecek.
- Proje hedefleriyle API-Football ligleri eslestirilecek.
- Gercek `league_id` degerleri rapora yazilacak.
- Secilen tarih araliginda fixture verisi cekilecek.
- Bulunan maclar `data/ham_mac_havuzu.json` dosyasina `match_id` ile tekillestirilerek eklenecek.

## Robot Entegrasyonu

`src/robot.py` guncellendi.

Robot artik:

- Maclari tarar.
- Ham veri havuzunu buyutir.
- Mac analizlerini uretir.
- Faz 3 kupon motorunu calistirir.
- Kupon onerilerini ana Markdown raporuna ekler.

## Sonraki Adim

Windows ortam degiskeni olarak `API_FOOTBALL_KEY` tanimlandiktan sonra:

```powershell
python src\turkiye_ligleri_canli.py
```

veya tek tik akis icin:

```powershell
run_robot.bat
```

calistirilmalidir.

## 2026-06-18 Guncel Kontrol

Bu oturumda `API_FOOTBALL_KEY` yeniden kontrol edildi ve ortam degiskeni olarak bulunamadi.

Bu nedenle:

- Turkiye liglerinin gercek `league_id` degerleri canli API'den cekilemedi.
- API-Football fixture verisi ile ham veri havuzu buyutulemedi.
- 1000+ maclik veri havuzu bu oturumda olusturulamadi.

Hazir olan kisimlar:

- `src/turkiye_ligleri_canli.py` API anahtari geldigi anda `/leagues?country=Turkey` endpointini cagiracak.
- Lig eslesmeleri `src/kaynak_oncelik_haritasi.py` icindeki hedef lig adlariyla yapilacak.
- Fixture verileri ortak mac semasina normalize edilecek.
- `data/ham_mac_havuzu.json` dosyasinda `match_id` ile tekillestirilerek saklanacak.
- `src/robot.py` veri cekme, analiz, confidence, kupon ve tahmin gecmisi akisini tek raporda birlestirecek.

Not: Gercek `league_id` degerleri tahmin edilerek yazilmadi. Sadece canli API yanitindan geldiginde rapora islenecek.
