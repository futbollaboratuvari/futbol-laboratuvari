# Futbol Veri Modeli

Bu dokuman Futbol Laboratuvari icin ilk surumda tutulacak temel veri alanlarini tanimlar. Alan adlari kod ve CSV/JSON semalari icin kullanilabilir olacak sekilde `snake_case` yazilmistir.

## 1. Mac Bilgileri

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| match_id | string | Evet | Mac icin benzersiz kimlik. | `2026-tr-superlig-0001` |
| league_id | string | Evet | Macin oynandigi lig kimligi. | `tr-superlig` |
| season | string | Evet | Sezon bilgisi. | `2026-2027` |
| match_week | integer | Hayir | Lig haftasi. | `12` |
| match_date | date | Evet | Mac tarihi. | `2026-09-18` |
| match_time | time | Hayir | Mac baslama saati. | `20:00` |
| home_team_id | string | Evet | Ev sahibi takim kimligi. | `galatasaray` |
| away_team_id | string | Evet | Deplasman takim kimligi. | `fenerbahce` |
| home_team_name | string | Evet | Ev sahibi takim adi. | `Galatasaray` |
| away_team_name | string | Evet | Deplasman takim adi. | `Fenerbahce` |
| stadium | string | Hayir | Macin oynandigi stadyum. | `RAMS Park` |
| city | string | Hayir | Macin oynandigi sehir. | `Istanbul` |
| referee | string | Hayir | Mac hakemi. | `Hakem Adi` |
| status | string | Evet | Mac durumu: scheduled, live, finished, postponed, cancelled. | `finished` |
| full_time_home_goals | integer | Hayir | Mac sonu ev sahibi gol sayisi. | `2` |
| full_time_away_goals | integer | Hayir | Mac sonu deplasman gol sayisi. | `1` |
| half_time_home_goals | integer | Hayir | Ilk yari ev sahibi gol sayisi. | `1` |
| half_time_away_goals | integer | Hayir | Ilk yari deplasman gol sayisi. | `0` |
| second_half_home_goals | integer | Hayir | Ikinci yari ev sahibi gol sayisi. | `1` |
| second_half_away_goals | integer | Hayir | Ikinci yari deplasman gol sayisi. | `1` |
| full_time_result | string | Hayir | Mac sonucu: home_win, draw, away_win. | `home_win` |
| half_time_result | string | Hayir | Ilk yari sonucu: home_win, draw, away_win. | `home_win` |
| total_goals | integer | Hayir | Mactaki toplam gol sayisi. | `3` |
| both_teams_scored | boolean | Hayir | Iki takim da gol atti mi? | `true` |
| over_2_5 | boolean | Hayir | Mac 2.5 ust bitti mi? | `true` |
| home_red_cards | integer | Hayir | Ev sahibi kirmizi kart sayisi. | `0` |
| away_red_cards | integer | Hayir | Deplasman kirmizi kart sayisi. | `1` |
| home_yellow_cards | integer | Hayir | Ev sahibi sari kart sayisi. | `3` |
| away_yellow_cards | integer | Hayir | Deplasman sari kart sayisi. | `4` |
| home_corners | integer | Hayir | Ev sahibi korner sayisi. | `6` |
| away_corners | integer | Hayir | Deplasman korner sayisi. | `4` |
| home_shots | integer | Hayir | Ev sahibi toplam sut sayisi. | `14` |
| away_shots | integer | Hayir | Deplasman toplam sut sayisi. | `9` |
| home_shots_on_target | integer | Hayir | Ev sahibi isabetli sut sayisi. | `6` |
| away_shots_on_target | integer | Hayir | Deplasman isabetli sut sayisi. | `3` |
| notes | string | Hayir | Mac hakkinda ek not. | `Derbi maci` |

## 2. Takim Bilgileri

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Takim icin benzersiz kimlik. | `galatasaray` |
| team_name | string | Evet | Takim adi. | `Galatasaray` |
| short_name | string | Hayir | Kisa takim adi. | `GS` |
| country | string | Evet | Takimin ulkesi. | `Turkiye` |
| city | string | Hayir | Takimin sehri. | `Istanbul` |
| founded_year | integer | Hayir | Kurulus yili. | `1905` |
| stadium | string | Hayir | Ana stadyum. | `RAMS Park` |
| manager | string | Hayir | Teknik direktor. | `Teknik Direktor Adi` |
| current_league_id | string | Evet | Takimin mevcut ligi. | `tr-superlig` |
| squad_value | decimal | Hayir | Kadro piyasa degeri. | `245000000` |
| average_age | decimal | Hayir | Kadro yas ortalamasi. | `26.8` |
| main_formation | string | Hayir | Siklikla kullanilan dizilis. | `4-2-3-1` |
| team_strength_score | decimal | Hayir | Genel takim guc skoru, 0-100. | `82.5` |
| attack_score | decimal | Hayir | Hucum gucu skoru, 0-100. | `85.0` |
| defense_score | decimal | Hayir | Savunma gucu skoru, 0-100. | `78.0` |
| form_score | decimal | Hayir | Guncel form skoru, 0-100. | `74.0` |
| risk_score | decimal | Hayir | Takimin tahmin riski, 0-100. | `42.0` |
| is_active | boolean | Evet | Takim aktif olarak takip ediliyor mu? | `true` |

## 3. Lig Bilgileri

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| league_id | string | Evet | Lig icin benzersiz kimlik. | `tr-superlig` |
| league_name | string | Evet | Lig adi. | `Super Lig` |
| country | string | Evet | Ligin ulkesi. | `Turkiye` |
| confederation | string | Hayir | Kitasal federasyon. | `UEFA` |
| season | string | Evet | Aktif sezon. | `2026-2027` |
| tier | integer | Hayir | Ulke futbolundaki seviye. | `1` |
| team_count | integer | Hayir | Ligdeki takim sayisi. | `20` |
| match_count | integer | Hayir | Sezondaki toplam mac sayisi. | `380` |
| completed_match_count | integer | Hayir | Tamamlanan mac sayisi. | `112` |
| average_goals_per_match | decimal | Hayir | Lig mac basina gol ortalamasi. | `2.74` |
| home_win_rate | decimal | Hayir | Ev sahibi galibiyet orani. | `0.46` |
| draw_rate | decimal | Hayir | Beraberlik orani. | `0.27` |
| away_win_rate | decimal | Hayir | Deplasman galibiyet orani. | `0.27` |
| both_teams_scored_rate | decimal | Hayir | KG Var orani. | `0.58` |
| over_2_5_rate | decimal | Hayir | 2.5 ust orani. | `0.54` |
| under_2_5_rate | decimal | Hayir | 2.5 alt orani. | `0.46` |
| favorite_win_rate | decimal | Hayir | Favori takimlarin kazanma orani. | `0.61` |
| upset_rate | decimal | Hayir | Surpriz sonuc orani. | `0.18` |
| average_cards_per_match | decimal | Hayir | Mac basina kart ortalamasi. | `4.9` |
| average_corners_per_match | decimal | Hayir | Mac basina korner ortalamasi. | `9.6` |
| league_style_label | string | Hayir | Lig karakter etiketi. | `gollu_lig` |
| league_risk_score | decimal | Hayir | Lig tahmin riski, 0-100. | `55.0` |

## 4. Son 5 Mac Formu

Bu tablo takimlarin yakin donem performansini ozetler. Her takim icin genel, ev sahibi ve deplasman ayriminda hesaplanabilir.

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Analiz edilen takim kimligi. | `galatasaray` |
| scope | string | Evet | Form kapsami: overall, home, away. | `overall` |
| reference_date | date | Evet | Formun hesaplandigi tarih. | `2026-09-18` |
| last_5_matches_played | integer | Evet | Hesaba katilan mac sayisi. | `5` |
| last_5_wins | integer | Evet | Son 5 mactaki galibiyet sayisi. | `3` |
| last_5_draws | integer | Evet | Son 5 mactaki beraberlik sayisi. | `1` |
| last_5_losses | integer | Evet | Son 5 mactaki maglubiyet sayisi. | `1` |
| last_5_points | integer | Evet | Son 5 macta toplanan puan. | `10` |
| last_5_points_per_match | decimal | Evet | Son 5 mac puan ortalamasi. | `2.00` |
| last_5_goals_for | integer | Evet | Son 5 macta atilan gol. | `9` |
| last_5_goals_against | integer | Evet | Son 5 macta yenilen gol. | `5` |
| last_5_goal_difference | integer | Evet | Son 5 mac gol averaji. | `4` |
| last_5_clean_sheets | integer | Hayir | Son 5 macta gol yememe sayisi. | `2` |
| last_5_failed_to_score | integer | Hayir | Son 5 macta gol atamama sayisi. | `1` |
| last_5_btts_count | integer | Hayir | Son 5 macta KG Var sayisi. | `3` |
| last_5_over_2_5_count | integer | Hayir | Son 5 macta 2.5 ust sayisi. | `3` |
| last_5_result_sequence | string | Hayir | Sonuclarin sirali ozeti. | `W-W-D-L-W` |
| last_5_form_score | decimal | Hayir | Form skoru, 0-100. | `76.0` |

## 5. Ev Sahibi / Deplasman Performansi

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Takim kimligi. | `galatasaray` |
| venue_scope | string | Evet | Performans kapsami: home veya away. | `home` |
| season | string | Evet | Sezon bilgisi. | `2026-2027` |
| matches_played | integer | Evet | Oynanan mac sayisi. | `8` |
| wins | integer | Evet | Galibiyet sayisi. | `6` |
| draws | integer | Evet | Beraberlik sayisi. | `1` |
| losses | integer | Evet | Maglubiyet sayisi. | `1` |
| points | integer | Evet | Toplanan puan. | `19` |
| points_per_match | decimal | Evet | Mac basina puan. | `2.38` |
| goals_for | integer | Evet | Atan gol. | `18` |
| goals_against | integer | Evet | Yenilen gol. | `7` |
| goal_difference | integer | Evet | Gol averaji. | `11` |
| goals_for_per_match | decimal | Evet | Mac basina atilan gol. | `2.25` |
| goals_against_per_match | decimal | Evet | Mac basina yenilen gol. | `0.88` |
| clean_sheet_rate | decimal | Hayir | Gol yememe orani. | `0.38` |
| failed_to_score_rate | decimal | Hayir | Gol atamama orani. | `0.13` |
| first_goal_scored_rate | decimal | Hayir | Ilk golu atma orani. | `0.63` |
| first_goal_conceded_rate | decimal | Hayir | Ilk golu yeme orani. | `0.25` |
| venue_strength_score | decimal | Hayir | Ic saha/deplasman guc skoru, 0-100. | `84.0` |

## 6. Gol Ortalamalari

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Takim kimligi. | `galatasaray` |
| scope | string | Evet | Kapsam: overall, home, away, last_5, last_10. | `overall` |
| season | string | Evet | Sezon bilgisi. | `2026-2027` |
| matches_played | integer | Evet | Hesaba katilan mac sayisi. | `12` |
| goals_for_total | integer | Evet | Toplam atilan gol. | `29` |
| goals_against_total | integer | Evet | Toplam yenilen gol. | `14` |
| total_goals_in_matches | integer | Evet | Takimin maclarindaki toplam gol. | `43` |
| goals_for_per_match | decimal | Evet | Mac basina atilan gol. | `2.42` |
| goals_against_per_match | decimal | Evet | Mac basina yenilen gol. | `1.17` |
| total_goals_per_match | decimal | Evet | Takimin maclarinda toplam gol ortalamasi. | `3.58` |
| first_half_goals_for_avg | decimal | Hayir | Ilk yari mac basina atilan gol. | `0.92` |
| first_half_goals_against_avg | decimal | Hayir | Ilk yari mac basina yenilen gol. | `0.42` |
| second_half_goals_for_avg | decimal | Hayir | Ikinci yari mac basina atilan gol. | `1.50` |
| second_half_goals_against_avg | decimal | Hayir | Ikinci yari mac basina yenilen gol. | `0.75` |
| scoring_rate | decimal | Hayir | En az bir gol atma orani. | `0.92` |
| conceding_rate | decimal | Hayir | En az bir gol yeme orani. | `0.67` |

## 7. Ilk Yari / Ikinci Yari Istatistikleri

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Takim kimligi. | `galatasaray` |
| scope | string | Evet | Kapsam: overall, home, away, last_5, last_10. | `overall` |
| season | string | Evet | Sezon bilgisi. | `2026-2027` |
| matches_played | integer | Evet | Hesaba katilan mac sayisi. | `12` |
| first_half_wins | integer | Hayir | Ilk yari onde kapatilan mac sayisi. | `5` |
| first_half_draws | integer | Hayir | Ilk yari berabere biten mac sayisi. | `4` |
| first_half_losses | integer | Hayir | Ilk yari geride kapatilan mac sayisi. | `3` |
| first_half_goals_for | integer | Hayir | Ilk yarilarda atilan toplam gol. | `11` |
| first_half_goals_against | integer | Hayir | Ilk yarilarda yenilen toplam gol. | `5` |
| first_half_goal_difference | integer | Hayir | Ilk yari gol averaji. | `6` |
| first_half_scoring_rate | decimal | Hayir | Ilk yarida gol atma orani. | `0.58` |
| first_half_conceding_rate | decimal | Hayir | Ilk yarida gol yeme orani. | `0.33` |
| second_half_wins | integer | Hayir | Ikinci yari skoruna gore kazanilan yari sayisi. | `7` |
| second_half_draws | integer | Hayir | Ikinci yari skoruna gore beraber biten yari sayisi. | `3` |
| second_half_losses | integer | Hayir | Ikinci yari skoruna gore kaybedilen yari sayisi. | `2` |
| second_half_goals_for | integer | Hayir | Ikinci yarilarda atilan toplam gol. | `18` |
| second_half_goals_against | integer | Hayir | Ikinci yarilarda yenilen toplam gol. | `9` |
| second_half_goal_difference | integer | Hayir | Ikinci yari gol averaji. | `9` |
| second_half_scoring_rate | decimal | Hayir | Ikinci yarida gol atma orani. | `0.75` |
| second_half_conceding_rate | decimal | Hayir | Ikinci yarida gol yeme orani. | `0.50` |
| comeback_points | integer | Hayir | Geriye dustukten sonra alinan puan. | `5` |
| points_lost_after_leading | integer | Hayir | One gectikten sonra kaybedilen puan. | `4` |

## 8. KG Var / KG Yok Istatistikleri

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Takim kimligi. | `galatasaray` |
| scope | string | Evet | Kapsam: overall, home, away, last_5, last_10. | `overall` |
| season | string | Evet | Sezon bilgisi. | `2026-2027` |
| matches_played | integer | Evet | Hesaba katilan mac sayisi. | `12` |
| btts_yes_count | integer | Evet | KG Var biten mac sayisi. | `7` |
| btts_no_count | integer | Evet | KG Yok biten mac sayisi. | `5` |
| btts_yes_rate | decimal | Evet | KG Var orani. | `0.58` |
| btts_no_rate | decimal | Evet | KG Yok orani. | `0.42` |
| scored_and_conceded_count | integer | Hayir | Hem gol atip hem gol yenen mac sayisi. | `7` |
| clean_sheet_count | integer | Hayir | Gol yemeden tamamlanan mac sayisi. | `4` |
| failed_to_score_count | integer | Hayir | Gol atilamayan mac sayisi. | `1` |
| btts_yes_streak | integer | Hayir | Devam eden KG Var serisi. | `3` |
| btts_no_streak | integer | Hayir | Devam eden KG Yok serisi. | `0` |
| btts_signal_score | decimal | Hayir | KG Var sinyal skoru, 0-100. | `68.0` |

## 9. Ust 2.5 / Alt 2.5 Istatistikleri

| Alan | Tip | Zorunlu | Aciklama | Ornek |
|---|---|---:|---|---|
| team_id | string | Evet | Takim kimligi. | `galatasaray` |
| scope | string | Evet | Kapsam: overall, home, away, last_5, last_10. | `overall` |
| season | string | Evet | Sezon bilgisi. | `2026-2027` |
| matches_played | integer | Evet | Hesaba katilan mac sayisi. | `12` |
| over_2_5_count | integer | Evet | 2.5 ust biten mac sayisi. | `8` |
| under_2_5_count | integer | Evet | 2.5 alt biten mac sayisi. | `4` |
| over_2_5_rate | decimal | Evet | 2.5 ust orani. | `0.67` |
| under_2_5_rate | decimal | Evet | 2.5 alt orani. | `0.33` |
| average_total_goals | decimal | Evet | Toplam gol ortalamasi. | `3.58` |
| over_1_5_count | integer | Hayir | 1.5 ust biten mac sayisi. | `10` |
| over_1_5_rate | decimal | Hayir | 1.5 ust orani. | `0.83` |
| over_3_5_count | integer | Hayir | 3.5 ust biten mac sayisi. | `4` |
| over_3_5_rate | decimal | Hayir | 3.5 ust orani. | `0.33` |
| over_2_5_streak | integer | Hayir | Devam eden 2.5 ust serisi. | `2` |
| under_2_5_streak | integer | Hayir | Devam eden 2.5 alt serisi. | `0` |
| over_2_5_signal_score | decimal | Hayir | 2.5 ust sinyal skoru, 0-100. | `72.0` |
| under_2_5_signal_score | decimal | Hayir | 2.5 alt sinyal skoru, 0-100. | `31.0` |

## Veri Modeli Notlari

- Oran alanlari `0.00` ile `1.00` arasinda decimal olarak tutulmalidir.
- Skor alanlari varsayilan olarak `0` ile `100` arasinda olmalidir.
- Tarihler ISO formatinda `YYYY-MM-DD` olarak saklanmalidir.
- Takim, lig ve mac kimlikleri tum tablolarda tutarli kullanilmalidir.
- Ilk surumda CSV dosyalari yeterlidir; ileride ayni alanlar veritabani tablolarina tasinabilir.
- Tahmin uretilirken `scope` alani kritik onemdedir; genel performans ile ev/deplasman performansi karistirilmamalidir.

