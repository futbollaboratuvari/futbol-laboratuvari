# Mackolik Veri Cekme Raporu - Faz 7 Son Durum

Tarih: 2026-06-19

Kaynak: https://arsiv.mackolik.com/Iddaa-Programi

## Amac

Mackolik veri cekicisini site entegrasyonuna gecmeden once son kez dogrulamak.

Bu sistem:

- Bahis oynatmaz.
- Kupona ekleme yapmaz.
- Para yatirma/cekme yapmaz.
- Uyelik veya satin alma islemi yapmaz.
- Sadece gorunen mac ve oran verilerini okur.

## Kontrol Edilen Dosyalar

- `src/mackolik_veri_cekici.py`
- `src/robot.py`
- `data/ham_mac_havuzu.json`
- `outputs/mackolik_veri_cekme_raporu.md`
- `MASTER_HAFIZA.md`
- `proje_hafizasi.md`
- `gunluk_rapor.md`

## Canli Test Sonucu

Playwright ile Mackolik Arsiv sayfasi acildi ve veri cekici canli sayfa uzerinde test edildi.

| Kontrol | Sonuc |
|---|---:|
| Bulunan mac satiri | 66 |
| Lig sayisi | 28 |
| Zorunlu alanlari ve temel oranlari tam okunan mac | 39 |
| Tumu/detail denemesi | 25 |
| Basariyla acilan Tumu/detail | 25 |
| Detail hata sayisi | 0 |
| Ham havuz toplam mac sayisi | 25 |
| Ham havuz JSON durumu | Gecerli |
| Ham havuz tekrar eden anahtar | 0 |

## Dogrulanan Zorunlu Alanlar

Asagidaki alanlar canli sayfadan okunabildi:

- Tarih
- Saat
- Lig
- Ev sahibi
- Deplasman
- Mac kodu
- MS 1
- MS X
- MS 2
- 2.5 Alt
- 2.5 Ust

Ornek canli okunan mac:

| Alan | Deger |
|---|---|
| Tarih | 19.06.2026 |
| Saat | 22:00 |
| Lig | Dunya Kupasi 2026 Grup D |
| Ev Sahibi | Abd |
| Deplasman | Avustralya |
| Mac Kodu | 14847 |
| MS 1 | 1.41 |
| MS X | 3.68 |
| MS 2 | 4.74 |
| 2.5 Alt | 1.63 |
| 2.5 Ust | 1.72 |

## Ek Market Durumu

`Tumu` detay alanlari acilabildi. Ancak mevcut parser bu fazda ek marketleri guvenilir sekilde normalize etmedi.

| Ek Alan | Durum |
|---|---|
| KG Var | Henuz guvenilir okunmadi |
| KG Yok | Henuz guvenilir okunmadi |
| 3.5 Alt/Ust | Henuz guvenilir okunmadi |
| IY KG / 2Y KG | Henuz guvenilir okunmadi |
| IY/MS | Henuz guvenilir okunmadi |

Karar: Faz 7'nin bitis kriteri icin temel mac ve temel oran veri cekimi dogrulandi. Ek marketler site entegrasyonu sonrasi gelistirilecek ayri iyilestirme olarak kalabilir.

## Tekrar Kayit Kontrolu

Benzersiz anahtar mantigi:

`tarih + saat + ev_sahibi + deplasman`

Test sonucu:

- Ilk ekleme: `new_matches_added = 1`
- Ayni mac ikinci kez eklendiginde: `duplicate_matches = 1`
- Ikinci eklemede yeni kayit: `new_matches_added = 0`

## Ham Veri Havuzu Durumu

- Dosya: `data/ham_mac_havuzu.json`
- JSON durumu: Gecerli
- Toplam mac sayisi: 25
- Mackolik son canli testinde bulunan mac: 66
- Kalici kaydedilen Mackolik dogrulama kaydi: 20
- Tekrar eden anahtar sayisi: 0

## Robot Ana Akis Durumu

`src/robot.py` import testi basarili.

Robot calistirma testi:

- Robot demo modda calisti.
- Maçkolik adimi sandbox icinde Chromium `EPERM` hatasi alsa bile ana robot akisi cokmedi.
- Demo analiz, kupon ve basari takip raporu terminale uretildi.
- `run_robot.bat` akisini bozan import veya baglanti hatasi bulunmadi.

Not: Codex sandbox ortaminda Python/PowerShell dosya yazma ve Chromium calistirma kisitlari gorulebiliyor. Yetkili Playwright testinde Maçkolik sayfasi acildi ve veri cekimi dogrulandi.

## Teknik Duzeltmeler

- Lig bilgisi mac satirindan degil, tek hucreli grup basligindan okunacak sekilde parser duzeltildi.
- Tarih bilgisi market baslik satirindaki tarih degisiminden okunacak sekilde duzeltildi.
- `Tumu` detay tiklamalarinda reklam/cookie katmani engelini azaltmak icin sadece `Tumu` hucresinde `force=True` kullanildi.
- Yasakli aksiyon metinleri korunmaya devam ediyor.

## Test Ozeti

- AST testi: Basarili
- Import testi: Basarili
- Playwright canli sayfa acma testi: Basarili
- Zorunlu alan okuma testi: Basarili
- Detail acma testi: Basarili
- JSON okuma testi: Basarili
- Tekrar kayit testi: Basarili
- Robot import testi: Basarili
- Robot ana akis testi: Basarili

## Son Karar

MAÇKOLİK VERİ ÇEKİCİ SON DURUM: HAZIR

SİTE ENTEGRASYONUNA GEÇİLEBİLİR Mİ: EVET
