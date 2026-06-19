# Ilk Yari / Ikinci Yari Modeli

## Modelin Amaci

Bu model, takimlarin ilk yari ve ikinci yari performanslarini ayri ayri analiz etmek icin tasarlanir.

Ana hedefler:

- Takimlarin ilk yari gol uretimini olcmek.
- Takimlarin ikinci yari gol uretimini olcmek.
- Ilk yari KG Var oranini hesaplamak.
- Ikinci yari KG Var oranini hesaplamak.
- Ilk yari ustun olunan maclari belirlemek.
- Ikinci yari ustun olunan maclari belirlemek.
- Son 5 mac ozelinde ilk yari ve ikinci yari formunu hesaplamak.
- 0-100 araliginda Yari Performans Puani uretmek.

## Girdi Verisi

Modelin calisabilmesi icin maclarda hem ilk yari hem de mac sonu skorlarinin tutulmasi gerekir. Ikinci yari skoru mac sonu skorundan ilk yari skoru cikarilarak hesaplanabilir.

| Alan | Tip | Aciklama | Ornek |
|---|---|---|---|
| match_id | string/integer | Mac kimligi. | `537785` |
| match_date | string | Mac tarihi veya UTC tarih. | `2025-08-15T19:00:00Z` |
| competition_code | string | Lig kodu. | `PL` |
| home_team_id | string/integer | Ev sahibi takim kimligi. | `64` |
| home_team_name | string | Ev sahibi takim adi. | `Liverpool FC` |
| away_team_id | string/integer | Deplasman takim kimligi. | `1044` |
| away_team_name | string | Deplasman takim adi. | `AFC Bournemouth` |
| half_time_home_goals | integer | Ilk yari ev sahibi gol sayisi. | `1` |
| half_time_away_goals | integer | Ilk yari deplasman gol sayisi. | `0` |
| full_time_home_goals | integer | Mac sonu ev sahibi gol sayisi. | `4` |
| full_time_away_goals | integer | Mac sonu deplasman gol sayisi. | `2` |
| status | string | Mac durumu. Sadece `FINISHED` maclar kullanilir. | `FINISHED` |

## Turetilen Alanlar

| Alan | Hesaplama | Aciklama |
|---|---|---|
| second_half_home_goals | `full_time_home_goals - half_time_home_goals` | Ev sahibinin ikinci yari golu. |
| second_half_away_goals | `full_time_away_goals - half_time_away_goals` | Deplasman takiminin ikinci yari golu. |
| first_half_total_goals | `half_time_home_goals + half_time_away_goals` | Ilk yari toplam gol. |
| second_half_total_goals | `second_half_home_goals + second_half_away_goals` | Ikinci yari toplam gol. |
| first_half_btts | Iki takim da ilk yarida gol atti mi? | Ilk yari KG Var. |
| second_half_btts | Iki takim da ikinci yarida gol atti mi? | Ikinci yari KG Var. |
| first_half_winner | Ilk yari skoru ustunu. | `home`, `away`, `draw` |
| second_half_winner | Sadece ikinci yari skoruna gore ustun taraf. | `home`, `away`, `draw` |

## Cikti Verisi

| Alan | Tip | Aciklama |
|---|---|---|
| team_id | string/integer | Analiz edilen takim kimligi. |
| team_name | string | Analiz edilen takim adi. |
| match_count | integer | Analize dahil edilen mac sayisi. |
| first_half_goals_for | integer | Ilk yarilarda atilan toplam gol. |
| first_half_goals_against | integer | Ilk yarilarda yenilen toplam gol. |
| first_half_goals_for_avg | decimal | Ilk yari mac basina atilan gol. |
| first_half_goals_against_avg | decimal | Ilk yari mac basina yenilen gol. |
| second_half_goals_for | integer | Ikinci yarilarda atilan toplam gol. |
| second_half_goals_against | integer | Ikinci yarilarda yenilen toplam gol. |
| second_half_goals_for_avg | decimal | Ikinci yari mac basina atilan gol. |
| second_half_goals_against_avg | decimal | Ikinci yari mac basina yenilen gol. |
| first_half_btts_count | integer | Ilk yari KG Var olan mac sayisi. |
| first_half_btts_rate | decimal | Ilk yari KG Var orani. |
| second_half_btts_count | integer | Ikinci yari KG Var olan mac sayisi. |
| second_half_btts_rate | decimal | Ikinci yari KG Var orani. |
| first_half_leading_count | integer | Takimin ilk yari ustun oldugu mac sayisi. |
| first_half_draw_count | integer | Takimin ilk yari berabere oldugu mac sayisi. |
| first_half_trailing_count | integer | Takimin ilk yari geride oldugu mac sayisi. |
| second_half_won_count | integer | Takimin sadece ikinci yari skoruna gore ustun oldugu mac sayisi. |
| second_half_draw_count | integer | Sadece ikinci yari skoruna gore beraberlik sayisi. |
| second_half_lost_count | integer | Takimin sadece ikinci yari skoruna gore geride oldugu mac sayisi. |
| first_half_form_score | decimal | 0-100 ilk yari performans puani. |
| second_half_form_score | decimal | 0-100 ikinci yari performans puani. |
| half_performance_score | decimal | 0-100 genel yari performans puani. |
| half_performance_label | string | Performans etiketi. |

## Analiz Kapsamlari

Model farkli kapsamlarda calisabilmelidir:

| Kapsam | Aciklama |
|---|---|
| overall | Tum uygun maclar. |
| home | Sadece ev sahibi olunan maclar. |
| away | Sadece deplasman maclari. |
| last_5 | Son 5 bitmis mac. |
| last_10 | Son 10 bitmis mac. |

V1 onceligi `last_5` ve `overall` kapsamlaridir.

## Son 5 Mac Ozelinde Yari Formu

Son 5 mac analizi icin:

1. Sadece `FINISHED` maclar secilir.
2. Takimin oynadigi maclar tarihe gore yeniden eskiye siralanir.
3. En yeni 5 mac alinir.
4. Her mac icin takim acisindan ilk yari ve ikinci yari skorlari cikarilir.
5. Ilk yari ve ikinci yari puanlari ayri hesaplanir.

Takim ev sahibiyse:

- Ilk yari atilan gol: `half_time_home_goals`
- Ilk yari yenilen gol: `half_time_away_goals`
- Ikinci yari atilan gol: `second_half_home_goals`
- Ikinci yari yenilen gol: `second_half_away_goals`

Takim deplasmandaysa:

- Ilk yari atilan gol: `half_time_away_goals`
- Ilk yari yenilen gol: `half_time_home_goals`
- Ikinci yari atilan gol: `second_half_away_goals`
- Ikinci yari yenilen gol: `second_half_home_goals`

## Yari Performans Puani Modeli

Yari Performans Puani 0-100 araliginda hesaplanir. Model iki alt skordan olusur:

- Ilk yari performans puani
- Ikinci yari performans puani

Genel puan:

`half_performance_score = (first_half_form_score * 0.45) + (second_half_form_score * 0.55)`

Ikinci yariya biraz daha fazla agirlik verilir; cunku mac sonu sonucuna dogrudan etkisi daha yuksek olabilir.

## Ilk Yari Performans Puani

| Bilesen | Agirlik | Aciklama |
|---|---:|---|
| Ilk yari ustunluk puani | 35 | Takimin ilk yariyi onde kapatma veya geride kalmama basarisi. |
| Ilk yari gol uretim puani | 25 | Ilk yari gol atma gucu. |
| Ilk yari savunma puani | 20 | Ilk yari gol yememe basarisi. |
| Ilk yari KG Var sinyali | 10 | Ilk yari karsilikli gol egilimi. |
| Son 5 ilk yari momentum puani | 10 | Son maclarda ilk yari performans gidisati. |

### Ilk Yari Ustunluk Puani

`first_half_advantage_ratio = (first_half_leading_count + first_half_draw_count * 0.5) / match_count`

`first_half_advantage_score = first_half_advantage_ratio * 35`

### Ilk Yari Gol Uretim Puani

`first_half_attack_score = min(first_half_goals_for_avg / 1.0, 1.0) * 25`

Ilk yari icin 1.00 gol ortalamasi guclu kabul edilir.

### Ilk Yari Savunma Puani

`first_half_defense_score = max(0, 1 - (first_half_goals_against_avg / 1.0)) * 20`

Ilk yari mac basina 1.00 veya daha fazla gol yemek savunma sinyalini ciddi dusurur.

### Ilk Yari KG Var Sinyali

Bu bilesen, KG Var tahmin modeli icin sinyal uretir; iyi/kotu performans puani olarak degil, gol acikligi sinyali olarak kullanilir.

`first_half_btts_score = first_half_btts_rate * 10`

### Son 5 Ilk Yari Momentum Puani

| Durum | Puan |
|---|---:|
| Son 3 macta ilk yari geride kalmadi | 10 |
| Son 2 macta ilk yari onde | 8 |
| Son macta ilk yari onde | 6 |
| Son macta ilk yari berabere | 4 |
| Son macta ilk yari geride | 0 |

## Ikinci Yari Performans Puani

| Bilesen | Agirlik | Aciklama |
|---|---:|---|
| Ikinci yari ustunluk puani | 35 | Sadece ikinci yari skoruna gore ustunluk. |
| Ikinci yari gol uretim puani | 25 | Ikinci yari gol atma gucu. |
| Ikinci yari savunma puani | 20 | Ikinci yari gol yememe basarisi. |
| Ikinci yari KG Var sinyali | 10 | Ikinci yari karsilikli gol egilimi. |
| Son 5 ikinci yari momentum puani | 10 | Son maclarda ikinci yari performans gidisati. |

### Ikinci Yari Ustunluk Puani

`second_half_advantage_ratio = (second_half_won_count + second_half_draw_count * 0.5) / match_count`

`second_half_advantage_score = second_half_advantage_ratio * 35`

### Ikinci Yari Gol Uretim Puani

`second_half_attack_score = min(second_half_goals_for_avg / 1.25, 1.0) * 25`

Ikinci yari gol ortalamasi genelde daha yuksek olabilecegi icin esik 1.25 olarak baslatilir.

### Ikinci Yari Savunma Puani

`second_half_defense_score = max(0, 1 - (second_half_goals_against_avg / 1.25)) * 20`

### Ikinci Yari KG Var Sinyali

`second_half_btts_score = second_half_btts_rate * 10`

### Son 5 Ikinci Yari Momentum Puani

| Durum | Puan |
|---|---:|
| Son 3 macta ikinci yari kaybetmedi | 10 |
| Son 2 macta ikinci yariyi kazandi | 8 |
| Son macta ikinci yariyi kazandi | 6 |
| Son macta ikinci yari berabere | 4 |
| Son macta ikinci yariyi kaybetti | 0 |

## Nihai Puan Etiketleri

| Puan | Etiket | Aciklama |
|---:|---|---|
| 85-100 | cok_guclu_yari_performansi | Takim devre performanslarinda cok guclu. |
| 70-84 | guclu_yari_performansi | Takim yari bazli olumlu sinyal veriyor. |
| 55-69 | orta_ustu_yari_performansi | Takim yari bazli makul seviyede. |
| 40-54 | orta_yari_performansi | Net sinyal zayif. |
| 25-39 | zayif_yari_performansi | Devre bazli risk yuksek. |
| 0-24 | cok_zayif_yari_performansi | Takim devre performanslarinda cok zayif. |

## Python Modulune Donusecek Veri Yapisi

Ornek girdi:

```json
{
  "team_id": 64,
  "team_name": "Liverpool FC",
  "scope": "last_5",
  "matches": [
    {
      "match_id": 537785,
      "match_date": "2025-08-15T19:00:00Z",
      "competition_code": "PL",
      "home_team_id": 64,
      "home_team_name": "Liverpool FC",
      "away_team_id": 1044,
      "away_team_name": "AFC Bournemouth",
      "half_time_home_goals": 1,
      "half_time_away_goals": 0,
      "full_time_home_goals": 4,
      "full_time_away_goals": 2,
      "status": "FINISHED"
    }
  ]
}
```

Ornek cikti:

```json
{
  "team_id": 64,
  "team_name": "Liverpool FC",
  "scope": "last_5",
  "match_count": 5,
  "first_half_goals_for_avg": 0.8,
  "first_half_goals_against_avg": 0.4,
  "second_half_goals_for_avg": 1.2,
  "second_half_goals_against_avg": 0.6,
  "first_half_btts_rate": 0.2,
  "second_half_btts_rate": 0.4,
  "first_half_leading_count": 2,
  "first_half_draw_count": 2,
  "first_half_trailing_count": 1,
  "second_half_won_count": 3,
  "second_half_draw_count": 1,
  "second_half_lost_count": 1,
  "first_half_form_score": 68.0,
  "second_half_form_score": 74.0,
  "half_performance_score": 71.3,
  "half_performance_label": "guclu_yari_performansi"
}
```

## Python Modulune Donusum Plani

Ileride `src/ilk_yari_ikinci_yari_modeli.py` dosyasi olusturulabilir.

| Fonksiyon | Amac |
|---|---|
| `derive_second_half_score(match)` | Ikinci yari skorlarini mac sonu ve ilk yari skorundan turetir. |
| `filter_matches_by_scope(matches, team_id, scope)` | Takim maclarini kapsam bazli secer. |
| `calculate_team_half_scores(match, team_id)` | Takim acisindan ilk/ikinci yari gol bilgilerini cikarir. |
| `calculate_first_half_stats(team_matches, team_id)` | Ilk yari istatistiklerini hesaplar. |
| `calculate_second_half_stats(team_matches, team_id)` | Ikinci yari istatistiklerini hesaplar. |
| `calculate_half_btts_rates(team_matches)` | Ilk ve ikinci yari KG Var oranlarini hesaplar. |
| `calculate_half_performance_score(stats)` | 0-100 Yari Performans Puani uretir. |
| `build_half_performance_report(matches, team_id, scope="last_5")` | Tum analizi tek raporda toplar. |

## Notlar

- Bu model, mac sonucu tahmininden cok devre bazli gol ve ustunluk davranisini anlamak icin kullanilir.
- Ilk yari ve ikinci yari KG Var sinyalleri kupon motorunda ayri bahis pazarlarini besleyebilir.
- Ilk surumda ham ilk yari skoru olmayan maclar model disinda birakilmalidir.
- Ileride rakip gucu, lig ortalamasi, mac onemi ve fikstur yorgunlugu modele eklenebilir.

