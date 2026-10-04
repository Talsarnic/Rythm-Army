import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sprites = path.join(root, "public/assets/sprites");
await mkdir(sprites, { recursive: true });

const inks = {
  outline: "#241b23",
  shadow: "#3d2a31",
  skinShade: "#98533f",
  skin: "#c98556",
  skinLight: "#e5a56d",
  leatherDeep: "#56362f",
  leather: "#805039",
  leatherLight: "#b47743",
  clothDeep: "#283a43",
  cloth: "#3d5960",
  clothLight: "#688077",
  clothGlint: "#91a080",
  goldDeep: "#945528",
  gold: "#d19743",
  goldLight: "#f1c76d",
  red: "#a84f3b",
  redLight: "#dc7950",
  steelDeep: "#46545a",
  steel: "#879391",
  steelLight: "#cad0bd",
  bone: "#ece1bd",
};

const palette = {
  wood: { dark: "#6b412e", mid: "#a06a3c", light: "#dfaa5d", shine: "#f0cb81" },
  iron: { dark: "#475257", mid: "#87918e", light: "#cad1c2", shine: "#f2e8c9" },
  fang: { dark: "#775541", mid: "#c9a77a", light: "#f0dfb4", shine: "#fff2d5" },
  storm: { dark: "#28546a", mid: "#3187a3", light: "#63c7ce", shine: "#d5fff0" },
};

const rect = (x, y, width, height, fill, opacity) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"${opacity ? ` opacity="${opacity}"` : ""}/>`;

const polygon = (points, fill) =>
  `<path d="M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z" fill="${fill}"/>`;

function spearHead(type) {
  const c = palette[type];
  if (type === "wood") {
    return [
      polygon([[104, 34], [109, 17], [122, 8], [119, 27], [113, 39], [108, 41]], c.dark),
      polygon([[108, 32], [111, 19], [120, 11], [117, 28], [112, 36]], c.mid),
      polygon([[112, 21], [120, 11], [117, 25]], c.light),
      rect(106, 35, 7, 2, c.shine),
    ].join("");
  }
  if (type === "iron") {
    return [
      polygon([[103, 35], [108, 20], [120, 8], [123, 24], [115, 40], [109, 42]], c.dark),
      polygon([[108, 33], [111, 21], [119, 12], [120, 24], [114, 36]], c.mid),
      polygon([[111, 23], [118, 13], [118, 25], [114, 31]], c.light),
      rect(107, 34, 6, 2, c.shine),
      rect(103, 38, 9, 3, c.dark),
    ].join("");
  }
  if (type === "fang") {
    return [
      polygon([[103, 36], [109, 20], [121, 8], [119, 27], [114, 42], [109, 40], [106, 45]], c.dark),
      polygon([[108, 34], [111, 22], [119, 12], [116, 30], [112, 37], [108, 40]], c.mid),
      polygon([[112, 25], [118, 14], [115, 31], [111, 36]], c.light),
      polygon([[109, 38], [114, 35], [112, 43], [108, 46]], c.shine),
      rect(103, 38, 8, 3, c.dark),
      rect(101, 35, 3, 6, inks.gold),
    ].join("");
  }
  return [
    polygon([[103, 35], [108, 19], [121, 7], [121, 26], [114, 41], [108, 42]], c.dark),
    polygon([[108, 34], [111, 21], [119, 11], [118, 27], [113, 37]], c.mid),
    polygon([[111, 24], [118, 14], [116, 26], [112, 32]], c.light),
    polygon([[110, 30], [105, 27], [108, 33], [103, 37], [111, 35]], c.shine),
    rect(105, 37, 8, 2, c.dark),
  ].join("");
}

function spear(type, shift) {
  const c = palette[type];
  return `<g transform="translate(${shift} 0)">
    ${polygon([[78, 83], [82, 86], [113, 27], [109, 25]], inks.outline)}
    ${polygon([[80, 82], [82, 83], [111, 27], [109, 26]], c.dark)}
    ${polygon([[81, 79], [83, 80], [108, 29], [107, 28]], c.mid)}
    ${rect(87, 72, 7, 2, c.light)}${rect(99, 48, 7, 2, c.light)}
    ${polygon([[83, 79], [88, 68], [91, 70], [86, 81]], inks.leatherDeep)}
    ${polygon([[84, 77], [88, 69], [89, 70], [86, 78]], inks.leatherLight)}
    ${polygon([[94, 57], [98, 49], [101, 51], [97, 59]], inks.goldDeep)}
    ${polygon([[95, 56], [98, 50], [99, 51], [97, 56]], inks.goldLight)}
    ${polygon([[105, 37], [109, 29], [112, 31], [108, 39]], inks.goldDeep)}
    ${rect(107, 36, 4, 2, c.dark)}
    ${spearHead(type)}
  </g>`;
}

function helmet(type) {
  if (type === "leather") {
    return `
      ${polygon([[43, 48], [43, 35], [48, 27], [58, 22], [67, 24], [75, 21], [85, 29], [87, 43], [82, 50], [46, 50]], inks.outline)}
      ${polygon([[47, 42], [47, 35], [52, 29], [59, 26], [66, 28], [75, 25], [81, 31], [83, 41], [77, 46], [49, 46]], inks.leather)}
      ${polygon([[51, 34], [56, 29], [63, 29], [67, 34], [57, 36]], inks.leatherLight)}
      ${rect(69, 28, 8, 4, inks.leatherDeep)}${rect(48, 44, 37, 5, inks.leatherDeep)}
      ${rect(52, 44, 6, 2, inks.gold)}${rect(75, 44, 6, 2, inks.gold)}
      ${rect(54, 30, 2, 8, "#d09250")}${rect(58, 28, 5, 2, "#e2ae68")}
      ${rect(68, 32, 5, 2, "#422b2b")}${rect(52, 39, 3, 2, inks.leatherLight)}
      ${polygon([[44, 43], [48, 46], [48, 57], [44, 61], [41, 55]], inks.leatherDeep)}
      ${rect(46, 48, 2, 8, inks.leatherLight)}${rect(43, 54, 3, 3, inks.goldDeep)}`;
  }
  if (type === "iron") {
    return `
      ${polygon([[42, 49], [42, 36], [46, 27], [54, 22], [72, 22], [82, 28], [87, 38], [86, 51], [80, 55], [47, 54]], inks.outline)}
      ${polygon([[46, 42], [46, 35], [50, 29], [56, 25], [71, 25], [79, 30], [83, 39], [82, 47], [77, 50], [50, 50]], inks.steelDeep)}
      ${polygon([[50, 36], [53, 29], [58, 27], [72, 27], [78, 32], [80, 39], [73, 41], [56, 40]], inks.steel)}
      ${polygon([[53, 34], [58, 29], [70, 29], [75, 33], [67, 35]], inks.steelLight)}
      ${rect(46, 43, 37, 6, "#536168")}${rect(50, 44, 28, 2, inks.steelLight)}
      ${polygon([[47, 47], [54, 48], [55, 60], [49, 65], [44, 57]], inks.steelDeep)}
      ${polygon([[77, 46], [83, 43], [85, 55], [80, 63], [76, 58]], inks.steelDeep)}
      ${rect(48, 51, 3, 5, inks.steel)}${rect(79, 49, 3, 6, inks.steel)}
      ${rect(61, 26, 4, 13, inks.steelLight)}${rect(57, 35, 13, 3, inks.steelLight)}
      ${rect(47, 45, 3, 2, inks.goldLight)}${rect(79, 45, 3, 2, inks.goldLight)}
      ${rect(53, 31, 2, 2, "#e5c77e")}${rect(74, 31, 2, 2, "#e5c77e")}
      ${rect(50, 39, 3, 2, inks.steelLight)}${rect(76, 39, 3, 2, inks.steelLight)}`;
  }
  if (type === "great") {
    return `
      ${polygon([[39, 50], [40, 34], [46, 23], [56, 19], [73, 20], [84, 28], [90, 41], [88, 57], [82, 65], [47, 63], [40, 58]], inks.outline)}
      ${polygon([[44, 44], [45, 34], [51, 26], [58, 23], [72, 24], [81, 31], [85, 42], [83, 53], [78, 58], [50, 57], [45, 53]], "#4d5b60")}
      ${polygon([[49, 34], [55, 27], [70, 27], [78, 33], [82, 42], [77, 46], [52, 45]], "#82908d")}
      ${polygon([[47, 45], [83, 44], [82, 53], [77, 59], [50, 57], [46, 53]], "#37464c")}
      ${rect(51, 47, 10, 3, inks.goldLight)}${rect(68, 47, 10, 3, inks.goldLight)}
      ${rect(62, 45, 4, 12, inks.steelLight)}${rect(59, 55, 10, 3, inks.steel)}
      ${polygon([[43, 49], [49, 53], [50, 64], [44, 61], [40, 56]], "#647278")}
      ${polygon([[79, 52], [85, 47], [89, 54], [83, 64], [78, 61]], "#647278")}
      ${rect(48, 31, 5, 4, inks.steelLight)}${rect(76, 35, 5, 4, inks.steelLight)}
      ${rect(47, 43, 4, 2, "#414d54")}${rect(78, 43, 4, 2, "#414d54")}
      ${rect(50, 51, 3, 2, inks.gold)}${rect(76, 51, 3, 2, inks.gold)}
      ${rect(54, 38, 5, 2, "#a5b0a8")}${rect(69, 38, 5, 2, "#a5b0a8")}`;
  }
  return `
    ${polygon([[42, 46], [44, 35], [50, 29], [78, 29], [85, 36], [86, 48], [81, 54], [46, 53]], inks.outline)}
    ${polygon([[47, 42], [48, 36], [53, 33], [76, 33], [81, 38], [81, 46], [77, 49], [50, 49]], inks.goldDeep)}
    ${polygon([[50, 40], [52, 36], [76, 36], [78, 40], [76, 45], [52, 45]], inks.gold)}
    ${rect(52, 36, 7, 3, inks.goldLight)}${rect(69, 36, 7, 3, inks.goldLight)}
    ${rect(45, 45, 39, 5, inks.leatherDeep)}${rect(49, 46, 9, 2, inks.goldLight)}
    ${polygon([[48, 31], [47, 24], [53, 27], [56, 19], [62, 26], [66, 17], [71, 26], [78, 22], [77, 31]], inks.goldDeep)}
    ${polygon([[50, 29], [50, 26], [55, 29], [57, 23], [62, 29], [66, 21], [70, 29], [76, 25], [75, 30]], inks.goldLight)}
    ${rect(62, 31, 7, 7, "#9d493b")}${rect(64, 32, 3, 3, "#f0a15d")}
    ${polygon([[44, 43], [49, 47], [48, 58], [43, 62], [40, 55]], inks.goldDeep)}
    ${polygon([[78, 47], [83, 43], [87, 53], [82, 62], [77, 58]], inks.goldDeep)}
    ${rect(54, 39, 7, 2, "#ffe091")}${rect(69, 39, 6, 2, "#ffe091")}
    ${rect(48, 47, 3, 2, inks.goldLight)}${rect(78, 48, 3, 2, inks.goldLight)}`;
}

function model(helm, weapon, frame) {
  const lift = [0, 1, 0, -1][frame];
  const spearShift = [0, 1, 0, -1][frame];
  const movingBoot = frame % 2;
  const c = inks;
  return `<g transform="translate(0 ${lift})">
    ${spear(weapon, spearShift)}
    <!-- compact, stepped shadow keeps the transparent sprite grounded -->
    ${rect(46, 111 - lift, 6, 2, c.outline, ".32")}${rect(52, 113 - lift, 27, 3, c.outline, ".42")}${rect(79, 111 - lift, 5, 2, c.outline, ".32")}
    <!-- boots and trousers -->
    ${polygon([[47, 83], [61, 83], [63, 104], [58, 110], [44, 108], [43, 96]], c.outline)}
    ${polygon([[67, 83], [81, 83], [86, 101], [83, 109], [69, 110], [65, 102]], c.outline)}
    ${polygon([[49, 86], [59, 86], [60, 103], [56, 107], [47, 105], [46, 96]], c.leatherDeep)}
    ${polygon([[69, 86], [79, 86], [82, 101], [80, 106], [71, 107], [68, 100]], c.leather)}
    ${rect(49 + movingBoot, 91, 5, 3, c.leatherLight)}${rect(73 - movingBoot, 94, 5, 3, c.leatherLight)}
    ${polygon([[41, 103], [59, 103], [64, 108], [62, 115], [39, 115], [37, 111]], c.outline)}
    ${polygon([[67, 103], [82, 103], [88, 109], [87, 115], [66, 115], [63, 111]], c.outline)}
    ${polygon([[42, 106], [57, 106], [60, 110], [58, 112], [39, 112]], c.leatherDeep)}
    ${polygon([[68, 106], [81, 106], [85, 110], [84, 112], [66, 112]], c.leatherDeep)}
    ${rect(44, 106, 7, 2, c.leatherLight)}${rect(72, 106, 7, 2, c.gold)}
    <!-- tunic silhouette, collar and short shoulder cape -->
    ${polygon([[46, 61], [53, 55], [74, 55], [84, 62], [90, 72], [85, 96], [77, 104], [48, 101], [37, 92], [38, 74]], c.outline)}
    ${polygon([[47, 65], [54, 59], [72, 59], [81, 65], [85, 74], [81, 92], [74, 98], [50, 96], [42, 89], [42, 75]], c.clothDeep)}
    ${polygon([[49, 68], [56, 63], [71, 63], [77, 68], [80, 77], [76, 90], [71, 94], [51, 92], [46, 87], [46, 75]], c.cloth)}
    ${polygon([[50, 68], [56, 63], [69, 63], [73, 68], [68, 72], [53, 72]], c.clothLight)}
    ${rect(48, 74, 4, 11, c.clothLight)}${rect(52, 76, 3, 4, c.clothGlint)}
    ${polygon([[72, 67], [80, 70], [83, 76], [79, 83], [73, 79]], c.clothDeep)}
    ${rect(74, 70, 5, 3, c.clothLight)}
    <!-- short red neck wrap adds a warm accent under the face -->
    ${polygon([[53, 64], [60, 62], [73, 63], [78, 68], [73, 74], [59, 72], [53, 69]], c.outline)}
    ${polygon([[56, 65], [62, 64], [72, 65], [75, 68], [71, 71], [60, 70], [55, 68]], c.red)}
    ${rect(58, 65, 7, 2, c.redLight)}${polygon([[56, 69], [61, 71], [54, 76], [51, 74]], c.red)}
    <!-- viewer-left arm, now clearly connected from shoulder to hand -->
    ${polygon([[42, 65], [49, 67], [53, 72], [50, 78], [45, 82], [42, 88], [38, 95], [30, 94], [27, 90], [29, 84], [34, 79], [35, 72], [38, 67]], c.outline)}
    ${polygon([[42, 69], [47, 70], [49, 73], [46, 78], [42, 82], [39, 89], [36, 92], [32, 91], [31, 89], [35, 83], [39, 77], [39, 71]], c.skin)}
    ${polygon([[39, 77], [46, 78], [43, 85], [37, 88], [34, 85]], c.leatherDeep)}
    ${polygon([[40, 78], [44, 79], [42, 84], [37, 86], [36, 84]], c.leatherLight)}
    ${rect(39, 78, 5, 2, c.goldDeep)}${rect(40, 78, 3, 1, c.goldLight)}
    ${polygon([[34, 85], [40, 86], [39, 91], [35, 94], [29, 93], [28, 90]], c.skinShade)}
    ${polygon([[32, 86], [37, 87], [36, 90], [33, 92], [30, 91]], c.skinLight)}
    ${rect(30, 88, 3, 2, c.skin)}${rect(34, 91, 4, 2, c.skinShade)}
    <!-- bright shoulder cap, chest plate, and riveted harness -->
    ${polygon([[41, 64], [48, 64], [53, 68], [51, 74], [45, 76], [40, 72]], c.outline)}
    ${polygon([[43, 66], [48, 66], [51, 69], [49, 72], [45, 73], [42, 70]], c.steelDeep)}
    ${polygon([[44, 67], [48, 67], [49, 69], [46, 70], [43, 69]], c.steelLight)}
    ${rect(44, 71, 5, 2, c.goldDeep)}${rect(45, 71, 3, 1, c.goldLight)}
    ${polygon([[73, 65], [80, 67], [84, 72], [82, 77], [76, 76], [72, 71]], c.outline)}
    ${polygon([[75, 67], [79, 68], [82, 72], [80, 74], [76, 73]], c.steelDeep)}
    ${polygon([[75, 68], [79, 69], [80, 71], [76, 70]], c.steelLight)}
    ${polygon([[53, 73], [72, 72], [77, 77], [75, 87], [69, 91], [54, 87], [50, 80]], c.outline)}
    ${polygon([[55, 75], [70, 74], [74, 78], [72, 85], [68, 88], [56, 85], [53, 80]], "#53696a")}
    ${polygon([[56, 76], [69, 75], [72, 78], [66, 80], [55, 79]], "#819083")}
    ${rect(55, 81, 3, 4, "#40575c")}${rect(68, 82, 3, 4, "#40575c")}
    ${rect(59, 82, 8, 2, c.goldLight)}${rect(61, 84, 4, 2, c.gold)}
    ${polygon([[73, 68], [78, 70], [57, 92], [52, 90]], c.outline)}
    ${polygon([[73, 70], [76, 71], [58, 90], [55, 89]], c.leather)}
    ${polygon([[72, 70], [74, 71], [58, 86], [56, 85]], c.leatherLight)}
    ${rect(65, 77, 4, 3, c.goldDeep)}${rect(66, 77, 2, 2, c.goldLight)}
    ${rect(56, 89, 2, 2, c.goldLight)}${rect(59, 86, 2, 2, c.goldLight)}${rect(62, 83, 2, 2, c.goldLight)}
    <!-- belt, clasp and field pouch -->
    ${polygon([[43, 88], [81, 91], [79, 98], [48, 96], [40, 93]], c.leatherDeep)}
    ${rect(48, 91, 28, 3, c.leather)}${rect(58, 90, 9, 6, c.goldDeep)}
    ${rect(60, 91, 5, 3, c.goldLight)}
    ${polygon([[75, 92], [84, 93], [84, 102], [76, 101]], c.leatherDeep)}
    ${rect(78, 94, 4, 4, c.leatherLight)}
    <!-- forward arm; hand closes around the spear shaft -->
    ${polygon([[76, 63], [86, 66], [93, 76], [91, 86], [82, 89], [76, 80]], c.outline)}
    ${polygon([[79, 66], [85, 69], [90, 77], [88, 83], [83, 84], [78, 77]], c.skin)}
    ${rect(84, 77, 7, 4, c.skinLight)}${rect(87, 81, 4, 4, c.skinShade)}
    ${rect(83, 76, 5, 3, inks.leatherLight)}
    <!-- face: warm stepped planes and large readable eyes -->
    ${polygon([[48, 39], [54, 34], [74, 34], [82, 42], [82, 62], [76, 72], [67, 76], [55, 73], [47, 64]], c.outline)}
    ${polygon([[51, 41], [56, 37], [72, 37], [78, 43], [78, 61], [73, 68], [66, 71], [57, 69], [51, 62]], c.skin)}
    ${polygon([[51, 52], [56, 55], [58, 66], [65, 70], [56, 68], [51, 62]], c.skinShade)}
    ${rect(55, 48, 7, 4, "#f4ddb1")}${rect(69, 48, 7, 4, "#f4ddb1")}
    ${rect(58, 49, 3, 4, c.outline)}${rect(71, 49, 3, 4, c.outline)}
    ${rect(57, 45, 8, 2, c.leatherDeep)}${rect(68, 45, 8, 2, c.leatherDeep)}
    ${rect(63, 59, 8, 3, c.skinLight)}${rect(62, 65, 9, 2, c.skinShade)}
    <!-- single equipment layer overlays only the head; body identity stays fixed -->
    ${helmet(helm)}
    <!-- metallic shoulder trim catches the dungeon light -->
    ${rect(43, 68, 5, 6, c.goldDeep)}${rect(44, 68, 3, 2, c.goldLight)}
    <!-- leather ties and warm stitched hem -->
    ${rect(47, 97, 8, 2, c.leatherLight)}${rect(68, 99, 7, 2, c.leatherLight)}
    <!-- reassert the front hand at the contact point so the spear reads gripped -->
    ${rect(84 + spearShift, 77, 6, 5, c.skin)}${rect(87 + spearShift, 80, 4, 4, c.skinShade)}
  </g>`;
}

function svg(content, width, height, viewBox = `0 0 ${width} ${height}`) {
  const compact = content.replace(/[ \t]+(?=\r?\n)/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" shape-rendering="crispEdges">${compact}</svg>`;
}

const helms = ["leather", "iron", "great", "crown"];
const spears = ["wood", "iron", "fang", "storm"];
const atlasFrames = [];

for (let helmIndex = 0; helmIndex < helms.length; helmIndex += 1) {
  for (let spearIndex = 0; spearIndex < spears.length; spearIndex += 1) {
    const helm = helms[helmIndex];
    const weapon = spears[spearIndex];
    const key = `spearkin-helm-${helm}-spear-${weapon}`;
    const frames = Array.from({ length: 4 }, (_, frame) => model(helm, weapon, frame));
    const strip = frames.map((art, frame) => `<g transform="translate(${frame * 128} 0)">${art}</g>`).join("");
    await writeFile(path.join(sprites, `${key}.svg`), svg(strip, 512, 128));

    for (let frame = 0; frame < 4; frame += 1) {
      atlasFrames.push(`<g transform="translate(${(spearIndex * 4 + frame) * 128} ${helmIndex * 128})">${frames[frame]}</g>`);
    }
  }
}

const atlas = svg(atlasFrames.join(""), 2048, 512);
await writeFile(path.join(sprites, "spearkin-loadouts.svg"), atlas);

const defaultFrames = Array.from({ length: 4 }, (_, frame) => model("leather", "wood", frame));
const idle = defaultFrames.map((art, frame) => `<g transform="translate(${frame * 128} 0)">${art}</g>`).join("");
await writeFile(path.join(sprites, "spearkin-idle.svg"), svg(idle, 512, 128));
await writeFile(path.join(sprites, "spearkin-portrait.svg"), svg(defaultFrames[0], 128, 128));

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--allow-file-access-from-files"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1536, height: 384 }, deviceScaleFactor: 1 });
  await page.setContent(`<html><head><style>html,body{margin:0;width:1536px;height:384px;overflow:hidden}svg{display:block!important;width:1536px!important;height:384px!important}</style></head><body>${atlas}</body></html>`);
  await page.screenshot({ path: path.join(sprites, "spearkin-loadouts-moonlighter.png"), omitBackground: true });

  const idlePage = await browser.newPage({ viewport: { width: 512, height: 128 }, deviceScaleFactor: 1 });
  await idlePage.setContent(`<html><head><style>html,body{margin:0;width:512px;height:128px;overflow:hidden}svg{display:block!important;width:512px!important;height:128px!important}</style></head><body>${svg(idle, 512, 128)}</body></html>`);
  await idlePage.screenshot({ path: path.join(sprites, "spearkin-idle.png"), omitBackground: true });

  const portraitPage = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 1 });
  await portraitPage.setContent(`<html><head><style>html,body{margin:0;width:128px;height:128px;overflow:hidden}svg{display:block!important;width:128px!important;height:128px!important}</style></head><body>${svg(defaultFrames[0], 128, 128)}</body></html>`);
  await portraitPage.screenshot({ path: path.join(sprites, "spearkin-portrait.png"), omitBackground: true });
} finally {
  await browser.close();
}

console.log("Generated four coherent idle frames for all 16 Spearkin loadouts.");
