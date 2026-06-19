# Bugunun En Guclu Maclari

## Calisma Modu

CALISMA_MODU: DEMO

Demo modda calisiyor.

API key bulunmadigi icin robot canli API yerine yerel ornek veriyi kullandi.

## Rapor Bilgisi

ANALIZ_TARIHI: demo
MAC_TARIHI: data/football_data_org_ornek.json
TOPLAM_MAC: 5

## Demo Skorlanan Maclar

| Sira | Mac | Lig | En Guclu Market | Guc Skoru | KG Var | Ust 2.5 | Confidence | Oneri Skoru | Risk |
|---:|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth | Premier League | Ust 2.5 | 72.55 | 92.5 | 100 | 19.5 | 62.22 | 52.78 (yuksek) |
| 2 | Brighton & Hove Albion FC - Fulham FC | Premier League | KG Var | 50.22 | 79.17 | 37.5 | 19.5 | 48.15 | 66.85 (yuksek) |
| 3 | Sunderland AFC - West Ham United FC | Premier League | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 4 | Tottenham Hotspur FC - Burnley FC | Premier League | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 5 | Aston Villa FC - Newcastle United FC | Premier League | KG Var | 20.38 | 0 | 0 | 19.5 | 13.96 | 100 (cok_yuksek) |

---

# Faz 3 Kupon Motoru Raporu

## Tek Mac Onerileri

| Sira | Mac | Market | Guc | KG Var | Ust 2.5 | Confidence | Oneri Skoru | Risk |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth | Ust 2.5 | 72.55 | 92.5 | 100 | 19.5 | 62.22 | 52.78 (yuksek) |
| 2 | Brighton & Hove Albion FC - Fulham FC | KG Var | 50.22 | 79.17 | 37.5 | 19.5 | 48.15 | 66.85 (yuksek) |
| 3 | Sunderland AFC - West Ham United FC | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 4 | Tottenham Hotspur FC - Burnley FC | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 5 | Aston Villa FC - Newcastle United FC | KG Var | 20.38 | 0 | 0 | 19.5 | 13.96 | 100 (cok_yuksek) |

## 2'li Kupon Onerileri

| Sira | Maclar | Marketler | Kupon Skoru | Confidence | Risk |
|---:|---|---|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC | Ust 2.5<br>KG Var | 47.19 | 19.5 | 67.81 (yuksek) |
| 2 | Liverpool FC - AFC Bournemouth<br>Sunderland AFC - West Ham United FC | Ust 2.5<br>Ust 2.5 | 47.05 | 19.5 | 67.95 (yuksek) |
| 3 | Liverpool FC - AFC Bournemouth<br>Tottenham Hotspur FC - Burnley FC | Ust 2.5<br>Ust 2.5 | 47.05 | 19.5 | 67.95 (yuksek) |

## 3'lu Kupon Onerileri

| Sira | Maclar | Marketler | Kupon Skoru | Confidence | Risk |
|---:|---|---|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC | Ust 2.5<br>KG Var<br>Ust 2.5 | 36.75 | 19.5 | 78.25 (cok_yuksek) |
| 2 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Tottenham Hotspur FC - Burnley FC | Ust 2.5<br>KG Var<br>Ust 2.5 | 36.75 | 19.5 | 78.25 (cok_yuksek) |
| 3 | Liverpool FC - AFC Bournemouth<br>Sunderland AFC - West Ham United FC<br>Tottenham Hotspur FC - Burnley FC | Ust 2.5<br>Ust 2.5<br>Ust 2.5 | 36.65 | 19.5 | 78.35 (cok_yuksek) |

---

# Basari Yuzdesi Raporu

## Rapor Bilgisi

TOPLAM_TAHMIN: 5
SONUCLANAN_TAHMIN: 0
BEKLEYEN_TAHMIN: 5
VOID_TAHMIN: 0
GENEL_BASARI_ORANI: -

## Market Bazli Basari

| Market | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 2 | 0 | - |
| UST_25 | 0 | 0 | 3 | 0 | - |

## Lig Bazli Basari

| Lig | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| Premier League | 0 | 0 | 5 | 0 | - |

## Ham Veri Havuzu

- Gelen mac: 5
- Tekrar mac: 5
- Toplam benzersiz mac: 5
- Dosya: data/ham_mac_havuzu.json

## Tahmin Performans Takibi

- Gelen tahmin: 5
- Yeni eklenen tahmin: 5
- Toplam tahmin: 5
- Dosya: data/tahmin_gecmisi.json

## Ortam Uyarilari

- FOOTBALL_DATA_API_KEY tanimli degil.
- API_FOOTBALL_KEY tanimli degil.
- API key olmadigi icin demo mod kullanildi.

## Canli Moda Gecis

- `FOOTBALL_DATA_API_KEY` veya `API_FOOTBALL_KEY` tanimlandiginda robot canli mod deneyecek.
- API key yoksa robot durmaz; demo mod ile rapor uretir.
