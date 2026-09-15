const fs = require("fs");
const path = require("path");

const SITE = "https://futbollaboratuuvari.org/";
const LASTMOD = "2026-09-15";

const PAGE_CONFIG = {
  "iptal-iade-politikasi.html": {
    schemaType: "WebPage",
    metaDescription: "Futbol Laboratuvarı dijital üyeliklerinde iptal, cayma, iade başvurusu, inceleme süreci ve tüketici haklarına ilişkin açıklamalar.",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>8. Başvuruyu hızlandırmak için</h2><p>İptal veya iade talebinde sipariş kodu, kayıtlı e-posta adresi, ödeme tarihi ve talebin kısa gerekçesi birlikte iletilirse kayıtların eşleştirilmesi daha hızlı yapılabilir. Dekont paylaşılması gerekiyorsa yalnız işlem doğrulaması için gerekli alanların görünür bırakılması ve gereksiz kişisel bilgilerin gizlenmesi önerilir.</p><p>Başvurunun sonucu; ödeme kaydı, aktivasyon zamanı, hizmetin kullanılıp kullanılmadığı ve yürürlükteki tüketici mevzuatı birlikte değerlendirilerek belirlenir. Kullanıcı, inceleme sürecinde ek bilgi istenmesi hâlinde aynı iletişim kanalı üzerinden yanıt verebilir.</p></section>`
  },
  "iletisim.html": {
    schemaType: "ContactPage",
    replaceUnderConstruction: true,
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>İletişim güvenliği ve doğru yönlendirme</h2><p>Destek talebinizin doğru bölüme yönlendirilebilmesi için mesajınızda konuyu açıkça belirtmeniz faydalıdır. Teknik sorunlarda kullandığınız cihazı, tarayıcıyı ve gördüğünüz hata mesajını; üyelik veya ödeme sorularında ise kayıtlı e-posta adresinizi ve varsa sipariş kodunu yazabilirsiniz. Parola, tam kart numarası, kart güvenlik kodu veya benzeri hassas bilgileri e-posta ile paylaşmayın.</p><p>İçerik düzeltme taleplerinde ilgili sayfanın bağlantısını ve düzeltilmesini istediğiniz bölümü belirtmeniz incelemeyi kolaylaştırır. Gizlilik ve kişisel veri taleplerinde kimliğinizi doğrulamaya yetecek kadar bilgi istenebilir; amaçla ilgisiz kişisel verileri göndermemeniz önerilir. Reklam ve iş birliği mesajlarında ise teklifin kapsamı, süre ve iletişim kişisi gibi temel bilgilerin eklenmesi değerlendirme sürecini hızlandırır.</p></section>`
  },
  "sorumlu-kullanim.html": {
    schemaType: "WebPage",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>7. Analizleri okurken kontrol listesi</h2><p>Bir maç değerlendirmesini okurken tek bir istatistiğe bağlı kalmak yerine form, fikstür yoğunluğu, kadro durumu, iç ve dış saha performansı, gol üretimi ve savunma eğilimlerini birlikte değerlendirin. Verinin hangi tarihte üretildiğini kontrol edin ve maç saati yaklaştıkça kadro veya sakatlık bilgilerinin değişebileceğini unutmayın.</p><p>Analizleri kesin sonuç olarak değil, futbol verisini anlamaya yardımcı bir çerçeve olarak kullanmak daha sağlıklıdır. Bir içerik sizde baskı, acelecilik veya kaybı telafi etme duygusu oluşturuyorsa karar vermeyi ertelemek ve bütçe sınırlarını korumak sorumlu kullanımın temel parçasıdır.</p></section>`
  },
  "yasal-uyari.html": {
    schemaType: "WebPage",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>8. Veri kaynakları ve güncelleme farkları</h2><p>Futbol verileri farklı sağlayıcılardan ve zaman damgalarından gelebilir. Fikstür, kadro, sakatlık, oran, sonuç veya istatistik bilgileri kaynak güncellemeleri nedeniyle sonradan değişebilir. Bu nedenle kullanıcıların kritik bir bilgiyi yalnız tek bir eski ekran görüntüsüne veya geçmiş tarihli veriye dayanarak değerlendirmemesi önerilir.</p><p>Site, tespit edilen veri veya içerik hatalarını düzeltmeye çalışır; ancak üçüncü taraf kaynakların kesintisi, gecikmesi veya sonradan yaptığı değişiklikler anlık farklılıklara yol açabilir. Güncel içerik ile arşiv içeriği aynı kesinlik düzeyinde değerlendirilmemelidir.</p></section>`
  },
  "gizlilik-politikasi.html": {
    schemaType: "PrivacyPolicy",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>8. Veri minimizasyonu ve güvenli paylaşım</h2><p>Destek veya üyelik işlemlerinde yalnız işlemin yürütülmesi için gerekli bilgilerin paylaşılması önerilir. Parola, tam kart numarası veya kart güvenlik kodu gibi hassas ödeme bilgileri e-posta ile istenmez. Kullanıcıların gönderdikleri ekran görüntüsü veya dekontlarda işlem için gereksiz kişisel alanları gizlemesi veri minimizasyonu açısından faydalıdır.</p><p>Gizlilik veya veri işleme hakkında bir sorunuz olduğunda, talebin hangi işlem veya hesapla ilgili olduğunu açıkça belirtmeniz incelemeyi kolaylaştırır. Talebin niteliğine göre kimlik doğrulaması için makul ek bilgi istenebilir.</p></section>`
  },
  "kullanim-sartlari.html": {
    schemaType: "WebPage",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>8. Hesap ve erişim güvenliği</h2><p>Kullanıcı, kendisine verilen üyelik veya erişim kodlarını üçüncü kişilerle paylaşmamalı ve ortak cihazlarda oturum bilgilerini açık bırakmamalıdır. Şüpheli erişim, beklenmeyen hata veya yetkisiz kullanım fark edilirse destek kanalı üzerinden bildirim yapılması önerilir. Güvenlik amacıyla bazı oturumlar veya erişimler yeniden doğrulama gerektirebilir.</p><p>Site özelliklerini bozacak yoğun otomatik istekler, güvenlik kontrollerini aşmaya yönelik girişimler veya başkalarının erişim hakkını kullanma teşebbüsleri hizmet güvenliğini etkileyebileceği için kısıtlanabilir.</p></section>`
  },
  "cerez-politikasi.html": {
    schemaType: "WebPage",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>7. Tercihlerin etkisi</h2><p>Zorunlu olmayan reklam teknolojilerini reddetmeniz sitenin temel içeriklerini görüntülemenizi engellemez. Reklam tercihini kabul etmeniz hâlinde üçüncü taraf reklam sağlayıcıları kendi politikaları kapsamında reklam sunumu, güvenlik ve ölçüm amaçlarıyla çerez veya benzer teknolojiler kullanabilir. Tercihinizi daha sonra değiştirmeniz, geçmişte oluşmuş bazı üçüncü taraf kayıtların otomatik olarak silindiği anlamına gelmez.</p><p>Tarayıcınızdan site verilerini veya çerezleri temizlerseniz kayıtlı tercih de silinebilir ve sonraki ziyarette yeniden seçim yapmanız istenebilir. Farklı tarayıcı veya cihazlarda tercihler ayrı tutulabilir.</p></section>`
  },
  "on-bilgilendirme-formu.html": {
    schemaType: "WebPage",
    extraSection: `<section class="card" data-static-seo-hardened="2026-09-15"><h2>8. Sipariş öncesi kontrol</h2><p>Ödeme yapmadan önce seçilen paket adı, toplam bedel, paket süresi, özel analiz hakkı ve iletişim bilgilerinin doğru olduğundan emin olun. Sistem tarafından oluşturulan sipariş kodu ile ödeme açıklamasının eşleşmesi doğrulama sürecini kolaylaştırır. Paket veya bedel bilgisinde tereddüt varsa ödeme göndermeden önce destek kanalından bilgi istenebilir.</p></section>`
  },
  "mesafeli-satis-sozlesmesi.html": {
    schemaType: "WebPage",
    metaDescription: "Futbol Laboratuvarı dijital üyelik hizmetlerinde paket, ödeme, dijital teslim, cayma, iade ve tarafların yükümlülüklerini açıklayan mesafeli satış sözleşmesi."
  }
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?\s*>/i);
  return match ? match[1].trim() : "";
}

function getTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "Futbol Laboratuvarı";
}

function setMetaDescription(html, description) {
  if (!description) return html;
  return html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?\s*>/i,
    `<meta name="description" content="${description}" />`
  );
}

function addHeadSeo(html, filename, config) {
  const canonical = `${SITE}${filename}`;
  const title = getTitle(html);
  const description = getMetaDescription(html);
  const additions = [];

  if (!/<meta\s+name=["']robots["']/i.test(html)) {
    additions.push('  <meta name="robots" content="index, follow, max-snippet:-1" />');
  }
  if (!/<link\s+rel=["']canonical["']/i.test(html)) {
    additions.push(`  <link rel="canonical" href="${canonical}" />`);
  }
  if (!/data-static-seo-schema=["']2026-09-15["']/i.test(html)) {
    const schema = {
      "@context": "https://schema.org",
      "@type": config.schemaType || "WebPage",
      name: title,
      description,
      url: canonical,
      isPartOf: {
        "@type": "WebSite",
        name: "Futbol Laboratuvarı",
        url: SITE
      },
      inLanguage: "tr-TR"
    };
    additions.push(`  <script type="application/ld+json" data-static-seo-schema="2026-09-15">${JSON.stringify(schema)}</script>`);
  }

  if (!additions.length) return html;
  if (!/<\/head>/i.test(html)) throw new Error(`${filename}: </head> bulunamadı`);
  return html.replace(/<\/head>/i, `${additions.join("\n")}\n</head>`);
}

function replaceContactPlaceholder(html) {
  const oldText = '<p>Satıcı unvanı, açık adres, vergi ve telefon bilgileri güvenli yayın yapılandırmasında eksiksiz tanımlanana kadar ücretli sipariş alımı teknik olarak kapalıdır. Satış açıldığında bu bilgiler ön bilgilendirme ve sözleşme sayfalarında gösterilir.</p>';
  const newText = '<p>Ücretli hizmetlere ilişkin satıcı ve işlem bilgileri, ödeme öncesinde Ön Bilgilendirme Formu ile Mesafeli Satış Sözleşmesi üzerinden kullanıcıya sunulur. Destek ve genel iletişim için bu sayfadaki e-posta kanalını kullanabilirsiniz.</p>';
  return html.includes(oldText) ? html.replace(oldText, newText) : html;
}

function addExtraSection(html, section) {
  if (!section || html.includes('data-static-seo-hardened="2026-09-15"')) return html;
  if (!/<\/main>/i.test(html)) throw new Error("</main> bulunamadı");
  return html.replace(/<\/main>/i, `    ${section}\n  </main>`);
}

function visibleWordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function updateSitemap(outDir) {
  const sitemapPath = path.join(outDir, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) throw new Error("sitemap.xml bulunamadı");
  let sitemap = fs.readFileSync(sitemapPath, "utf8");

  for (const filename of Object.keys(PAGE_CONFIG)) {
    const loc = `${SITE}${filename}`;
    const blockRe = new RegExp(`(<url>\\s*<loc>${escapeRegExp(loc)}<\\/loc>)([\\s\\S]*?)(<\\/url>)`);
    const match = sitemap.match(blockRe);
    if (!match) throw new Error(`Sitemap URL bulunamadı: ${loc}`);
    let middle = match[2].replace(/\s*<lastmod>[^<]+<\/lastmod>/, "");
    sitemap = sitemap.replace(blockRe, `$1\n    <lastmod>${LASTMOD}</lastmod>${middle}$3`);
  }

  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

function hardenStaticSeo(outDir) {
  const results = [];

  for (const [filename, config] of Object.entries(PAGE_CONFIG)) {
    const filePath = path.join(outDir, filename);
    if (!fs.existsSync(filePath)) throw new Error(`SEO hedef sayfası bulunamadı: ${filename}`);

    let html = fs.readFileSync(filePath, "utf8");
    html = setMetaDescription(html, config.metaDescription);
    if (config.replaceUnderConstruction) html = replaceContactPlaceholder(html);
    html = addHeadSeo(html, filename, config);
    html = addExtraSection(html, config.extraSection);

    const canonical = `${SITE}${filename}`;
    if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
      throw new Error(`${filename}: canonical eklenemedi`);
    }
    if (!html.includes('data-static-seo-schema="2026-09-15"')) {
      throw new Error(`${filename}: yapılandırılmış veri eklenemedi`);
    }

    const words = visibleWordCount(html);
    if (config.extraSection && words < 320) {
      throw new Error(`${filename}: içerik hâlâ zayıf görünüyor (${words} kelime)`);
    }

    fs.writeFileSync(filePath, html, "utf8");
    results.push(`${filename}:${words}`);
  }

  updateSitemap(outDir);
  console.log(`Statik SEO güçlendirme tamamlandı: ${results.join(", ")}`);
}

module.exports = { hardenStaticSeo };
