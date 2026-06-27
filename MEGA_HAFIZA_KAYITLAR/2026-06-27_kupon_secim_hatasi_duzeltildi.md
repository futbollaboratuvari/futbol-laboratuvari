# 2026-06-27 Kupon Secim Hatasi Duzeltildi

## Kullanici Geri Bildirimi

Kullanici oran secince sag tarafta kupon olusmadigini bildirdi.

Istenen net davranis:

1. Oran butonlarina mac index/id bilgisi net verilecek.
2. Tiklaninca dogrudan o mac + market + oran alinacak.
3. Sagdaki Kuponum alani aninda guncellenecek.
4. Ayni mactan baska oran secilirse eski secim degisecek.
5. Secilen oran gorsel olarak aktif kalacak.
6. Sil butonu secimi kaldiracak.

## Yapilan Islem

Sadece mevcut dosya guncellendi:

- `daily-matches-widget.js`

Commit:

- `ae5fca7697c431ea947c9b121bf2dc58054be556`

## Teknik Duzeltme

### Net Mac Kimligi

Her mac icin:

- `_uid`
- `_index`

atanir.

Ayrica `state.byUid` haritasi olusturulur.

### Oran Butonlari

Her oran butonuna su bilgiler yazildi:

- `data-select-uid`
- `data-select-index`
- `data-select-market`
- `data-select-label`
- `data-select-value`

### Kupon Secim Mantigi

- Tiklanan oran `selectPick` fonksiyonuna gider.
- Mac once uid ile bulunur, olmazsa index ile bulunur.
- Aynı mactan baska oran secilirse eski secim degisir.
- Ayni oran tekrar tiklanirsa secim kaldirilir.
- Secimden sonra `renderView()` cagrilir ve sag panel aninda yenilenir.

### Sag Kupon Alani

`renderSlip()` sag paneli `state.selected` icinden olusturur.

Gosterilenler:

- Mac adi
- Secilen market
- Oran
- Sil butonu

### Click Guvenligi

Oran tiklamasi click handler'in en basina alindi.

Tiklamada:

- `preventDefault`
- `stopPropagation`
- `stopImmediatePropagation`

calisir. Boylece eski handlerlar secimi engellemez.

## Korunanlar

- Tek bulten korundu.
- Yeni widget yok.
- Yeni bridge yok.
- Sag kupon alani korundu.
- Canli / Tum Bulten modu korundu.

## Sonuc

Oran secince sagdaki Kuponum alanina mac + market + oran dusmesi icin secim mantigi netlestirildi.
