const assert = require("node:assert/strict");
const handler = require("../api/send-coupon-mail");

const cem = handler.PRIMARY_COUPON_RECIPIENT;
const arif = handler.SECONDARY_COUPON_RECIPIENT;

assert.equal(cem, "cemkaplanoglu@gmail.com");
assert.equal(arif, "arifkaplanoglu@gmail.com");

assert.equal(
  handler.supportsExternalRecipients("Futbol Laboratuvarı <onboarding@resend.dev>"),
  false,
  "Resend test göndericisi dış alıcıyı açmamalı",
);
assert.equal(
  handler.supportsExternalRecipients("Futbol Laboratuvarı <mail@futbollaboratuuvari.org>"),
  true,
  "özel alan adı göndericisi ikinci alıcıyı açmalı",
);

assert.equal(
  handler.mergeCouponRecipients("", "Futbol Laboratuvarı <mail@futbollaboratuuvari.org>"),
  "",
  "COUPON_MAIL_TO eksikse mevcut güvenlik kontrolü korunmalı",
);

assert.deepEqual(
  handler.mergeCouponRecipients(cem, "Futbol Laboratuvarı <onboarding@resend.dev>").split(","),
  [cem],
  "test göndericisi kullanılırken çalışan Cem teslimatı korunmalı",
);

assert.deepEqual(
  handler.mergeCouponRecipients(cem, "Futbol Laboratuvarı <mail@futbollaboratuuvari.org>").split(","),
  [cem, arif],
  "uygun göndericide Cem ve Arif aynı kupon mailinde alıcı olmalı",
);

assert.deepEqual(
  handler.mergeCouponRecipients(`${cem},${arif},${cem}`, "Futbol Laboratuvarı <mail@futbollaboratuuvari.org>").split(","),
  [cem, arif],
  "alıcı listesi tekrar üretmemeli",
);

console.log("✓ kupon mail alıcı yönlendirmesi güvenli: test sender=Cem, uygun sender=Cem+Arif");
