# Faz 6 Mackolik Veri Cekme Durumu - 2026-06-18

Durum: Baslatildi ve ilk uygulama tamamlandi.

- `src/mackolik_veri_cekici.py` olusturuldu.
- Playwright ile Mackolik Arsiv sayfasi acildi.
- Canli testte 66 mac satiri bulundu.
- MS 1, MS X, MS 2, 2.5 Alt ve 2.5 Ust oranlari okundu.
- `data/ham_mac_havuzu.json` 25 toplam maca cikarildi.
- `outputs/mackolik_veri_cekme_raporu.md` olusturuldu.
- Ana V1 demo akisi bozulmadan `src/robot.py` icine kontrollu Mackolik adimi eklendi.

Sonraki veri buyutme adimlari:

- Tarih gezintisini ekle.
- Detay pencerelerinden KG Var/Yok ve ek marketleri parse et.
- Ham havuzu 1000+ maca cikar.

# Futbol Laboratuvari V1 Yol Haritasi

## Mevcut Proje Durumu

Futbol Laboratuvari V1 su anda guclu bir planlama ve ilk veri toplama temelindedir. Proje klasoru kurulmus, veri modeli ve analiz tasarimlari yazilmis, football-data.org API baglantisi test edilmis ve ornek Premier League verisi `data/football_data_org_ornek.json` dosyasina kaydedilmistir.

Mevcut durumda calisan ana Python parcasi `src/ilk_veri_toplayici.py` dosyasidir. Analiz modellerinin cogu henuz Python modulune donusmemis, tasarim dokumani seviyesindedir.

## Taranan Dosya ve Klasorler

| Yol | Durum | Not |
|---|---|---|
| `README.md` | Var | Kurulum, API anahtari ve calistirma talimatlari mevcut. |
| `notes.md` | Var | V1 yol haritasi ve ileri analiz fikirleri mevcut. |
| `requirements.txt` | Var | Ucuncu parti paket gerekmiyor; standart kutuphane kullaniliyor. |
| `proje_hafizasi.md` | Var | Genel proje hafizasi tutuluyor. |
| `gunluk_rapor.md` | Var | Oturum bazli calisma gecmisi tutuluyor. |
| `yol_haritasi_v1.md` | Yeni | Mevcut analiz sonucu ve V1 oncelik plani. |
| `son_5_mac_form_analizi.md` | Var | Son 5 mac form puani tasarimi mevcut. |
| `ilk_yari_ikinci_yari_modeli.md` | Var | Devre bazli performans modeli tasarimi mevcut. |
| `data/.gitkeep` | Var | Bos klasor koruma dosyasi. |
| `data/football_data_org_ornek.json` | Var | PL icin 20 takimlik puan durumu ve 5 mac sonucu mevcut. |
| `src/.gitkeep` | Var | Bos klasor koruma dosyasi. |
| `src/futbol_veri_modeli.md` | Var | Veri alanlari ve istatistik semasi mevcut. |
| `src/veri_kaynaklari.md` | Var | Veri kaynaklari arastirmasi mevcut. |
| `src/ilk_veri_toplayici.py` | Var | football-data.org API istemcisi mevcut. |
| `tests/.gitkeep` | Var | Test klasoru var, ancak test dosyasi yok. |

## Tamamlanan Parcalar

- Proje klasor yapisi kuruldu.
- V1 genel yol haritasi yazildi.
- Futbol veri modeli tasarlandi.
- Veri kaynaklari arastirildi.
- football-data.org API entegrasyonu icin ilk Python istemcisi yazildi.
- API anahtari ortam degiskeniyle okunacak sekilde tasarlandi.
- API baglantisi basariyla test edildi.
- Premier League icin puan durumu ve son mac verisi cekildi.
- API sonucu JSON olarak kaydedildi.
- Son 5 mac form analizi tasarlandi.
- Ilk yari / ikinci yari performans modeli tasarlandi.
- Proje hafizasi ve gunluk rapor sistemi kuruldu.

## Eksik Moduller

| Modul | Durum | Neden Gerekli |
|---|---|---|
| `src/veri_okuyucu.py` | Eksik | `data/football_data_org_ornek.json` gibi dosyalari standart sekilde okumak icin. |
| `src/veri_dogrulama.py` | Eksik | Eksik alan, bozuk skor, tarih ve takim kimligi kontrolleri icin. |
| `src/veri_normalizasyon.py` | Eksik | API yanitlarini ortak mac semasina donusturmek icin. |
| `src/son_5_mac_form_analizi.py` | Eksik | Tasarimi yapilan son 5 mac form modelini calisan koda cevirmek icin. |
| `src/ilk_yari_ikinci_yari_modeli.py` | Eksik | Devre bazli analiz tasarimini calisan koda cevirmek icin. |
| `src/kg_var_modeli.py` | Eksik | KG Var/Yok oranlari ve sinyalleri uretmek icin. |
| `src/ust_alt_25_modeli.py` | Eksik | Ust 2.5 / Alt 2.5 sinyalleri uretmek icin. |
| `src/lig_gucu_motoru.py` | Tamamlandi | Lig gol ortalamasi, KG Var orani, Ust oranlari ve lig guc skorlarini uretmek icin. |
| `src/lig_analizi.py` | Kismen eksik | Beraberlik orani, favori/riski gibi ek lig metrikleri icin. |
| `src/takim_analizi.py` | Eksik | Takim bazli genel hucum, savunma, form ve saha performansi icin. |
| `src/kupon_motoru.py` | Eksik | Analiz sinyallerini guven/risk/deger skoruna cevirmek icin. |
| `src/tahmin_motoru.py` | Tamamlandi | Alt analiz motorlarini agirlikli birlestiren ana karar motoru. |
| `src/mac_skorlayici.py` | Tamamlandi | Iki takim girdisiyle market skorlarini, en guclu marketi ve ilk 3 marketi ureten katman. |
| `src/ana_tahmin_motoru.py` | Tamamlandi | Tum motorlari Mac Skor Karti formatinda birlestiren ust karar katmani. |
| `src/gunun_maclari_tarayici.py` | Tamamlandi | API'den bugunku maclari cekip mevcut motorlarla analiz ederek ilk 10 guclu mac raporu ureten tarayici. |
| `src/raporlama.py` | Eksik | Analiz sonucunu okunabilir JSON/Markdown raporuna cevirmek icin. |
| API cache modulu | Eksik | Ucretsiz API limitlerini korumak ve tekrar istekleri azaltmak icin. |
| `src/veri_havuzu.py` | Tamamlandi | Takim bazli son 20 mac, son 10 ic saha ve son 10 deplasman macini saklayacak veri havuzu. |
| `src/veri_havuzu_guncelleyici.py` | Tamamlandi | API'den gercek veriyi cekip mac tekrari kontroluyle veri havuzunu buyuten modul. |
| Test dosyalari | Eksik | Veri okuyucu, parser ve analiz fonksiyonlarini guvenli gelistirmek icin. |
| Ornek veri setleri | Kismen eksik | Sadece PL ornek sonucu var; daha fazla lig ve mac gecmisi gerekli. |

## Onemli Teknik Riskler

- Mevcut `football_data_org_ornek.json` sadece 5 mac sonucu iceriyor; son 5 mac form analizi icin takim basina yeterli veri henuz yok.
- Mevcut ornek API verisinde ilk yari skor alanlari yok; `ilk_yari_ikinci_yari_modeli.md` tasarimini calistirmak icin ek veri kaynagi veya API yanit genisletmesi gerekli.
- `src/ilk_veri_toplayici.py` icinde `save_results_to_file` fonksiyonu var, ancak bu ortamda Python dosya yazma adimi daha once `Bad file descriptor` hatasi vermisti. V1'de dosya yazma stratejisi tekrar test edilmeli veya dosya yazma sorumlulugu ayri bir katmanda ele alinmali.
- Test klasoru bos; bundan sonraki kodlamada regresyon riski artar.
- API anahtari kullanildi; anahtar dosyalara yazilmamali ve commit edilmemeli.
- Confidence esigi proje genelinde 0-5 mac low, 6-15 mac medium, 16+ mac high olarak standartlastirildi.
- P9 gercek API denemesinde PL icin 379 benzersiz bitmis mac cekildi; takimlarin buyuk kisminda confidence `high` seviyesine cikti.
- Calisma ortaminda Python/PowerShell dosya yazma denemeleri `Bad file descriptor` veya erisim reddi verdigi icin tam havuzun dosyaya yazilmasi proje araci disinda dogrulanamadi.
- Gunun Maclari Tarayicisi gercek zamanli API verisine baglidir; API bugun icin mac dondurmezse rapor bos fikstur notuyla uretilir.
- 2026-06-18 P12 denemesinde API bugun icin 0 mac dondurdu; tarayici hata vermeden bos fikstur raporu uretmistir.
- P13 ile bugun 0 mac dondugunde sistem durmayacak; yarin ve 7 gunluk pencere taranarak ilk mac bulunan tarih rapora alinacak.
- P13 gercek API denemesinde ilk macli tarih 2026-06-21 olarak bulundu; bu tarih `MAC_TARIHI` alanina yazildi.
- Mac bulma sistemi sonraki adimda tek tarih veya tek competition varsayimindan cikarildi; 2026-06-18 / 2026-06-24 araliginda 13 competition kodu taranarak WC icin 29 mac bulundu.
- API rate limit riskini azaltmak icin competition taramasi kuyruk sistemine alindi; her cagri sonrasi 6 saniye bekleme, 429 durumunda Retry-After bekleme ve `api_rate_limit_raporu.md` raporu eklendi.
- Mac sayisini artirmak icin 14 gunluk lig bazli tarama raporu eklendi; mevcut API erisiminde WC disindaki buyuk ligler bu tarih araliginda 0 mac dondurdu.
- Turkiye ligleri icin football-data.org yetersiz kaldigindan P14 olarak API-Football ikinci veri kaynagi entegrasyonu planlandi.
- Faz 1 baslatildi: API-Football fallback mimarisi, ortak sema normalizasyonu, Turkiye ligleri kaynak plani, tek tik `run_robot.bat`, `.env.example` ve `.gitignore` hazirlandi.
- Faz 1 altyapi denetimi tamamlandi; import zinciri temiz, API-Football fallback fixture cekim yolu hazir ve `faz1_altyapi_raporu.md` olusturuldu.
- Faz 1 bitis denetimi tamamlandi; `outputs/faz1_durum_raporu.md` olusturuldu. Faz 2 oncesi son is API-Football gercek anahtariyla Turkiye lig ID eslesmelerini canli olarak doldurmak.

## V1 Icin Oncelikli Isler

### P0 - Temel Veri Altyapisi

1. `src/veri_okuyucu.py` olustur.
2. `data/football_data_org_ornek.json` dosyasini okuyacak fonksiyon yaz.
3. Okunan veriyi `standings` ve `recent_results` olarak ayir.
4. Temel hata yonetimi ekle: dosya yok, bozuk JSON, beklenen alan yok.
5. `tests/test_veri_okuyucu.py` ile ilk testleri yaz.

Basari kriteri:

- JSON dosyasi okunur.
- 20 takim ve 5 mac sonucu dogrulanir.
- Testler gecmeden sonraki modullere gecilmez.

### P1 - Mac Veri Normalizasyonu

1. `src/veri_normalizasyon.py` olustur.
2. football-data.org mac sonucunu ortak mac formatina cevir.
3. Alan adlarini `futbol_veri_modeli.md` ile uyumlu hale getir.
4. Eksik alanlar icin `None` veya kontrollu varsayilan kullan.
5. Mac tarihini tek formatta sakla.

Basari kriteri:

- `recent_results` verisi analiz modullerinin kullanabilecegi ortak yapida doner.

### P2 - Son 5 Mac Form Analizi

1. `src/son_5_mac_form_analizi.py` olustur.
2. `son_5_mac_form_analizi.md` dokumanindaki fonksiyonlari uygula.
3. Galibiyet, beraberlik, maglubiyet, gol ortalamasi ve form puani hesapla.
4. Ev sahibi/deplasman ayrimini ekle.
5. Veri yetersizse `low_confidence` veya benzeri bir isaret uret.

Basari kriteri:

- En az bir takim icin form raporu uretilebilir.
- Veri azsa sistem hata vermek yerine dusuk guven notu doner.

### P3 - KG Var/Yok ve Ust/Alt 2.5 Modelleri

1. `src/kg_var_modeli.py` olustur.
2. `both_teams_scored` hesaplama fonksiyonu yaz.
3. KG Var/Yok oranlarini genel, ev ve deplasman kapsaminda hesapla.
4. `src/ust_alt_25_modeli.py` olustur.
5. Toplam gol, Ust 2.5 ve Alt 2.5 oranlarini hesapla.

Basari kriteri:

- Mac listesi verildiginde KG Var ve Ust/Alt istatistikleri uretilebilir.

### P4 - Lig Analizi

Durum: Kismen tamamlandi. `src/lig_gucu_motoru.py` ile lig gol gucu ve KG Var gucu hesaplama katmani olusturuldu.

Tamamlananlar:

- Lig gol ortalamasi hesaplandi.
- KG Var lig orani hesaplandi.
- Ust 2.5 ve Ust 3.5 oranlari hesaplandi.
- Ilk yari ve ikinci yari gol ortalamalari icin veri yapisi hazirlandi.
- `LIG_GOAL_POWER` ve `LIG_KG_POWER` skorlarinin 0-100 arasi hesaplanmasi eklendi.

Kalanlar:

1. `src/lig_analizi.py` veya mevcut lig motoru icinde ev sahibi galibiyet, beraberlik ve deplasman galibiyet oranlarini hesapla.
2. Favori/riski gibi ek lig metriklerini tasarla.
3. Basit lig risk skoru uret.

Basari kriteri:

- Bir lig icin gol gucu, KG gucu, genel karakter etiketi ve risk skoru uretilebilir.

### P5 - Ilk Yari / Ikinci Yari Modeli

1. football-data.org verisinde ilk yari skorlarinin alinabilirligini arastir.
2. Gerekirse alternatif veri kaynagi belirle.
3. `src/ilk_yari_ikinci_yari_modeli.py` olustur.
4. Ilk yari ve ikinci yari skorlarini ayri hesapla.
5. 0-100 Yari Performans Puani uret.

Basari kriteri:

- Ilk yari skoru olan veriyle devre bazli rapor uretilebilir.

### P6 - Kupon Uretim Motoru

On hazirlik durumu: `src/tahmin_motoru.py` ile ana karar motoru olusturuldu. Kupon motoru bu karar skorlarini ana sinyal kaynagi olarak kullanacak.
Ek hazirlik durumu: `src/mac_skorlayici.py` ile iki takim girdisinden kupon motoruna aktarilabilecek sade market skorlari uretiliyor.

1. `src/kupon_motoru.py` olustur.
2. `src/mac_skorlayici.py` ciktisini ana sinyal kaynagi olarak kullan.
3. Form, KG Var, Ust/Alt ve lig risk sinyallerini birlestir.
4. Guven skoru, risk skoru ve deger skoru hesapla.
5. Dusuk, orta ve yuksek riskli kupon onerisi uret.
6. Her onerinin gerekcesini metin olarak ekle.

Basari kriteri:

- En az 3 maclik ornek veriyle okunabilir kupon onerisi uretilebilir.

### P7 - Raporlama ve CLI

1. `src/raporlama.py` olustur.
2. Analiz sonucunu JSON ve Markdown olarak cikart.
3. `src/main.py` veya basit CLI girisi ekle.
4. README'ye calistirma orneklerini ekle.

Basari kriteri:

- Tek komutla veri okunur, analiz edilir ve rapor uretilir.

## Onerilen Gelistirme Sirasi

1. Veri okuyucu
2. Veri havuzu
3. Veri havuzu guncelleyici
4. Veri normalizasyonu
5. Test altyapisi
6. Son 5 mac form analizi
7. KG Var/Yok modeli
8. Ust/Alt 2.5 modeli
9. Lig gucu ve lig analizi
10. Ilk yari / ikinci yari modeli
11. Ana tahmin motoru
12. Mac skorlayici
13. Mac skor karti / ana tahmin raporu
14. Gunun maclari tarayicisi
15. Kupon motoru
16. Raporlama ve CLI

## V1 Kabul Kriterleri

Futbol Laboratuvari V1 tamamlanmis sayilmak icin:

- API'den veya `data/` klasorunden mac verisi okuyabilmeli.
- Veriyi ortak semaya normalize edebilmeli.
- Takim bazli son 5 mac form raporu uretebilmeli.
- KG Var/Yok ve Ust/Alt 2.5 istatistikleri hesaplayabilmeli.
- Lig bazli temel risk ve karakter analizi yapabilmeli.
- Basit kural tabanli kupon onerisi uretebilmeli.
- Her onerinin guven, risk ve gerekce alanlari olmali.
- Temel fonksiyonlar icin testler bulunmali.

## Kisa Sonuc

Projenin V1 temeli hazir. En kritik sonraki adim, belge seviyesindeki analiz tasarimlarini calisan Python modullerine cevirmektir. Once veri okuma ve normalizasyon katmani kurulmadan kupon motoruna gecilmemelidir.

## Faz 2 Durumu - Analiz Katmani

Durum: Tamamlandi.

Faz 2 kapsaminda mevcut motorlar korunarak takim ve lig gucu katmani kuruldu.

Tamamlananlar:

- Lig gucu motoru ev sahibi galibiyet orani, deplasman galibiyet orani ve beraberlik oraniyla genisletildi.
- Takim gucu motoru olusturuldu.
- Mac guc skoru motoru olusturuldu.
- Gunun maclari tarayicisi Faz 2 guc skoru motoruna baglandi.
- Her mac icin `GUC_SKORU`, `KG_VAR_OLASILIGI`, `UST_25_OLASILIGI` ve `confidence` uretilecek hale getirildi.
- `outputs/faz2_analiz_raporu.md` raporu olusturuldu.

Faz 2 basari kriteri:

- Mevcut Form, KG Var, Ust/Alt ve Lig Gucu motorlari tek skor katmaninda birlesir.
- Veri yetersizse sistem hata vermek yerine `confidence: low` uretir.
- Robot tekrar calistirildiginda `outputs/bugunun_en_guclu_maclari.md` Faz 2 skor semasiyla uretilir.

Faz 3 icin onerilen siradaki is:

1. Kupon motorunu olustur.
2. Faz 2 skorlarini ana sinyal olarak kullan.
3. Dusuk, orta ve yuksek riskli kupon onerileri uret.
4. Birim testleri ekle.

## Faz 2 Iyilestirme Durumu

Durum: Tamamlandi.

Faz 3'e gecmeden once iki temel altyapi eksigi kapatildi:

- Confidence sistemi sayisal ve dort seviyeli hale getirildi.
- Ham mac veri havuzu olusturuldu.

Yeni confidence seviyeleri:

| Seviye | Aralik |
|---|---:|
| low | 0-39 |
| medium | 40-64 |
| high | 65-84 |
| very_high | 85-100 |

Yeni dosyalar:

- `src/confidence_motoru.py`
- `src/ham_veri_havuzu.py`
- `data/ham_mac_havuzu.json`
- `outputs/faz2_iyilestirme_raporu.md`

Faz 3 artik kupon motoru ile baslayabilir.

## Faz 3 Durumu - Kupon Motoru

Durum: Baslatildi ve ilk surum tamamlandi.

Tamamlananlar:

- `src/kupon_motoru.py` olusturuldu.
- Faz 2 skorlarindan otomatik kupon onerisi uretildi.
- Tek mac onerileri olusturuldu.
- 2'li kupon onerileri olusturuldu.
- 3'lu kupon onerileri olusturuldu.
- Risk puani ve risk seviyesi eklendi.
- `outputs/faz3_kupon_motoru_raporu.md` olusturuldu.

Faz 3 sonraki adim:

1. Kupon motorunu robot akisina bagla.
2. Canli API verisiyle ham havuzu buyut.
3. Kupon onerilerini daha yuksek confidence verisiyle tekrar uret.
4. Risk profilini dusuk, orta ve yuksek kupon tiplerine ayir.

## Turkiye Ligleri Canli Veri Durumu

Durum: Altyapi hazir, API anahtari bekliyor.

Tamamlananlar:

- `src/turkiye_ligleri_canli.py` olusturuldu.
- API-Football Turkiye ligleri canli baglanti akisi hazirlandi.
- Ham veri havuzu buyutme akisi hazirlandi.
- Kupon motoru `src/robot.py` uzerinden `run_robot.bat` akisina baglandi.
- `outputs/veri_buyutme_raporu.md` olusturuldu.

Bekleyen:

- `API_FOOTBALL_KEY` ortam degiskeni tanimlanmali.
- Gercek league_id degerleri canli API yanitindan cekilmeli.
- Turkiye ligleri fixture verisi ham veri havuzuna eklenmeli.

## Faz 4 Durumu - Performans Takibi ve Veri Buyutme

Durum: Hazirlik tamamlandi, canli API anahtari bekliyor.

Tamamlananlar:

- `MASTER_HAFIZA.md` olusturuldu.
- `src/performans_takip.py` olusturuldu.
- `data/tahmin_gecmisi.json` olusturuldu.
- `outputs/basari_yuzdesi_raporu.md` olusturuldu.
- `outputs/faz4_yol_haritasi.md` olusturuldu.
- `src/robot.py` kupon onerilerini tahmin gecmisine ekleyecek sekilde guncellendi.

Bekleyenler:

1. `API_FOOTBALL_KEY` ortam degiskeni tanimlanmali.
2. Turkiye liglerinin gercek `league_id` degerleri canli API'den cekilmeli.
3. `data/ham_mac_havuzu.json` en az 1000 benzersiz maca buyutulmeli.
4. Bekleyen tahminleri gercek mac sonuclariyla eslestirecek sonuc dogrulama katmani eklenmeli.
5. `outputs/basari_yuzdesi_raporu.md` sonuclanmis tahminlerle otomatik guncellenmeli.

Basari kriteri:

- `run_robot.bat` veri ceker, analiz eder, confidence hesaplar, kupon olusturur, tahmin gecmisini gunceller ve rapor uretir.
- Sonuclanan tahminler icin genel, market bazli ve lig bazli basari yuzdesi hesaplanir.

## Kalici Gelistirme Onceligi

Yeni algoritma veya kupon motoru gelistirmesi yapilmadan once veri havuzu buyutulecek.

Ana hedef:

- 1000+ benzersiz maclik ham veri havuzu.

Calisma sirasi:

1. Veri
2. Model
3. Kupon

Veri kaynagi onceligi:

1. API-Football
2. football-data.org
3. CollectAPI
4. TheSportsDB
5. The Odds API
6. SportMonks

API ve hesap kurali:

- Hesap acma, e-posta dogrulama, sifre uretme ve API key uydurma islemleri robot tarafindan yapilmaz.
- Kullanici API key'i aldiktan sonra robot entegrasyonu yapar.

## Offline Demo Mod Durumu

Durum: Tamamlandi ve uctan uca dogrulandi.

Hedef:

- Futbol Laboratuvari V1, API key olmadan da yerel PC'de tek tikla calissin.

Tamamlananlar:

- `src/robot.py` API key yoksa demo moda gececek sekilde guncellendi.
- `run_robot.bat` API key yokken `Demo modda calisiyor.` mesajini verir.
- Demo mod `data/football_data_org_ornek.json` dosyasini kullanir.
- Demo mod analiz, kupon, tahmin gecmisi ve basari raporu adimlarini calistirir.
- `outputs/bugunun_en_guclu_maclari.md` demo raporu olarak uretilir.
- `outputs/kullanim_kilavuzu.md` olusturuldu.
- `outputs/v1_demo_durum_raporu.md` olusturuldu.
- `run_robot.bat` `outputs` ve `data` klasorlerini garanti olusturur.

Canli moda gecis:

- `FOOTBALL_DATA_API_KEY` veya `API_FOOTBALL_KEY` tanimlandiginda robot canli veri kaynagini dener.
- API key yoksa robot durmaz; demo modda calisir.

V1 Demo kabul durumu:

- API key olmadan yerel PC'de tek tikla calisma hedefi tamamlandi.
- Yeni ozellik eklemeden once demo akisi korunacak.
