# 2026-06-22 - Kurucu Erişimi ve Ziyaretçi Kilidi Kaydı

Bu kayıt, Futbol Laboratuvarı sitesinde üyeye/kurucuya özel analiz alanı ile normal ziyaretçi erişim sınırlarının netleştirilmesi için yapılan çalışmayı saklar.

## Amaç

- Kupon / özel analiz alanı normal ziyaretçilere açık olmayacak.
- Kurucu erişimi olan Cem Kaplanoğlu için panel sınırsız çalışacak.
- Kurucu kodu girildiğinde panel kilidi açılacak.
- Normal ziyaretçi maç detay oran alanına tıklayıp detayları göremeyecek.

## Kurucu erişim kodu

`CEM-ANALIZ-2026`

Bu kod girildiğinde tarayıcı tarafında şu erişim bayrağı aktif olur:

`fl_premium_beta_access = 1`

Bu bayrak aktif olduğunda sistem kurucu/üye erişimi var kabul eder.

## Yapılan teknik düzenlemeler

### 1. Kurucu kod kutusu aktif hale getirildi

`cache-version.js` içine premium kod alanını görünür, tıklanabilir ve yazılabilir hale getiren güvenli erişim düzeltmesi eklendi.

İlgili commit:

`d3d6a1121c5bb5bcaada4f3f4c6c54d155288eef`

### 2. Normal ziyaretçi için maç detay oran alanları kapatıldı

Bugünün Maçları bölümünde normal ziyaretçi, maç satırındaki detay/oran alanını açamayacak. Kurucu/üye erişimi yoksa detay butonu pasifleşir ve `Üye Alanı` metnine döner.

İlgili commit:

`b921802aaa49e969d9865036f81daa1ad0920e9c`

### 3. Ücretli Üye Alanı etiketi kod girişine bağlandı

`Ücretli Üye Alanı` etiketi tıklanınca premium kod giriş alanına odaklanacak şekilde düzenlendi.

İlgili commit:

`6fb942ae63f4031c22512fa7f3e92d7fc446d6d0`

## Erişim kuralı

- Ziyaretçi: maç detay/oran/özel analiz alanı kapalı.
- Üye: erişim hakkına göre özel analiz alanı açık.
- Kurucu: `CEM-ANALIZ-2026` kodu ile sınırsız erişim.

## Önemli not

Bu çalışma ziyaretçiye kupon/özel analiz alanını açmak için yapılmadı. Amaç, ziyaretçiye kapalı kalması gereken alanları kapatmak ve kurucu erişimini doğru çalıştırmaktır.

## Sonraki kontrolde bakılacaklar

1. Canlı sitede `Ücretli Üye Alanı` tıklanınca kod kutusuna odaklanıyor mu?
2. `CEM-ANALIZ-2026` girilince panel açılıyor mu?
3. Normal ziyaretçi maç detay oran alanlarını açamıyor mu?
4. Kurucu erişimi aktifken maç detayleri ve özel analiz alanı çalışıyor mu?
