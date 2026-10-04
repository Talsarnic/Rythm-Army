import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sprites = path.join(root, "public/assets/sprites");
await mkdir(sprites, { recursive: true });

const ink = "#241b23";
const palette = {
  skin: "#c98556", skinShade: "#98533f", skinLight: "#e5a56d",
  cloth: "#3d5960", clothShade: "#283a43", clothLight: "#819083",
  leather: "#805039", leatherShade: "#56362f", leatherLight: "#b47743",
  gold: "#d19743", goldLight: "#f1c76d", steel: "#879391", steelLight: "#cad0bd",
  red: "#a84f3b", cyan: "#54bbc1", ivory: "#ece1bd", violet: "#76659a",
};

const gear = {
  banner: { texture: "bannerkin", weapons: [null], shields: [null], rows: 4 },
  aegis: { texture: "aegiskin", weapons: ["wood", "iron", "flame", "divine"], shields: ["wood", "iron", "tower", "core"], rows: 16 },
  bow: { texture: "bowkin", weapons: ["wood", "recurve", "great", "cyclone"], shields: [null], rows: 4 },
  kiba: { texture: "kibakin", weapons: ["wood", "iron", "fang", "storm"], shields: [null], rows: 4 },
  deka: { texture: "dekakin", weapons: ["wood", "iron", "crusher", "divine"], shields: [null], rows: 4 },
  mega: { texture: "megakin", weapons: ["wood", "iron", "sonic", "divine"], shields: [null], rows: 4 },
  tori: { texture: "torikin", weapons: ["wood", "iron", "fang", "storm"], shields: [null], rows: 4 },
  maho: { texture: "mahokin", weapons: ["wood", "flame", "thunder", "divine"], shields: [null], rows: 4 },
  robo: { texture: "robokin", weapons: ["wood", "iron", "crusher", "divine"], shields: [null], rows: 4 },
};

const r = (x, y, w, h, color, opacity = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"${opacity === 1 ? "" : ` opacity="${opacity}"`}/>`;
const p = (points, color) =>
  `<path d="M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z" fill="${color}"/>`;
const line = (points, color, width = 2) =>
  `<path d="M${points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="square" shape-rendering="crispEdges"/>`;

const itemColors = {
  wood: ["#6b412e", "#a06a3c", "#dfaa5d", "#f0cb81"],
  iron: ["#475257", "#87918e", "#cad1c2", "#f2e8c9"],
  flame: ["#713b36", "#c2563e", "#f39a4e", "#ffe08a"],
  divine: ["#805329", "#d19743", "#ffe09a", "#fff2d5"],
  fang: ["#775541", "#c9a77a", "#f0dfb4", "#fff2d5"],
  storm: ["#28546a", "#3187a3", "#63c7ce", "#d5fff0"],
  recurve: ["#4c593f", "#89915a", "#d4bd7d", "#f1e3b5"],
  great: ["#473b39", "#856447", "#d5a45e", "#ffe2a3"],
  cyclone: ["#315264", "#4a8b9c", "#79d1cd", "#e0fff1"],
  crusher: ["#49343a", "#80565b", "#c27664", "#f0bd86"],
  sonic: ["#315465", "#438ba2", "#7bd0d2", "#e6fff0"],
  thunder: ["#42436b", "#7479bd", "#a9caff", "#ffffff"],
  core: ["#254957", "#348996", "#69d8ce", "#e1fff0"],
  tower: ["#493c39", "#76584b", "#b28b66", "#e8d4ad"],
};

function drawHelmet(kind, cls) {
  const isRobot = cls === "robo";
  const metal = kind !== "leather";
  const dark = isRobot ? "#303b40" : metal ? "#46545a" : "#56362f";
  const mid = isRobot ? "#657a78" : metal ? "#879391" : "#805039";
  const light = isRobot ? "#c2c9b2" : metal ? "#cad0bd" : "#b47743";
  const cap = p([[43, 47], [44, 34], [51, 25], [60, 21], [74, 23], [83, 31], [86, 44], [80, 52], [48, 52]], ink)
    + p([[47, 42], [48, 35], [54, 28], [61, 25], [73, 27], [80, 33], [82, 42], [77, 47], [50, 47]], dark)
    + p([[51, 36], [56, 29], [63, 28], [71, 30], [77, 36], [69, 38], [55, 36]], mid)
    + r(53, 30, 7, 3, light) + r(69, 31, 7, 3, metal ? light : dark)
    + r(47, 43, 36, 5, kind === "leather" ? "#56362f" : "#536168")
    + r(50, 44, 6, 2, kind === "leather" ? palette.gold : light)
    + r(74, 44, 6, 2, kind === "leather" ? palette.gold : light);
  const details = kind === "leather"
    ? line([[55, 31], [55, 38], [58, 40]], "#e1ad6a", 2) + r(69, 34, 4, 2, "#422b2b")
    : r(51, 35, 3, 2, light) + r(77, 37, 3, 2, light) + r(49, 46, 3, 2, palette.goldLight) + r(78, 46, 3, 2, palette.goldLight);
  let helm = cap + details;
  if (kind === "great") {
    helm = p([[39, 51], [40, 34], [47, 22], [59, 18], [75, 20], [86, 30], [90, 43], [87, 57], [80, 64], [45, 61]], ink)
      + p([[44, 46], [45, 35], [52, 26], [60, 23], [73, 25], [82, 33], [85, 44], [82, 54], [77, 58], [49, 56]], dark)
      + p([[49, 39], [54, 28], [66, 26], [78, 33], [82, 43], [75, 47], [51, 45]], mid)
      + p([[48, 46], [83, 45], [81, 55], [76, 59], [50, 57], [45, 53]], "#37464c")
      + r(51, 48, 10, 3, palette.goldLight) + r(68, 48, 10, 3, palette.goldLight)
      + r(62, 46, 4, 12, light) + r(59, 56, 10, 3, mid)
      + r(49, 53, 3, 2, palette.gold) + r(76, 53, 3, 2, palette.gold);
  } else if (kind === "crown") {
    helm += p([[48, 31], [47, 22], [55, 27], [58, 16], [64, 25], [69, 14], [74, 25], [82, 21], [78, 34]], ink)
      + p([[51, 29], [51, 25], [57, 29], [59, 20], [64, 29], [69, 19], [73, 29], [78, 25], [76, 31]], palette.goldLight)
      + r(62, 32, 7, 7, "#9d493b") + r(64, 33, 3, 3, "#f0a15d")
      + r(54, 39, 7, 2, "#ffe091") + r(69, 39, 6, 2, "#ffe091");
  } else if (kind === "iron") {
    helm += r(61, 26, 4, 13, light) + r(57, 35, 13, 3, light);
  }
  if (cls === "tori") {
    helm += p([[46, 46], [39, 44], [44, 52], [49, 50]], dark)
      + r(47, 47, 4, 2, light);
  }
  return helm;
}

function drawShield(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  const shape = kind === "tower"
    ? [[15, 60], [45, 57], [52, 64], [50, 91], [33, 107], [16, 95], [12, 72]]
    : [[17, 62], [40, 58], [52, 68], [49, 89], [34, 101], [18, 91], [12, 75]];
  return `<g transform="translate(0 ${bob})">${p(shape, ink)}${p(shape.map(([x, y]) => [x + 4, y + 4]), dark)}
    ${p([[21, 68], [38, 65], [45, 71], [43, 86], [33, 94], [21, 87]], mid)}
    ${p([[23, 69], [34, 67], [39, 70], [31, 73], [22, 75]], light)}
    ${kind === "wood" || kind === "tower" ? `${r(29, 69, 3, 22, dark)}${r(22, 79, 22, 3, dark)}` : `${r(30, 70, 3, 18, shine)}${r(24, 78, 17, 2, shine)}`}
    ${r(31, 77, 5, 7, shine)}${r(32, 79, 3, 3, palette.gold)}
    ${r(20, 72, 2, 2, palette.goldLight)}${r(43, 72, 2, 2, palette.goldLight)}
  </g>`;
}

function drawSpear(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  return `<g transform="translate(0 ${bob})">
    ${p([[80, 86], [84, 88], [114, 27], [110, 24]], ink)}
    ${p([[82, 84], [84, 85], [112, 27], [110, 26]], dark)}${p([[83, 81], [85, 82], [109, 29], [108, 28]], mid)}
    ${p([[99, 48], [103, 40], [106, 42], [102, 50]], palette.gold)}
    ${p([[108, 37], [112, 29], [115, 31], [111, 39]], palette.goldLight)}
    ${p([[104, 37], [109, 20], [121, 8], [120, 28], [114, 41], [108, 44]], dark)}
    ${p([[108, 35], [112, 22], [119, 13], [117, 30], [112, 38]], mid)}
    ${p([[112, 26], [119, 14], [116, 29], [112, 34]], light)}
    ${r(110, 24, 3, 4, shine)}${r(83, 80, 5, 2, palette.leatherLight)}
  </g>`;
}

function drawSword(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  const flaming = kind === "flame";
  return `<g transform="translate(0 ${bob})">
    ${p([[81, 83], [85, 87], [114, 32], [110, 29]], ink)}
    ${p([[83, 82], [85, 83], [112, 31], [110, 30]], dark)}
    ${p([[84, 78], [86, 79], [110, 32], [108, 32]], light)}
    ${p([[108, 34], [112, 16], [122, 8], [120, 28], [114, 37]], ink)}
    ${p([[111, 31], [114, 17], [120, 12], [117, 28], [113, 34]], mid)}
    ${p([[114, 24], [119, 14], [116, 29]], shine)}
    ${p([[78, 79], [84, 82], [87, 77], [81, 75]], dark)}${r(80, 78, 5, 3, palette.gold)}
    ${flaming ? p([[116, 19], [118, 9], [123, 16], [121, 22], [124, 27], [118, 27]], "#f39a4e") : ""}
    ${kind === "divine" ? `${r(108, 23, 3, 3, shine)}${r(114, 27, 3, 2, palette.goldLight)}` : ""}
  </g>`;
}

function drawBow(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  const wide = kind === "great" || kind === "cyclone";
  const limb = wide ? 6 : 4;
  return `<g transform="translate(0 ${bob})">
    ${line([[88, 31], [96, 39], [101, 52], [101, 66], [95, 79], [87, 85]], ink, limb + 4)}
    ${line([[88, 31], [96, 39], [101, 52], [101, 66], [95, 79], [87, 85]], mid, limb)}
    ${line([[89, 33], [96, 41], [99, 53], [99, 66], [94, 77]], light, 2)}
    ${line([[88, 31], [88, 50], [90, 67], [87, 85]], shine, 1)}
    ${r(86, 29, 5, 4, dark)}${r(84, 82, 6, 4, dark)}
    ${kind === "recurve" ? `${r(96, 43, 5, 3, palette.gold)}${r(99, 63, 4, 3, palette.gold)}` : ""}
    ${kind === "cyclone" ? `${r(96, 48, 4, 3, "#63c7ce")}${r(96, 62, 4, 3, "#d5fff0")}` : ""}
    ${kind === "great" ? `${r(91, 38, 5, 3, palette.gold)}${r(97, 71, 5, 3, palette.gold)}` : ""}
  </g>`;
}

function drawClub(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  const size = kind === "crusher" || kind === "divine";
  return `<g transform="translate(0 ${bob})">
    ${p([[79, 85], [83, 88], [111, 38], [107, 35]], ink)}
    ${p([[81, 84], [84, 85], [109, 38], [107, 37]], dark)}${p([[83, 80], [85, 81], [108, 39], [106, 38]], mid)}
    ${p([[101, 39], [103, 24], [112, 19], [121, 25], [124, 38], [117, 47], [105, 45]], ink)}
    ${p(size ? [[101, 38], [103, 22], [114, 17], [123, 25], [126, 39], [117, 48], [104, 46]] : [[104, 36], [106, 25], [114, 22], [121, 27], [122, 37], [116, 43], [106, 42]], dark)}
    ${p([[106, 29], [113, 24], [120, 28], [119, 35], [112, 39], [106, 36]], mid)}
    ${r(108, 28, 5, 3, light)}${r(114, 31, 5, 3, shine)}
    ${kind === "crusher" ? `${p([[101, 25], [98, 17], [107, 21]], light)}${p([[120, 25], [126, 19], [124, 29]], light)}${r(104, 40, 3, 5, shine)}` : ""}
    ${kind === "divine" ? `${r(112, 27, 4, 5, palette.goldLight)}${r(117, 33, 4, 3, shine)}` : ""}
  </g>`;
}

function drawHorn(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  return `<g transform="translate(0 ${bob})">
    ${p([[71, 68], [78, 65], [89, 65], [102, 58], [119, 53], [124, 57], [122, 67], [108, 74], [92, 77], [80, 76]], ink)}
    ${p([[74, 69], [81, 67], [91, 68], [103, 61], [119, 57], [120, 64], [106, 70], [91, 74], [81, 73]], dark)}
    ${p([[82, 68], [94, 68], [105, 62], [118, 59], [115, 64], [104, 68], [93, 72], [83, 72]], mid)}
    ${p([[103, 62], [118, 59], [115, 63], [104, 67]], light)}${r(113, 60, 4, 2, shine)}
    ${p([[75, 67], [83, 64], [88, 68], [86, 75], [79, 76], [74, 72]], dark)}
    ${r(78, 67, 6, 3, light)}${r(84, 72, 4, 2, shine)}
    ${kind === "sonic" ? `${r(116, 57, 4, 3, "#e6fff0")}${r(109, 69, 4, 2, "#7bd0d2")}` : ""}
    ${kind === "divine" ? `${r(101, 64, 3, 7, palette.goldLight)}${r(91, 69, 3, 4, palette.gold)}` : ""}
  </g>`;
}

function drawStaff(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  const glow = kind === "flame" ? "#f39a4e" : kind === "thunder" ? "#a9caff" : "#f1c76d";
  return `<g transform="translate(0 ${bob})">
    ${p([[77, 88], [81, 91], [112, 31], [108, 28]], ink)}
    ${p([[79, 87], [82, 88], [110, 31], [108, 30]], dark)}${p([[81, 82], [83, 83], [107, 32], [105, 31]], mid)}
    ${p([[102, 32], [102, 22], [108, 13], [117, 13], [124, 21], [120, 31], [112, 36]], ink)}
    ${p([[106, 29], [106, 22], [111, 17], [118, 17], [121, 22], [117, 29], [112, 32]], mid)}
    ${p([[108, 23], [112, 19], [118, 20], [116, 25], [111, 27]], light)}
    ${r(110, 21, 5, 4, glow)}${r(111, 22, 2, 2, shine)}
    ${kind === "flame" ? p([[105, 19], [107, 11], [111, 17], [116, 9], [118, 17], [122, 14], [120, 21]], "#e65d3f") : ""}
    ${kind === "thunder" ? `${line([[105, 27], [110, 24], [108, 30], [115, 28]], "#e8efff", 2)}${r(121, 29, 2, 3, "#fff")}` : ""}
    ${kind === "divine" ? `${r(105, 24, 2, 6, palette.goldLight)}${r(119, 20, 3, 5, palette.gold)}` : ""}
  </g>`;
}

function drawArmWeapon(kind, bob) {
  const [dark, mid, light, shine] = itemColors[kind];
  return `<g transform="translate(0 ${bob})">
    ${p([[76, 70], [91, 66], [105, 73], [108, 85], [99, 95], [81, 91], [73, 82]], ink)}
    ${p([[80, 72], [91, 70], [101, 75], [103, 84], [97, 91], [83, 88], [78, 81]], dark)}
    ${p([[83, 74], [92, 72], [99, 77], [100, 83], [94, 86], [84, 84]], mid)}
    ${r(84, 75, 8, 3, light)}${r(92, 79, 7, 4, shine)}
    ${r(78, 80, 4, 7, palette.leather)}${r(81, 86, 5, 3, palette.gold)}
    ${kind === "crusher" ? `${p([[78, 74], [75, 69], [83, 72]], light)}${p([[98, 75], [105, 70], [102, 79]], light)}${r(89, 72, 3, 3, "#e5a56d")}` : ""}
    ${kind === "divine" ? `${r(87, 78, 4, 6, "#f1c76d")}${r(92, 80, 4, 2, "#e1fff0")}` : ""}
  </g>`;
}

function drawWeapon(cls, kind, bob) {
  if (cls === "banner" || !kind) return "";
  if (cls === "aegis") return drawSword(kind, bob);
  if (cls === "bow") return drawBow(kind, bob);
  if (cls === "kiba" || cls === "tori") return drawSpear(kind, bob);
  if (cls === "deka") return drawClub(kind, bob);
  if (cls === "mega") return drawHorn(kind, bob);
  if (cls === "maho") return drawStaff(kind, bob);
  return drawArmWeapon(kind, bob);
}

function drawBanner() {
  return `${p([[23, 17], [28, 17], [30, 70], [26, 73]], ink)}${r(25, 21, 2, 47, "#b27a43")}
    ${p([[28, 18], [52, 15], [49, 42], [29, 39]], ink)}
    ${p([[30, 20], [49, 18], [46, 39], [30, 36]], "#a9473b")}
    ${p([[33, 22], [47, 20], [42, 28], [47, 34], [33, 33]], "#d46b4e")}
    ${r(35, 26, 7, 2, palette.goldLight)}${r(38, 23, 2, 8, palette.goldLight)}
    ${r(27, 17, 3, 3, palette.goldLight)}`;
}

function drawHorse(bob, frame) {
  const step = frame % 2;
  return `${p([[24, 83], [31, 71], [44, 66], [75, 68], [92, 74], [103, 85], [97, 101], [83, 111], [40, 111], [26, 101]], ink)}
    ${p([[29, 83], [35, 75], [48, 70], [74, 72], [89, 77], [97, 86], [92, 99], [80, 106], [43, 106], [31, 98]], "#754b3b")}
    ${p([[38, 77], [49, 73], [73, 74], [88, 80], [91, 86], [76, 83], [52, 81], [37, 85]], "#a86b45")}
    ${p([[86, 78], [96, 69], [108, 70], [117, 78], [113, 91], [102, 98], [91, 92]], ink)}
    ${p([[90, 79], [98, 73], [108, 74], [113, 80], [109, 89], [101, 93], [93, 89]], "#a86b45")}
    ${p([[98, 73], [96, 63], [101, 70], [108, 73], [113, 66], [112, 77]], "#56362f")}
    ${r(108, 80, 3, 3, ink)}${r(113, 86, 3, 3, "#3d2a31")}
    ${p([[34, 98], [44, 99], [43 + step, 117], [36 + step, 117]], ink)}
    ${p([[52, 101], [61, 102], [58 - step, 117], [51 - step, 117]], ink)}
    ${p([[75, 101], [84, 100], [87 + step, 116], [80 + step, 117]], ink)}
    ${p([[90, 95], [98, 92], [104 - step, 108], [99 - step, 112]], ink)}
    ${r(37 + step, 103, 5, 11, "#614038")}${r(52 - step, 104, 5, 10, "#614038")}
    ${r(81 + step, 103, 5, 10, "#614038")}${r(97 - step, 97, 4, 10, "#614038")}
    ${p([[26, 79], [19, 71], [21, 87], [29, 94]], ink)}${r(22, 78, 5, 3, "#c0814c")}
    ${p([[50, 72], [58, 66], [70, 68], [80, 74], [74, 78], [61, 76]], "#3d5960")}
    ${r(56, 73, 19, 3, "#d19743")}${r(62, 72, 6, 9, "#f1c76d")}`;
}

function drawWings() {
  return `${p([[45, 68], [32, 57], [19, 45], [13, 35], [17, 34], [14, 24], [22, 29], [23, 18], [31, 29], [38, 27], [43, 38], [51, 47], [55, 61]], ink)}
    ${p([[43, 65], [32, 55], [20, 43], [17, 36], [24, 40], [20, 30], [29, 36], [27, 25], [35, 36], [41, 36], [46, 45], [51, 58]], "#697c78")}
    ${p([[42, 62], [33, 53], [25, 45], [29, 47], [25, 39], [35, 45], [40, 48], [47, 59]], "#d0c7a4")}
    ${p([[78, 68], [90, 57], [106, 45], [114, 34], [110, 33], [116, 24], [107, 28], [108, 18], [99, 29], [92, 26], [86, 37], [77, 47], [74, 61]], ink)}
    ${p([[80, 65], [91, 55], [106, 43], [111, 36], [104, 40], [111, 30], [100, 36], [103, 25], [94, 36], [88, 36], [82, 45], [77, 58]], "#697c78")}
    ${p([[81, 62], [91, 53], [101, 45], [97, 47], [102, 39], [92, 45], [86, 49], [79, 59]], "#d0c7a4")}`;
}

function drawQuiver() {
  return `${p([[29, 47], [41, 44], [49, 61], [44, 78], [32, 77], [26, 62]], ink)}
    ${p([[32, 50], [40, 48], [45, 62], [41, 73], [34, 73], [30, 62]], "#805039")}
    ${r(34, 52, 3, 15, "#b47743")}${r(38, 50, 3, 15, "#d19743")}
    ${p([[31, 53], [34, 43], [37, 52]], ink)}${p([[37, 51], [41, 41], [43, 51]], ink)}${p([[42, 55], [47, 46], [47, 57]], ink)}`;
}

function classBody(cls, frame, helmet, weapon, shield) {
  const bob = [0, 1, 0, -1][frame];
  const step = frame % 2;

  const wide = cls === "aegis" || cls === "deka";
  const torso = wide
    ? [[36, 62], [45, 55], [78, 55], [91, 63], [96, 79], [88, 101], [76, 107], [46, 103], [33, 89]]
    : cls === "maho"
      ? [[45, 61], [54, 55], [75, 55], [84, 65], [91, 97], [80, 111], [47, 108], [35, 96], [39, 72]]
      : [[43, 63], [52, 56], [75, 56], [85, 64], [91, 82], [83, 101], [75, 105], [47, 101], [36, 91], [38, 73]];
  const accent = cls === "banner" ? "#744034" : cls === "bow" ? "#526044" : cls === "aegis" ? "#53666a" : cls === "deka" ? "#634347" : cls === "mega" ? "#785737" : cls === "tori" ? "#657b78" : cls === "maho" ? "#45405f" : "#566969";
  const cloth = cls === "banner" ? "#ad4a3d" : cls === "bow" ? "#718056" : cls === "aegis" ? "#63777a" : cls === "deka" ? "#87524d" : cls === "mega" ? "#a37943" : cls === "tori" ? "#8eaa9e" : cls === "maho" ? "#6f5e92" : "#84918a";
  const highlight = cls === "banner" ? "#d87a52" : cls === "bow" ? "#a3a369" : cls === "aegis" ? "#a4b0a4" : cls === "deka" ? "#c17b62" : cls === "mega" ? "#e0bd69" : cls === "tori" ? "#d7d6b8" : cls === "maho" ? "#a691c5" : "#c8cbb9";
  const shadow = r(45, 112 - bob, 6, 2, ink, .3) + r(51, 114 - bob, 28, 3, ink, .4) + r(79, 112 - bob, 6, 2, ink, .3);
  const legs = cls === "maho"
    ? `${p([[48, 90], [61, 92], [61, 109], [54, 114], [44, 110]], ink)}${p([[67, 92], [80, 89], [86, 108], [81, 114], [69, 110]], ink)}${r(49, 96, 8, 13, "#533d39")}${r(70, 95, 8, 14, "#533d39")}`
    : `${p([[45, 87], [61, 88], [63, 108], [58, 114], [42, 111]], ink)}${p([[68, 88], [83, 85], [88, 107], [82, 114], [68, 109]], ink)}${p([[48, 90], [58, 91], [60, 107], [56, 111], [45, 108]], "#684238")}${p([[71, 91], [80, 89], [84, 106], [80, 110], [71, 107]], "#684238")}${r(48 + step, 97, 6, 3, "#b47743")}${r(73 - step, 98, 6, 3, "#b47743")}`;

  const arms = `${p([[40, 64], [49, 65], [53, 76], [47, 86], [40, 90], [32, 86], [34, 75]], ink)}${p([[41, 68], [47, 68], [49, 76], [44, 82], [38, 85], [35, 82], [38, 75]], "#98533f")}${p([[75, 64], [84, 64], [94, 75], [91, 86], [83, 90], [76, 82]], ink)}${p([[78, 67], [83, 68], [90, 76], [88, 83], [82, 84], [78, 78]], "#c98556")}${r(85, 76, 6, 4, "#e5a56d")}`;
  const body = `${cls === "kiba" ? "" : shadow}${cls === "kiba" ? "" : legs}${arms}
    ${p(torso, ink)}
    ${p(torso.map(([x, y]) => [x + 4, y + 4]), accent)}
    ${p([[49, 67], [56, 62], [72, 62], [81, 68], [84, 81], [77, 95], [53, 94], [44, 86], [45, 74]], cloth)}
    ${p([[51, 68], [57, 63], [69, 63], [76, 68], [69, 71], [52, 72]], highlight)}
    ${r(48, 75, 4, 11, highlight)}${r(52, 78, 3, 5, "#c0b089")}
    ${p([[44, 88], [80, 91], [78, 98], [49, 96], [39, 93]], "#56362f")}
    ${r(53, 91, 23, 3, "#805039")}${r(61, 90, 8, 6, "#945528")}${r(63, 91, 4, 3, "#f1c76d")}
    ${p([[75, 92], [84, 93], [84, 103], [76, 101]], "#56362f")}${r(78, 94, 4, 4, "#b47743")}`;

  let unique = "";
  if (cls === "banner") unique = `${p([[41, 66], [49, 66], [53, 72], [48, 80], [42, 79]], ink)}${r(43, 71, 6, 6, "#c98556")}${r(40, 77, 8, 4, "#805039")}`;
  if (cls === "aegis") unique = `${p([[39, 70], [49, 68], [53, 76], [48, 82], [40, 81]], "#46545a")}${p([[76, 66], [87, 66], [93, 75], [90, 83], [80, 82]], "#46545a")}${p([[42, 71], [48, 70], [50, 74], [45, 77]], "#cad0bd")}`;
  if (cls === "bow") unique = `${p([[46, 66], [52, 61], [60, 63], [59, 71], [51, 75]], "#526044")}${r(48, 67, 5, 2, "#d4bd7d")}`;
  if (cls === "deka") unique = `${p([[36, 61], [47, 55], [55, 59], [53, 71], [43, 75], [35, 69]], ink)}${p([[38, 62], [47, 58], [51, 61], [49, 68], [41, 71]], "#a65e55")}${r(40, 63, 6, 3, "#e0a06e")}${p([[74, 60], [86, 57], [94, 65], [91, 74], [81, 76]], ink)}${p([[77, 62], [85, 61], [90, 66], [87, 71], [80, 72]], "#a65e55")}`;
  if (cls === "mega") unique = `${p([[46, 63], [55, 59], [62, 64], [59, 73], [51, 75]], "#785737")}${r(50, 64, 7, 3, "#e0bd69")}${r(54, 74, 3, 12, "#d19743")}`;
  if (cls === "tori") unique = "";
  if (cls === "maho") unique = `${p([[43, 70], [52, 64], [56, 70], [52, 80], [46, 84]], "#45405f")}${p([[74, 69], [82, 67], [87, 77], [82, 85], [76, 80]], "#45405f")}${r(51, 74, 3, 11, "#a691c5")}${r(76, 79, 4, 5, "#76659a")}`;
  if (cls === "robo") unique = `${p([[43, 63], [51, 58], [59, 63], [57, 75], [49, 79], [42, 73]], ink)}${p([[46, 64], [52, 62], [56, 66], [54, 72], [48, 74]], "#657a78")}${r(48, 67, 3, 3, "#e5a64e")}${r(78, 67, 8, 6, "#46545a")}${r(80, 68, 4, 2, "#cad0bd")}`;

  let head;
  if (cls === "robo") {
    head = `${p([[48, 36], [55, 30], [73, 30], [81, 37], [80, 59], [73, 67], [53, 65], [47, 57]], ink)}${p([[52, 37], [57, 34], [71, 34], [77, 39], [76, 56], [70, 62], [55, 60], [51, 54]], "#657a78")}${r(54, 43, 7, 5, "#e6a84e")}${r(68, 43, 7, 5, "#e6a84e")}${r(56, 44, 3, 3, ink)}${r(70, 44, 3, 3, ink)}${r(59, 56, 12, 3, "#303b40")}${r(54, 36, 7, 2, "#cad0bd")}`;
  } else if (cls === "tori") {
    head = `${p([[47, 39], [53, 33], [70, 32], [80, 39], [79, 58], [71, 67], [54, 64], [48, 57]], ink)}${p([[51, 40], [56, 36], [69, 35], [76, 40], [75, 55], [69, 62], [56, 60], [52, 54]], "#d0c7a4")}${p([[66, 49], [81, 51], [92, 56], [82, 62], [68, 59]], ink)}${p([[69, 51], [82, 53], [87, 56], [81, 59], [68, 57]], "#d19743")}${r(57, 45, 7, 4, "#f4ddb1")}${r(59, 46, 3, 3, ink)}${r(61, 39, 3, 3, "#718056")}`;
  } else {
    head = `${p([[47, 39], [54, 33], [74, 34], [82, 42], [81, 62], [75, 71], [66, 74], [55, 71], [47, 63]], ink)}${p([[51, 41], [56, 37], [72, 37], [78, 43], [77, 60], [72, 67], [65, 69], [57, 67], [51, 61]], "#c98556")}${p([[51, 52], [57, 56], [58, 65], [65, 69], [56, 67], [51, 61]], "#98533f")}${r(55, 47, 7, 4, "#f4ddb1")}${r(69, 47, 7, 4, "#f4ddb1")}${r(58, 48, 3, 4, ink)}${r(71, 48, 3, 4, ink)}${r(57, 45, 8, 2, "#56362f")}${r(68, 45, 8, 2, "#56362f")}${r(63, 57, 3, 5, "#98533f")}${r(65, 58, 3, 2, "#e5a56d")}${r(62, 65, 9, 2, "#98533f")}`;
  }

  let specialBack = "";
  if (cls === "banner") specialBack = drawBanner();
  else if (cls === "bow") specialBack = drawQuiver();
  else if (cls === "tori") specialBack = drawWings();
  else if (cls === "kiba") specialBack = drawHorse(bob, frame);

  const leftArmHand = `${p([[40, 68], [48, 68], [52, 73], [49, 79], [45, 82], [41, 89], [36, 94], [29, 93], [27, 89], [31, 82], [36, 77], [36, 72]], ink)}${p([[41, 71], [47, 71], [48, 74], [44, 79], [41, 85], [36, 91], [31, 90], [31, 88], [35, 82], [39, 77]], "#c98556")}${p([[38, 77], [46, 78], [42, 85], [36, 87], [33, 84]], "#56362f")}${p([[39, 78], [43, 79], [41, 83], [36, 85]], "#b47743")}${r(39, 78, 5, 2, "#f1c76d")}${p([[33, 84], [40, 86], [38, 91], [34, 94], [29, 92], [28, 89]], "#98533f")}${r(31, 86, 6, 4, "#e5a56d")}`;
  const faceEyes = cls === "robo"
    ? `${r(54, 44, 8, 5, "#f1c76d")}${r(69, 44, 8, 5, "#f1c76d")}${r(56, 45, 4, 3, "#e6a84e")}${r(71, 45, 4, 3, "#e6a84e")}`
    : cls === "tori"
      ? `${r(56, 52, 4, 3, "#f4ddb1")}${r(58, 52, 2, 3, ink)}`
      : helmet === "great"
        ? `${r(52, 48, 29, 4, "#303b40")}${r(56, 49, 6, 2, "#f1c76d")}${r(70, 49, 6, 2, "#f1c76d")}${r(58, 49, 2, 2, ink)}${r(72, 49, 2, 2, ink)}`
        : `${r(54, 53, 6, 3, "#f4ddb1")}${r(57, 53, 2, 3, ink)}${r(68, 53, 6, 3, "#f4ddb1")}${r(71, 53, 2, 3, ink)}`;

  return `<g transform="translate(0 ${bob})">
    ${specialBack}${body}${cls === "banner" ? "" : leftArmHand}${head}
    ${unique}
    ${cls === "banner" ? `${r(50, 67, 7, 3, "#d19743")}${r(55, 68, 8, 3, "#f1c76d")}` : ""}
    ${cls === "aegis" ? `${p([[53, 74], [72, 73], [77, 79], [74, 88], [69, 92], [54, 87], [50, 80]], ink)}${p([[56, 76], [70, 75], [73, 79], [70, 86], [67, 88], [56, 84]], "#53696a")}${r(57, 78, 13, 3, "#a4b0a4")}${r(61, 82, 7, 5, "#d19743")}` : ""}
    ${cls === "bow" ? `${r(52, 76, 3, 8, "#526044")}${r(57, 79, 3, 6, "#718056")}` : ""}
    ${cls === "deka" ? `${p([[38, 64], [47, 59], [54, 63], [51, 72], [43, 75]], "#a65e55")}${r(41, 64, 6, 3, "#f0bd86")}` : ""}
    ${cls === "mega" ? `${r(53, 74, 4, 11, "#d19743")}${r(54, 75, 2, 5, "#f1c76d")}` : ""}
    ${cls === "maho" ? `${p([[45, 69], [53, 65], [57, 72], [52, 81], [46, 84]], "#45405f")}${r(48, 72, 4, 11, "#a691c5")}` : ""}
    ${cls === "robo" ? `${r(45, 65, 10, 7, "#46545a")}${r(47, 67, 3, 2, "#e5a64e")}` : ""}
    ${drawHelmet(helmet, cls)}
    ${faceEyes}
    ${cls === "aegis" ? drawShield(shield, 0) : ""}
    ${drawWeapon(cls, weapon, 0)}
  </g>`;
}

function drawClass(cls, helmet, weapon, shield, frame) {
  return classBody(cls, frame, helmet, weapon, shield);
}

function svg(content, width, height) {
  const compact = content.replace(/[ \t]+(?=\r?\n)/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${compact}</svg>`;
}

const atlasOutputs = [];
for (const [cls, config] of Object.entries(gear)) {
  const cells = [];
  const weapons = config.weapons;
  const shields = config.shields;
  for (let helmetIndex = 0; helmetIndex < 4; helmetIndex += 1) {
    for (let shieldIndex = 0; shieldIndex < shields.length; shieldIndex += 1) {
      for (let weaponIndex = 0; weaponIndex < weapons.length; weaponIndex += 1) {
        for (let frame = 0; frame < 4; frame += 1) {
          const row = cls === "aegis" ? helmetIndex * shields.length + shieldIndex : helmetIndex;
          const column = weaponIndex * 4 + frame;
          const art = drawClass(cls, ["leather", "iron", "great", "crown"][helmetIndex], weapons[weaponIndex], shields[shieldIndex], frame);
          cells.push(`<g transform="translate(${column * 128} ${row * 128})">${art}</g>`);
        }
      }
    }
  }
  const texture = `${config.texture}-loadouts`;
  const height = config.rows * 128;
  const atlas = svg(cells.join(""), 2048, height);
  await writeFile(path.join(sprites, `${texture}.svg`), atlas);

  const defaultFrames = Array.from({ length: 4 }, (_, frame) => drawClass(cls, "leather", weapons[0], shields[0], frame));
  const idle = defaultFrames.map((art, frame) => `<g transform="translate(${frame * 128} 0)">${art}</g>`).join("");
  const portrait = defaultFrames[0];
  const oldName = config.texture.replace("kin", "kin").replace("banner", "banner");
  const idleName = `${oldName}-idle.svg`;
  const portraitName = `${oldName}-portrait.svg`;
  await writeFile(path.join(sprites, idleName), svg(idle, 512, 128));
  await writeFile(path.join(sprites, portraitName), svg(portrait, 128, 128));
  atlasOutputs.push({ cls, texture, atlas, rows: config.rows, idle, portrait });
}

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
try {
  for (const output of atlasOutputs) {
    const width = 1536;
    const height = output.rows * 96;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.setContent(`<html><head><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}svg{display:block!important;width:${width}px!important;height:${height}px!important}</style></head><body>${output.atlas}</body></html>`);
    await page.screenshot({ path: path.join(sprites, `${output.texture}.png`), omitBackground: true });
    await page.close();

    const idlePage = await browser.newPage({ viewport: { width: 512, height: 128 }, deviceScaleFactor: 1 });
    await idlePage.setContent(`<html><head><style>html,body{margin:0;width:512px;height:128px;overflow:hidden}svg{display:block!important;width:512px!important;height:128px!important}</style></head><body>${svg(output.idle, 512, 128)}</body></html>`);
    const stem = output.texture.replace("-loadouts", "");
    await idlePage.screenshot({ path: path.join(sprites, `${stem}-idle.png`), omitBackground: true });
    await idlePage.close();

    const portraitPage = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 1 });
    await portraitPage.setContent(`<html><head><style>html,body{margin:0;width:128px;height:128px;overflow:hidden}svg{display:block!important;width:128px!important;height:128px!important}</style></head><body>${svg(output.portrait, 128, 128)}</body></html>`);
    await portraitPage.screenshot({ path: path.join(sprites, `${stem}-portrait.png`), omitBackground: true });
    await portraitPage.close();
  }
} finally {
  await browser.close();
}

console.log("Generated 180 equipment-aware unit loadouts across 9 classes.");
