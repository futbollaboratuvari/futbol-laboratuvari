# Faz 3 Kupon Motoru Raporu

## Tarih

2026-06-18

## Amaç

Faz 3'ün amacı, Faz 2 analiz motorlarının ürettiği skorları kullanarak otomatik kupon öneri sistemi oluşturmaktır.

Kullanılan ana sinyaller:

- `GUC_SKORU`
- `confidence_score`
- `KG_VAR_OLASILIGI`
- `UST_25_OLASILIGI`

## Oluşturulan Modül

`src/kupon_motoru.py` oluşturuldu.

Bu modül:

- Tek maç önerileri üretir.
- 2'li kupon önerileri üretir.
- 3'lü kupon önerileri üretir.
- Her öneri için risk puanı hesaplar.
- En güvenilir maçları öneri skoruna göre sıralar.

## Karar Kuralları

Tek maç öneri skoru:

```text
ONERI_SKORU =
  GUC_SKORU * 0.35 +
  confidence_score * 0.35 +
  market_score * 0.30
```

Market seçimi:

```text
market_score = max(KG_VAR_OLASILIGI, UST_25_OLASILIGI)
```

Risk puanı:

```text
RISK = 100 - ONERI_SKORU
```

Confidence düşükse risk artırılır:

```text
confidence_score < 40 ise +15 risk
confidence_score < 65 ise +7 risk
```

Kombine kupon riski:

```text
2'li kupon: +8 risk cezası
3'lü kupon: +16 risk cezası
```

Risk seviyeleri:

| Risk Puanı | Seviye |
|---:|---|
| 0-25 | düşük |
| 26-50 | orta |
| 51-75 | yüksek |
| 76-100 | çok yüksek |

## Test Verisi

Bu rapor, mevcut yerel örnek veriyle oluşturuldu:

```text
data/football_data_org_ornek.json
```

Maç sayısı:

```text
5
```

Not: Ham veri havuzu şu an 5 maçla başladığı için `confidence_score` düşük kalmaktadır. Bu nedenle önerilerde risk puanları yüksek görünür. Veri havuzu büyüdükçe öneri kalitesi ve confidence artacaktır.

## Tek Maç Önerileri

| Sıra | Maç | Market | Güç | KG Var | Üst 2.5 | Confidence | Öneri Skoru | Risk |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth | Üst 2.5 | 72.55 | 92.5 | 100 | 19.5 | 62.22 | 52.78 (yüksek) |
| 2 | Brighton & Hove Albion FC - Fulham FC | KG Var | 50.22 | 79.17 | 37.5 | 19.5 | 48.15 | 66.85 (yüksek) |
| 3 | Sunderland AFC - West Ham United FC | Üst 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yüksek) |
| 4 | Tottenham Hotspur FC - Burnley FC | Üst 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yüksek) |
| 5 | Aston Villa FC - Newcastle United FC | KG Var | 20.38 | 0 | 0 | 19.5 | 13.96 | 100 (çok yüksek) |

## 2'li Kupon Önerileri

| Sıra | Maçlar | Marketler | Kupon Skoru | Confidence | Risk |
|---:|---|---|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC | Üst 2.5<br>KG Var | 47.19 | 19.5 | 67.81 (yüksek) |
| 2 | Liverpool FC - AFC Bournemouth<br>Sunderland AFC - West Ham United FC | Üst 2.5<br>Üst 2.5 | 47.05 | 19.5 | 67.95 (yüksek) |
| 3 | Liverpool FC - AFC Bournemouth<br>Tottenham Hotspur FC - Burnley FC | Üst 2.5<br>Üst 2.5 | 47.05 | 19.5 | 67.95 (yüksek) |
| 4 | Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC | KG Var<br>Üst 2.5 | 40.01 | 19.5 | 74.99 (yüksek) |
| 5 | Brighton & Hove Albion FC - Fulham FC<br>Tottenham Hotspur FC - Burnley FC | KG Var<br>Üst 2.5 | 40.01 | 19.5 | 74.99 (yüksek) |

## 3'lü Kupon Önerileri

| Sıra | Maçlar | Marketler | Kupon Skoru | Confidence | Risk |
|---:|---|---|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC | Üst 2.5<br>KG Var<br>Üst 2.5 | 36.75 | 19.5 | 78.25 (çok yüksek) |
| 2 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Tottenham Hotspur FC - Burnley FC | Üst 2.5<br>KG Var<br>Üst 2.5 | 36.75 | 19.5 | 78.25 (çok yüksek) |
| 3 | Liverpool FC - AFC Bournemouth<br>Sunderland AFC - West Ham United FC<br>Tottenham Hotspur FC - Burnley FC | Üst 2.5<br>Üst 2.5<br>Üst 2.5 | 36.65 | 19.5 | 78.35 (çok yüksek) |
| 4 | Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC<br>Tottenham Hotspur FC - Burnley FC | KG Var<br>Üst 2.5<br>Üst 2.5 | 31.96 | 19.5 | 83.04 (çok yüksek) |
| 5 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Aston Villa FC - Newcastle United FC | Üst 2.5<br>KG Var<br>KG Var | 25.44 | 19.5 | 89.21 (çok yüksek) |

## Değerlendirme

En güçlü tek maç önerisi:

```text
Liverpool FC - AFC Bournemouth
Market: Üst 2.5
Öneri Skoru: 62.22
Risk: 52.78
```

En güçlü 2'li kupon:

```text
Liverpool FC - AFC Bournemouth / Üst 2.5
Brighton & Hove Albion FC - Fulham FC / KG Var
Kupon Skoru: 47.19
Risk: 67.81
```

En güçlü 3'lü kupon:

```text
Liverpool FC - AFC Bournemouth / Üst 2.5
Brighton & Hove Albion FC - Fulham FC / KG Var
Sunderland AFC - West Ham United FC / Üst 2.5
Kupon Skoru: 36.75
Risk: 78.25
```

## Önemli Not

Bu kupon motoru karar destek sistemi olarak tasarlanmıştır. Kesin sonuç iddiası üretmez.

Mevcut veri havuzu küçük olduğu için 2'li ve 3'lü kuponların risk seviyesi yüksek/çok yüksek çıkmaktadır. Faz 3'ün sonraki adımı, canlı API ile ham veri havuzunu büyütmek ve kupon motorunu `run_robot.bat` akışına bağlamaktır.
