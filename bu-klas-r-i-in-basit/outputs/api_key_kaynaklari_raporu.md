# API Key Kaynaklari Raporu

## Rapor Bilgisi

Tarih: 2026-06-18

Amaç: Futbol Laboratuvarı için ücretsiz veya düşük maliyetli futbol veri API kaynaklarını karşılaştırmak, Türkiye ligleri desteğini incelemek ve API key alma adımlarını belgelemek.

Not: Hesap açma, e-posta doğrulama veya şifre oluşturma yapılmadı. Bu rapor yalnızca araştırma ve karar desteği amaçlıdır.

## Kısa Sonuç

Futbol Laboratuvarı için en uygun başlangıç çözümü:

1. **API-Football / API-Sports Football**
   - Türkiye Süper Lig, 1. Lig, 2. Lig, 3. Lig grupları, Türkiye Kupası ve Süper Kupa kapsıyor.
   - Ücretsiz planda 100 istek/gün var.
   - Fikstür, sonuç, takım, puan durumu, istatistik, sakatlık, oyuncu, transfer, oran ve tahmin endpointleri aynı API içinde.
   - Projenin mevcut `API_FOOTBALL_KEY` fallback mimarisiyle en uyumlu kaynak.

2. **football-data.org**
   - Ana Avrupa ligleri için temiz ve basit.
   - Ücretsiz plan 12 competition, fikstür, sonuç ve puan durumu verir.
   - Türkiye Süper Lig ve 1. Lig tüm coverage tablosunda görünüyor, ancak ücretsiz tier listesinde Türkiye yok; TFF 2. Lig ve TFF 3. Lig desteği görünmüyor.
   - Futbol Laboratuvarı için ana Avrupa kaynağı olarak tutulmalı, Türkiye alt ligleri için tek başına yeterli değil.

3. **TheSportsDB**
   - Gerçek ücretsiz API var.
   - Ücretsiz limit 30 istek/dakika; premium $9/ay.
   - Takım/lig temel bilgileri, sezon, fikstür ve bazı event verileri için yararlı.
   - Türkiye alt ligleri ve derin istatistik/odds kapsamı API-Football kadar net ve güçlü değil.

4. **SportMonks**
   - Veri kalitesi ve profesyonel kapsam güçlü.
   - 14 günlük deneme ve ücretsiz plan/dash erişimi var.
   - Başlangıç fiyatı yüksek: Starter aylık 29 euro seviyesinde.
   - Faz 5 veya profesyonel büyüme aşaması için aday; V1 ücretsiz/düşük maliyet hedefi için ilk tercih değil.

5. **The Odds API**
   - Odds için iyi ek kaynak.
   - Ücretsiz 500 credit/ay.
   - Maç veri havuzu, takım formu, lig istatistikleri için ana kaynak değil; sadece oran katmanı için değerlendirilmeli.

## Genel Karşılaştırma Tablosu

| Kaynak | Ücretsiz Plan | Limit | Yaklaşık Aylık Limit | Türkiye Lig Desteği | Veri Kapsamı | Fiyat |
|---|---|---:|---:|---|---|---|
| API-Football | Var | 100 istek/gün | Yaklaşık 3.000 istek/ay | Süper Lig, 1. Lig, 2. Lig, 3. Lig grupları, Türkiye Kupası, Süper Kupa | Fikstür, sonuç, puan durumu, takım, oyuncu, sakatlık, istatistik, odds, tahmin | Ücretsiz; Pro $19/ay |
| football-data.org | Var | 10 istek/dakika | Günlük/aylık resmi kota yok; dakika limiti var | Süper Lig ve 1. Lig coverage tablosunda; ücretsiz tier listesinde Türkiye yok; 2. ve 3. Lig yok | Fikstür, sonuç, puan durumu; üst planlarda kadro, kart, golcü, odds/stat add-on | Ücretsiz; düşük paid plan 12 euro/aydan başlıyor |
| SportMonks | Free plan / 14 günlük deneme | Starter: 2.000 istek/entity/saat | Günlük/aylık resmi kota yerine entity/saat limiti | 2.500+ lig iddiası var; Türkiye alt ligleri dashboard/ID Finder ile doğrulanmalı | Profesyonel fikstür, live, events, standings, takım, oyuncu, istatistik, odds add-on | Starter 29 euro/ay |
| TheSportsDB | Var | 30 istek/dakika | Teorik 43.200 istek/gün; endpoint başına free veri kısıtları var | Türkiye için temel lig/takım verisi bulunabilir; alt lig kapsamı ve veri derinliği sınırlı/teyit gerekli | Takım, lig, sezon, event, bazı sonuç/lineup/stat endpointleri; free endpoint limitleri düşük | Ücretsiz; premium $9/ay |
| The Odds API | Var | 500 credit/ay | 500 credit/ay | Türkiye ligleri açıkça garanti edilmedi; soccer odds kapsamı geniş ama odds odaklı | Oran, bookmaker, market, totals, h2h; maç analiz verisi değil | Ücretsiz; 20K credit $30/ay |
| OpenLigaDB | Var | Resmi auth yok; topluluk servisi | Belirtilmemiş | Türkiye ligleri için uygun değil | Topluluk tabanlı sonuç/fikstür; özellikle Almanya ve bazı turnuvalar | Ücretsiz |

## Türkiye Ligleri Kapsamı

| Kaynak | Süper Lig | TFF 1. Lig | TFF 2. Lig | TFF 3. Lig | Türkiye Kupası | Not |
|---|---|---|---|---|---|---|
| API-Football | Var | Var | Var | Var, grup bazlı | Var | En güçlü aday. Coverage listesinde Turkey altında 1. Lig, 2. Lig, 3. Lig Group 1-4, 3. Lig Play-offs, Süper Lig ve Türkiye Kupası görünüyor. |
| football-data.org | Var, paid/all coverage tablosunda | Var, paid/all coverage tablosunda | Görünmüyor | Görünmüyor | Görünmüyor | Ücretsiz tier listesinde Türkiye yok. Avrupa ligleri için iyi, Türkiye alt ligleri için yetersiz. |
| SportMonks | Muhtemel | Muhtemel | Teyit gerekli | Teyit gerekli | Teyit gerekli | 2.500+ lig kapsadığını söylüyor; Türkiye alt ligleri için ID Finder/dashboard doğrulaması gerekir. |
| TheSportsDB | Kısmi/teyit gerekli | Kısmi/teyit gerekli | Zayıf/teyit gerekli | Zayıf/teyit gerekli | Teyit gerekli | Free API bazı aramalarda ciddi kısıtlı; ana veri havuzu için güvenilir ilk seçenek değil. |
| The Odds API | Odds varsa olabilir | Teyit gerekli | Teyit gerekli | Teyit gerekli | Teyit gerekli | Sadece oran verisi için. |
| OpenLigaDB | Yok | Yok | Yok | Yok | Yok | Türkiye hedefi için uygun değil. |

## Veri Kapsamı Değerlendirmesi

### API-Football

Güçlü taraflar:

- Tüm planlarda tüm competition ve endpointlerin dahil olduğu belirtiliyor; ücretsiz planda sezon erişimi sınırlı.
- Ücretsiz plan 100 istek/gün.
- Pro plan 7.500 istek/gün, Ultra 75.000 istek/gün, Mega 150.000 istek/gün.
- Coverage listesi 1.233 lig/kupa gösteriyor.
- Türkiye için 1. Lig, 2. Lig, 3. Lig grupları, Süper Lig, Türkiye Kupası ve Süper Kupa görünüyor.
- Endpoint kapsamı: countries, seasons, leagues, standings, teams, livescore, fixtures, head-to-head, events, lineups, top scorers, players/coaches, transfers, trophies, sidelined, injuries, in-play odds, pre-match odds, statistics, predictions.

Zayıf taraflar:

- Ücretsiz 100 istek/gün 1000+ maçlık havuz büyütmek için yavaş kalır.
- Ücretsiz plan sezon geçmişinde sınırlı olabilir.
- Odds ve istatistik endpointleri plan içinde görünse bile gerçek veri derinliği lig/sezon bazında değişebilir.

Futbol Laboratuvarı kararı:

- **Birincil Türkiye kaynağı olmalı.**
- İlk hedef: ücretsiz planla league_id değerlerini çekmek, sonra günlük batch ile ham havuzu büyütmek.
- Eğer 1000+ maç hızlı istenirse Pro plan mantıklı ilk ücretli seçenek.

### football-data.org

Güçlü taraflar:

- Basit API, temiz JSON, mevcut projede entegrasyonu hazır.
- Ücretsiz plan: 12 competition, fikstür, gecikmeli sonuçlar/schedule, puan durumu, 10 çağrı/dakika.
- Free w/ Livescores: 12 euro/ay, 20 çağrı/dakika.
- ML Pack Light: 29 euro/ay, 10 sezon geçmiş ve advanced trend/form data.
- Standard: 49 euro/ay, 30 competition.
- Odds add-on ve Statistics add-on ayrı satılıyor.

Zayıf taraflar:

- Ücretsiz tier listesinde Türkiye ligleri yok.
- TFF 2. Lig ve TFF 3. Lig coverage tablosunda görünmüyor.
- Odds/statistics için ek ücret gerekiyor.

Futbol Laboratuvarı kararı:

- **Avrupa ana ligleri için ana kaynak olarak kalmalı.**
- Türkiye alt ligleri için fallback değil, tamamlayıcı kaynak olmalı.

### SportMonks

Güçlü taraflar:

- 2.500+ lig kapsadığını söylüyor.
- Starter: 5 lig seçimi, 2.000 API çağrısı/entity/saat, 14 gün deneme.
- Growth: 30 lig, 2.500 API çağrısı/entity/saat.
- Pro: 120 lig, 3.000 API çağrısı/entity/saat.
- Fixture, live score, match events, standings, season statistics, top scorers, team/player data, injuries/suspensions, historical data ve advanced statistics kapsamı güçlü.
- Odds & Predictions bundle ve Premium Odds Feed gibi ileri eklentiler var.

Zayıf taraflar:

- Ücretsiz kalıcı kullanım API-Football kadar net ve pratik değil; free plan/dash ile deneme yapılmalı.
- Starter bile 29 euro/ay.
- Türkiye alt ligleri için bu araştırmada herkese açık sayfadan kesin alt lig listesi doğrulanamadı; ID Finder veya dashboard gerekir.

Futbol Laboratuvarı kararı:

- **Profesyonel veri kalitesi için ikinci aşama adayı.**
- V1 ücretsiz/düşük maliyet hedefinde API-Football'dan sonra düşünülmeli.

### TheSportsDB

Güçlü taraflar:

- Ücretsiz API var.
- Free limit 30 istek/dakika.
- Premium $9/ay; 100 istek/dakika, daha geniş veri ve V2 API.
- Free key herkese açık `123`; premium key profil sayfasında bulunuyor.
- Takım, lig, sezon, event, lig tablosu, fikstür, lineup, event statistics gibi endpointler var.

Zayıf taraflar:

- Free endpoint limitleri veri sayısı olarak çok düşük. Örneğin bazı arama endpointleri free kullanımda 1 sonuçla sınırlı, schedule day free limit 3 gibi kısıtlar var.
- Alt lig ve Türkiye derinliği API-Football kadar net değil.
- Odds kapsamı yok veya Futbol Laboratuvarı odds katmanı için yeterli değil.

Futbol Laboratuvarı kararı:

- **Yardımcı metadata kaynağı olabilir.**
- Ana maç havuzu ve Türkiye alt ligleri için ilk tercih olmamalı.

### The Odds API

Güçlü taraflar:

- Ücretsiz 500 credit/ay.
- Soccer odds, bookmaker, head-to-head, over/under/totals gibi marketleri destekler.
- 20K credit plan $30/ay.

Zayıf taraflar:

- Takım formu, lig puan durumu, detaylı maç istatistiği kaynağı değil.
- Türkiye lig kapsamı bu araştırmada garanti olarak doğrulanmadı.

Futbol Laboratuvarı kararı:

- **Faz 5 odds/değer skoru katmanı için ek kaynak.**
- Ana veri kaynağı olmamalı.

### OpenLigaDB

Güçlü taraflar:

- Ücretsiz topluluk API.
- Auth gerekmeden JSON API ile veri çekilebiliyor.
- Sonuç/fikstür odaklı basit kullanıma uygun.

Zayıf taraflar:

- Türkiye ligleri için uygun değil.
- Veri topluluk tarafından giriliyor; profesyonel kapsama ve garanti beklenmemeli.

Futbol Laboratuvarı kararı:

- Türkiye hedefi için kullanılmamalı.
- Sadece test/deneme veya Almanya odaklı yan kaynak olabilir.

## En Uygun Çözüm Sıralaması

### 1. API-Football Free

Neden:

- Türkiye hedef liglerini en net kapsayan kaynak.
- Ücretsiz başlatılabilir.
- Projede mevcut `src/api_football_client.py`, `src/api_football_normalizer.py`, `src/veri_kaynagi_yoneticisi.py` zaten bu kaynağa göre hazır.

Kullanım stratejisi:

- Önce ücretsiz planla `/leagues?country=Turkey` çek.
- Gerçek `league_id` değerlerini kaydet.
- Günlük 100 istek sınırını aşmadan fixture ve sonuçları yavaş yavaş havuza ekle.
- 1000+ maç hedefi hızlı istenirse Pro plana geç.

### 2. API-Football Pro

Neden:

- $19/ay ile 7.500 istek/gün.
- 1000+ maçlık ham havuz büyütme hedefi için ücretsiz plana göre çok daha uygun.

Kullanım stratejisi:

- Bir aylık Pro plan ile Türkiye ligleri ve seçili Avrupa liglerinden geçmiş sezon/fixture verisi çek.
- `data/ham_mac_havuzu.json` dosyasını büyüt.
- Sonra gerekirse ücretsiz plana geri dön.

### 3. football-data.org Free + API-Football Free

Neden:

- football-data.org Avrupa ana ligleri için temiz.
- API-Football Türkiye alt liglerini tamamlar.

Kullanım stratejisi:

- football-data.org: PL, BL1, SA, PD, FL1, ELC, DED, PPL gibi erişilebilir ligleri çek.
- API-Football: Türkiye liglerini çek.
- Ortak semada birleştir.

### 4. TheSportsDB Premium $9

Neden:

- Ucuz.
- Takım/lig metadata ve bazı event verileri için yardımcı olabilir.

Eksik:

- Türkiye alt ligleri ve istatistik derinliği belirsiz.

### 5. SportMonks Starter

Neden:

- Veri kalitesi güçlü.
- Daha profesyonel büyüme aşamasında anlamlı.

Eksik:

- Ücretsiz/düşük maliyet hedefinde pahalı.
- Türkiye alt lig kapsamı hesap/dashboard ile doğrulanmalı.

## API Key Alma Adımları

### API-Football / API-Sports Football

1. `https://dashboard.api-football.com/register` adresine git.
2. E-posta adresinle hesap oluştur.
3. E-posta doğrulaması istenirse kendi e-postandan doğrula.
4. Dashboard içine gir.
5. Free planı seç.
6. API key veya project key alanını dashboarddan kopyala.
7. Windows PowerShell'de geçici kullanım için:

```powershell
$env:API_FOOTBALL_KEY="BURAYA_API_FOOTBALL_KEY"
```

8. Kalıcı kullanım için:

```powershell
setx API_FOOTBALL_KEY "BURAYA_API_FOOTBALL_KEY"
```

9. Yeni terminal aç.
10. Proje klasöründe şu komutla kontrol et:

```powershell
echo $env:API_FOOTBALL_KEY
```

11. Sonra:

```powershell
python .\src\turkiye_ligleri_canli.py
```

veya:

```powershell
run_robot.bat
```

Gerekli bilgiler:

- E-posta
- Şifre
- Kullanım amacı/proje bilgisi istenebilir
- Free plan için kredi kartı gerekmediği belirtiliyor

### football-data.org

1. `https://www.football-data.org/client/register` adresine git.
2. Kullanacağın teknoloji/dili seç.
3. Terms & Conditions kutusunu onayla.
4. Hesabı oluştur.
5. Kayıt tamamlandıktan sonra API key alınır.
6. PowerShell geçici kullanım:

```powershell
$env:FOOTBALL_DATA_API_KEY="BURAYA_FOOTBALL_DATA_KEY"
```

7. Kalıcı kullanım:

```powershell
setx FOOTBALL_DATA_API_KEY "BURAYA_FOOTBALL_DATA_KEY"
```

8. Yeni terminal açıp test et:

```powershell
python .\src\ilk_veri_toplayici.py
```

Gerekli bilgiler:

- Geçerli e-posta
- Tercih edilen programlama dili/teknoloji
- Terms kabulü

### SportMonks

1. `https://my.sportmonks.com/register` adresine git.
2. Hesap oluştur.
3. Dashboard içinde Football API bölümüne gir.
4. Free plan veya 14 günlük trial seçeneklerini incele.
5. Türkiye liglerini ID Finder veya league search ile ara.
6. Kullanılacak ligleri seç.
7. API tokenı dashboarddan al.
8. Projede ayrı değişken önerisi:

```powershell
setx SPORTMONKS_API_KEY "BURAYA_SPORTMONKS_KEY"
```

Gerekli bilgiler:

- E-posta
- Şifre
- Kişisel/kurumsal bilgiler istenebilir
- Paid trial için ödeme bilgisi istenebilir

### TheSportsDB

Ücretsiz V1 kullanım için özel hesap zorunlu değil; ücretsiz key `123` olarak belgelenmiş.

Premium için:

1. `https://www.thesportsdb.com/signup` veya sitedeki Signup/Login bağlantısından hesap oluştur.
2. Premium $9/ay planına geç.
3. Profil sayfasında API key görünür.
4. Projede ayrı değişken önerisi:

```powershell
setx THESPORTSDB_API_KEY "BURAYA_THESPORTSDB_KEY"
```

Gerekli bilgiler:

- E-posta
- Şifre
- Premium için ödeme bilgisi

### The Odds API

1. `https://the-odds-api.com/` adresine git.
2. Get API Key veya Account bölümünü aç.
3. E-posta ile kayıt ol.
4. API key e-posta ile gelir.
5. Projede ayrı değişken önerisi:

```powershell
setx THE_ODDS_API_KEY "BURAYA_THE_ODDS_API_KEY"
```

Gerekli bilgiler:

- E-posta
- Paid plan için ödeme bilgisi

## Futbol Laboratuvarı İçin Önerilen Uygulama Planı

### Aşama 1 - Hemen

- API-Football Free key al.
- `API_FOOTBALL_KEY` ortam değişkenine ekle.
- `src/turkiye_ligleri_canli.py` çalıştır.
- Türkiye liglerinin gerçek `league_id` değerlerini `outputs/veri_buyutme_raporu.md` içine yazdır.

### Aşama 2 - Ücretsiz Veri Büyütme

- Günlük 100 istek sınırına göre kuyruklu çekim yap.
- Öncelik:
  1. Süper Lig
  2. TFF 1. Lig
  3. TFF 2. Lig
  4. TFF 3. Lig grupları
  5. Türkiye Kupası
- Aynı maçları `match_id` ile tekrar ekleme.

### Aşama 3 - Hızlı 1000+ Maç Hedefi

- Eğer ücretsiz plan yavaş kalırsa API-Football Pro planı 1 ay kullan.
- 7.500 istek/gün ile geçmiş sezon ve fixture verileri çek.
- 1000+ maç havuzu tamamlanınca tekrar Free plana dönülebilir.

### Aşama 4 - Odds Katmanı

- Önce API-Football pre-match odds endpointleri test edilir.
- Yetersiz kalırsa The Odds API ücretsiz 500 credit/ay yardımcı kaynak olarak eklenir.

## Kaynaklar

- API-Football Pricing: https://www.api-football.com/pricing
- API-Football Coverage: https://www.api-football.com/coverage
- football-data.org Pricing: https://www.football-data.org/pricing
- football-data.org Coverage: https://www.football-data.org/coverage
- football-data.org Register: https://www.football-data.org/client/register
- SportMonks Football API: https://www.sportmonks.com/football-api/
- SportMonks Rate Limit Docs: https://docs.sportmonks.com/v3/api/rate-limit
- SportMonks Authentication Docs: https://docs.sportmonks.com/v3/welcome/authentication
- TheSportsDB Free API: https://www.thesportsdb.com/api.php
- TheSportsDB Pricing: https://www.thesportsdb.com/pricing
- TheSportsDB Documentation: https://www.thesportsdb.com/documentation
- The Odds API: https://the-odds-api.com/
- OpenLigaDB: https://www.openligadb.de/
