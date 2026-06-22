# Sayfa Düzenleme İlkeleri

Bu dosya Futbol Laboratuvarı site düzenlemelerinde uygulanacak temel kuralları tutar.

## Ana ilke

Her yeni sayfa düzenleme adımında eski yapı ekrana düşmeyecek.

## Uygulama kuralları

1. Yeni görünüm sadece sonradan çalışan JavaScript ile ekrana basılmayacak.
2. Kritik metinler ve kritik HTML yapısı doğrudan ilgili HTML dosyasına işlenecek.
3. Kritik CSS doğrudan sayfa açılışında yüklenecek şekilde `head` içinde bağlanacak.
4. Sadece JavaScript ile sonradan düzeltme yapılırsa eski görünüm kısa süre görünebilir; bu yöntem ana çözüm olarak kullanılmayacak.
5. Cache çakışmasını önlemek için düzenlenen CSS/JS dosyalarının versiyon parametresi güncellenecek.
6. Eski yapı ile yeni yapı üst üste binmesin diye eski katmanlar ya kaldırılacak ya da açıkça kapatılacak.
7. Web ve mobil kırılımlar birlikte kontrol edilecek.
8. Önce ilgili bölüm stabil hale getirilecek, sonra diğer bölüme geçilecek.
9. Public sitede teknik kelimeler yerine kullanıcı dostu ifadeler kullanılacak.
10. Düzenleme sonrası kullanıcıdan ekran görüntüsü alınarak bir sonraki küçük adım belirlenecek.

## Hero özel kuralı

Hero bölümü için metin, kartlar ve temel görsel düzen doğrudan `index.html` ve hero CSS dosyası üzerinden yüklenmelidir. Eski hero metinleri veya eski sayaçlar sayfa açılışında görünmemelidir.
