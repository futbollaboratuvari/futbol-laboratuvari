const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "robot-exact-scoring.js");
let text = fs.readFileSync(file, "utf8");

text = text.replace("item.hasOdds && item.score >= 65", "item.hasOdds && item.score >= 55");
text = text.replace("odd < 2.40", "odd < 2.00");
text = text.replace("odd < 3.20", "odd < 2.60");

fs.writeFileSync(file, text, "utf8");
console.log("Robot esikleri guncellendi: 55 / 2.00 / 2.60");
