# Faz 2 Analiz Raporu

## Tarih

2026-06-18

## Faz 2 Amaci

Faz 2'nin amaci mevcut mac verilerinden takim ve lig gucu hesaplayan analiz katmanini kurmak, bu katmani mevcut Form, KG Var ve Ust/Alt motorlariyla birlestirmek ve her mac icin aciklanabilir bir Guc Skoru uretmektir.

## Yapilan Degisiklikler

- `src/lig_gucu_motoru.py` genisletildi.
  - Lig gol ortalamasi zaten hesaplaniyordu.
  - KG Var orani zaten hesaplaniyordu.
  - Ust 2.5 ve Ust 3.5 oranlari zaten hesaplaniyordu.
  - Yeni olarak ev sahibi galibiyet orani, deplasman galibiyet orani ve beraberlik orani eklendi.
- `src/takim_gucu_motoru.py` olusturuldu.
  - Mevcut `form_puani_motoru.py`, `kg_var_motoru.py` ve `ust_alt_motoru.py` ciktisini kullanir.
  - Takim bazli form, ic saha performansi, dis saha performansi, gol atma gucu, gol yeme riski ve KG potansiyeli uretir.
  - `TEAM_POWER_SCORE` alanini hesaplar.
- `src/guc_skoru_motoru.py` olusturuldu.
  - Takim gucu, lig gucu, KG Var egilimi ve Ust/Alt egilimini tek mac skorunda birlestirir.
  - Her mac icin `GUC_SKORU`, `KG_VAR_OLASILIGI`, `UST_25_OLASILIGI` ve `confidence` uretir.
- `src/gunun_maclari_tarayici.py` mevcut mimari bozulmadan Faz 2 motoruna baglandi.
  - Eski market skorlamasi korunabilir yardimci fonksiyon olarak duruyor.
  - Ana siralama artik Faz 2 `GUC_SKORU` alanini kullanacak sekilde hazirlandi.
  - Rapor ciktisina KG Var ve Ust 2.5 olasilik alanlari eklendi.
- `outputs/bugunun_en_guclu_maclari.md` Faz 2 rapor semasina gore guncellendi.

## Kullanilan Formuller

### Lig Gucu

Lig gucu iki ana skor uzerinden kullanilir:

- `LIG_GOAL_POWER`
- `LIG_KG_POWER`

Lig metrikleri:

| Metrik | Hesap |
|---|---|
| Ortalama gol | Toplam gol / bitmis mac sayisi |
| KG Var orani | Iki takimin da gol attigi mac / bitmis mac |
| Ust 2.5 orani | Toplam gol > 2.5 olan mac / bitmis mac |
| Ev sahibi galibiyet orani | Ev sahibi kazandigi mac / bitmis mac |
| Deplasman galibiyet orani | Deplasman kazandigi mac / bitmis mac |

### Takim Gucu

`TEAM_POWER_SCORE` varsayilan agirliklari:

| Bilesen | Agirlik |
|---|---:|
| Form | %30 |
| Hucum gucu | %25 |
| Ic/dis saha performansi | %20 |
| KG potansiyeli | %15 |
| Savunma istikrari | %10 |

Hucum gucu:

```text
goal_scoring_power = min(goals_for_avg / 2.5, 1.0) * 100
```

Gol yeme riski:

```text
goal_conceding_risk = min(goals_against_avg / 2.5, 1.0) * 100
```

Savunma istikrari:

```text
defense_stability = 100 - goal_conceding_risk
```

### Mac Guc Skoru

`GUC_SKORU` varsayilan agirliklari:

| Bilesen | Agirlik |
|---|---:|
| Form | %25 |
| Lig gucu | %20 |
| Hucum gucu | %20 |
| Savunma zafiyeti | %15 |
| KG potansiyeli | %20 |

Formul:

```text
GUC_SKORU =
  form * 0.25 +
  league_power * 0.20 +
  attack_power * 0.20 +
  defense_weakness * 0.15 +
  kg_potential * 0.20
```

KG Var olasiligi:

```text
KG_VAR_OLASILIGI = ortak_kg_var_egilimi_hesapla(...).common_kg_var_score
```

Ust 2.5 olasiligi:

```text
UST_25_OLASILIGI = ortak_ust_alt_egilimi_hesapla(...).ORTAK_UST_25_SCORE
```

Confidence:

```text
0-5 mac = low
6-15 mac = medium
16+ mac = high
```

Alt motorlardan herhangi biri `low` ise macin nihai confidence seviyesi `low` olur.

## Ornek Mac Ciktilari

Yerel `data/football_data_org_ornek.json` dosyasindaki Premier League ornek verisiyle uretilen Faz 2 ciktisi:

| Mac | Guc Skoru | KG Var Olasiligi | Ust 2.5 Olasiligi | Confidence |
|---|---:|---:|---:|---|
| Liverpool FC - AFC Bournemouth | 72.55 | 92.5 | 100 | low |
| Aston Villa FC - Newcastle United FC | 20.38 | 0 | 0 | low |
| Brighton & Hove Albion FC - Fulham FC | 50.22 | 79.17 | 37.5 | low |
| Sunderland AFC - West Ham United FC | 46.55 | 32.5 | 82.5 | low |
| Tottenham Hotspur FC - Burnley FC | 46.55 | 32.5 | 82.5 | low |

Liverpool FC - AFC Bournemouth icin skor bilesenleri:

| Bilesen | Skor |
|---|---:|
| Form | 49.0 |
| Lig gucu | 51.5 |
| Hucum gucu | 90.0 |
| Savunma zafiyeti | 90.0 |
| KG potansiyeli | 92.5 |

Bu ornekte confidence `low` doner; cunku yerel ornek veri takim basina yeterli mac gecmisi icermiyor. Motor skor uretir, fakat kupon karari icin veri miktarini dusuk guven olarak isaretler.

## Mimari Durum

Faz 2 yeni bir paralel sistem kurmadan mevcut mimariye entegre edildi:

```text
run_robot.bat
->
src/robot.py
->
src/veri_kaynagi_yoneticisi.py
->
src/gunun_maclari_tarayici.py
->
src/tahmin_motoru.py
->
src/guc_skoru_motoru.py
->
src/takim_gucu_motoru.py
->
mevcut motorlar
  - Form
  - KG Var
  - Ust/Alt
  - Lig Gucu
->
outputs/bugunun_en_guclu_maclari.md
```

## Dogrulama

- `src/lig_gucu_motoru.py`, `src/takim_gucu_motoru.py`, `src/guc_skoru_motoru.py` ve `src/gunun_maclari_tarayici.py` AST soz dizimi kontrolunden gecti.
- `src/guc_skoru_motoru.py` yerel ornek veriyle calistirildi.
- `src/takim_gucu_motoru.py` yerel ornek veriyle takim gucu raporu uretti.
- Python dosya yazma ortamdaki `Bad file descriptor` riskinden dolayi rapor dosyalari proje dosya araci ile guncellendi.

## Sonraki Faz 3 Onerileri

1. Kupon motorunu baslat.
   - Faz 2 `GUC_SKORU`, `KG_VAR_OLASILIGI`, `UST_25_OLASILIGI` alanlarini ana sinyal olarak kullansin.
   - Dusuk, orta ve yuksek riskli kupon tipleri uretsin.
2. Deger skoru ekle.
   - Market skoru ile oran bilgisi ileride birlestirilsin.
   - Sadece yuksek olasilik degil, oran/deger dengesi hesaplansin.
3. Test altyapisini kur.
   - Takim gucu motoru icin eksik veri, tek mac, 5 mac ve 16+ mac senaryolari test edilsin.
   - Guc skoru motoru icin agirlik ve confidence testleri eklensin.
4. Veri havuzunu buyut.
   - API-Football anahtari eklendiginde Turkiye ligleri canli fixture ve sonuc verisiyle doldurulsun.
   - Takim basina 16+ mac seviyesine gelindiginde confidence `high` seviyesine cikacak.
5. Raporlama katmanini ayir.
   - `src/raporlama.py` ile Markdown/JSON raporlari merkezi hale getirilsin.

## Faz 2 Sonuc

Faz 2 analiz katmani calisir durumdadir. Takim gucu, lig gucu ve mac guc skoru motorlari mevcut motorlari kullanarak entegre edildi. Yeni sistem her mac icin Guc Skoru, KG Var Olasiligi, Ust 2.5 Olasiligi ve Confidence uretmeye hazirdir.
