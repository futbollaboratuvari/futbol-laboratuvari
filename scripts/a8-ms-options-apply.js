const fs = require("fs");

function patchMarketRules(filePath, block, checkText) {
  let text = fs.readFileSync(filePath, "utf8");
  if (text.includes(checkText)) {
    console.log(`${filePath}: MS options already exist`);
    return false;
  }
  if (!text.includes("const marketRules = {")) {
    throw new Error(`${filePath}: marketRules marker not found`);
  }
  text = text.replace("const marketRules = {", `const marketRules = {\n${block}`);
  fs.writeFileSync(filePath, text, "utf8");
  console.log(`${filePath}: MS options added`);
  return true;
}

const couponBlock = `  ms1: {
    label: "MS 1",
    keys: ["ms1", "homeWin", "home_win", "macSonucu1", "ms_1"],
    minOdd: 1.25,
    maxOdd: 6.50,
    boost: 8,
    riskAdd: 5,
    scores: ["1-0", "2-0", "2-1"],
    signals: ["MS 1 secenegi kontrol edildi"],
  },
  msx: {
    label: "MS X",
    keys: ["msx", "draw", "beraberlik", "macSonucuX", "ms_x"],
    minOdd: 2.20,
    maxOdd: 5.80,
    boost: 10,
    riskAdd: 9,
    scores: ["0-0", "1-1", "2-2"],
    signals: ["MS X secenegi kontrol edildi"],
  },
  ms2: {
    label: "MS 2",
    keys: ["ms2", "awayWin", "away_win", "macSonucu2", "ms_2"],
    minOdd: 1.25,
    maxOdd: 7.50,
    boost: 9,
    riskAdd: 7,
    scores: ["0-1", "0-2", "1-2"],
    signals: ["MS 2 secenegi kontrol edildi"],
  },
`;

const exactBlock = `  ms1: { label: "MS 1", keys: ["ms1", "homeWin", "home_win", "macSonucu1", "ms_1"], minOdd: 1.25, maxOdd: 6.50, scores: ["1-0", "2-0", "2-1"] },
  msx: { label: "MS X", keys: ["msx", "draw", "beraberlik", "macSonucuX", "ms_x"], minOdd: 2.20, maxOdd: 5.80, scores: ["0-0", "1-1", "2-2"] },
  ms2: { label: "MS 2", keys: ["ms2", "awayWin", "away_win", "macSonucu2", "ms_2"], minOdd: 1.25, maxOdd: 7.50, scores: ["0-1", "0-2", "1-2"] },
`;

patchMarketRules("scripts/robot-coupon-engine.js", couponBlock, "ms1: {");
patchMarketRules("scripts/robot-exact-scoring.js", exactBlock, "ms1: { label: \"MS 1\"");
