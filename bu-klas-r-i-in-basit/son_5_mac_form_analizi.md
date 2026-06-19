# Son 5 Mac Form Analizi

## Modulun Amaci

Bu modul, bir takimin son 5 mac performansini analiz ederek form durumunu sayisal ve aciklanabilir hale getirmek icin tasarlanir.

Ana hedefler:

- Bir takimin son 5 macini incelemek.
- Galibiyet, beraberlik ve maglubiyet sayisini cikarmak.
- Atilan ve yenilen gol ortalamalarini hesaplamak.
- Ev sahibi ve deplasman performansini ayirmak.
- 0-100 araliginda form puani uretmek.

## Girdi Verisi

| Alan | Tip | Aciklama | Ornek |
|---|---|---|---|
| match_id | string/integer | Mac kimligi. | `537785` |
| match_date | string | Mac tarihi veya UTC tarih. | `2025-08-15T19:00:00Z` |
| competition_code | string | Lig kodu. | `PL` |
| home_team_id | string/integer | Ev sahibi takim kimligi. | `64` |
| home_team_name | string | Ev sahibi takim adi. | `Liverpool FC` |
| away_team_id | string/integer | Deplasman takim kimligi. | `1044` |
| away_team_name | string | Deplasman takim adi. | `AFC Bournemouth` |
| home_goals | integer | Ev sahibi gol sayisi. | `4` |
| away_goals | integer | Deplasman gol sayisi. | `2` |
| status | string | Mac durumu. Sadece `FINISHED` maclar kullanilir. | `FINISHED` |

## Cikti Verisi

| Alan | Tip | Aciklama |
|---|---|---|
| team_id | string/integer | Analiz edilen takim kimligi. |
| team_name | string | Analiz edilen takim adi. |
| match_count | integer | Analize dahil edilen mac sayisi. En fazla 5. |
| wins | integer | Galibiyet sayisi. |
| draws | integer | Beraberlik sayisi. |
| losses | integer | Maglubiyet sayisi. |
| points | integer | Son 5 macta toplanan puan. |
| points_per_match | decimal | Mac basina puan. |
| goals_for | integer | Toplam atilan gol. |
| goals_against | integer | Toplam yenilen gol. |
| goal_difference | integer | Gol averaji. |
| goals_for_avg | decimal | Mac basina atilan gol. |
| goals_against_avg | decimal | Mac basina yenilen gol. |
| clean_sheets | integer | Gol yemeden bitirilen mac sayisi. |
| failed_to_score | integer | Gol atilamayan mac sayisi. |
| home_matches | integer | Son 5 icindeki ev sahibi mac sayisi. |
| away_matches | integer | Son 5 icindeki deplasman mac sayisi. |
| home_points | integer | Ev sahibi maclardan alinan puan. |
| away_points | integer | Deplasman maclardan alinan puan. |
| home_goals_for_avg | decimal | Ev sahibi maclarda atilan gol ortalamasi. |
| away_goals_for_avg | decimal | Deplasman maclarda atilan gol ortalamasi. |
| home_goals_against_avg | decimal | Ev sahibi maclarda yenilen gol ortalamasi. |
| away_goals_against_avg | decimal | Deplasman maclarda yenilen gol ortalamasi. |
| result_sequence | string | Sonuc dizisi. Ornek: `W-W-D-L-W`. |
| form_score | decimal | 0-100 arasi form puani. |
| form_label | string | Form etiketi. |

## Son 5 Mac Secim Mantigi

1. Sadece `FINISHED` durumundaki maclar dikkate alinir.
2. Takimin ev sahibi veya deplasman oldugu tum maclar bulunur.
3. Maclar tarihe gore yeniden eskiye siralanir.
4. En yeni 5 mac secilir.
5. Mac sayisi 5'ten azsa analiz yine calisir; `match_count` gercek sayiyi gosterir.
6. Mac sayisi 3'ten azsa form puani dusuk guvenli olarak isaretlenir.

## Mac Sonucu Hesaplama

Takim ev sahibiyse:

- `goals_for = home_goals`
- `goals_against = away_goals`
- `home_goals > away_goals`: galibiyet
- `home_goals == away_goals`: beraberlik
- `home_goals < away_goals`: maglubiyet

Takim deplasmandaysa:

- `goals_for = away_goals`
- `goals_against = home_goals`
- `away_goals > home_goals`: galibiyet
- `away_goals == home_goals`: beraberlik
- `away_goals < home_goals`: maglubiyet

Puanlama:

- Galibiyet: 3 puan
- Beraberlik: 1 puan
- Maglubiyet: 0 puan

## Ev Sahibi ve Deplasman Ayrimi

Son 5 mac icinde ev ve deplasman performansi ayri hesaplanir.

| Kapsam | Hesaplanacak Alanlar |
|---|---|
| Ev sahibi | Mac sayisi, puan, galibiyet, beraberlik, maglubiyet, atilan gol, yenilen gol, gol ortalamasi. |
| Deplasman | Mac sayisi, puan, galibiyet, beraberlik, maglubiyet, atilan gol, yenilen gol, gol ortalamasi. |

Bu ayrim kupon motorunda su sorular icin kullanilir:

- Ev sahibi takim evinde guclu mu?
- Deplasman takim dis sahada gol bulabiliyor mu?
- Takim genel formda mi iyi, yoksa macin oynanacagi saha kosulunda da iyi mi?

## Form Puani Hesaplama Mantigi

Form puani 0-100 araliginda uretilir. Ilk surumda aciklanabilir, agirlikli ve kural tabanli model kullanilir.

| Bilesen | Agirlik | Aciklama |
|---|---:|---|
| Sonuc puani | 45 | Galibiyet, beraberlik ve maglubiyetlerden gelen ana performans puani. |
| Gol uretim puani | 20 | Takimin son 5 macta gol atma gucu. |
| Savunma puani | 20 | Takimin son 5 macta gol yeme durumu. |
| Ev/deplasman uyum puani | 10 | Takimin macin oynanacagi saha tipindeki performansi. |
| Seri ve momentum puani | 5 | Son maclarin olumlu veya olumsuz gidisati. |

Toplam agirlik: 100

### Sonuc Puani

`max_points = match_count * 3`

`points_ratio = points / max_points`

`result_score = points_ratio * 45`

Ornek:

- 5 macta 10 puan alan takim:
- `points_ratio = 10 / 15 = 0.666`
- `result_score = 0.666 * 45 = 30`

### Gol Uretim Puani

Mac basina atilan gol ortalamasi kullanilir.

`attack_score = min(goals_for_avg / 2.0, 1.0) * 20`

| Goals For Avg | Gol Uretim Puani |
|---:|---:|
| 0.00 | 0 |
| 0.50 | 5 |
| 1.00 | 10 |
| 1.50 | 15 |
| 2.00 ve uzeri | 20 |

### Savunma Puani

Mac basina yenilen gol ortalamasi dusukse savunma puani artar.

`defense_score = max(0, 1 - (goals_against_avg / 2.0)) * 20`

| Goals Against Avg | Savunma Puani |
|---:|---:|
| 0.00 | 20 |
| 0.50 | 15 |
| 1.00 | 10 |
| 1.50 | 5 |
| 2.00 ve uzeri | 0 |

### Ev/Deplasman Uyum Puani

Bir sonraki macin saha kosulu biliniyorsa ilgili saha tipi kullanilir.

`venue_points_ratio = venue_points / (venue_matches * 3)`

`venue_score = venue_points_ratio * 10`

Ilgili saha tipinde hic mac yoksa:

`venue_score = 5`

Bu durumda "saha tipi icin yeterli veri yok" notu eklenir.

### Seri ve Momentum Puani

| Durum | Momentum Puani |
|---|---:|
| Son 3 mac galibiyet | 5 |
| Son 2 mac galibiyet | 4 |
| Son mac galibiyet | 3 |
| Son mac beraberlik | 2 |
| Son mac maglubiyet | 0 |
| Son 3 mac maglubiyet | 0 ve risk notu |

## Nihai Form Puani

`form_score = result_score + attack_score + defense_score + venue_score + momentum_score`

Sonuc 0-100 araligina sabitlenir:

`form_score = max(0, min(100, form_score))`

## Form Etiketleri

| Form Puani | Etiket | Aciklama |
|---:|---|---|
| 85-100 | cok_guclu_form | Takim cok iyi formda. |
| 70-84 | guclu_form | Takim pozitif formda. |
| 55-69 | orta_ustu_form | Takim kabul edilebilir formda. |
| 40-54 | orta_form | Net sinyal zayif. |
| 25-39 | zayif_form | Takim form olarak riskli. |
| 0-24 | cok_zayif_form | Takim cok dusuk formda. |

## Python Modulune Donusecek Veri Yapisi

Ornek girdi:

```json
{
  "team_id": 64,
  "team_name": "Liverpool FC",
  "reference_date": "2026-06-18",
  "next_match_venue": "home",
  "matches": [
    {
      "match_id": 537785,
      "match_date": "2025-08-15T19:00:00Z",
      "competition_code": "PL",
      "home_team_id": 64,
      "home_team_name": "Liverpool FC",
      "away_team_id": 1044,
      "away_team_name": "AFC Bournemouth",
      "home_goals": 4,
      "away_goals": 2,
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
  "match_count": 5,
  "wins": 3,
  "draws": 1,
  "losses": 1,
  "points": 10,
  "points_per_match": 2.0,
  "goals_for": 9,
  "goals_against": 5,
  "goal_difference": 4,
  "goals_for_avg": 1.8,
  "goals_against_avg": 1.0,
  "clean_sheets": 2,
  "failed_to_score": 1,
  "home_matches": 3,
  "away_matches": 2,
  "home_points": 7,
  "away_points": 3,
  "result_sequence": "W-W-D-L-W",
  "form_score": 74.0,
  "form_label": "guclu_form"
}
```

## Python Modulune Donusum Plani

Ileride `src/son_5_mac_form_analizi.py` dosyasi olusturulabilir.

| Fonksiyon | Amac |
|---|---|
| `filter_team_matches(matches, team_id)` | Takimin oynadigi maclari secer. |
| `get_last_finished_matches(matches, limit=5)` | Bitmis son maclari tarihe gore secer. |
| `calculate_match_result(match, team_id)` | Takim acisindan W/D/L sonucunu hesaplar. |
| `calculate_goal_stats(team_matches, team_id)` | Atilan/yenilen gol ve ortalamalari hesaplar. |
| `calculate_venue_stats(team_matches, team_id)` | Ev/deplasman ayrimli performansi hesaplar. |
| `calculate_form_score(stats, next_match_venue=None)` | 0-100 form puani uretir. |
| `build_form_report(matches, team_id, next_match_venue=None)` | Tum analizi tek raporda toplar. |

## Notlar

- Son 5 mac formu tek basina kupon karari vermemelidir.
- Lig kalitesi, rakip gucu, ev/deplasman kosulu ve sakatliklar ileride modele eklenmelidir.
- Form puani aciklanabilir olmalidir; her puanin hangi bilesenden geldigi raporlanmalidir.

