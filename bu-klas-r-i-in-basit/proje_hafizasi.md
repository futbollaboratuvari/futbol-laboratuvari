# Proje Hafizasi

## Projenin Amaci

Futbol Laboratuvari; futbol mac verilerini toplamak, takim ve lig seviyesinde analiz etmek, bahis odakli sinyaller uretmek ve kontrollu kupon onerileri hazirlamak icin gelistirilen V1 proje iskeletidir.

Ilk hedef, dogrudan "kesin tahmin" sistemi kurmak degil; veri toplama, analiz, risk puanlama ve aciklanabilir kupon onerisi icin izlenebilir bir temel olusturmaktir.

## Bugune Kadar Yapilan Calismalar

- Temel proje klasor yapisi olusturuldu.
- V1 yol haritasi `notes.md` dosyasina yazildi.
- Futbol veri modeli ayrintili tablolarla tasarlandi.
- V1 icin kullanilabilecek veri kaynaklari arastirildi ve karsilastirildi.
- football-data.org API icin ilk veri toplayici Python scripti olusturuldu.
- API anahtari ortam degiskeniyle okunacak sekilde tasarlandi.
- Premier League puan durumu ve son mac sonuclari football-data.org API'den basariyla cekildi.
- API'den gelen ornek JSON veri `data/football_data_org_ornek.json` dosyasina kaydedildi.
- Son 5 mac form analizi icin ayrintili tasarim dokumani olusturuldu.
- Ilk yari / ikinci yari performans modeli icin ayrintili tasarim dokumani olusturuldu.
- Mevcut proje dosyalari tarandi ve V1 icin eksik moduller oncelik sirasina gore `yol_haritasi_v1.md` dosyasina yazildi.
- P0 kapsaminda `src/veri_okuyucu.py` olusturuldu; yerel JSON verisini okuma, lig bilgisi, takim listesi, puan durumu ve son mac sonuclari cikarma fonksiyonlari eklendi.
- P1 kapsaminda `src/form_puani_motoru.py` olusturuldu; veri okuyucu ciktisinden takim bazli son 5 mac form puani hesaplama motoru eklendi.
- P2 kapsaminda `src/kg_var_motoru.py` olusturuldu; takim bazli ve iki takim ortak KG Var egilimi icin 0-100 skor ve guven seviyesi ureten motor eklendi.
- P2 kapsaminda `src/iy_iy_kg_var_motoru.py` olusturuldu; ilk yari ve ikinci yari KG Var egilimi icin ayri skorlar ve eksik devre verisi algilama eklendi.
- P3 kapsaminda `src/ust_alt_motoru.py` olusturuldu; takim bazli Ust/Alt gol egilimi, x_goal_score, UST_25_SCORE ve ALT_25_SCORE hesaplama motoru eklendi.
- P4 kapsaminda `src/lig_gucu_motoru.py` olusturuldu; lig bazli gol uretkenligi, KG Var egilimi, Ust oranlari ve lig guc skorlarini ureten motor eklendi.
- P5 kapsaminda `src/tahmin_motoru.py` olusturuldu; form, KG Var, devre KG Var, Ust/Alt ve lig gucu motorlarini agirlikli birlestiren ana karar motoru eklendi.
- P6 kapsaminda `src/mac_skorlayici.py` olusturuldu; iki takim secildiginde ana tahmin motorunu calistirip en guclu marketi ve ilk 3 marketi siralayan katman eklendi.
- P7 kapsaminda `src/mac_analiz_servisi.py` olusturuldu; takim isimleriyle tum analiz zincirini calistirip tek rapor ureten servis katmani eklendi.
- P8 kapsaminda `src/veri_havuzu.py` olusturuldu; takim bazli son 20 mac, son 10 ic saha ve son 10 deplasman macini saklayabilecek veri havuzu tasarlandi.
- Confidence standardi tum ilgili motorlarda guncellendi: 0-5 mac `low`, 6-15 mac `medium`, 16+ mac `high`.
- P9 kapsaminda `src/veri_havuzu_guncelleyici.py` olusturuldu; football-data.org API'den gercek PL verisi cekildi, 379 benzersiz mac ve takim bazli buyume raporu uretildi.
- Bu ortamda Python/PowerShell dosya yazma erisimi reddedildigi icin `data/veri_havuzu.json` tam havuz yerine gercek API'den alinan ozet buyume raporu olarak proje araci ile kaydedildi.
- P10 kapsaminda `src/ana_tahmin_motoru.py` olusturuldu; tum mevcut motorlari Mac Skor Karti formatinda birlestiren ust karar katmani eklendi.
- Bugunun en guclu maclari icin manuel skor karti raporu `outputs/bugunun_en_guclu_maclari.md` dosyasina kaydedildi.
- P12 kapsaminda `src/gunun_maclari_tarayici.py` olusturuldu; API'den bugunku maclari cekip mevcut motorlarla analiz ederek ilk 10 maci guc skoruna gore siralayacak tarayici eklendi.
- P12 gercek API denemesinde 2026-06-18 tarihi icin football-data.org API 0 mac dondurdu; `outputs/bugunun_en_guclu_maclari.md` bos fikstur notuyla guncellendi.
- P13 kapsaminda Gunun Maclari Tarayicisi gelistirildi; bugun mac yoksa yarini, sonra 7 gunluk pencereyi tarayip ilk mac bulunan tarihi kullanacak fallback mantigi eklendi.
- P13 gercek API denemesinde 2026-06-18, 2026-06-19 ve 2026-06-20 tarihlerinde 0 mac bulundu; ilk macli gun olarak 2026-06-21 secildi ve Ecuador - Curacao maci rapora yazildi.
- Mac cekme modulu duzeltildi; `dateFrom` ve `dateTo` ile 7 gunluk aralikta PL, PD, SA, BL1, FL1, ELC, PPL, DED, BSA ve CL lig kodlarini tarayacak API mac tarama raporu fonksiyonlari eklendi.
- Gercek API taramasinda 2026-06-18 / 2026-06-24 araliginda PL, PD, SA, BL1, FL1, ELC, PPL, DED, BSA ve CL icin erisim hatasi alinmadi; ancak toplam 0 mac dondu ve sonuc `outputs/api_mac_tarama_raporu.md` dosyasina yazildi.
- Mac bulma sistemi genisletildi; PL, PD, SA, BL1, FL1, ELC, PPL, DED, BSA, CLI, CL, EC ve WC kodlari 2026-06-18 / 2026-06-24 araliginda tarandi.
- Genisletilmis API taramasinda WC icin 29 mac bulundu; diger competition kodlari 0 mac dondurdu. Ilk turda EC ve WC icin 429 hiz limiti goruldu, bekleme sonrasi tekrar denendi ve rapor guncellendi.
- `outputs/bugunun_en_guclu_maclari.md` artik tek mac yerine bulunan tum 29 WC macini guc skoruna gore sirali olarak iceriyor.
- 429 rate limit sorunu icin kuyruk sistemi eklendi; her API cagrisindan sonra 6 saniye bekleme, 429 durumunda `Retry-After` header'ini okuyup ayni istegi tekrar deneme ve rate limit raporu uretme mantigi kuruldu.
- Kuyruklu gercek API taramasinda 13 competition tamamlandi, 429 alinmadi, WC icin 29 mac bulundu ve `outputs/api_rate_limit_raporu.md` olusturuldu.
- Mevcut API tarayicisi analiz edildi; football-data.org `/competitions` yaniti mevcut 13 competition koduyla birebir ayni oldugu icin erisilebilir listede eksik buyuk lig gorunmedi.
- Sonraki 14 gun icin 2026-06-18 / 2026-07-01 araligi kuyruklu tarandi; WC 59 mac dondurdu, diger 12 competition 0 mac dondurdu ve sonuc `outputs/lig_bazli_mac_sayilari.md` dosyasina yazildi.
- football-data.org sinirlari nedeniyle API-Football, SportMonks, TheSportsDB ve API-Sports Football karsilastirildi; sonuc `api_veri_kaynaklari.md` dosyasina yazildi.
- football-data.org Turkiye alt liglerini vermedigi icin otomatik ikinci veri kaynagi arastirmasi yapildi; API-Football coverage bilgisinde Super Lig, 1. Lig, 2. Lig ve 3. Lig gruplari goruldu ve `ikinci_veri_kaynagi_entegrasyonu.md` olusturuldu.
- Faz 1 kapsaminda Futbol Laboratuvari V1'in yerel PC'de tek tikla calismasi icin API yedekleme mimarisi, API-Football placeholder istemcisi, normalizer, kaynak yoneticisi, robot giris noktasi ve `run_robot.bat` dosyasi olusturuldu.
- Faz 1 modulleri tarandi; eksik import ve kullanilmayan import bulunmadi. API-Football fallback'in gercek fixture cekimine baglanmamis oldugu tespit edilip `src/veri_kaynagi_yoneticisi.py` icinde duzeltildi. Sonuc `faz1_altyapi_raporu.md` dosyasina yazildi.
- Faz 1 bitis denetimi tekrar yapildi; anahtarsiz robot uyarisi, football-data.org anahtarli canli akis, API-Football fallback hazirligi ve Turkiye ligleri placeholder eslesmesi kontrol edildi. Sonuc `outputs/faz1_durum_raporu.md` dosyasina yazildi.
- README dosyasina kurulum, API anahtari alma ve calistirma talimatlari eklendi.
- Gelecekte eklenecek ileri analiz fikirleri yol haritasina islendi.

## Olusturulan Dosyalar

- `README.md`: Proje aciklamasi, kurulum, API anahtari alma ve calistirma talimatlari.
- `notes.md`: V1 yol haritasi, katmanlar, ileri analiz fikirleri ve uzun vadeli notlar.
- `requirements.txt`: Python bagimlilik dosyasi. Su an ucuncu parti paket gerekmiyor.
- `proje_hafizasi.md`: Proje hafizasi ve ilerleme kaydi.
- `gunluk_rapor.md`: Oturum bazli yapilan isler, cozulmus hatalar, degisen dosyalar ve sonraki hedef kaydi.
- `yol_haritasi_v1.md`: Mevcut proje analizi, eksik moduller ve V1 oncelik plani.
- `son_5_mac_form_analizi.md`: Son 5 mac form analizi, form puani hesaplama mantigi ve gelecekteki Python veri yapisi tasarimi.
- `ilk_yari_ikinci_yari_modeli.md`: Ilk yari ve ikinci yari performans analizi, KG Var oranlari ve Yari Performans Puani tasarimi.
- `data/.gitkeep`: Bos `data` klasorunu korumak icin.
- `data/football_data_org_ornek.json`: football-data.org API'den cekilen ornek Premier League verisi.
- `src/.gitkeep`: Bos `src` klasorunu korumak icin.
- `src/futbol_veri_modeli.md`: Mac, takim, lig ve bahis odakli istatistik veri modeli.
- `src/veri_kaynaklari.md`: Futbol veri kaynaklari arastirmasi ve karsilastirma tablolari.
- `src/ilk_veri_toplayici.py`: football-data.org API entegrasyonu icin ilk veri toplayici.
- `src/veri_okuyucu.py`: `data/football_data_org_ornek.json` dosyasini okuyup V1 analizleri icin temel veri ozeti ureten modul.
- `src/form_puani_motoru.py`: Son mac sonuclarindan galibiyet, beraberlik, maglubiyet, gol ortalamalari, ev/deplasman performansi, momentum ve 0-100 form puani ureten modul.
- `src/kg_var_motoru.py`: Son maclardan KG Var oranlari, ev/deplasman KG Var oranlari, gol ortalamalari, ortak KG Var egilimi ve guven seviyesi ureten modul.
- `src/iy_iy_kg_var_motoru.py`: Ilk yari ve ikinci yari KG Var oranlari, ortak devre KG Var egilimi, devre gol ortalamalari ve eksik veri durumunda dusuk guven ureten modul.
- `src/ust_alt_motoru.py`: Ust 0.5/1.5/2.5/3.5, Alt 2.5, gol ortalamalari, x_goal_score, UST_25_SCORE ve ALT_25_SCORE ureten modul.
- `src/lig_gucu_motoru.py`: Lig bazli ortalama gol, KG Var orani, Ust 2.5/3.5, devre gol ortalamalari, LIG_GOAL_POWER ve LIG_KG_POWER ureten modul.
- `src/tahmin_motoru.py`: Alt analiz motorlarini agirlikli birlestirerek GENEL_KG_VAR_SCORE, GENEL_ILK_YARI_KG_SCORE, GENEL_IKINCI_YARI_KG_SCORE ve GENEL_UST_25_SCORE ureten ana karar motoru.
- `src/mac_skorlayici.py`: EV_TAKIMI ve DEPLASMAN_TAKIMI girdisiyle ana market skorlarini, en guclu marketi ve ilk 3 marketi ureten modul.
- `src/mac_analiz_servisi.py`: Takim isimleriyle tum analiz motorlarini calistirip JSON ve okunabilir metin raporu ureten servis katmani.
- `src/veri_havuzu.py`: Takim kimligiyle indekslenen, son 20 mac, son 10 ic saha ve son 10 deplasman macini tutan genisletilebilir veri havuzu modulu.
- `src/veri_havuzu_guncelleyici.py`: API verisiyle kalici veri havuzunu buyuten, `match_id` ile tekrar kontrolu yapan ve takim buyume raporu ureten modul.
- `src/ana_tahmin_motoru.py`: Form, KG, devre KG, Ust 2.5, lig gucu ve mac skorlayici ciktisini Mac Skor Karti raporunda birlestiren ana tahmin katmani.
- `src/gunun_maclari_tarayici.py`: football-data.org API'den bugunku maclari cekip Form, KG Var, devre KG, Ust 2.5, guc skoru, confidence ve ilk 3 market bilgisiyle ilk 10 mac raporu ureten tarayici.
- `outputs/api_mac_tarama_raporu.md`: football-data.org API icin 7 gunluk aralikta lig bazli mac sayisi, mac tarih araligi ve erisim hatasi raporu.
- `outputs/api_rate_limit_raporu.md`: Kuyruklu API taramasinda her competition icin mac sayisi, response code, kalan istek hakki, retry sayisi ve bekleme suresi raporu.
- `outputs/lig_bazli_mac_sayilari.md`: 14 gunluk aralikta competition kodu, lig adi, bulunan mac sayisi, ilk/son mac tarihi ve en cok mac ureten ilk 10 competition raporu.
- `api_veri_kaynaklari.md`: API-Football, SportMonks, TheSportsDB ve API-Sports Football servislerinin limit, lig kapsami, devre skoru, KG Var/Ust Alt uygunlugu ve fiyat karsilastirmasi.
- `ikinci_veri_kaynagi_entegrasyonu.md`: football-data.org basarisiz kaldiginda API-Football / API-Sports Football odakli otomatik fallback veri kaynagi mimarisi ve Turkiye ligleri kapsami arastirmasi.
- `.env.example`: API anahtarlari icin ornek ortam degiskeni dosyasi.
- `.gitignore`: `.env` ve gecici Python dosyalarini dislamak icin.
- `run_robot.bat`: Windows icin tek tik robot calistirma dosyasi.
- `src/api_football_client.py`: API-Football / API-Sports Football istemcisi.
- `src/api_football_normalizer.py`: API-Football fixture ve lig yanitlarini ortak semaya ceviren normalizer.
- `src/kaynak_oncelik_haritasi.py`: Turkiye ligleri ve kaynak onceligi haritasi.
- `src/veri_kaynagi_yoneticisi.py`: football-data.org ana kaynak, API-Football fallback kaynak olacak sekilde kaynak secim yoneticisi.
- `src/robot.py`: Tek tik robotun Python giris noktasi.
- `faz1_altyapi_raporu.md`: Faz 1 import, akış, fallback ve calisma engeli denetim raporu.
- `outputs/faz1_durum_raporu.md`: Faz 1 bitis durumu, tamamlananlar, eksikler, calisan akis, calismayan yerler ve Faz 2 oncesi son isler raporu.
- `data/veri_havuzu.json`: Gercek API cagrisiyla uretilen PL veri havuzu guncelleme ozeti ve takim bazli buyume raporu.
- `outputs/bugunun_en_guclu_maclari.md`: Manuel girilen bugunun en guclu maclari, UST 2.5, KG VAR ve GUC skor raporu.
- `tests/.gitkeep`: Bos `tests` klasorunu korumak icin.

## Kullanilan API'ler

- football-data.org API
  - Kullanim amaci: Lig puan durumu ve son mac sonuclari cekmek.
  - Kimlik dogrulama: `FOOTBALL_DATA_API_KEY` ortam degiskeni.
  - Ornek lig kodu: `PL`
  - Cekilen veri: Premier League puan durumu ve 5 son mac sonucu.

## Alinan Kararlar

- API anahtari dosyaya kaydedilmeyecek; ortam degiskeniyle kullanilacak.
- Ilk veri toplayici sadece Python standart kutuphaneleriyle yazilacak.
- V1 icin veri once JSON/CSV dosyalariyla tutulacak; veritabani sonraki asamada dusunulecek.
- Son 5 mac formu, KG Var/Yok ve Ust/Alt 2.5 gibi metrikler ham mac skorlarindan hesaplanabilecek.
- Kupon onerileri kesin sonuc iddiasi olarak degil, karar destek ciktisi olarak tasarlanacak.
- Python dosya yazma adiminda ortam kaynakli hata alindigi icin API sonucu terminale JSON yazdirildi ve veri proje dosya araciyla kaydedildi.
- P12 calismasinda Python rapor dosyasi yazma adimi yine `Bad file descriptor` hatasi verdi; Markdown ciktisi terminale bastirildi ve `outputs/bugunun_en_guclu_maclari.md` proje dosya araci ile guncellendi.
- P13 raporu da terminal Markdown ciktisinden proje dosya araci ile kaydedildi; dogrudan Python dosya yazma sorununa takilmadan rapor guncellendi.
- Proje hafizasi genel bilgileri tutacak; gunluk rapor ise oturum bazli calisma gecmisini tutacak.
- Son 5 mac form puani ilk surumda 0-100 arasi, aciklanabilir ve agirlikli kural tabanli hesaplanacak.
- Yari Performans Puani ilk surumda ilk yari ve ikinci yari alt skorlarindan olusacak; ikinci yariya biraz daha yuksek agirlik verilecek.
- V1 gelistirme sirasi once veri okuyucu ve normalizasyon, sonra analiz modulleri, en son kupon motoru olacak sekilde belirlendi.
- Yerel veri okuma katmani ayri bir modul olarak tasarlandi; API cekme ve dosyadan okuma sorumluluklari ayrildi.
- Form puani motoru, veri azliginda `confidence: low` donerek kupon motoru icin guven uyarisi uretir.
- KG Var motoru, takim bazli ve mac eslesmesi bazli skor uretir; guven seviyesi veri miktarina gore `low`, `medium`, `high` olarak belirlenir.
- Ilk yari / ikinci yari KG Var motoru, mevcut ornek veride devre skorlari olmadiginda `data_status: missing_half_time_data` ve `confidence: low` donecek sekilde tasarlandi.
- Ust/Alt motoru, takim bazli ve ortak mac eslesmesi bazli UST_25_SCORE ve ALT_25_SCORE uretir; guven seviyesi veri miktarina gore belirlenir.
- Lig gucu motoru tum tahmin motorlari icin lig baglami uretecek ortak katman olarak konumlandirildi.
- Ana tahmin motorunda agirliklar ayarlanabilir tasarlandi; varsayilan KG Var karari Form %25, KG Var %35, Ust/Alt %20 ve Lig Gucu %20 agirliklariyla hesaplanir.
- Mac skorlayici, kupon olusturucuya gidecek sade karar katmani olarak konumlandirildi.
- Mac analiz servisi, kullanici veya gelecek arayuz tarafindan cagrilacak ust seviye rapor katmani olarak konumlandirildi.
- Gercek veri havuzu takim bazli indekslenecek; her takim icin son 20 genel, son 10 ic saha ve son 10 deplasman maci tutulacak.
- Confidence esikleri proje genelinde standartlastirildi: 0-5 low, 6-15 medium, 16+ high.
- Veri tekrar kontrolu `match_id` uzerinden yapilacak; ayni mac ikinci kez kaydedilmeyecek.
- Ana Tahmin Motoru, V1 icin kullaniciya sunulacak ozet karar raporu olarak Mac Skor Karti formatini kullanacak.
- Manuel mac skor kartlari, otomatik motor ciktisiyle ayni 0-100 skor mantiginda raporlanacak ve `outputs` klasorunde tutulacak.
- Gunun Maclari Tarayicisi, API'den gelen fikstur maclarini otomatik analiz ederken mevcut gecmis veri yetersizse dusuk confidence ile rapor uretecek.
- Gunun Maclari Tarayicisi raporlarinda `ANALIZ_TARIHI`, `MAC_TARIHI` ve `TOPLAM_MAC` alanlari zorunlu ust bilgi olarak tutulacak.
- API mac tarama raporu, tek lig varsayimina baglanmayacak; ucretsiz planda denenebilecek tum tanimli lig kodlarini ayri ayri raporlayacak.
- football-data.org ucretsiz planinda donen mac kapsamı sinirli kabul edilecek ve raporlarda "Bu API ücretsiz planda sınırlı maç döndürüyor." notu acikca yer alacak.
- API taramalari artik rate limit dostu kuyrukla calistirilacak; competition istekleri pes pese patlatilmayacak, 429 gelirse Retry-After beklenip ayni istek tekrarlanacak.
- Mac sayisini artirmak icin once football-data.org tarafinda erisilebilir competition listesi kontrol edilecek; mevcut hesabin dondurdugu 13 kodun disindaki buyuk ligler tarama disi kabul edilecek.
- V1 icin ana alternatif veri kaynagi olarak API-Football / API-Sports Football Pro plani onerildi; SportMonks ileri seviye/profesyonel faz icin ikinci aday olarak kaydedildi.
- Turkiye ligleri icin kaynak onceligi API-Football olacak; football-data.org sadece destekledigi liglerde birincil kaynak olarak kalacak.
- API anahtarlari hicbir zaman koda gomulmeyecek; `FOOTBALL_DATA_API_KEY` ve `API_FOOTBALL_KEY` ortam degiskenlerinden okunacak.
- Yerel robot hata durumunda pencereyi kapatmayacak; `run_robot.bat` sonunda `pause` ile kullaniciya hata/rapor durumunu gosterecek.
- Codex calisma ortaminda Python dosya yazma `Bad file descriptor` hatasi verebildigi icin `src/robot.py` rapor yazma hatasini yakalayip Markdown ciktisini terminale basacak sekilde dayanıklı hale getirildi.
- Faz 1 akisi icin calismayi engelleyen eksik kalmadi; gercek API-Football anahtari girildiginde fallback canli fixture cekimine hazirdir.
- Faz 2'ye gecmeden once API-Football gercek anahtariyla Turkiye lig ID eslesmeleri canli olarak doldurulacak.

## Cozulen Sorunlar

- Bos klasorlerin gorunmesi icin `.gitkeep` dosyalari eklendi.
- Sistemde `python` komutu PATH uzerinde bulunmadigi icin Codex'in paketli Python yolu kullanildi.
- `py_compile` calisirken `__pycache__` yazma sorunu oldugu icin `ast.parse` ile soz dizimi kontrolu yapildi.
- Ilk API denemesinde sandbox kaynakli DNS/baglanti hatasi alindi; ag izniyle tekrar calistirildi.
- `Bad file descriptor` dosya yazma hatasi nedeniyle Python ile JSON yazma yerine terminal JSON ciktisi alindi ve `apply_patch` ile dosyaya kaydedildi.

## Bir Sonraki Yapilacak Isler

- `tests/` klasorune `ilk_veri_toplayici.py` ve `veri_okuyucu.py` icin birim testleri ekle.
- `form_puani_motoru.py` icin birim testleri ekle.
- `form_puani_motoru.py` ve `kg_var_motoru.py` icin birim testleri ekle.
- `iy_iy_kg_var_motoru.py` icin hem eksik veri hem de devre verisi bulunan senaryo testleri ekle.
- `ust_alt_motoru.py` icin birim testleri ekle.
- `lig_gucu_motoru.py` icin birim testleri ekle.
- `tahmin_motoru.py` icin birim testleri ekle.
- `mac_skorlayici.py` icin birim testleri ekle.
- `mac_analiz_servisi.py` icin birim testleri ekle.
- `veri_havuzu.py` icin buyuk veri ve eksik devre skoru testleri ekle.
- `veri_havuzu_guncelleyici.py` icin tekrarli mac, bos havuz ve mevcut havuz testleri ekle.
- `ana_tahmin_motoru.py` icin skor karti ve market siralama testleri ekle.
- Manuel mac listelerini ileride otomatik `ana_tahmin_motoru.py` ciktisinden uretecek raporlama modulu tasarla.
- `gunun_maclari_tarayici.py` icin API'siz sahte istemci testleri ve bos fikstur senaryosu testleri ekle.
- `gunun_maclari_tarayici.py` icin bugun bos, yarin dolu ve 7 gun icinde ilk dolu gun senaryolarini test et.
- Mac analiz servisi ciktisini kullanacak kupon motoru ve raporlama adimlarina gec.
- `data/football_data_org_ornek.json` ve `src/veri_okuyucu.py` uzerinden analiz fonksiyonlari yazmaya basla.
- `son_5_mac_form_analizi.md` tasarimina gore takim bazli son 5 mac formu hesaplama modulu olustur.
- `ilk_yari_ikinci_yari_modeli.md` tasarimina gore devre bazli analiz modulu olustur.
- KG Var/Yok ve Ust/Alt 2.5 hesaplama fonksiyonlari ekle.
- Lig bazli gol ortalamasi ve risk skoru hesaplama fonksiyonlarini tasarla.
- README'ye ornek veri dosyasinin nasil kullanilacagini ekle.
- API anahtari ve kaynak limitleri icin cache stratejisi planla.
- Her oturum sonunda `gunluk_rapor.md` dosyasini guncelle.

## Uzun Vadeli Hedefler

- Veri toplama katmanini birden fazla kaynagi destekleyecek hale getirmek.
- Takim, lig ve mac bazli analiz motoru kurmak.
- Kupon uretim katmaninda guven skoru, risk skoru ve deger skoru kullanmak.
- Transfer etkisi, teknik direktor etkisi, sakatlik etkisi, motivasyon puani ve derbi etkisi gibi ileri analizleri eklemek.
- Avrupa maci sonrasi performans, ilk yari/ikinci yari gol modeli ve KG Var modeli gelistirmek.
- Gecmis maclar uzerinde backtest ve performans takibi yapmak.
- Yapay zeka destekli yorumlama ve tahmin katmanini sonraki surumlerde eklemek.

## Guncelleme Kurali

Bu dosya, bundan sonra projede yapilan anlamli her degisiklikten sonra guncellenecek. Yeni dosyalar, teknik kararlar, cozulmus sorunlar ve sonraki isler burada takip edilecek.

Her oturum sonunda `gunluk_rapor.md` dosyasi ayrica guncellenecek. Gunluk rapor; tarih, oturum ozeti, yapilan isler, olusturulan dosyalar, degistirilen dosyalar, cozulmus hatalar, API test sonucu, kaydedilen veri ve bir sonraki hedef basliklarini takip edecek.

## Faz 2 Guncellemesi - 2026-06-18

Faz 2 kapsaminda mevcut mimari bozulmadan takim ve lig gucu hesaplayan analiz katmani kuruldu.

Yapilanlar:

- `src/lig_gucu_motoru.py` genisletildi; ev sahibi galibiyet orani, deplasman galibiyet orani ve beraberlik orani eklendi.
- `src/takim_gucu_motoru.py` olusturuldu.
- `src/guc_skoru_motoru.py` olusturuldu.
- `src/gunun_maclari_tarayici.py` Faz 2 guc skoru motoruna baglandi.
- `outputs/bugunun_en_guclu_maclari.md` Faz 2 rapor semasina gore guncellendi.
- `outputs/faz2_analiz_raporu.md` olusturuldu.

Faz 2 karar mantigi:

- Takim gucu; form, hucum gucu, ic/dis saha performansi, KG potansiyeli ve savunma istikrariyla hesaplanir.
- Mac guc skoru; form, lig gucu, hucum gucu, savunma zafiyeti ve KG potansiyelini birlestirir.
- Her mac icin `GUC_SKORU`, `KG_VAR_OLASILIGI`, `UST_25_OLASILIGI` ve `confidence` uretilir.

Alinan kararlar:

- Faz 2 yeni bir paralel sistem kurmayacak; mevcut Form, KG Var, Ust/Alt ve Lig Gucu motorlari kullanilacak.
- Guc skoru formulu aciklanabilir agirlikli model olarak kalacak.
- Confidence esigi mevcut standartta devam edecek: 0-5 mac low, 6-15 mac medium, 16+ mac high.

Sonraki isler:

- `takim_gucu_motoru.py` ve `guc_skoru_motoru.py` icin birim testleri ekle.
- Faz 3'te kupon motoruna gec ve Faz 2 skorlarini ana sinyal olarak kullan.
- API-Football anahtari eklendiginde Turkiye ligleri icin veri havuzunu buyut.

## Faz 2 Iyilestirmesi - 2026-06-18

Faz 3'e gecmeden once iki temel eksik tamamlandi.

Yapilanlar:

- `src/confidence_motoru.py` olusturuldu.
- Confidence sistemi sayisal hale getirildi: `low`, `medium`, `high`, `very_high`.
- `src/guc_skoru_motoru.py` ve `src/takim_gucu_motoru.py` ciktisina `confidence_score` ve `confidence_details` eklendi.
- `src/ham_veri_havuzu.py` olusturuldu.
- `data/ham_mac_havuzu.json` olusturuldu.
- `src/robot.py` taranan maclari ham veri havuzuna ekleyecek sekilde guncellendi.
- `outputs/faz2_iyilestirme_raporu.md` olusturuldu.

Alinan karar:

- Ham maclar `match_id` ile tekillestirilerek saklanacak.
- Sonraki testler ve analiz tekrarları `data/ham_mac_havuzu.json` uzerinden yeniden uretilebilecek.

## Faz 3 Guncellemesi - 2026-06-18

Faz 3 kapsaminda otomatik kupon onerisi sistemi baslatildi.

Yapilanlar:

- `src/kupon_motoru.py` olusturuldu.
- `outputs/faz3_kupon_motoru_raporu.md` olusturuldu.
- Kupon motoru Faz 2 ciktisi olan `GUC_SKORU`, `confidence_score`, `KG_VAR_OLASILIGI` ve `UST_25_OLASILIGI` alanlarini kullanacak sekilde tasarlandi.
- Tek mac onerileri uretildi.
- 2'li kupon onerileri uretildi.
- 3'lu kupon onerileri uretildi.
- Her oneri icin risk puani ve risk seviyesi hesaplandi.

Alinan kararlar:

- Tek mac oneri skoru; Guc Skoru %35, Confidence Score %35 ve Market Sinyali %30 agirliklariyla hesaplanacak.
- Kombine kuponlarda her ek ayak icin 8 puan risk/ceza uygulanacak.
- Veri havuzu kucukken confidence dusuk kalacagi icin kuponlar riskli isaretlenecek.

## Turkiye Ligleri Canli Baglanti Guncellemesi - 2026-06-18

Turkiye liglerini API-Football uzerinden canli baglamak ve ham veri havuzunu buyutmek icin altyapi tamamlandi.

Yapilanlar:

- `src/turkiye_ligleri_canli.py` olusturuldu.
- `outputs/veri_buyutme_raporu.md` olusturuldu.
- `src/robot.py` Faz 3 kupon motorunu ana robot akisina ekleyecek sekilde guncellendi.
- `src/kupon_motoru.py` canli mac analiz satirlarindan kupon uretecek adaptor fonksiyonlarla genisletildi.

Durum:

- `API_FOOTBALL_KEY` ortam degiskeni bu oturumda tanimli degildi.
- Bu nedenle gercek league_id degerleri canli API'den cekilemedi.
- Anahtar tanimlandiginda `src/turkiye_ligleri_canli.py`, `/leagues?country=Turkey` endpointinden ligleri cekecek ve ham veri havuzunu fixture verisiyle buyutecek.

Alinan karar:

- Gercek `league_id` degerleri tahmin edilerek dosyaya yazilmayacak; yalnizca canli API yanitindan geldikten sonra rapora islenecek.

## Faz 4 Hazirlik Guncellemesi - 2026-06-18

Faz 4 icin performans takip sistemi ve ana proje hafizasi olusturuldu.

Yapilanlar:

- `MASTER_HAFIZA.md` olusturuldu.
- `src/performans_takip.py` olusturuldu.
- `data/tahmin_gecmisi.json` olusturuldu.
- `outputs/basari_yuzdesi_raporu.md` olusturuldu.
- `outputs/faz4_yol_haritasi.md` olusturuldu.
- `src/robot.py` kupon onerilerini tahmin gecmisine ekleyecek ve basari raporu mantigini kullanacak sekilde guncellendi.
- `outputs/veri_buyutme_raporu.md` API anahtari kontrol sonucuyla guncellendi.

Durum:

- Bu oturumda `API_FOOTBALL_KEY` ortam degiskeni tanimli degil.
- Turkiye liglerinin gercek `league_id` degerleri canli API'den cekilemedi.
- 1000+ maclik ham veri havuzu bu oturumda olusturulamadi.
- Canli API anahtari tanimlandiginda `src/turkiye_ligleri_canli.py` ile veri buyutme akisi calistirilacak.

Alinan kararlar:

- `MASTER_HAFIZA.md` bundan sonra yeni oturumlarda ilk okunacak tek gercek hafiza dosyasi olacak.
- Tahmin performansi `data/tahmin_gecmisi.json` uzerinden takip edilecek.
- Basari yuzdesi sonuc dogrulanmis tahminler uzerinden `won / (won + lost) * 100` formuluyle hesaplanacak.
- Tahminler once `pending` durumunda kaydedilecek; mac sonucu kesinlesince `won`, `lost` veya `void` durumuna alinacak.

Sonraki hedef:

- `API_FOOTBALL_KEY` tanimlandiktan sonra canli Turkiye league_id cekimini calistir.
- Ham mac havuzunu 1000+ benzersiz maca cikar.
- Bekleyen tahminleri mac sonuclariyla otomatik dogrulayacak Faz 4 sonuc dogrulama katmanini ekle.

## Kalici API ve Veri Onceligi Kurallari - 2026-06-18

Kullanici tarafindan proje icin kalici API ve hesap kurallari tanimlandi.

Kurallar:

- Robot kullanici adina hesap acmaz.
- Robot e-posta dogrulamasi yapmaz.
- Robot sifre uretip hesap olusturmaz.
- Robot API key uydurmaz.
- Robot yalnizca ucretsiz veya dusuk maliyetli API kaynaklarini arastirir.
- API key kullanici tarafindan alinir.
- API key `.env` veya Windows ortam degiskenlerinde saklanir.
- Robot mevcut key ile entegrasyonu yapar.

Veri kaynagi oncelik sirasi:

1. API-Football
2. football-data.org
3. CollectAPI
4. TheSportsDB
5. The Odds API
6. SportMonks

Bir sonraki hedef:

- 1000+ maclik ham veri havuzu.
- Kupon motoru gelistirmekten once veri havuzu buyutulecek.
- Veri olmadan yeni algoritma yazilmayacak.
- Once veri, sonra model, sonra kupon.

## Faz 5 Basari Takip ve Ogrenme Sistemi - 2026-06-18

Faz 5 kapsaminda mevcut yapi bozulmadan tahmin performans takip sistemi genisletildi.

Yapilanlar:

- `src/performans_takip.py` Faz 5 ihtiyaclarina gore guncellendi.
- `data/tahmin_gecmisi.json` v2 semasina yukseltildi.
- `outputs/basari_yuzdesi_raporu.md` Faz 5 basliklariyla guncellendi.
- Her tahmin icin `prediction_id` ureten yapi korundu ve tarih + mac + market bazli hale getirildi.
- Tahmin kaydina tarih, lig, mac, tahmin turu, onerilen oran, confidence, confidence score ve guc skoru alanlari eklendi.
- Sonuc girildiginde `won`, `lost` veya `void` isaretleme fonksiyonlari eklendi.
- KG Var, Ust 2.5, MS1, MSX, MS2 ve Cifte Sans marketleri icin skor bazli dogrulama kurallari eklendi.
- Genel basari yuzdesi, lig bazli basari, tahmin turu bazli basari, market bazli basari ve confidence bazli basari ozetleri desteklendi.

Alinan karar:

- Bu calisma yeni kupon algoritmasi degildir; mevcut tahminlerin performansini olcmek icin takip katmanidir.
- Veri havuzunu 1000+ maca buyutme onceligi devam eder.
- Once veri, sonra model, sonra kupon ilkesi korunur.

## Offline Demo Mod Guncellemesi - 2026-06-18

API key satin alma veya API key bekleme sureci olmadigi icin robotun API key olmadan da yerel PC'de tek tikla calismasi saglandi.

Yapilanlar:

- `src/robot.py` demo mod destekleyecek sekilde guncellendi.
- API key yoksa robot artik durmaz; `Demo modda calisiyor.` mesaji verir.
- Demo mod `data/football_data_org_ornek.json` dosyasindaki ornek veriyi okur.
- Demo mod analiz motorlarini calistirir.
- Demo mod kupon motorunu calistirir.
- Demo mod tahmin gecmisini ve basari takip ozetini guncellemeye calisir.
- `run_robot.bat` API key yokken demo mod bilgisini ekrana yazacak sekilde guncellendi.
- `outputs/kullanim_kilavuzu.md` olusturuldu.
- `outputs/bugunun_en_guclu_maclari.md` demo mod raporuyla guncellendi.
- `data/tahmin_gecmisi.json` demo moddan gelen 5 pending tahminle guncellendi.
- `outputs/basari_yuzdesi_raporu.md` demo mod basari takip ozetiyle guncellendi.

Alinan karar:

- API key satin alma simdilik yok.
- API key yoksa demo mod kullanilacak.
- API key geldiginde robot canli moda gecmeye hazir kalacak.
- Bu calisma yeni algoritma degil; V1'in yerel PC'de anahtarsiz calismasini saglayan isletim katmanidir.

## V1 Demo Surumu Tamamlama - 2026-06-18

V1 demo surumu uctan uca denetlendi ve API key olmadan calisacak hale getirildi.

Kontrol edilen akış:

- `run_robot.bat`
- `src/robot.py`
- Veri okuma
- Analiz motorlari
- Kupon motoru
- Performans takip sistemi
- Basari yuzdesi sistemi
- Rapor uretimi

Sonuc:

- API key yoksa robot demo moda gecer.
- Demo mod `data/football_data_org_ornek.json` dosyasini okur.
- Demo mod 5 mac analiz eder.
- Demo mod kupon onerileri uretir.
- Demo mod tahmin gecmisi ve basari yuzdesi ozetini uretir.
- `outputs/bugunun_en_guclu_maclari.md`, `outputs/basari_yuzdesi_raporu.md` ve `data/tahmin_gecmisi.json` hazir durumdadir.
- `outputs/v1_demo_durum_raporu.md` olusturuldu.

Duzeltilen:

- `run_robot.bat` baslangicta `outputs` ve `data` klasorlerini garanti olusturacak sekilde guncellendi.

Durum:

- V1 Demo surumu tamamlandi.
- Bundan sonraki ana hedef, demo modu koruyarak 1000+ maclik ham veri havuzudur.

## V1 Final Demo Kapanis Raporu - 2026-06-18

Kullanici talimati geregi yeni ozellik, yeni veri kaynagi, API entegrasyonu, Mackolik, widget veya yeni tahmin modeli calismasi yapilmadi.

Yapilan:

- Mevcut V1 demo akisi uctan uca dogrulandi.
- `run_robot.bat`, `src/robot.py`, analiz motorlari, kupon motoru, ham veri havuzu, confidence sistemi, performans takip sistemi ve basari yuzdesi sistemi arasindaki baglantilar kontrol edildi.
- Demo surumunu durduran kod baglantisi eksigi bulunmadi.
- `outputs/v1_final_durum_raporu.md` olusturuldu.

Karar:

- V1 DEMO TAMAMLANDI.

Not:

- Codex calisma ortaminda Python/PowerShell dosya yazma kisiti goruldu. Bu durum kod akisini durduran mimari hata olarak degerlendirilmedi; raporlar proje dosya araci ile kaydedildi.

## Faz 6 Mackolik Veri Cekme Sistemi - 2026-06-18

Mackolik Arsiv uzerinden API key olmadan mac ve oran verisi okumak icin uygulama modulu eklendi.

Yapilanlar:

- `src/mackolik_veri_cekici.py` olusturuldu.
- Playwright ile `https://arsiv.mackolik.com/Iddaa-Programi` sayfasi acildi.
- Canli testte 66 mac satiri bulundu.
- MS 1, MS X, MS 2, 2.5 Alt ve 2.5 Ust oranlari okundu.
- `Tumu` detay alanlari sadece veri okuma amaciyla denendi.
- Kupon, bahis, para yatirma/cekme, satin alma veya uyelik islemi yapilmadi.
- `src/robot.py` Mackolik adimini ana akisi bozmadan calistiracak sekilde guncellendi.
- `requirements.txt` dosyasina `playwright>=1.44.0` eklendi.
- `data/ham_mac_havuzu.json` Mackolik kayitlariyla 25 toplam maca cikarildi.
- `outputs/mackolik_veri_cekme_raporu.md` olusturuldu.

Alinan karar:

- Mackolik modulu ham veri havuzunu buyutme amaciyla kullanilacak.
- Bu modul bahis oynatma veya kupon ekleme aksiyonu icermez.
- KG Var, 3.5 Alt/Ust ve devre marketleri icin detay penceresi parse etme sonraki veri iyilestirme adimi olarak kaldi.

## Faz 7 Mackolik Veri Cekici Son Tamamlama - 2026-06-19

Mackolik veri cekici site entegrasyonuna gecmeden once son kez dogrulandi.

Sonuc:

- Canli Playwright testinde 66 mac satiri bulundu.
- 28 lig okunabildi.
- Tarih, saat, lig, ev sahibi, deplasman, mac kodu, MS 1, MS X, MS 2, 2.5 Alt ve 2.5 Ust alanlari dogrulandi.
- 39 macta tum zorunlu alanlar ve temel oran seti eksiksiz okundu.
- `Tumu` detay alanlari 25/25 basariyla acildi.
- `data/ham_mac_havuzu.json` gecerli JSON olarak dogrulandi.
- Ham havuz toplam mac sayisi 25 olarak raporlandi.
- Tekrar eden ham havuz anahtari bulunmadi.
- `src/robot.py` ve `run_robot.bat` ana akisi bozulmadi.
- `outputs/mackolik_veri_cekme_raporu.md` son durum raporuyla guncellendi.

Karar:

- MAÇKOLİK VERİ ÇEKİCİ SON DURUM: HAZIR
- SİTE ENTEGRASYONUNA GEÇİLEBİLİR Mİ: EVET
## Web Site Calismalari Takip Dosyasi - 2026-06-19

Web sitesi islemleri icin yeni takip dosyasi olusturuldu:

- `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari\WEB_SITE_CALISMALARI.md`

Bu dosya, ana site ve admin panel tarafinda yapilan degisikliklerin web odakli kaydini tutacak.

Guncelleme kurali:

- Web siteyle ilgili her degisiklikten sonra `WEB_SITE_CALISMALARI.md`, `MASTER_HAFIZA.md`, `proje_hafizasi.md` ve `gunluk_rapor.md` guncellenecek.
- Ana web site repo klasoru: `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari`.
- Push/commit kullanici acikca istemedikce yapilmayacak.
- Site linkleri relative kalacak.
- `eu.org` domain linki yeniden eklenmeyecek.

Bugunku web site durumu:

- Ana sayfa mac vitrini robot verilerine gore duzenlendi.
- Admin panel ayri sayfa olarak duruyor.
- Son Analizler ve Analiz Veritabani eski sabit verilerden arindirildi.
- Guncel veri yoksa kullaniciya robotun calistirilmasi gerektigi mesaji gosterilecek.
## Web Site - Analiz Veritabani / Son Analizler Guncellemesi - 2026-06-19

Ana web sitesindeki `Son Analizler` ve `Analiz Veritabani` bolumleri robot veri akisiyle uyumlu hale getirildi.

Yapilanlar:

- Eski 12.06.2026 sabit veri gorunumu temizlendi.
- `script.js` icindeki eski analiz dizisinin sayfaya basmasi engellendi.
- `robot-dashboard.js` tarafinda guncel robot dosyalarindan analiz satirlari uretme akisi korundu.
- Kontrol edilen kaynaklar:
  - `data/ham_mac_havuzu.json`
  - `data/tahmin_gecmisi.json`
  - `outputs/bugunun_en_guclu_maclari.md`
  - `outputs/mackolik_veri_cekme_raporu.md`
- Veri yoksa eski tarihli veri yerine robotun calistirilmasi gerektigini belirten uyari gosterilecek.
- `WEB_SITE_CALISMALARI.md` bu islemle guncellendi.
## Web Site GitHub Desktop Commit / Push Kuralı - 2026-06-19

Kullanici talimatiyla web site islemlerinde commit ve push akisi GitHub Desktop uzerinden yapilacak sekilde belirlendi.

Karar:

- Web site dosyalari `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari` repo klasorune kaydedilecek.
- Commit/push islemi GitHub Desktop ile yapilacak.
- Kod tarafindan otomatik commit veya push yapilmayacak.
- GitHub Desktop acilmadan once degisen web site dosyalari kullaniciya ozetlenecek.
- Varsayilan commit mesaji yapilan ise gore secilecek; mevcut web site guncellemeleri icin onerilen mesaj:
  `Web site robot veri görünümü güncellendi`
## Robot Ciktilarini Web Siteye Otomatik Yonlendirme - 2026-06-19

Robot tarafinda uretilen gunluk mac, ham veri ve tahmin dosyalarinin web site repo klasorune otomatik aktarilmasi icin esitleme sistemi eklendi.

Yapilanlar:

- `src/web_site_esitleyici.py` olusturuldu.
- `run_robot.bat` robot basariyla tamamlandiktan sonra web site esitleme modulunu calistiracak sekilde guncellendi.
- `setup_daily_robot_task.bat` olusturuldu.
- Hedef web site repo klasoru:
  `C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari`
- Web site repo icinde `outputs/.gitkeep` dosyasi olusturularak `outputs` klasoru hazirlandi.

Esitlenecek dosyalar:

- `data/ham_mac_havuzu.json`
- `data/tahmin_gecmisi.json`
- `outputs/bugunun_en_guclu_maclari.md`
- `outputs/mackolik_veri_cekme_raporu.md`
- `outputs/basari_yuzdesi_raporu.md`

Not:

- Codex sandbox ortaminda dis repo klasorune otomatik dosya kopyalama testinde Windows erisim kisiti goruldu.
- Yerel PC'de `run_robot.bat` cift tiklandiginda esitleme normal kullanici yetkisiyle calisacak sekilde tasarlandi.
- Git kurulu oldugu icin `run_robot.bat` artik web site esitlemesinden sonra otomatik commit/push deneyecek.
- Otomatik commit mesaji: `Canli veri otomatik guncellendi`.
- `setup_daily_robot_task.bat` bir kez calistirilirse robot her gun 08:30'da otomatik calisir.
