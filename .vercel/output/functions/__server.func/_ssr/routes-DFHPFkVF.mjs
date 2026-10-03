import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { G as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as ChevronLeft, n as Settings, r as Pause } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DFHPFkVF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var AudioEngine = class {
	ctx = null;
	master = null;
	musicBus = null;
	sfxBus = null;
	noise = null;
	masterVol = .85;
	musicVol = .45;
	sfxVol = .9;
	muted = false;
	async unlock() {
		if (!this.ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.musicBus = this.ctx.createGain();
			this.sfxBus = this.ctx.createGain();
			this.musicBus.connect(this.master);
			this.sfxBus.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.applyVolumes();
			const len = Math.floor(this.ctx.sampleRate * .5);
			this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
			const data = this.noise.getChannelData(0);
			for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
		}
		if (this.ctx.state !== "running") this.ctx.resume();
	}
	now() {
		return this.ctx?.currentTime ?? 0;
	}
	eventTimeToAudio(domTimestamp) {
		if (!this.ctx) return 0;
		let age = (performance.now() - domTimestamp) / 1e3;
		if (!(age >= 0 && age < 1)) age = 0;
		return this.ctx.currentTime - age;
	}
	setVolumes(opts) {
		if (opts.master !== void 0) this.masterVol = opts.master;
		if (opts.music !== void 0) this.musicVol = opts.music;
		if (opts.sfx !== void 0) this.sfxVol = opts.sfx;
		this.applyVolumes();
	}
	applyVolumes() {
		const mute = this.muted ? 0 : 1;
		const now = this.ctx?.currentTime ?? 0;
		this.master?.gain.setTargetAtTime(this.masterVol * mute, now, .03);
		this.musicBus?.gain.setTargetAtTime(this.musicVol, now, .03);
		this.sfxBus?.gain.setTargetAtTime(this.sfxVol, now, .03);
	}
	env(when, peak, decay, bus) {
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(1e-4, when);
		g.gain.linearRampToValueAtTime(peak, when + .004);
		g.gain.exponentialRampToValueAtTime(1e-4, when + decay);
		g.connect(bus);
		return g;
	}
	tone(type, f0, f1, when, peak, decay, bus) {
		if (!this.ctx || !this.sfxBus) return;
		const dest = bus ?? this.sfxBus;
		const o = this.ctx.createOscillator();
		o.type = type;
		o.frequency.setValueAtTime(f0, when);
		if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + decay * .7);
		o.connect(this.env(when, peak, decay, dest));
		o.start(when);
		o.stop(when + decay + .05);
	}
	burst(freq, q, when, peak, decay) {
		if (!this.ctx || !this.sfxBus || !this.noise) return;
		const s = this.ctx.createBufferSource();
		s.buffer = this.noise;
		const f = this.ctx.createBiquadFilter();
		f.type = "bandpass";
		f.frequency.value = freq;
		f.Q.value = q;
		s.connect(f);
		f.connect(this.env(when, peak, decay, this.sfxBus));
		s.start(when);
		s.stop(when + decay + .05);
	}
	drum(id, when = this.now()) {
		if (id === 0) this.tone("sine", 150, 45, when, .95, .32);
		else if (id === 1) {
			this.burst(1800, 1.2, when, .7, .1);
			this.tone("sine", 230, 200, when, .25, .08);
		} else if (id === 2) {
			this.tone("triangle", 340, 250, when, .6, .16);
			this.burst(3200, 2, when, .18, .05);
		} else {
			this.tone("sine", 880, 880, when, .35, .4);
			this.tone("sine", 1320, 1320, when, .18, .3);
		}
	}
	tick(when, accent = false) {
		this.tone("square", accent ? 1500 : 1e3, accent ? 1500 : 1e3, when, accent ? .1 : .05, .035);
	}
	thump(when) {
		this.tone("sine", 90, 55, when, .2, .14);
	}
	chant(when, fever) {
		const f = fever ? 392 : 294;
		this.tone("triangle", f, f * .92, when, fever ? .18 : .12, .22, this.musicBus ?? void 0);
	}
	pluck(when, freq, fever) {
		if (!this.musicBus) return;
		this.tone("triangle", freq, freq * .97, when, fever ? .11 : .07, .28, this.musicBus);
	}
	hit(when = this.now()) {
		this.burst(900, 1.4, when, .35, .08);
		this.tone("square", 180, 90, when, .2, .12);
	}
	whoosh(when = this.now()) {
		this.burst(400, .6, when, .25, .18);
	}
};
var audio = new AudioEngine();
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible" && audio.ctx?.state === "suspended") audio.ctx.resume();
});
var COMMANDS = [
	{
		id: "march",
		name: "MARCH",
		pattern: [
			1,
			1,
			1,
			0
		],
		hint: "Advance the line"
	},
	{
		id: "attack",
		name: "ATTACK",
		pattern: [
			0,
			0,
			1,
			0
		],
		hint: "Strike in range"
	},
	{
		id: "defend",
		name: "DEFEND",
		pattern: [
			3,
			3,
			1,
			0
		],
		hint: "Raise shields"
	},
	{
		id: "retreat",
		name: "RETREAT",
		pattern: [
			0,
			1,
			0,
			1
		],
		hint: "Fall back"
	},
	{
		id: "charge",
		name: "CHARGE",
		pattern: [
			0,
			0,
			3,
			3
		],
		hint: "Rush and empower"
	},
	{
		id: "jump",
		name: "JUMP",
		pattern: [
			2,
			2,
			3,
			3
		],
		hint: "Leap over slams"
	}
];
var MISSIONS = [
	{
		id: "training",
		name: "First Drum",
		blurb: "Learn the four drums, then MARCH to the sun-disk shrine.",
		bpm: 112,
		worldLength: 2400,
		goalX: 1680,
		tutorial: true,
		waves: []
	},
	{
		id: "dust-road",
		name: "Dust Road",
		blurb: "Goretusks block the caravan road. March, then ATTACK.",
		bpm: 118,
		worldLength: 3200,
		goalX: 2800,
		unlockAfter: "training",
		waves: [{
			atX: 720,
			enemies: [{
				kind: "goretusk",
				count: 3
			}]
		}, {
			atX: 1480,
			enemies: [{
				kind: "goretusk",
				count: 4
			}]
		}]
	},
	{
		id: "thorn-gate",
		name: "Thorn Gate",
		blurb: "A Tuskbrute leads the pack. DEFEND the slams, then strike.",
		bpm: 122,
		worldLength: 3600,
		goalX: 3100,
		unlockAfter: "dust-road",
		waves: [
			{
				atX: 640,
				enemies: [{
					kind: "goretusk",
					count: 3
				}]
			},
			{
				atX: 1280,
				enemies: [{
					kind: "goretusk",
					count: 3
				}, {
					kind: "brute",
					count: 1
				}]
			},
			{
				atX: 2100,
				enemies: [{
					kind: "goretusk",
					count: 4
				}, {
					kind: "brute",
					count: 1
				}]
			}
		]
	},
	{
		id: "howls-gate",
		name: "Howl's Gate",
		blurb: "Iron Howl waits. JUMP the ground slam. CHARGE when Fever hits.",
		bpm: 126,
		worldLength: 3800,
		goalX: 3200,
		unlockAfter: "thorn-gate",
		waves: [{
			atX: 900,
			enemies: [{
				kind: "goretusk",
				count: 2
			}]
		}, {
			atX: 1700,
			enemies: [{
				kind: "howl",
				count: 1
			}, {
				kind: "goretusk",
				count: 2
			}]
		}]
	}
];
function missionById(id) {
	return MISSIONS.find((m) => m.id === id);
}
function isUnlocked(id, completed) {
	const m = missionById(id);
	if (!m) return false;
	if (!m.unlockAfter) return true;
	return completed.includes(m.unlockAfter);
}
var CLASSES = {
	banner: {
		id: "banner",
		name: "Bannerkin",
		sprite: "bannerkin-idle",
		hp: 48,
		damage: 0,
		range: 0,
		role: "flag"
	},
	aegis: {
		id: "aegis",
		name: "Aegiskin",
		sprite: "aegiskin-idle",
		hp: 78,
		damage: 7,
		range: 70,
		role: "tank"
	},
	pike: {
		id: "pike",
		name: "Pikekin",
		sprite: "pikekin-idle",
		hp: 44,
		damage: 14,
		range: 92,
		role: "melee"
	},
	bow: {
		id: "bow",
		name: "Bowkin",
		sprite: "bowkin-idle",
		hp: 32,
		damage: 9,
		range: 260,
		role: "ranged"
	}
};
var ENEMY_STATS = {
	goretusk: {
		name: "Goretusk",
		sprite: "goretusk-idle",
		hp: 42,
		damage: 8,
		range: 70,
		speed: 46,
		scale: .92
	},
	brute: {
		name: "Tuskbrute",
		sprite: "goretusk-idle",
		hp: 90,
		damage: 14,
		range: 82,
		speed: 32,
		scale: 1.28
	},
	howl: {
		name: "Iron Howl",
		sprite: "howl-idle",
		hp: 420,
		damage: 22,
		range: 110,
		speed: 22,
		scale: 1.7
	}
};
var STARTER_ARMY = [
	"banner",
	"aegis",
	"aegis",
	"pike",
	"pike",
	"pike",
	"bow",
	"bow"
];
var Bus = class {
	map = /* @__PURE__ */ new Map();
	on(ev, fn) {
		let set = this.map.get(ev);
		if (!set) {
			set = /* @__PURE__ */ new Set();
			this.map.set(ev, set);
		}
		set.add(fn);
		return () => this.off(ev, fn);
	}
	off(ev, fn) {
		this.map.get(ev)?.delete(fn);
	}
	emit(ev, payload) {
		this.map.get(ev)?.forEach((fn) => fn(payload));
	}
	clear() {
		this.map.clear();
	}
};
var bus = new Bus();
var RhythmEngine = class {
	bpm;
	startTime;
	inputOffsetMs;
	perfectMs;
	goodMs;
	commands;
	beatLength;
	slots = /* @__PURE__ */ new Map();
	nextBeat = 0;
	nextMeasure = 0;
	combo = 0;
	bestCombo = 0;
	commandCount = 0;
	failCount = 0;
	constructor(opts = {}) {
		this.bpm = opts.bpm ?? 120;
		this.startTime = opts.startTime ?? 0;
		this.inputOffsetMs = opts.inputOffsetMs ?? 0;
		this.perfectMs = opts.perfectMs ?? 60;
		this.goodMs = opts.goodMs ?? 130;
		this.commands = opts.commands ?? COMMANDS;
		this.beatLength = 60 / this.bpm;
	}
	get fever() {
		return this.combo >= 4;
	}
	beatTime(n) {
		return this.startTime + n * this.beatLength;
	}
	beatPosition(time) {
		return (time - this.startTime) / this.beatLength;
	}
	judgeTap(drum, time) {
		const adjusted = time - this.inputOffsetMs / 1e3;
		const beat = Math.round((adjusted - this.startTime) / this.beatLength);
		const deltaMs = (adjusted - this.beatTime(beat)) * 1e3;
		const abs = Math.abs(deltaMs);
		return {
			drum,
			beat,
			deltaMs,
			grade: abs <= this.perfectMs ? "perfect" : abs <= this.goodMs ? "good" : "miss"
		};
	}
	tap(drum, time) {
		const j = this.judgeTap(drum, time);
		if (j.beat < 0) return {
			...j,
			measure: -1,
			slot: -1,
			ignored: true
		};
		const measure = Math.floor(j.beat / 8);
		const slot = j.beat % 8;
		if (slot >= 4) return {
			...j,
			measure,
			slot,
			ignored: true
		};
		if (j.grade === "miss") return {
			...j,
			measure,
			slot,
			ignored: false
		};
		let row = this.slots.get(measure);
		if (!row) {
			row = new Array(4).fill(null);
			this.slots.set(measure, row);
		}
		const existing = row[slot];
		if (!existing || Math.abs(j.deltaMs) < Math.abs(existing.deltaMs)) row[slot] = {
			...j,
			measure,
			slot,
			ignored: false
		};
		return {
			...j,
			measure,
			slot,
			ignored: false
		};
	}
	advance(time) {
		const events = [];
		while (this.beatTime(this.nextBeat) <= time) {
			const beat = this.nextBeat++;
			const slot = beat % 8;
			events.push({
				type: "beat",
				beat,
				measure: Math.floor(beat / 8),
				slot,
				phase: slot < 4 ? "input" : "response"
			});
		}
		const grace = this.goodMs / 1e3 + Math.max(0, this.inputOffsetMs) / 1e3;
		while (this.beatTime(this.nextMeasure * 8 + 4) + grace <= time) {
			const m = this.nextMeasure++;
			const ev = this.evaluate(m);
			if (ev) events.push(ev);
		}
		return events;
	}
	evaluate(measure) {
		const row = this.slots.get(measure);
		this.slots.delete(measure);
		const beat = measure * 8 + 4;
		if (!row) return null;
		if (row.some((s) => s === null)) {
			this.combo = 0;
			this.failCount += 1;
			return {
				type: "fail",
				reason: "incomplete",
				measure,
				beat
			};
		}
		const drums = row.map((s) => s.drum);
		const command = this.commands.find((c) => c.pattern.every((d, i) => d === drums[i]));
		if (!command) {
			this.combo = 0;
			this.failCount += 1;
			return {
				type: "fail",
				reason: "unknown",
				measure,
				beat
			};
		}
		const perfects = row.filter((s) => s.grade === "perfect").length;
		this.combo += 1;
		this.bestCombo = Math.max(this.bestCombo, this.combo);
		this.commandCount += 1;
		return {
			type: "command",
			command,
			measure,
			beat,
			perfects,
			fever: this.fever
		};
	}
};
function computeOffset(deltasMs) {
	const usable = deltasMs.filter((d) => Math.abs(d) <= 250).sort((a, b) => a - b);
	if (usable.length < 4) return null;
	const mid = Math.floor(usable.length / 2);
	const median = usable.length % 2 ? usable[mid] : (usable[mid - 1] + usable[mid]) / 2;
	return Math.round(median);
}
var KEY = "rhythm-army-save";
var SAVE_VERSION = 1;
var defaultSave = () => ({
	version: SAVE_VERSION,
	completed: [],
	bestCombo: 0,
	offsetMs: 0,
	settings: {
		master: .85,
		music: .45,
		sfx: .9,
		shake: .7
	}
});
function migrate(raw) {
	const base = defaultSave();
	return {
		...base,
		...raw,
		version: SAVE_VERSION,
		completed: Array.isArray(raw.completed) ? raw.completed : [],
		settings: {
			...base.settings,
			...raw.settings ?? {}
		},
		offsetMs: typeof raw.offsetMs === "number" ? raw.offsetMs : 0,
		bestCombo: typeof raw.bestCombo === "number" ? raw.bestCombo : 0
	};
}
function loadSave() {
	try {
		const v = localStorage.getItem(KEY);
		if (!v) return defaultSave();
		return migrate(JSON.parse(v));
	} catch {
		return defaultSave();
	}
}
function writeSave(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}
function PhaserGame({ missionId }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let game;
		let dead = false;
		(async () => {
			const { createGame } = await import("./createGame-BL-HY92g.mjs");
			if (dead || !ref.current) return;
			game = createGame(ref.current, missionId);
		})();
		return () => {
			dead = true;
			game?.destroy(true);
		};
	}, [missionId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "absolute inset-0 touch-none"
	});
}
var DRUMS = [
	{
		id: 0,
		name: "BOOM",
		color: "#e4572e",
		keys: ["a", "j"],
		codes: ["KeyA", "KeyJ"]
	},
	{
		id: 1,
		name: "TAK",
		color: "#f2b134",
		keys: ["s", "k"],
		codes: ["KeyS", "KeyK"]
	},
	{
		id: 2,
		name: "RAT",
		color: "#3fa7d6",
		keys: ["d", "l"],
		codes: ["KeyD", "KeyL"]
	},
	{
		id: 3,
		name: "TING",
		color: "#59cd90",
		keys: ["f", ";"],
		codes: ["KeyF", "Semicolon"]
	}
];
var useGame = create((set, get) => ({
	screen: "title",
	save: defaultSave(),
	hydrated: false,
	missionId: null,
	result: null,
	hud: null,
	paused: false,
	hydrate: () => {
		if (get().hydrated) return;
		set({
			save: loadSave(),
			hydrated: true
		});
	},
	patchSave: (fn) => {
		const save = fn(get().save);
		writeSave(save);
		set({ save });
	},
	go: (screen) => set({
		screen,
		paused: false
	}),
	startMission: (id) => set({
		screen: "battle",
		missionId: id,
		result: null,
		hud: null,
		paused: false
	}),
	setHud: (hud) => set({ hud }),
	setPaused: (paused) => set({ paused }),
	finishBattle: (result) => {
		if (result.win) get().patchSave((s) => ({
			...s,
			completed: s.completed.includes(result.missionId) ? s.completed : [...s.completed, result.missionId],
			bestCombo: Math.max(s.bestCombo, result.bestCombo)
		}));
		else get().patchSave((s) => ({
			...s,
			bestCombo: Math.max(s.bestCombo, result.bestCombo)
		}));
		set({
			result,
			screen: "result",
			paused: false
		});
	}
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function BattleHud({ hud, offsetMs, onPause }) {
	const slot = hud?.slot ?? -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between px-3 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-lg tabular-nums tracking-wide text-fg",
						children: ["COMBO ", hud?.combo ?? 0]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[11px] text-muted",
						children: [
							"offset ",
							offsetMs >= 0 ? "+" : "",
							offsetMs,
							"ms"
						]
					}),
					hud?.fever && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-xl tracking-wide text-fever",
						children: "FEVER"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onPause,
					className: "pointer-events-auto rounded-xl border border-border bg-surface/80 p-2 text-fg",
					"aria-label": "Pause",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1.5 sm:gap-2",
					children: Array.from({ length: 8 }, (_, i) => {
						const on = i === slot;
						const input = i < 4;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("block rounded-full transition-transform duration-75", on ? "scale-125" : "scale-100", i === 4 ? "ml-2" : ""),
							style: {
								width: on ? 14 : 10,
								height: on ? 14 : 10,
								background: input ? on ? "#f4ead8" : "rgba(244,234,216,0.35)" : on ? "#59cd90" : "rgba(89,205,144,0.35)"
							}
						}, i);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex w-56 justify-between text-[10px] tracking-widest text-muted uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Army" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-3 mt-2 sm:mx-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-ting",
						style: { width: `${hud ? hud.armyHp / Math.max(1, hud.armyMax) * 100 : 100}%` }
					})
				}), hud?.boss && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 text-right text-[10px] tracking-widest text-muted uppercase",
						children: hud.boss.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 overflow-hidden rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-primary",
							style: { width: `${hud.boss.hp / Math.max(1, hud.boss.max) * 100}%` }
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center px-4 text-center",
				children: [
					hud?.ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-sm text-fg",
						children: "Get ready. Drum the first four beats. The army moves on the next four."
					}),
					hud?.telegraph && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tracking-wide text-primary",
						children: hud.telegraph
					}),
					hud?.tutorial && !hud.ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-sm text-muted",
						children: hud.tutorial
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none hidden px-4 pb-2 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ml-auto w-max rounded-2xl border border-border bg-bg/55 px-3 py-2 font-mono text-[11px] text-muted",
					children: COMMANDS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block w-16 text-fg",
						children: c.name
					}), c.pattern.map((d) => DRUMS[d].name).join(" ")] }, c.id))
				})
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold tracking-wide transition-[color,background-color,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-fg hover:bg-primary/90",
			secondary: "border border-border bg-surface-2 text-fg hover:bg-surface",
			ghost: "text-fg hover:bg-surface-2",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2"
		},
		size: {
			sm: "h-10 px-4 text-sm",
			default: "h-12 px-5 text-base",
			lg: "h-14 px-8 text-lg"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
function CalibrateScreen() {
	const go = useGame((s) => s.go);
	const patchSave = useGame((s) => s.patchSave);
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [count, setCount] = (0, import_react.useState)(0);
	const [result, setResult] = (0, import_react.useState)(null);
	const [pulse, setPulse] = (0, import_react.useState)(0);
	const cal = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let raf = 0;
		const loop = () => {
			const c = cal.current;
			if (c && audio.ctx) {
				const now = audio.now();
				const beatPos = (now - c.start) / c.len;
				const frac = beatPos - Math.floor(beatPos);
				setPulse(beatPos >= 0 && beatPos < c.beats ? Math.exp(-frac * 6) : 0);
				if (phase === "run" && now > c.start + c.beats * c.len + .45) {
					const off = computeOffset(c.deltas);
					setResult(off);
					setPhase("done");
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [phase]);
	async function start() {
		await audio.unlock();
		const bpm = 100;
		const beats = 12;
		const len = 60 / bpm;
		const startAt = audio.now() + 1.1;
		for (let i = 0; i < beats; i++) audio.tick(startAt + i * len, i % 4 === 0);
		cal.current = {
			start: startAt,
			beats,
			len,
			deltas: []
		};
		setCount(0);
		setResult(null);
		setPhase("run");
	}
	function tap(stamp) {
		const c = cal.current;
		if (!c || !audio.ctx) return;
		if (phase === "done") {
			if (result !== null) patchSave((s) => ({
				...s,
				offsetMs: result
			}));
			go("title");
			return;
		}
		if (phase !== "run") return;
		audio.drum(0, audio.now());
		const t = audio.eventTimeToAudio(stamp);
		const n = Math.round((t - c.start) / c.len);
		if (n >= 2 && n < c.beats) {
			c.deltas.push((t - (c.start + n * c.len)) * 1e3);
			setCount(c.deltas.length);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center bg-bg px-5 text-fg pt-[max(2rem,env(safe-area-inset-top))]",
		onPointerDown: (e) => {
			if (phase === "idle") return;
			e.preventDefault();
			tap(e.timeStamp);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-wide",
				children: "Calibrate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-center text-sm text-muted",
				children: "Tap exactly on each click. Ignore the first two. We store the median offset so hits feel tight."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-16 rounded-full bg-primary transition-transform",
				style: {
					width: 120,
					height: 120,
					transform: `scale(${1 + pulse * .28})`
				}
			}),
			phase === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-12",
				size: "lg",
				onClick: () => void start(),
				children: "Start clicks"
			}),
			phase === "run" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-12 text-sm text-muted",
				children: [count, " taps counted"]
			}),
			phase === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 text-center",
				children: [result === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Not enough taps. Start again." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-2xl",
					children: [
						"Offset ",
						result >= 0 ? "+" : "",
						result,
						" ms"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => void start(),
						children: "Retry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							if (result !== null) patchSave((s) => ({
								...s,
								offsetMs: result
							}));
							go("title");
						},
						children: "Save"
					})]
				})]
			}),
			phase === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "mt-4",
				onClick: () => go("title"),
				children: "Back"
			})
		]
	});
}
function DrumPads({ pressed, onDrum, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full grid-cols-4 gap-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
		children: DRUMS.map((d) => {
			const lit = pressed[d.id] > performance.now();
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				"aria-label": d.name,
				onPointerDown: (e) => {
					e.preventDefault();
					e.currentTarget.setPointerCapture(e.pointerId);
					onDrum(d.id, e.timeStamp);
				},
				className: cn("flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 select-none", "transition-[background-color,transform] duration-75", lit ? "scale-[0.98] text-primary-fg" : "bg-surface text-fg"),
				style: {
					borderColor: d.color,
					backgroundColor: lit ? d.color : void 0,
					color: lit ? "#fff8f0" : d.color
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xl tracking-wide sm:text-2xl",
					children: d.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 font-mono text-[11px] text-muted uppercase",
					children: d.keys.join(" / ")
				})]
			}, d.id);
		})
	});
}
function HowToScreen() {
	const go = useGame((s) => s.go);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg px-5 pb-10 text-fg pt-[max(1rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => go("title"),
				className: "mb-4 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Back"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-wide",
				children: "How to drum"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-lg text-sm leading-relaxed text-muted",
				children: "Each measure is eight beats. You drum the first four. The army answers on the next four — marching, striking, or holding. Hit the beat. Chain four commands to ignite Fever."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xs font-semibold tracking-[0.2em] text-muted uppercase",
				children: "Drums"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: DRUMS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg",
						style: { color: d.color },
						children: d.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted uppercase",
						children: d.keys.join(" / ")
					})]
				}, d.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xs font-semibold tracking-[0.2em] text-muted uppercase",
				children: "Commands"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: COMMANDS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: c.hint
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-sm text-fg sm:mt-0",
						children: c.pattern.map((id) => DRUMS[id].name).join("  ")
					})]
				}, c.id))
			})
		]
	});
}
var PORTRAITS = {
	pike: "/assets/sprites/pikekin-portrait.png",
	bow: "/assets/sprites/bowkin-portrait.png",
	aegis: "/assets/sprites/aegiskin-portrait.png",
	banner: "/assets/sprites/bannerkin-portrait.png"
};
function HubScreen({ onPlay }) {
	const go = useGame((s) => s.go);
	const save = useGame((s) => s.save);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => go("title"),
						className: "gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Title"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl tracking-wide",
						children: "Campaign"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => go("settings"),
						"aria-label": "Settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-4 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-semibold tracking-[0.2em] text-muted uppercase",
					children: "Your army"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-2",
					children: Object.keys(CLASSES).map((id) => {
						const c = CLASSES[id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-surface p-2 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: PORTRAITS[id],
									alt: "",
									className: "mx-auto h-16 w-16 object-contain"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs font-semibold",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-faint",
									children: c.role
								})
							]
						}, id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3 px-4 pb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
						children: "Missions"
					}),
					MISSIONS.map((m) => {
						const unlocked = isUnlocked(m.id, save.completed);
						const done = save.completed.includes(m.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !unlocked,
							onClick: () => unlocked && onPlay(m.id),
							className: cn("rounded-3xl border p-4 text-left transition-colors", unlocked ? "border-border bg-surface hover:bg-surface-2" : "border-border/40 bg-surface/40 opacity-50"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl tracking-wide",
									children: m.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted",
									children: done ? "Cleared" : unlocked ? "Open" : "Locked"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: m.blurb
							})]
						}, m.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-2",
						onClick: () => go("calibrate"),
						children: "Calibrate timing"
					})
				]
			})
		]
	});
}
function ResultScreen({ onPlay }) {
	const result = useGame((s) => s.result);
	const go = useGame((s) => s.go);
	const save = useGame((s) => s.save);
	if (!result) return null;
	const next = MISSIONS[MISSIONS.findIndex((m) => m.id === result.missionId) + 1];
	const nextOpen = next ? isUnlocked(next.id, save.completed) : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-bg px-5 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-[0.24em] text-muted uppercase",
				children: result.missionName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-5xl tracking-wide",
				children: result.win ? "Victory" : "Broken beat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-muted",
				children: result.cause
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-8 grid w-full max-w-sm grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Commands"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-2xl tabular-nums",
							children: result.commands
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Best combo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-2xl tabular-nums",
							children: result.bestCombo
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Misses"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-2xl tabular-nums",
							children: result.fails
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted",
							children: "Fever"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-display text-2xl",
							children: result.feverReached ? "Yes" : "No"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex w-full max-w-sm flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						onClick: () => onPlay(result.missionId),
						children: "Play again"
					}),
					result.win && nextOpen && next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						variant: "secondary",
						onClick: () => onPlay(next.id),
						children: ["Next: ", next.name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => go("hub"),
						children: "Campaign"
					})
				]
			})
		]
	});
}
function Slider({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono tabular-nums",
				children: Math.round(value * 100)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 0,
			max: 1,
			step: .01,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "h-2 w-full appearance-none rounded-full bg-surface-2 accent-primary"
		})]
	});
}
function SettingsScreen() {
	const go = useGame((s) => s.go);
	const save = useGame((s) => s.save);
	const patchSave = useGame((s) => s.patchSave);
	function setField(key, v) {
		patchSave((s) => ({
			...s,
			settings: {
				...s.settings,
				[key]: v
			}
		}));
		if (key !== "shake") audio.setVolumes({ [key]: v });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg px-5 text-fg pt-[max(1rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => go("hub"),
				className: "mb-4 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Back"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-wide",
				children: "Settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex max-w-md flex-col gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Master",
						value: save.settings.master,
						onChange: (v) => setField("master", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Music",
						value: save.settings.music,
						onChange: (v) => setField("music", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Drums",
						value: save.settings.sfx,
						onChange: (v) => setField("sfx", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Screen shake",
						value: save.settings.shake,
						onChange: (v) => setField("shake", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 font-mono text-xs text-faint",
				children: [
					"Input offset ",
					save.offsetMs >= 0 ? "+" : "",
					save.offsetMs,
					"ms"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				variant: "secondary",
				onClick: () => go("calibrate"),
				children: "Recalibrate"
			})
		]
	});
}
function TitleScreen({ onPlay }) {
	const go = useGame((s) => s.go);
	const save = useGame((s) => s.save);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/assets/ui/title-art.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/25" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-1 flex-col items-center justify-end px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))] sm:justify-center sm:pb-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold tracking-[0.28em] text-muted uppercase",
						children: "Drum war"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl leading-none tracking-tight text-fg sm:text-7xl",
						children: "RHYTHM ARMY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-center text-base text-muted",
						children: "Drum four beats. Your army answers on the next four. March, strike, and hold the line."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex w-full max-w-sm flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								className: "w-full rounded-xl",
								onClick: onPlay,
								children: "Play"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								variant: "secondary",
								className: "w-full rounded-xl",
								onClick: () => go("hub"),
								children: "Campaign"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => go("howto"),
									children: "How to drum"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => go("calibrate"),
									children: "Calibrate"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 font-mono text-xs text-faint",
						children: [
							"Offset ",
							save.offsetMs >= 0 ? "+" : "",
							save.offsetMs,
							"ms · Best combo ",
							save.bestCombo
						]
					})
				]
			})
		]
	});
}
function GameShell() {
	const screen = useGame((s) => s.screen);
	const missionId = useGame((s) => s.missionId);
	const hud = useGame((s) => s.hud);
	const paused = useGame((s) => s.paused);
	const save = useGame((s) => s.save);
	const hydrate = useGame((s) => s.hydrate);
	const go = useGame((s) => s.go);
	const startMission = useGame((s) => s.startMission);
	const setHud = useGame((s) => s.setHud);
	const setPaused = useGame((s) => s.setPaused);
	const finishBattle = useGame((s) => s.finishBattle);
	const pressed = (0, import_react.useRef)([
		0,
		0,
		0,
		0
	]);
	const [, bump] = (0, import_react.useState)(0);
	const padHeld = (0, import_react.useRef)([
		false,
		false,
		false,
		false
	]);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		audio.setVolumes(save.settings);
	}, [save.settings]);
	(0, import_react.useEffect)(() => {
		const offHud = bus.on("hud", (p) => setHud(p));
		const offEnd = bus.on("battle-end", (p) => finishBattle(p));
		return () => {
			offHud();
			offEnd();
		};
	}, [setHud, finishBattle]);
	async function unlockAndPlay(id) {
		await audio.unlock();
		startMission(id);
	}
	function hitDrum(drum, stamp) {
		if (screen !== "battle" || paused) return;
		pressed.current[drum] = performance.now() + 120;
		bump((n) => n + 1);
		audio.unlock().then(() => {
			audio.drum(drum);
			const t = audio.eventTimeToAudio(stamp);
			bus.emit("drum", {
				drum,
				time: t
			});
		});
	}
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.repeat) return;
			if (e.code === "Escape") {
				if (screen === "battle") {
					const next = !useGame.getState().paused;
					setPaused(next);
					bus.emit("pause", next);
				} else if (screen !== "title") go("title");
				return;
			}
			if (screen === "title" && e.code === "Enter") {
				unlockAndPlay("training");
				return;
			}
			if (screen !== "battle") return;
			const drum = DRUMS.findIndex((d) => d.codes.includes(e.code));
			if (drum < 0) return;
			e.preventDefault();
			hitDrum(drum, e.timeStamp);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		screen,
		go,
		setPaused
	]);
	(0, import_react.useEffect)(() => {
		if (screen !== "battle") return;
		let raf = 0;
		const poll = () => {
			const p = (navigator.getGamepads?.() ?? [])[0];
			if (p) {
				const map = [
					0,
					1,
					2,
					3
				];
				for (let i = 0; i < 4; i++) {
					const down = p.buttons[map[i]]?.pressed ?? false;
					if (down && !padHeld.current[i]) hitDrum(i, performance.now());
					padHeld.current[i] = down;
				}
			}
			raf = requestAnimationFrame(poll);
		};
		raf = requestAnimationFrame(poll);
		return () => cancelAnimationFrame(raf);
	}, [screen, paused]);
	if (screen === "title") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, { onPlay: () => void unlockAndPlay("training") });
	if (screen === "hub") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubScreen, { onPlay: (id) => void unlockAndPlay(id) });
	if (screen === "howto") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowToScreen, {});
	if (screen === "calibrate") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalibrateScreen, {});
	if (screen === "settings") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, {});
	if (screen === "result") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultScreen, { onPlay: (id) => void unlockAndPlay(id) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh overflow-hidden bg-bg text-fg",
		children: [
			missionId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhaserGame, { missionId }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleHud, {
				hud,
				offsetMs: save.offsetMs,
				onPause: () => {
					setPaused(true);
					bus.emit("pause", true);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0 z-20 h-[min(28vh,168px)] bg-bg/90",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrumPads, {
					pressed: pressed.current,
					onDrum: hitDrum,
					disabled: paused
				})
			}),
			paused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-30 flex flex-col items-center justify-center bg-bg/80 px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl tracking-wide",
					children: "Paused"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex w-full max-w-xs flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						onClick: () => {
							setPaused(false);
							bus.emit("pause", false);
						},
						children: "Resume"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "lg",
						onClick: () => go("hub"),
						children: "Abandon march"
					})]
				})]
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameShell, {});
}
//#endregion
export { CLASSES as a, missionById as c, bus as i, COMMANDS as l, loadSave as n, ENEMY_STATS as o, RhythmEngine as r, STARTER_ARMY as s, routes_exports as t, audio as u };
