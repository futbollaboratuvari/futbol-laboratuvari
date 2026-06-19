# Mackolik Arsiv Fizibilite Raporu

Hazirlanma tarihi: 18.06.2026

Incelenen kaynaklar:

- https://arsiv.mackolik.com/Iddaa-Programi
- https://arsiv.mackolik.com/Genis-Iddaa-Programi

Not: Bu calisma sadece fizibilite analizidir. Kod yazilmadi, scraper gelistirilmedi, veri cekme otomasyonu kurulmadı, bahis/kupon islemi yapilmadi.

## 1. Site yapisi

Mackolik Arsiv Iddaa Programi sayfasi, gunluk mac programini tablo halinde gosteren arsiv ekranidir. Sayfa iki ana kullanima ayriliyor:

- Standart Iddaa Programi: Daha sade tablo, gorunur market secimleri ve mac satirlari.
- Genis Iddaa Programi: Daha genis kolonlu oran tablosu; tek ekranda daha fazla market ve oran gorunuyor.

Gorulen ana bolumler:

- Tarih secim seridi
- Spor dali secimi
- Lige gore / tarihe gore gorunum secimi
- Lig filtresi
- Market sekmeleri
- Mac satirlari
- Mac satiri uzerinde detay alanina giden "Tumu" veya detay ikonu benzeri alan

Veri akisi acisindan en onemli yuzey "Genis Iddaa Programi" sayfasi gibi gorunuyor. Bu sayfa, her mac icin birden fazla market oranini tek tabloda gostererek ham veri havuzuna daha dogrudan aktarilabilecek bir yapi sunuyor.

## 2. Tarih gezintisi mumkun mu?

Kismen mumkun gorunuyor.

Sayfada tarih secim seridi bulunuyor. Inceleme sirasinda gorunen tarih araligi 16.06.2026 ile 23.06.2026 arasinda kisa bir serit olarak listeleniyordu. Bu, kullanicinin gun bazli program degistirebildigini gosterir.

Kesin olarak tespit edilenler:

- Tarih secimi sayfa uzerinde var.
- Gun bazli program mantigi var.
- Secili gun icin mac listesi tabloya yansiyor.
- Tarih seridi yakin gecmis ve yakin gelecek gunleri gosteriyor.

Netlestirilmesi gerekenler:

- Tum gecmis arsive sinirsiz gidilip gidilemedigi bu incelemede kesin dogrulanamadi.
- Eski sezonlara dogrudan URL parametresiyle erisim olup olmadigi ayrica test edilmeli.
- Tarih degisiminin tam olarak query string, form postback veya JavaScript state uzerinden mi calistigi tarayici ag kaydiyla incelenmeli.

Raporlanabilir alanlar:

| Alan | Durum |
|---|---|
| Tarih | Gorunur |
| Mac sayisi | Sayfa tablosundan sayilabilir |
| Lig sayisi | Mac satirlarindaki lig adlarindan sayilabilir |
| Tum gecmis arsiv | Bu asamada kesin degil |

## 3. Lig gezintisi mumkun mu?

Kismen mumkun gorunuyor.

Sayfada lig filtresi ve "lige gore" gorunum mantigi bulunuyor. Bu, maclarin lig bazinda gruplanabildigini veya filtrelenebildigini gosterir.

Incelenmesi gereken lig tipleri:

- Turkiye Super Lig
- TFF 1. Lig
- TFF 2. Lig
- TFF 3. Lig
- Premier League
- La Liga
- Serie A
- Bundesliga
- MLS
- Uluslararasi turnuvalar
- Diger ligler

Kesin olarak tespit edilenler:

- Lig bilgisi mac satirlarinda yer alabilecek sekilde sayfa yapisinda var.
- Lig bazli gruplama/filtreleme icin arayuz bulunuyor.
- Genis program tablosunda lig kolonu veri modeli icin uygun.

Netlestirilmesi gerekenler:

- Tum ligler tek tek secilebiliyor mu?
- Lig listesi sadece o gun maci olan liglerle mi sinirli?
- Gecmis tarihte lig listesi dinamik degisiyor mu?
- Alt ligler her zaman gorunuyor mu, yoksa sadece iddaa programina girmis maclar mi listeleniyor?

Lig bazli veri cekme potansiyeli yuksek; ancak lig evreni sayfanin o gun yayimladigi programla sinirli olabilir.

## 4. Market gezintisi mumkun mu?

Mumkun gorunuyor.

Standart Iddaa Programi ekraninda market secim sekmeleri bulunuyor. Genis Iddaa Programi ekraninda ise birden fazla market kolonu ayni tabloda gorunebiliyor.

Gorulen veya yapida beklenen marketler:

| Market | Standart sayfada potansiyel | Genis tabloda potansiyel | Not |
|---|---:|---:|---|
| Mac Sonucu | Var | Var | 1, X, 2 oranlari |
| Ilk Yari Sonucu | Var | Kismen/var | IY kolonlariyla izlenebilir |
| Karsilikli Gol | Var | Var | Var/Yok kolonlari |
| Alt/Ust | Var | Var | Ozellikle 2.5 alt/ust gorunur |
| Cifte Sans | Var | Var | 1-X, 1-2, X-2 |
| Handikap | Var | Var | H1, HX, H2 gibi kolonlar |
| Toplam Gol Araligi | Detayda muhtemel | Var | 0-1, 2-3, 4-6, 7+ gol |
| Ilk Yari Alt/Ust | Detayda muhtemel | Kesin degil | Detay penceresi gerekir |
| Ev Sahibi Alt/Ust | Detayda muhtemel | Kesin degil | Detay penceresi gerekir |
| Deplasman Alt/Ust | Detayda muhtemel | Kesin degil | Detay penceresi gerekir |

Her market secildiginde veri yapisinin degisme ihtimali var. Standart ekranda market sekmesi degistiginde tablo kolonlari veya satir icindeki oran alanlari degisebilir. Genis ekranda ise sabit genis kolon yapisi daha tutarli gorunuyor.

## 5. Mac detaylari acilabiliyor mu?

Muhtemelen evet, ancak bu incelemede detay penceresindeki tum marketler kesin olarak dogrulanamadi.

Mac satirlarinda "Tumu" veya detay acma islevi tasiyan alanlar bulunuyor. Bu alanin amaci maca ait tum bahis marketlerini gostermek gibi gorunuyor.

Detay penceresinde aranacak alanlar:

- Mac Sonucu
- Cifte Sans
- Handikapli Sonuc
- Ilk Yari Sonucu
- Ilk Yari / Mac Sonucu
- Karsilikli Gol
- Toplam Gol Araligi
- Alt/Ust 0.5
- Alt/Ust 1.5
- Alt/Ust 2.5
- Alt/Ust 3.5
- Alt/Ust 4.5
- Alt/Ust 5.5
- Ev Sahibi Alt/Ust
- Deplasman Alt/Ust
- Diger ozel marketler

Teknik olarak detay penceresi JavaScript ile aciliyor olabilir. Bu nedenle gelecekte otomasyon dusunulurse once tarayici uzerinden ag istekleri ve DOM degisimi izlenmelidir.

## 6. Hangi veriler cekilebilir?

Asagidaki alanlarin cekilebilir olma potansiyeli yuksek:

| Veri alani | Cekilebilirlik | Kaynak yuzeyi |
|---|---|---|
| Tarih | Yuksek | Tarih secimi / sayfa basligi |
| Saat | Yuksek | Mac satiri |
| Lig | Yuksek | Lig kolonu veya grup basligi |
| Ev sahibi | Yuksek | Mac satiri |
| Deplasman | Yuksek | Mac satiri |
| Market adi | Yuksek | Market sekmesi / kolon adi / detay basligi |
| Secenek adi | Yuksek | 1, X, 2, Var, Yok, Alt, Ust vb. |
| Oran | Yuksek | Oran hucreleri |
| Mac kodu | Yuksek | Genis tablo kod kolonu |
| Sayfa URL'si | Yuksek | Tarih ve sayfa URL bilgisi |
| MBS | Yuksek | Genis tablo kolonu |
| Handikap oranlari | Orta/Yuksek | Genis tablo ve detay |
| Toplam gol araligi | Orta/Yuksek | Genis tablo ve detay |

Ham veri havuzu icin onerilen kayit mantigi:

| Alan | Aciklama |
|---|---|
| source | mackolik_arsiv |
| source_url | Sayfa URL'si |
| scrape_date | Gelecekte veri alindigi tarih |
| match_date | Mac tarihi |
| match_time | Mac saati |
| league_name | Lig adi |
| home_team | Ev sahibi |
| away_team | Deplasman |
| match_code | Iddaa mac kodu |
| market_name | Market adi |
| selection_name | Secenek adi |
| odd | Oran |
| raw_row | Gerekirse ham satir metni |

## 7. Hangi veriler cekilemez?

Bu sayfadan dogrudan cekilemeyebilecek veya kesin olmayan alanlar:

| Veri | Durum | Not |
|---|---|---|
| Mac sonucu | Kesin degil | Iddaa programi sayfasi daha cok oran/program odakli |
| Ilk yari skoru | Kesin degil | Program sayfasinda olmayabilir |
| Ikinci yari skoru | Kesin degil | Program sayfasinda olmayabilir |
| Oyuncu istatistikleri | Dusuk | Bu ekranin kapsami disinda |
| Kadro bilgisi | Dusuk | Bu ekranin kapsami disinda |
| Sakat/cezali bilgisi | Dusuk | Bu ekranin kapsami disinda |
| Canli istatistik | Dusuk | Arsiv/program ekrani |
| Tum tarih arsivi | Kesin degil | Tarih navigasyonu derinligi dogrulanmali |

Bu kaynak en guclu olarak "program + oran + market" verisi saglar. Mac sonucu ve skor dogrulama icin baska sayfa veya baska kaynak gerekebilir.

## 8. Gunluk tahmini veri kapasitesi

Kesin kapasite, tarih ve lig kapsamli manuel/tarayici testiyle belirlenmeli. Bu raporda otomatik veri cekimi yapilmadigi icin kapasite tahmini asagidaki varsayimlara dayanir:

| Senaryo | Gunluk mac | Mac basina market/secenek kaydi | Gunluk ham kayit potansiyeli |
|---|---:|---:|---:|
| Dusuk program gunu | 10-30 | 20-60 | 200-1.800 |
| Normal program gunu | 50-150 | 20-80 | 1.000-12.000 |
| Yogun hafta sonu | 150-500 | 20-100 | 3.000-50.000 |

Futbol Laboratuvari icin 1000+ maclik ham veri havuzu hedefi acisindan, eger tarih arsivi geriye dogru yeterli aciliyorsa bu kaynak cok yuksek katkı potansiyeline sahiptir.

## 9. API'siz kullanim potansiyeli

API'siz kullanim potansiyeli orta-yuksek.

Guclu taraflar:

- Herkese acik arsiv sayfasi var.
- Tarih bazli program mantigi var.
- Lig ve market bilgileri gorunur.
- Genis program tablosu veri modeli icin uygun.
- Mac kodu ve oranlar ham veri havuzu icin degerli.

Sinirlar:

- Sayfa JavaScript/postback kullanabilir.
- Tum gecmis tarihler garanti degil.
- Detay pencerelerindeki marketler stabil olmayabilir.
- Site yapisi degisirse manuel secici mantigi bozulabilir.
- Kullanim kosullari ve erisim limitleri kontrol edilmelidir.

Bu kaynak API yerine gecmekten cok, API kaynaklarini tamamlayan ikinci veri kaynagi olarak daha uygundur.

## 10. Ham veri havuzuna katkı potansiyeli

Katki potansiyeli yuksek.

Futbol Laboratuvari'nin mevcut `data/ham_mac_havuzu.json` yapisi mac odakli buyutulmek isteniyor. Mackolik Arsiv bu havuza iki tur veri katabilir:

- Mac programi verisi: tarih, saat, lig, takimlar, mac kodu
- Market/oran verisi: market adi, secenek adi, oran

En iyi kullanim modeli:

1. Mac seviyesinde benzersiz kayit olustur.
2. Ayni mac altinda market listesi tut.
3. Her market altinda secenek/oran ciftlerini sakla.
4. Mac sonucu baska kaynaktan geldikten sonra tahmin performansi icin eslestir.

Potansiyel veri modeli:

| Seviye | Alanlar |
|---|---|
| Match | match_id, source, date, time, league, home_team, away_team, match_code, source_url |
| Market | market_name, market_group |
| Selection | selection_name, odd |
| Audit | collected_at, raw_date_label, source_page_type |

## 11. Teknik riskler

| Risk | Etki | Onlem |
|---|---|---|
| Tarih arsivi sinirli olabilir | Gecmis veri havuzu hedefi zayiflar | Once manuel tarih derinligi testi yap |
| JavaScript/postback bagimliligi | Basit HTML okuma yetmeyebilir | Tarayici ag kaydi ile istekleri haritala |
| Detay penceresi dinamik olabilir | Tum marketler eksik kalabilir | Detay acilisinda DOM ve network farkini incele |
| Site tasarimi degisebilir | Gelecek entegrasyon kirilir | Kaynak adapter mimarisi kullan |
| Erişim limiti veya bot korumasi | Veri toplama kesilebilir | Dusuk frekans, cache ve saygi kurallari |
| Kullanim kosullari | Hukuki/etik risk | Site sartlari incelenmeden otomasyon yapma |
| Oranlar tarihsel kapanis orani olmayabilir | Analiz kalitesi etkilenir | Oranin zaman damgasini kaydet |
| Mac sonucu ayni sayfada olmayabilir | Basari takibi eksik kalir | Sonuc icin ayri dogrulama kaynagi kullan |

## 12. Onerilen mimari

Bu gorevde kod yazilmamistir. Gelecekte gelistirme yapilacaksa onerilen mimari asagidaki gibi olmalidir:

1. Kaynak adapter katmani
   - Mackolik Arsiv ayri bir adapter olarak dusunulmeli.
   - Mevcut API adapterleriyle ayni ortak mac semasina normalize etmeli.

2. Sayfa haritalama katmani
   - Tarih secimi
   - Lig filtresi
   - Market sekmesi
   - Genis tablo
   - Detay penceresi

3. Normalize veri katmani
   - Mac bilgisi
   - Market bilgisi
   - Secenek/oran bilgisi
   - Kaynak URL ve denetim bilgisi

4. Tekrar kontrol katmani
   - match_code varsa oncelikli benzersiz anahtar
   - match_date + home_team + away_team ikincil benzersiz anahtar
   - market_name + selection_name ile oran tekrari kontrolu

5. Ham veri havuzu entegrasyonu
   - Hedef dosya: `data/ham_mac_havuzu.json`
   - Mevcut veri bozulmadan yeni kaynak kayitlari eklenmeli.

6. Uygunluk ve etik kontrol
   - Site kullanim sartlari incelenmeden otomasyon baslatilmamali.
   - Erisim frekansi dusuk tutulmali.
   - Sadece acik program/arsiv verisi hedeflenmeli.

## Sonuc

Mackolik Arsiv, Futbol Laboratuvari icin API disi ikinci veri kaynagi olmaya adaydir. En guclu katkisi mac programi, lig, takim, mac kodu, market ve oran verileridir. Ancak bu kaynak tek basina mac sonucu, ilk yari skoru ve ikinci yari skoru saglamayabilir.

Karar:

Mackolik Arsiv icin fizibilite olumlu, fakat otomasyon gelistirmeden once iki konu netlestirilmelidir:

1. Tarih secicisi tum gecmis arsive ne kadar izin veriyor?
2. Mac detay penceresi tum marketleri stabil ve okunabilir sekilde sunuyor mu?

Bu iki konu dogrulanirsa, kaynak `data/ham_mac_havuzu.json` dosyasini buyutmek icin yuksek potansiyelli ikinci veri kaynagi olabilir.
