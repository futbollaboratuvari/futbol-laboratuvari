# FUTBOL LABORATUVARI - MASTER HAFIZA

## Son Guncelleme - Faz 6 Mackolik Arsiv Veri Cekme - 2026-06-18

* `src/mackolik_veri_cekici.py` olusturuldu.
* Playwright ile Mackolik Arsiv sayfasi acildi ve 66 mac satiri bulundu.
* `data/ham_mac_havuzu.json` dogrulanmis Mackolik kayitlariyla 25 toplam maca cikarildi.
* `outputs/mackolik_veri_cekme_raporu.md` olusturuldu.
* `src/robot.py` Mackolik adimini ana akisi bozmadan kontrollu calistiracak sekilde guncellendi.

## Son Guncelleme - Faz 7 Mackolik Veri Cekici Son Tamamlama - 2026-06-19

* Mackolik veri cekme sistemi ilk calisan surum olarak hazirlandi. Site entegrasyonuna gecmeden once ham veri havuzu uretimi dogrulandi.
* Canli testte 66 mac satiri, 28 lig ve 39 tam temel oranli mac dogrulandi.
* Zorunlu alanlar dogrulandi: tarih, saat, lig, ev sahibi, deplasman, mac kodu, MS 1, MS X, MS 2, 2.5 Alt, 2.5 Ust.
* `Tumu` detay alanlari 25/25 basariyla acildi; ek marketlerin guvenilir normalize edilmesi sonraki iyilestirme olarak kaldi.
* `data/ham_mac_havuzu.json` gecerli JSON, toplam 25 mac ve 0 tekrar anahtari ile dogrulandi.
* Son karar: Mackolik veri cekici HAZIR; site entegrasyonuna gecilebilir.

## Proje Amacı

* Futbol verilerini otomatik toplamak
* Takım ve lig analizleri yapmak
* KG Var, Üst/Alt, İlk Yarı, İkinci Yarı ve maç sonucu sinyalleri üretmek
* Açıklanabilir kupon önerileri oluşturmak
* Uzun vadede kendi başarı oranını ölçen öğrenen sistem haline gelmek

## Tamamlanan Fazlar

### Faz 1

* Veri toplama altyapısı
* football-data.org entegrasyonu
* API-Football fallback sistemi
* run_robot.bat

### Faz 2

* Lig gücü motoru
* Form puanı motoru
* Takım gücü motoru
* Güç skoru sistemi

### Faz 2 İyileştirmeleri

* Confidence sistemi
* Ham veri havuzu
* Confidence detay raporları

### Faz 3

* Kupon motoru
* Tekli kupon
* Çoklu kupon
* Güç skoru bazlı sıralama

## Mevcut Durum

* Sistem çalışıyor
* Faz 3 tamamlandı
* API_FOOTBALL_KEY bu oturumda ortam değişkeni olarak bulunamadı
* Türkiye lig league_id eşleşmeleri canlı API anahtarı bekliyor
* Ham veri havuzu büyütülmeli
* Performans takip sistemi ilk sürüm olarak tasarlandı
* Başarı yüzdesi raporu ilk sürüm olarak oluşturuldu
* Robot akışı kupon üretimi ve tahmin geçmişi kaydına hazır
* Faz 5 başarı takip ve öğrenme sistemi altyapısı eklendi
* `data/tahmin_gecmisi.json` v2 şeması KG Var, Üst 2.5, MS1 ve Çifte Şans marketlerini takip eder
* API key olmadan offline/demo mod eklendi
* `run_robot.bat` API key yoksa yerel örnek veriyle rapor üretir
* V1 Demo sürümü tamamlandı
* V1 final durum raporu oluşturuldu: `outputs/v1_final_durum_raporu.md`

## API ve Hesap Kuralları

* Robot hiçbir zaman kullanıcı adına hesap açmaz.
* Robot hiçbir zaman e-posta doğrulaması yapmaz.
* Robot hiçbir zaman şifre üretip hesap oluşturmaz.
* Robot hiçbir zaman API key uydurmaz.
* Robot yalnızca ücretsiz veya düşük maliyetli API kaynaklarını araştırır.
* API key kullanıcı tarafından alınır.
* API key `.env` veya Windows ortam değişkenlerinde saklanır.
* Robot mevcut key ile entegrasyonu yapar.

## Veri Kaynağı Öncelik Sırası

1. API-Football
2. football-data.org
3. CollectAPI
4. TheSportsDB
5. The Odds API
6. SportMonks

Yeni kaynak bulunduğunda raporlanır ve karşılaştırılır.

## Bir Sonraki Hedef

Öncelik: API key olmadan yerel demo modda çalışan V1'i koruyarak 1000+ maçlık ham veri havuzu.

Kupon motoru geliştirmekten önce veri havuzu büyütülecek.

Çalışma sırası:

1. Önce veri.
2. Sonra model.
3. Sonra kupon.

## Desteklenecek Ligler

### Türkiye

* Süper Lig
* TFF 1. Lig
* TFF 2. Lig
* TFF 3. Lig
* Türkiye Kupası
* Süper Kupa

### Öncelikli Avrupa Ligleri

* Premier League
* Championship
* Bundesliga
* Bundesliga 2
* La Liga
* Serie A
* Ligue 1
* Eredivisie

## Sonraki Hedefler

### Faz 4

* Performans takip sistemi
* Başarı yüzdesi hesaplama
* Market bazlı başarı oranları
* Lig bazlı başarı oranları
* Otomatik sonuç doğrulama
* API-Football canlı Türkiye league_id çekimi
* 1000+ maçlık ham veri havuzu
* Yeni algoritma geliştirmeden önce veri havuzu büyütme

### Faz 5

* Öğrenen model
* Geçmiş tahmin analizi
* Risk puanlama geliştirme
* Her tahmini benzersiz ID ile kaydetme
* Sonuç girildiğinde won/lost/void işaretleme
* Genel, lig bazlı, tahmin türü bazlı ve market bazlı başarı yüzdesi

## Önemli Dosyalar

### Ana Hafıza ve Plan Dosyaları

* `MASTER_HAFIZA.md`
* `proje_hafizasi.md`
* `gunluk_rapor.md`
* `yol_haritasi_v1.md`
* `notes.md`

### Faz Raporları

* `outputs/faz1_durum_raporu.md`
* `outputs/faz2_analiz_raporu.md`
* `outputs/faz2_iyilestirme_raporu.md`
* `outputs/faz3_kupon_motoru_raporu.md`
* `outputs/faz4_yol_haritasi.md`
* `outputs/kullanim_kilavuzu.md`
* `outputs/v1_demo_durum_raporu.md`
* `outputs/v1_final_durum_raporu.md`

### Veri ve API Raporları

* `outputs/veri_buyutme_raporu.md`
* `outputs/api_key_kaynaklari_raporu.md`
* `outputs/api_mac_tarama_raporu.md`
* `outputs/api_rate_limit_raporu.md`
* `outputs/lig_bazli_mac_sayilari.md`
* `api_veri_kaynaklari.md`
* `ikinci_veri_kaynagi_entegrasyonu.md`

### Günlük Çıktılar

* `outputs/bugunun_en_guclu_maclari.md`
* `outputs/basari_yuzdesi_raporu.md`

### Veri Havuzları

* `data/football_data_org_ornek.json`
* `data/ham_mac_havuzu.json`
* `data/veri_havuzu.json`
* `data/tahmin_gecmisi.json`

### Ana Kod Dosyaları

* `run_robot.bat`
* `src/robot.py`
* `src/veri_kaynagi_yoneticisi.py`
* `src/api_football_client.py`
* `src/api_football_normalizer.py`
* `src/turkiye_ligleri_canli.py`
* `src/ham_veri_havuzu.py`
* `src/performans_takip.py`
* `src/kupon_motoru.py`
* `src/guc_skoru_motoru.py`
* `src/takim_gucu_motoru.py`
* `src/form_puani_motoru.py`
* `src/kg_var_motoru.py`
* `src/iy_iy_kg_var_motoru.py`
* `src/ust_alt_motoru.py`
* `src/lig_gucu_motoru.py`
* `src/tahmin_motoru.py`
* `src/gunun_maclari_tarayici.py`

## Oturum Devam Talimatı

Yeni oturum başladığında:

1. Önce MASTER_HAFIZA.md oku.
2. Son oluşturulan rapor dosyasını bul.
3. Eksik kalan en önemli işi belirle.
4. Oradan devam et.

Bu dosya her faz sonunda otomatik güncellensin.
## Web Site Calismalari Guncelleme Kurali - 2026-06-19

Web sitesiyle ilgili her degisiklikten sonra asagidaki dosyalar guncellenecek:

1. `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari\WEB_SITE_CALISMALARI.md`
2. `MASTER_HAFIZA.md`
3. `proje_hafizasi.md`
4. `gunluk_rapor.md`

Web sitesi calisma kopyasi:

`C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari`

Karar:

- Ana site kullanicilarin maclari inceleyecegi ana vitrin olacak.
- Admin panel ayri kalacak.
- Web site linkleri relative tutulacak.
- `eu.org` domain linki kullanici istemedikce eklenmeyecek.
- Push ve commit kullanici acikca istemedikce yapilmayacak.
- Web site takip dosyasi: `WEB_SITE_CALISMALARI.md`.
## Web Site Guncellemesi - 2026-06-19

Son Analizler ve Analiz Veritabani bolumleri eski sabit verilerden arindirildi.

Yapilanlar:

- `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari\index.html` icinde `Son Analizler` metni guncel robot veri akisini anlatacak sekilde duzenlendi.
- `Analiz Veritabani` basligi `Arsiv / Bekleyen Veri` olarak ayarlandi.
- `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari\script.js` icindeki eski analiz dizisinin gorunum uretmesi engellendi.
- `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari\robot-dashboard.js` robot veri kaynaklarindan tablo/kart uretmeye devam edecek.
- Veri yoksa eski tarihli veri gosterilmeyecek; kullaniciya robotun calistirilmasi gerektigi mesaji gosterilecek.
- `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari\WEB_SITE_CALISMALARI.md` guncellendi.
## Web Site GitHub Desktop Kuralı - 2026-06-19

Bundan sonra web site commit ve push islemleri PC uzerindeki GitHub Desktop ile yapilacak.

Kural:

- Web site dosyalari once su repo klasorune kaydedilecek:
  `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari`
- Kullanici web site islemlerini yayinlamak istediginde GitHub Desktop acilacak.
- Commit ve push GitHub Desktop arayuzunden yapilacak.
- Kod tarafindan otomatik push/commit yapilmayacak.
- Islem oncesi degisen dosyalar kullaniciya ozetlenecek.
## Web Site Otomatik Veri Yönlendirme - 2026-06-19

Robot çıktılarının her çalıştırmada web site repo klasörüne aktarılması için otomatik eşitleme katmanı eklendi.

Eklenen dosya:

- `src/web_site_esitleyici.py`
- `setup_daily_robot_task.bat`

Güncellenen dosya:

- `run_robot.bat`

Akış:

1. Robot `run_robot.bat` ile çalışır.
2. `src/robot.py` veri/rapor üretir.
3. Robot başarılı biterse `src/web_site_esitleyici.py` çalışır.
4. Aşağıdaki dosyalar web site repo klasörüne kopyalanır:
   - `data/ham_mac_havuzu.json`
   - `data/tahmin_gecmisi.json`
   - `outputs/bugunun_en_guclu_maclari.md`
   - `outputs/mackolik_veri_cekme_raporu.md`
   - `outputs/basari_yuzdesi_raporu.md`
5. Web site repo klasörü:
   `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari`
6. Git kuruluysa `src/web_site_esitleyici.py --push` otomatik commit/push dener.
7. Otomatik commit mesajı: `Canli veri otomatik guncellendi`.

Günlük otomatik çalışma:

- `setup_daily_robot_task.bat` bir kez çalıştırılırsa Windows Görev Zamanlayıcı’da `FutbolLaboratuvariRobotGunluk` görevi oluşur.
- Varsayılan çalışma saati: 08:30.
- Görev her gün `run_robot.bat` dosyasını çalıştırır.
