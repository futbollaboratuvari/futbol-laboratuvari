const crypto = require("crypto");

const CODE_DATABASE = {
  "340e3aa6b3669a195f3691ae3c605fcf2c21e96b759e7e93fa31133eea828bdf": {
    "planCode": "founder",
    "planName": "Kurucu Test Kodu",
    "remainingAnalysisCount": 9999
  },
  "d0e366399638702f7f4fd5cae64e544617bc4ec948a277a34c2a9d7cb855d290": {
    "planCode": "founder",
    "planName": "Kurucu Üye",
    "remainingAnalysisCount": 9999
  },
  "79a8ad54b8f8846d574f41f27ffae13e837dfe3f386db9598a4b7f5c13cf4e6e": {
    "planCode": "founder",
    "planName": "Kurucu Üye",
    "remainingAnalysisCount": 9999
  },
  "6d5bd708687b4e43841417d3f633c204eb0d6f38fa2188af391bdfbf70223494": {
    "planCode": "founder",
    "planName": "Kurucu Üye",
    "remainingAnalysisCount": 9999
  },
  "b1815e0b6801061a3dc77efba12eb3c4d27c0ecfef51490ba7dc286b4f6c6340": {
    "planCode": "diamond",
    "planName": "Diamond Paket",
    "remainingAnalysisCount": 50
  },
  "c950f3d3f72d1a2c51d582f0f907611753bc1c30caa3d78bcf4c90ce51a67116": {
    "planCode": "diamond",
    "planName": "Diamond Paket",
    "remainingAnalysisCount": 50
  },
  "fc048150686974c734a729e95c17463cda8779d00ba573b099b9a865b89e11a1": {
    "planCode": "diamond",
    "planName": "Diamond Paket",
    "remainingAnalysisCount": 50
  },
  "7c36216aba3befd142477a671d29d0bcb41ebedf0ddb5f2eea288cc0ad8aa497": {
    "planCode": "gold",
    "planName": "Gold Paket",
    "remainingAnalysisCount": 25
  },
  "f8e38c5484e6ab2e5e31a1b137296044d22ec2973f62ad533615240a6bf15dae": {
    "planCode": "gold",
    "planName": "Gold Paket",
    "remainingAnalysisCount": 25
  },
  "26f9791481d49d93316e4d9059e1e3426d4664df7300e5a3506852a14c0e9dad": {
    "planCode": "gold",
    "planName": "Gold Paket",
    "remainingAnalysisCount": 25
  },
  "2deb19baf472497bf6061bd9a9d70ea9a3aed64ab49bebdd1487b2d08186690f": {
    "planCode": "premium",
    "planName": "Premium Paket",
    "remainingAnalysisCount": 100
  },
  "a4771e2bd3ee8c598d5fb15655845ccd72a83887cc227cd4a16ad340acfc8b80": {
    "planCode": "premium",
    "planName": "Premium Paket",
    "remainingAnalysisCount": 100
  },
  "fb0e56cabd621a033f03be29be8e65adc258420e7e6e9d3a9b02ce134ac361bf": {
    "planCode": "premium",
    "planName": "Premium Paket",
    "remainingAnalysisCount": 100
  },
  "72a3d85246bd1e04aa877ffed6584fe15e4970fb80d9513a7579de5a2372bda1": {
    "planCode": "gift",
    "planName": "Hediyelik Kod",
    "remainingAnalysisCount": 10
  },
  "1b42bae60f528f26ae3e0427237b1a0a76e7311acc30ad6c8171a57d9fc7d019": {
    "planCode": "gift",
    "planName": "Hediyelik Kod",
    "remainingAnalysisCount": 10
  },
  "15f6e3b9fa29d79e8abad020db1dfeab5b9fc223828ecab38a7960bc58bd46ea": {
    "planCode": "gift",
    "planName": "Hediyelik Kod",
    "remainingAnalysisCount": 10
  }
};

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLocaleUpperCase("tr-TR");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readEnvCodes() {
  const envHashes = String(process.env.MEMBERSHIP_CODE_HASHES || "")
    .split(/[\n,;]+/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const envPlainCodes = String(process.env.MEMBERSHIP_CODES || "")
    .split(/[\n,;]+/)
    .map(normalizeCode)
    .filter(Boolean)
    .map(sha256);

  const extra = {};

  for (const hash of [...envHashes, ...envPlainCodes]) {
    extra[hash] = {
      planCode: "premium",
      planName: "Premium Paket",
      remainingAnalysisCount: 100
    };
  }

  return extra;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Sadece POST isteği kabul edilir." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const code = normalizeCode(body.code);

    if (!code) {
      return res.status(400).json({ ok: false, message: "Kod boş olamaz." });
    }

    const codeHash = sha256(code);
    const codeInfo = CODE_DATABASE[codeHash] || readEnvCodes()[codeHash];

    if (!codeInfo) {
      return res.status(401).json({ ok: false, message: "Kod hatalı veya aktif değil." });
    }

    return res.status(200).json({
      ok: true,
      message: `${codeInfo.planName} kabul edildi. Üyelik aktif.`,
      membership: {
        planCode: codeInfo.planCode,
        planName: codeInfo.planName,
        remainingAnalysisCount: codeInfo.remainingAnalysisCount
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Backend kod kontrolünde hata oluştu." });
  }
};
