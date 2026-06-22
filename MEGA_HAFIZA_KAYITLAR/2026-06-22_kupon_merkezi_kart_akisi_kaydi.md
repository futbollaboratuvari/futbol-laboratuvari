# Futbol Laboratuvarı - Kupon Merkezi Kart Akışı Kaydı

Tarih: 2026-06-22

## Özet

Kupon merkezi kartlarında veri görünmemesi incelendi. Canlı maç verisinin geldiği, fakat kupon kartlarının beslendiği `data/daily-coupons.json` dosyasında kuponların boş kaldığı görüldü.

## Bulunan sorunlar

1. `data/live-matches.json` içinde güncel maç listesi vardı.
2. `data/daily-coupons.json` içinde kuponlar boştu.
3. `selected_matches` alanları boştu.
4. `is_available` değerleri `false` durumundaydı.
5. Kartlar veri beklerken boş görünüyordu.
6. Kupon üretim eşiği yüksek kaldığı için düşük puanlı maçlar kartlara düşmüyordu.

## Kullanıcı kararı

Kullanıcı şu kararı verdi:

- Düşük puanlı adaylar da kartlarda görünsün.
- Son karar kullanıcıya bırakılsın.
- Kartlar boş kalmasın.
- Kullanıcı maç, oran ve risk bilgisini görüp kendi kararını versin.

## Yapılan çalışmalar

### 1. Boş kart temizliği

`site-human-language.js` dosyasına kupon merkezi kartlarını kontrol eden temizlik eklendi.

Amaç:

- Kupon yoksa birden fazla boş kart göstermemek.
- Her sütunda tek sade bekleme mesajı göstermek.
- Gerçek kart varsa onu korumak.

Commit:

- `bd6c6332ce70531638aa64e00607214af0017752`

### 2. Kart veri besleme dosyası

`cards-user-choice.js` dosyası eklendi.

Amaç:

- Canlı maç listesindeki maçları kartlara aday olarak aktarmak.
- Düşük puanlı adayları da gizlememek.
- Oran bilgisi bulunan maçları kullanıcı tercihine açık şekilde göstermek.

Commit:

- `29de69c5ea4468dca22694a3d90e39af541219cb`

### 3. Kart veri akışı otomatik akışı

`cards-user-choice.yml` dosyası eklendi.

Amaç:

- Kart verisini 15 dakikada bir yenilemek.
- `data/live-matches.json` güncellendiğinde kart verisini tekrar oluşturmak.
- `data/daily-coupons.json` dosyasını güncellemek.

Commit:

- `63b02a43b7c97f635a1896e3cebf58264c5b8062`

### 4. Kartlara doğrudan aday veri ekleme

`data/daily-coupons.json` dosyası doğrudan aday maçlarla dolduruldu.

Eklenen mantık:

- `user_choice_mode: true`
- Düşük puanlı adaylar da gösterilir.
- Her kartta maç adı, lig, saat, öneri, oran, risk ve açıklama bulunur.
- Son karar kullanıcıya bırakılır.

Commit:

- `8483db9bde2151bdc53f856bbbc19300cd150b2e`

## Güncel kart mantığı

Kupon merkezi artık şu şekilde çalışacak:

- Maç verisi varsa kartlar boş kalmayacak.
- Düşük puanlı adaylar gizlenmeyecek.
- Kartlar kesin öneri gibi değil, aday seçenek olarak gösterilecek.
- Kullanıcı kendi tercihine göre karar verecek.

## Site dili politikası

Kullanıcıya görünen alanlarda robotik ve teknik ifadeler kullanılmayacak.

Kullanılacak dil:

- Güncel maç listesi
- Kupon adayı
- Seçim kullanıcıya ait
- Son karar kullanıcıya bırakılır
- Güncel Veri
- Maç yorumu
- Risk seviyesi

Kaçınılacak dil:

- robot
- JSON
- API
- engine
- script
- ham veri
- workflow

## Son durum

Kupon merkezi kartlarına veri akışı sağlandı. Kartlar boş kalmayacak şekilde aday veriyle dolduruldu. Otomatik güncelleme için ayrı akış eklendi. Düşük puanlı adaylar da kullanıcı tercihine bırakılacak şekilde görünür hale getirildi.
