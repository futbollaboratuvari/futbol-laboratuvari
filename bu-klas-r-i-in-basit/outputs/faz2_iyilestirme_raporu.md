# Faz 2 Iyilestirme Raporu

## Tarih

2026-06-18

## Amaç

Faz 3'e gecmeden once Faz 2 analiz katmaninda iki temel eksik tamamlandi:

1. Confidence sistemi sayisal ve dort seviyeli hale getirildi.
2. Cekilen maclarin tekrar kullanilabilecegi ham veri havuzu olusturuldu.

## Yapilan Degisiklikler

### 1. Merkezi Confidence Motoru

`src/confidence_motoru.py` olusturuldu.

Yeni confidence seviyeleri:

| Seviye | Sayisal Aralik |
|---|---:|
| low | 0-39 |
| medium | 40-64 |
| high | 65-84 |
| very_high | 85-100 |

Mac sayisi veri kalitesi:

```text
match_count_score = min(match_count / 20, 1.0) * 100
```

Mac bazli confidence formulu:

```text
confidence_score =
  team_data_quality * 0.40 +
  league_data_quality * 0.25 +
  market_data_quality * 0.25 +
  half_time_data_quality * 0.10
```

Devre verisi genel KG/UST analizinde zorunlu degilse `half_time_data_quality` 100 kabul edilir. Boylece ilk yari/ikinci yari verisi eksikligi genel mac guc skorunu gereksiz cezalandirmaz.

### 2. Faz 2 Motorlarina Sayisal Confidence Eklendi

Guncellenen dosyalar:

- `src/guc_skoru_motoru.py`
- `src/takim_gucu_motoru.py`
- `src/form_puani_motoru.py`
- `src/kg_var_motoru.py`
- `src/ust_alt_motoru.py`
- `src/lig_gucu_motoru.py`
- `src/iy_iy_kg_var_motoru.py`
- `src/veri_havuzu.py`
- `src/tahmin_motoru.py`

`src/guc_skoru_motoru.py` artik su alanlari uretir:

```text
confidence
confidence_score
confidence_details
```

Ornek:

```json
{
  "GUC_SKORU": 72.55,
  "confidence": "low",
  "confidence_score": 19.5,
  "KG_VAR_OLASILIGI": 92.5,
  "UST_25_OLASILIGI": 100
}
```

Confidence detaylari:

| Bilesen | Skor | Agirlik | Seviye |
|---|---:|---:|---|
| team_data_quality | 5.0 | 0.40 | low |
| league_data_quality | 25.0 | 0.25 | low |
| market_data_quality | 5.0 | 0.25 | low |
| half_time_data_quality | 100.0 | 0.10 | very_high |

Bu ornekte confidence dusuk kalir; cunku yerel ornek veri takim basina sadece az sayida mac icerir.

### 3. Ham Veri Havuzu

`src/ham_veri_havuzu.py` olusturuldu.

Amac:

- Cekilen maclari ham haliyle saklamak.
- `match_id` ile tekrar kontrolu yapmak.
- Sonraki analizlerde ayni ham veriyi tekrar kullanmak.
- Gecmis testlerin yeniden uretilebilmesini saglamak.

Olusturulan veri dosyasi:

```text
data/ham_mac_havuzu.json
```

Mevcut durum:

| Alan | Deger |
|---|---:|
| schema_version | raw_match_pool_v1 |
| match_count | 5 |
| storage_strategy | match_id_indexed_raw_matches |
| duplicate_matches | 0 |
| total_unique_matches | 5 |

Kaynak:

```text
football_data_org_ornek
```

### 4. Robot Akisina Ham Veri Kaydi Eklendi

`src/robot.py` guncellendi.

Robot artik mac taramasi yaptiginda bulunan maclari `data/ham_mac_havuzu.json` dosyasina eklemeye calisir.

Kurallar:

- Ayni `match_id` ikinci kez eklenmez.
- Yeni mac sayisi rapora yazilir.
- Python dosya yazma hatasi olursa robot durmaz; Markdown raporuna uyarı ekler.

## Mevcut Faz 2 Mimarisi Korundu

Yeni sistem mevcut motorlari bozmaz:

```text
Form Motoru
KG Var Motoru
Ust/Alt Motoru
Lig Gucu Motoru
Takim Gucu Motoru
Guc Skoru Motoru
```

Bu motorlar ayni sekilde calismaya devam eder. Confidence sistemi sadece ek alanlarla zenginlestirildi.

## Dogrulama

AST kontrolunden gecen dosya sayisi:

```text
11
```

Kontrol edilen dosyalar:

- `src/confidence_motoru.py`
- `src/ham_veri_havuzu.py`
- `src/takim_gucu_motoru.py`
- `src/guc_skoru_motoru.py`
- `src/robot.py`
- `src/form_puani_motoru.py`
- `src/kg_var_motoru.py`
- `src/ust_alt_motoru.py`
- `src/lig_gucu_motoru.py`
- `src/veri_havuzu.py`
- `src/iy_iy_kg_var_motoru.py`

Yerel ornek mac testi:

```text
Liverpool FC - AFC Bournemouth
GUC_SKORU: 72.55
KG_VAR_OLASILIGI: 92.5
UST_25_OLASILIGI: 100
confidence: low
confidence_score: 19.5
```

Ham havuz okuma testi:

```text
schema_version: raw_match_pool_v1
match_count: 5
ilk mac: Brighton & Hove Albion FC - Fulham FC
```

## Kalan Riskler

- `data/ham_mac_havuzu.json` su an 5 maclik yerel ornek veriyle baslatildi.
- Daha once cekilen 379 PL macinin ham listesi dosyada bulunmadigi icin bu maclar geriye donuk olarak ham havuza eklenemedi.
- Canli API calistiginda robot yeni bulunan maclari ham havuza ekleyecek.
- Codex ortaminda Python dosya yazma `Bad file descriptor` hatasi verebildigi icin yerel PC'de robot calistirma ile dosya yazimi tekrar dogrulanmali.

## Faz 3'e Gecmeden Once Durum

Tamamlanan iki ana eksik:

- Confidence sistemi dort seviyeli ve sayisal hale getirildi.
- Ham mac havuzu olusturuldu ve robot akisi bu havuza baglandi.

Faz 3 icin hazirlik durumu:

- Kupon motoru artik `GUC_SKORU`, `KG_VAR_OLASILIGI`, `UST_25_OLASILIGI`, `confidence` ve `confidence_score` alanlarini kullanabilir.
- Testler ham veri havuzundaki maclardan tekrar uretilebilir hale geldi.
