const fs = require("fs");
const path = require("path");
const { hardenStaticSeo: runBaseHardening } = require("./harden-static-seo");

const PRESECTIONS = {
  "iptal-iade-politikasi.html": "İade talebinizi göndermeden önce kayıtlı e-posta adresinizi, sipariş kodunu ve ödeme tarihini kontrol edin. Aynı talep için farklı kanallardan tekrar tekrar mesaj göndermek yerine tek iletişim zinciri üzerinden ilerlemek, kayıtların karışmasını önler ve değerlendirmeyi kolaylaştırır. İşlem sonucuna ilişkin bilgilendirme için kullandığınız e-posta hesabının gelen kutusu ve gereksiz klasörü de kontrol edilebilir.",
  "iletisim.html": "Futbol Laboratuvarı ile iletişim kurarken talebinizi tek bir konu başlığı altında ve mümkün olduğunca açık biçimde iletmeniz önerilir. Teknik bir sorun bildiriyorsanız sorunun hangi sayfada oluştuğunu, yaklaşık zamanı ve tekrar edip etmediğini yazabilirsiniz. İçerik veya analizle ilgili bildirimlerde ilgili maçın ya da sayfanın adını belirtmek incelemeyi kolaylaştırır. Güvenlik amacıyla parola, kart güvenlik kodu veya tam ödeme kartı bilgisi göndermeyin.",
  "sorumlu-kullanim.html": "Sorumlu kullanım yalnız sonuçlara değil, karar sürecine de dikkat etmeyi gerektirir. Bir analiz beklediğiniz yönde çıkmadığında kaybı telafi etme düşüncesiyle acele karar vermemek, farklı kaynakları karşılaştırmak ve kişisel bütçe sınırlarını korumak önemlidir. Futbol verileri olasılıkları anlamaya yardımcı olabilir ancak maç sonucunu garanti etmez; bu nedenle her değerlendirme belirsizlik payı içerir.",
  "yasal-uyari.html": "Sitedeki analizlerin yayın zamanı ile maç başlangıç zamanı arasında kadro, sakatlık, hava, saha koşulları veya resmi veri akışında değişiklik oluşabilir. Kullanıcıların güncel karar verirken tarih ve saat bilgisini kontrol etmesi önerilir. Arşivde kalan eski analizler geçmişteki veri görünümünü yansıtır ve daha sonra ortaya çıkan bilgilerle aynı bağlamda değerlendirilmemelidir.",
  "gizlilik-politikasi.html": "Kişisel veri taleplerinde yalnız talebin değerlendirilmesi için gerekli bilgilerin paylaşılması esastır. Kullanıcılar destek mesajlarında gereksiz kimlik, finans veya hesap bilgisi göndermemelidir. E-posta üzerinden iletilen belgelerde işlemle ilgisi olmayan alanların gizlenmesi önerilir. Bu yaklaşım hem veri minimizasyonunu destekler hem de destek sürecinde gereksiz kişisel veri işlenmesini azaltır.",
  "kullanim-sartlari.html": "Siteyi kullanan kişiler hesap ve erişim bilgilerini korumakla yükümlüdür. Ortak veya güvenilmeyen cihazlarda oturum bilgilerinin kaydedilmemesi, şüpheli bağlantılardan giriş yapılmaması ve erişim kodlarının üçüncü kişilerle paylaşılmaması önerilir. Teknik güvenlik kontrolleri hizmetin bütünlüğünü korumak amacıyla uygulanabilir ve olağan dışı kullanım tespit edildiğinde ek doğrulama istenebilir.",
  "cerez-politikasi.html": "Çerez ve yerel depolama tercihleri kullandığınız tarayıcıya ve cihaza bağlı olabilir. Bir cihazda verdiğiniz tercih başka bir tarayıcıya otomatik olarak aktarılmayabilir. Tarayıcı verilerini temizlediğinizde seçimlerin yeniden sorulması normaldir. Zorunlu olmayan reklam teknolojileri için verdiğiniz tercihleri daha sonra değiştirebilir ve sitenin temel içeriklerine erişmeye devam edebilirsiniz.",
  "on-bilgilendirme-formu.html": "Sipariş oluşturmadan önce paket kapsamı, toplam bedel, kullanım süresi ve iletişim bilgilerinin ekranda doğru göründüğünü kontrol etmek önemlidir. Tereddüt edilen bir bilgi varsa ödeme yapılmadan önce destek kanalından açıklama istenebilir. Sipariş kodu ve ödeme açıklamasının doğru kullanılması, ödemenin ilgili taleple eşleştirilmesini ve dijital erişimin doğru hesaba tanımlanmasını kolaylaştırır."
};

function addPreSections(outDir) {
  for (const [filename, text] of Object.entries(PRESECTIONS)) {
    const filePath = path.join(outDir, filename);
    if (!fs.existsSync(filePath)) throw new Error(`SEO destek sayfası bulunamadı: ${filename}`);
    let html = fs.readFileSync(filePath, "utf8");
    if (html.includes('data-static-seo-support="2026-09-15"')) continue;
    const section = `<section class="card" data-static-seo-support="2026-09-15"><h2>Ek kullanıcı bilgisi</h2><p>${text}</p></section>`;
    if (!/<\/main>/i.test(html)) throw new Error(`${filename}: </main> bulunamadı`);
    html = html.replace(/<\/main>/i, `    ${section}\n  </main>`);
    fs.writeFileSync(filePath, html, "utf8");
  }
}

function hardenStaticSeo(outDir) {
  addPreSections(outDir);
  runBaseHardening(outDir);

  const privacyPath = path.join(outDir, "gizlilik-politikasi.html");
  if (fs.existsSync(privacyPath)) {
    const privacyHtml = fs.readFileSync(privacyPath, "utf8")
      .replace('"@type":"PrivacyPolicy"', '"@type":"WebPage"');
    fs.writeFileSync(privacyPath, privacyHtml, "utf8");
  }
}

module.exports = { hardenStaticSeo };
