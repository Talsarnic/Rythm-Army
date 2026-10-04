import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { G as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ArrowRightLeft, c as Settings, d as Heart, f as Crosshair, g as BookOpen, h as Check, i as UserPlus, l as Pause, m as ChevronLeft, n as X, o as Sparkles, p as CircleAlert, r as WandSparkles, s as Shield, t as Zap, u as Package } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DDavm2BG.js
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
var ITEMS = {
	"spear-wood": {
		id: "spear-wood",
		name: "Wooden Spear",
		description: "Standard carved wooden spear with balanced thrust.",
		category: "gear",
		rarity: "common",
		icon: "🍢",
		equipment: {
			slot: "weapon",
			gearType: "spear",
			allowedClasses: [
				"spear",
				"kiba",
				"tori"
			],
			damageBonus: 0,
			attackSpeedMultiplier: 1,
			rangeBonus: 0
		}
	},
	"spear-iron": {
		id: "spear-iron",
		name: "Iron Spear",
		description: "Forged iron spear with sturdy piercing power.",
		category: "gear",
		rarity: "uncommon",
		icon: "🗡️",
		equipment: {
			slot: "weapon",
			gearType: "spear",
			allowedClasses: [
				"spear",
				"kiba",
				"tori"
			],
			damageBonus: 6,
			attackSpeedMultiplier: 1.15,
			rangeBonus: 20
		}
	},
	"spear-fang": {
		id: "spear-fang",
		name: "Fang Spear",
		description: "Serrated beast-tusk spear dealing swift, cruel punctures.",
		category: "gear",
		rarity: "rare",
		icon: "🔱",
		equipment: {
			slot: "weapon",
			gearType: "spear",
			allowedClasses: [
				"spear",
				"kiba",
				"tori"
			],
			damageBonus: 12,
			attackSpeedMultiplier: 1.35,
			rangeBonus: 40
		}
	},
	"spear-storm": {
		id: "spear-storm",
		name: "Thunder Lance",
		description: "Electrified spear humming with storm resonance. Cracks through any armor.",
		category: "gear",
		rarity: "epic",
		icon: "⚡",
		equipment: {
			slot: "weapon",
			gearType: "spear",
			allowedClasses: [
				"spear",
				"kiba",
				"tori"
			],
			damageBonus: 20,
			attackSpeedMultiplier: 1.5,
			rangeBonus: 60
		}
	},
	"sword-wood": {
		id: "sword-wood",
		name: "Wooden Sword",
		description: "Basic carved wooden broadsword for close-quarters swinging.",
		category: "gear",
		rarity: "common",
		icon: "🗡️",
		equipment: {
			slot: "weapon",
			gearType: "sword",
			allowedClasses: ["aegis"],
			damageBonus: 2,
			attackSpeedMultiplier: 1,
			rangeBonus: 0
		}
	},
	"sword-iron": {
		id: "sword-iron",
		name: "Iron Sword",
		description: "Sturdy steel-edged blade that cuts clean through beast hide.",
		category: "gear",
		rarity: "uncommon",
		icon: "⚔️",
		equipment: {
			slot: "weapon",
			gearType: "sword",
			allowedClasses: ["aegis"],
			damageBonus: 7,
			attackSpeedMultiplier: 1.1,
			rangeBonus: 10
		}
	},
	"sword-flame": {
		id: "sword-flame",
		name: "Flame Sword",
		description: "Enchanted red-hot blade radiating searing battle fury.",
		category: "gear",
		rarity: "rare",
		icon: "🔥",
		equipment: {
			slot: "weapon",
			gearType: "sword",
			allowedClasses: ["aegis"],
			damageBonus: 14,
			attackSpeedMultiplier: 1.25,
			rangeBonus: 15
		}
	},
	"sword-divine": {
		id: "sword-divine",
		name: "Divine Sword",
		description: "Sacred blade blessed by the Almighty. Cleaves through enemy battle lines.",
		category: "gear",
		rarity: "epic",
		icon: "✨",
		equipment: {
			slot: "weapon",
			gearType: "sword",
			allowedClasses: ["aegis"],
			damageBonus: 22,
			attackSpeedMultiplier: 1.4,
			rangeBonus: 25
		}
	},
	"shield-wood": {
		id: "shield-wood",
		name: "Wooden Shield",
		description: "Basic plank round shield providing reliable baseline defense.",
		category: "gear",
		rarity: "common",
		icon: "🛡️",
		equipment: {
			slot: "shield",
			gearType: "shield",
			allowedClasses: ["aegis"],
			damageBonus: 0,
			attackSpeedMultiplier: 1,
			rangeBonus: 0,
			defenseBonus: .08,
			hpBonus: 15
		}
	},
	"shield-iron": {
		id: "shield-iron",
		name: "Iron Shield",
		description: "Stout iron heater shield that deflects heavy impacts and arrows.",
		category: "gear",
		rarity: "uncommon",
		icon: "🛡️",
		equipment: {
			slot: "shield",
			gearType: "shield",
			allowedClasses: ["aegis"],
			damageBonus: 2,
			attackSpeedMultiplier: 1.05,
			rangeBonus: 5,
			defenseBonus: .16,
			hpBonus: 30
		}
	},
	"shield-tower": {
		id: "shield-tower",
		name: "Giant Tower Shield",
		description: "Massive slab shield forged from hardened alloy plates.",
		category: "gear",
		rarity: "rare",
		icon: "🛡️",
		equipment: {
			slot: "shield",
			gearType: "shield",
			allowedClasses: ["aegis"],
			damageBonus: 5,
			attackSpeedMultiplier: 1.05,
			rangeBonus: 10,
			defenseBonus: .28,
			hpBonus: 60
		}
	},
	"shield-aegis-core": {
		id: "shield-aegis-core",
		name: "Divine Greatshield",
		description: "Imposing fortress shield humming with rhythmic Almighty barrier power.",
		category: "gear",
		rarity: "epic",
		icon: "💠",
		equipment: {
			slot: "shield",
			gearType: "shield",
			allowedClasses: ["aegis"],
			damageBonus: 8,
			attackSpeedMultiplier: 1.15,
			rangeBonus: 15,
			defenseBonus: .42,
			hpBonus: 100
		}
	},
	"bow-wood": {
		id: "bow-wood",
		name: "Wooden Bow",
		description: "Simple wooden hunting bow with standard draw weight.",
		category: "gear",
		rarity: "common",
		icon: "🏹",
		equipment: {
			slot: "weapon",
			gearType: "bow",
			allowedClasses: ["bow"],
			damageBonus: 0,
			attackSpeedMultiplier: 1,
			rangeBonus: 0
		}
	},
	"bow-recurve": {
		id: "bow-recurve",
		name: "Iron Bow",
		description: "Reinforced composite bow delivering fast, piercing volleys.",
		category: "gear",
		rarity: "uncommon",
		icon: "🏹",
		equipment: {
			slot: "weapon",
			gearType: "bow",
			allowedClasses: ["bow"],
			damageBonus: 5,
			attackSpeedMultiplier: 1.25,
			rangeBonus: 50
		}
	},
	"bow-great": {
		id: "bow-great",
		name: "Piercing Warbow",
		description: "Heavy horn bow with long reach and lethal arrow penetration.",
		category: "gear",
		rarity: "rare",
		icon: "🎯",
		equipment: {
			slot: "weapon",
			gearType: "bow",
			allowedClasses: ["bow"],
			damageBonus: 10,
			attackSpeedMultiplier: 1.15,
			rangeBonus: 100
		}
	},
	"bow-cyclone": {
		id: "bow-cyclone",
		name: "Gale Bow",
		description: "Masterwork bow blessed with wind spirits. Rains storming arrow barrages.",
		category: "gear",
		rarity: "epic",
		icon: "🌪️",
		equipment: {
			slot: "weapon",
			gearType: "bow",
			allowedClasses: ["bow"],
			damageBonus: 18,
			attackSpeedMultiplier: 1.45,
			rangeBonus: 150
		}
	},
	"club-wood": {
		id: "club-wood",
		name: "Wooden Club",
		description: "Heavy log bludgeon that smashes into enemy frontlines.",
		category: "gear",
		rarity: "common",
		icon: "🪵",
		equipment: {
			slot: "weapon",
			gearType: "club",
			allowedClasses: ["deka"],
			damageBonus: 0,
			attackSpeedMultiplier: 1,
			rangeBonus: 0,
			hpBonus: 15
		}
	},
	"club-iron": {
		id: "club-iron",
		name: "Iron Mace",
		description: "Spiked iron club with crushing stagger and impact power.",
		category: "gear",
		rarity: "uncommon",
		icon: "🔨",
		equipment: {
			slot: "weapon",
			gearType: "club",
			allowedClasses: ["deka"],
			damageBonus: 8,
			attackSpeedMultiplier: 1.1,
			rangeBonus: 10,
			hpBonus: 30
		}
	},
	"club-crusher": {
		id: "club-crusher",
		name: "Titan Hammer",
		description: "Enormous heavy hammer capable of shattering fortress fortifications.",
		category: "gear",
		rarity: "rare",
		icon: "⚒️",
		equipment: {
			slot: "weapon",
			gearType: "club",
			allowedClasses: ["deka"],
			damageBonus: 16,
			attackSpeedMultiplier: 1.2,
			rangeBonus: 20,
			hpBonus: 60
		}
	},
	"club-divine": {
		id: "club-divine",
		name: "Divine Greatclub",
		description: "Legendary giant maul causing seismic shockwaves on impact.",
		category: "gear",
		rarity: "epic",
		icon: "💥",
		equipment: {
			slot: "weapon",
			gearType: "club",
			allowedClasses: ["deka"],
			damageBonus: 26,
			attackSpeedMultiplier: 1.35,
			rangeBonus: 30,
			hpBonus: 110
		}
	},
	"horn-wood": {
		id: "horn-wood",
		name: "Wooden Horn",
		description: "Carved war horn blasting rhythmic sonic soundwaves.",
		category: "gear",
		rarity: "common",
		icon: "📯",
		equipment: {
			slot: "weapon",
			gearType: "horn",
			allowedClasses: ["mega"],
			damageBonus: 0,
			attackSpeedMultiplier: 1,
			rangeBonus: 0
		}
	},
	"horn-iron": {
		id: "horn-iron",
		name: "Iron Horn",
		description: "Polished brass horn emitting resonant shock pulses.",
		category: "gear",
		rarity: "uncommon",
		icon: "🎺",
		equipment: {
			slot: "weapon",
			gearType: "horn",
			allowedClasses: ["mega"],
			damageBonus: 5,
			attackSpeedMultiplier: 1.15,
			rangeBonus: 40
		}
	},
	"horn-sonic": {
		id: "horn-sonic",
		name: "Resonance Horn",
		description: "Harmonic horn blasting wide musical blasts that disrupt enemy ranks.",
		category: "gear",
		rarity: "rare",
		icon: "🎶",
		equipment: {
			slot: "weapon",
			gearType: "horn",
			allowedClasses: ["mega"],
			damageBonus: 11,
			attackSpeedMultiplier: 1.3,
			rangeBonus: 80
		}
	},
	"horn-divine": {
		id: "horn-divine",
		name: "Divine Warhorn",
		description: "Celestial instrument playing the hymn of victory with devastating sonic energy.",
		category: "gear",
		rarity: "epic",
		icon: "🔔",
		equipment: {
			slot: "weapon",
			gearType: "horn",
			allowedClasses: ["mega"],
			damageBonus: 19,
			attackSpeedMultiplier: 1.5,
			rangeBonus: 120
		}
	},
	"staff-wood": {
		id: "staff-wood",
		name: "Wooden Staff",
		description: "Gnarled wooden wizard staff casting elemental fire sparks.",
		category: "gear",
		rarity: "common",
		icon: "🪄",
		equipment: {
			slot: "weapon",
			gearType: "staff",
			allowedClasses: ["maho"],
			damageBonus: 0,
			attackSpeedMultiplier: 1,
			rangeBonus: 0
		}
	},
	"staff-flame": {
		id: "staff-flame",
		name: "Flame Staff",
		description: "Pyromantic staff launching scorching fireballs into enemy lines.",
		category: "gear",
		rarity: "uncommon",
		icon: "🔥",
		equipment: {
			slot: "weapon",
			gearType: "staff",
			allowedClasses: ["maho"],
			damageBonus: 6,
			attackSpeedMultiplier: 1.2,
			rangeBonus: 60
		}
	},
	"staff-thunder": {
		id: "staff-thunder",
		name: "Thunder Staff",
		description: "Staff charged with crackling lightning bolts that fry opposing armies.",
		category: "gear",
		rarity: "rare",
		icon: "⚡",
		equipment: {
			slot: "weapon",
			gearType: "staff",
			allowedClasses: ["maho"],
			damageBonus: 13,
			attackSpeedMultiplier: 1.3,
			rangeBonus: 110
		}
	},
	"staff-divine": {
		id: "staff-divine",
		name: "Divine Scepter",
		description: "Sacred tribal scepter invoking Almighty meteor storms upon foes.",
		category: "gear",
		rarity: "epic",
		icon: "🌟",
		equipment: {
			slot: "weapon",
			gearType: "staff",
			allowedClasses: ["maho"],
			damageBonus: 22,
			attackSpeedMultiplier: 1.5,
			rangeBonus: 160
		}
	},
	"arm-wood": {
		id: "arm-wood",
		name: "Wooden Gauntlets",
		description: "Carved wooden brawler arms with reinforced knuckles.",
		category: "gear",
		rarity: "common",
		icon: "🥊",
		equipment: {
			slot: "weapon",
			gearType: "arm",
			allowedClasses: ["robo"],
			damageBonus: 3,
			attackSpeedMultiplier: 1,
			rangeBonus: 0,
			hpBonus: 20
		}
	},
	"arm-iron": {
		id: "arm-iron",
		name: "Iron Gauntlets",
		description: "Heavy iron fist gauntlets that shatter armor and obstacles.",
		category: "gear",
		rarity: "uncommon",
		icon: "🥊",
		equipment: {
			slot: "weapon",
			gearType: "arm",
			allowedClasses: ["robo"],
			damageBonus: 10,
			attackSpeedMultiplier: 1.1,
			rangeBonus: 10,
			hpBonus: 40
		}
	},
	"arm-crusher": {
		id: "arm-crusher",
		name: "Titan Boulder Fists",
		description: "Gigantic stone and alloy fists that crush barriers and launch boulders.",
		category: "gear",
		rarity: "rare",
		icon: "👊",
		equipment: {
			slot: "weapon",
			gearType: "arm",
			allowedClasses: ["robo"],
			damageBonus: 18,
			attackSpeedMultiplier: 1.25,
			rangeBonus: 20,
			hpBonus: 80
		}
	},
	"arm-divine": {
		id: "arm-divine",
		name: "Divine Megafists",
		description: "Colossal mythical gauntlets capable of toppling fortresses with single strikes.",
		category: "gear",
		rarity: "epic",
		icon: "💥",
		equipment: {
			slot: "weapon",
			gearType: "arm",
			allowedClasses: ["robo"],
			damageBonus: 28,
			attackSpeedMultiplier: 1.4,
			rangeBonus: 30,
			hpBonus: 140
		}
	},
	"helm-leather": {
		id: "helm-leather",
		name: "Leather Cap",
		description: "Light padded headgear offering initial protection.",
		category: "gear",
		rarity: "common",
		icon: "🧢",
		equipment: {
			slot: "helmet",
			gearType: "helmet",
			allowedClasses: [
				"spear",
				"bow",
				"aegis",
				"kiba",
				"deka",
				"mega",
				"tori",
				"maho",
				"robo",
				"banner"
			],
			hpBonus: 12,
			defenseBonus: .05
		}
	},
	"helm-iron": {
		id: "helm-iron",
		name: "Iron Helm",
		description: "Solid forged skullcap that absorbs crushing blows.",
		category: "gear",
		rarity: "uncommon",
		icon: "🪖",
		equipment: {
			slot: "helmet",
			gearType: "helmet",
			allowedClasses: [
				"spear",
				"bow",
				"aegis",
				"kiba",
				"deka",
				"mega",
				"tori",
				"maho",
				"robo",
				"banner"
			],
			hpBonus: 26,
			defenseBonus: .12
		}
	},
	"helm-great": {
		id: "helm-great",
		name: "Greathelm of Fortitude",
		description: "Heavy plate helmet worn by elite champions. Grants immense vitality and defense.",
		category: "gear",
		rarity: "rare",
		icon: "👑",
		equipment: {
			slot: "helmet",
			gearType: "helmet",
			allowedClasses: [
				"spear",
				"bow",
				"aegis",
				"kiba",
				"deka",
				"mega",
				"tori",
				"maho",
				"robo",
				"banner"
			],
			hpBonus: 48,
			defenseBonus: .2
		}
	},
	"helm-crown": {
		id: "helm-crown",
		name: "Divine War-Crown",
		description: "Ancient relic crown radiating rhythmic power, boosting the wearer's vitality.",
		category: "gear",
		rarity: "epic",
		icon: "⚜️",
		equipment: {
			slot: "helmet",
			gearType: "helmet",
			allowedClasses: [
				"spear",
				"bow",
				"aegis",
				"kiba",
				"deka",
				"mega",
				"tori",
				"maho",
				"robo",
				"banner"
			],
			hpBonus: 75,
			defenseBonus: .28
		}
	},
	"mat-meat-leather": {
		id: "mat-meat-leather",
		name: "Tough Jerky",
		description: "Chewy, protein-rich dried beast meat obtained from basic game hunts.",
		category: "food",
		rarity: "common",
		icon: "🥩"
	},
	"mat-meat-tender": {
		id: "mat-meat-tender",
		name: "Tender Haunch",
		description: "Juicy cut of prime game meat that empowers marching warriors.",
		category: "food",
		rarity: "uncommon",
		icon: "🍖"
	},
	"mat-meat-dream": {
		id: "mat-meat-dream",
		name: "Beast Loin",
		description: "Exquisite marbled cut yielding boundless stamina and vitality.",
		category: "food",
		rarity: "rare",
		icon: "🥓"
	},
	"mat-meat-mystery": {
		id: "mat-meat-mystery",
		name: "Celestial Cut",
		description: "Legendary gourmet delicacy coveted by tribal shamans and ancients.",
		category: "food",
		rarity: "epic",
		icon: "🍖"
	},
	"mat-wood-bitan": {
		id: "mat-wood-bitan",
		name: "Birch Timber",
		description: "Standard straight wood used for basic bows and spear shafts.",
		category: "material",
		rarity: "common",
		icon: "🪵"
	},
	"mat-wood-hinoki": {
		id: "mat-wood-hinoki",
		name: "Amber Hardwood",
		description: "Fragrant, flexible hardwood suitable for sturdy shafts and horns.",
		category: "material",
		rarity: "uncommon",
		icon: "🪵"
	},
	"mat-wood-cherry": {
		id: "mat-wood-cherry",
		name: "Ironwood Branch",
		description: "Dense, resonant red timber prized for high-tier warhorns and bows.",
		category: "material",
		rarity: "rare",
		icon: "🪵"
	},
	"mat-wood-cedar": {
		id: "mat-wood-cedar",
		name: "Elder Heartwood",
		description: "Ancient colossal forest wood imbued with primal nature spirits.",
		category: "material",
		rarity: "epic",
		icon: "🌲"
	},
	"mat-stone-rock": {
		id: "mat-stone-rock",
		name: "Quarry Stone",
		description: "Common river pebble and quarry rock for basic armor and shields.",
		category: "material",
		rarity: "common",
		icon: "🪨"
	},
	"mat-stone-hardiron": {
		id: "mat-stone-hardiron",
		name: "Dark Iron Ore",
		description: "Dense dark ore smelted into tough soldier equipment.",
		category: "material",
		rarity: "uncommon",
		icon: "🔩"
	},
	"mat-stone-titanium": {
		id: "mat-stone-titanium",
		name: "Titan Ore",
		description: "Ultra-resilient lustrous ore resistant to heavy crushing force.",
		category: "material",
		rarity: "rare",
		icon: "💎"
	},
	"mat-stone-mythril": {
		id: "mat-stone-mythril",
		name: "Astral Crystal",
		description: "Mythical silvery mineral with near-weightless durability and shine.",
		category: "material",
		rarity: "epic",
		icon: "✨"
	},
	"mat-alloy-sloppy": {
		id: "mat-alloy-sloppy",
		name: "Rough Slag Alloy",
		description: "Rough slag metal forged in basic campfire crucibles.",
		category: "material",
		rarity: "common",
		icon: "⚙️"
	},
	"mat-alloy-hard": {
		id: "mat-alloy-hard",
		name: "Tempered Ingot",
		description: "Carefully tempered alloy ingots for reinforced shields and blades.",
		category: "material",
		rarity: "uncommon",
		icon: "🛡️"
	},
	"mat-alloy-awesome": {
		id: "mat-alloy-awesome",
		name: "Resonant Alloy",
		description: "Masterwork forged ingot vibrating with rhythmic battle energy.",
		category: "material",
		rarity: "rare",
		icon: "🔶"
	},
	"mat-alloy-magic": {
		id: "mat-alloy-magic",
		name: "Arcane Alloy",
		description: "Alchemical metal infused with divine rhythmic enchantments.",
		category: "material",
		rarity: "epic",
		icon: "🔮"
	},
	"mat-veg-eyeball": {
		id: "mat-veg-eyeball",
		name: "Sun Cabbage",
		description: "Crisp and nutritious field crop grown in sunny tribal valleys.",
		category: "food",
		rarity: "common",
		icon: "🥬"
	},
	"mat-veg-crying": {
		id: "mat-veg-crying",
		name: "Ember Root",
		description: "Sweet, spicy root vegetable bursting with fiery energy.",
		category: "food",
		rarity: "uncommon",
		icon: "🥕"
	},
	"mat-veg-predator": {
		id: "mat-veg-predator",
		name: "Bramble Gourd",
		description: "Rare thorny gourd prized by tribal stewmasters and witch doctors.",
		category: "food",
		rarity: "rare",
		icon: "🎃"
	},
	"wood-branch": {
		id: "wood-branch",
		name: "Birch Timber",
		description: "Flexible hardwood timber used for bows and spear shafts.",
		category: "material",
		rarity: "common",
		icon: "🪵"
	},
	"iron-scrap": {
		id: "iron-scrap",
		name: "Dark Iron Ore",
		description: "Jagged pieces of dense iron. Essential for forging shields and spear tips.",
		category: "material",
		rarity: "common",
		icon: "🔩"
	},
	"stone-chunk": {
		id: "stone-chunk",
		name: "Quarry Stone",
		description: "Dense river stones and quarry rocks used for fortifications and unit gear.",
		category: "material",
		rarity: "common",
		icon: "🪨"
	},
	"goretusk-fang": {
		id: "goretusk-fang",
		name: "Goretusk Fang",
		description: "Sharp curved tusk dropped by wild beasts.",
		category: "material",
		rarity: "common",
		icon: "🦷"
	},
	"beast-meat": {
		id: "beast-meat",
		name: "Tough Jerky",
		description: "Hearty dried meat collected from hunts to nourish the army.",
		category: "food",
		rarity: "common",
		icon: "🍖"
	},
	"brute-hide": {
		id: "brute-hide",
		name: "Tuskbrute Hide",
		description: "Thick, layered leather that dampens heavy shockwaves.",
		category: "material",
		rarity: "uncommon",
		icon: "🛡️"
	},
	"drummer-resin": {
		id: "drummer-resin",
		name: "Drummer's Resin",
		description: "Aromatic sap that resonates with the rhythm of the drums.",
		category: "material",
		rarity: "uncommon",
		icon: "💧"
	},
	"howl-core": {
		id: "howl-core",
		name: "Iron Howl Core",
		description: "Pulsing iron reactor retrieved from the defeated Iron Howl behemoth.",
		category: "relic",
		rarity: "rare",
		icon: "🔮"
	},
	"ancient-sigil": {
		id: "ancient-sigil",
		name: "Ancient Sigil",
		description: "A mysterious tribal token engraved with forgotten rhythm symbols.",
		category: "relic",
		rarity: "rare",
		icon: "✨"
	}
};
var CLASSES = {
	banner: {
		id: "banner",
		name: "Bannerkin",
		roleTitle: "Standard Bearer",
		sprite: "bannerkin-idle",
		hp: 55,
		damage: 0,
		range: 0,
		role: "flag",
		slots: ["helmet"]
	},
	spear: {
		id: "spear",
		name: "Spearkin",
		roleTitle: "Spear Hurler",
		sprite: "spearkin-idle",
		hp: 44,
		damage: 14,
		range: 380,
		role: "ranged",
		slots: ["weapon", "helmet"]
	},
	aegis: {
		id: "aegis",
		name: "Aegiskin",
		roleTitle: "Shield Guard",
		sprite: "aegiskin-idle",
		hp: 80,
		damage: 10,
		range: 75,
		role: "tank",
		slots: [
			"weapon",
			"shield",
			"helmet"
		]
	},
	bow: {
		id: "bow",
		name: "Bowkin",
		roleTitle: "Storm Archer",
		sprite: "bowkin-idle",
		hp: 34,
		damage: 9,
		range: 420,
		role: "ranged",
		slots: ["weapon", "helmet"]
	},
	kiba: {
		id: "kiba",
		name: "Horsekin",
		roleTitle: "Cavalry Charger",
		sprite: "kibakin-idle",
		hp: 68,
		damage: 18,
		range: 120,
		role: "melee",
		slots: ["weapon", "helmet"]
	},
	deka: {
		id: "deka",
		name: "Bludgeonkin",
		roleTitle: "Heavy Smasher",
		sprite: "dekakin-idle",
		hp: 125,
		damage: 24,
		range: 85,
		role: "melee",
		slots: ["weapon", "helmet"]
	},
	mega: {
		id: "mega",
		name: "Warhornkin",
		roleTitle: "Sonic Blaster",
		sprite: "megakin-idle",
		hp: 42,
		damage: 13,
		range: 360,
		role: "ranged",
		slots: ["weapon", "helmet"]
	},
	tori: {
		id: "tori",
		name: "Wingkin",
		roleTitle: "Sky Lancer",
		sprite: "torikin-idle",
		hp: 46,
		damage: 15,
		range: 310,
		role: "ranged",
		slots: ["weapon", "helmet"]
	},
	maho: {
		id: "maho",
		name: "Magekin",
		roleTitle: "Mystic Channeler",
		sprite: "mahokin-idle",
		hp: 36,
		damage: 17,
		range: 400,
		role: "magic",
		slots: ["weapon", "helmet"]
	},
	robo: {
		id: "robo",
		name: "Mechakin",
		roleTitle: "Fist Brawler",
		sprite: "robokin-idle",
		hp: 110,
		damage: 22,
		range: 95,
		role: "melee",
		slots: ["weapon", "helmet"]
	}
};
function computeUnitStats(unit) {
	const base = CLASSES[unit.cls] ?? CLASSES.banner;
	let hp = base.hp;
	let damage = base.damage;
	let range = base.range;
	let defense = 0;
	let attackSpeed = 1;
	if (unit.weapon) {
		const weaponDef = ITEMS[unit.weapon];
		if (weaponDef?.equipment) {
			damage += weaponDef.equipment.damageBonus ?? 0;
			range += weaponDef.equipment.rangeBonus ?? 0;
			defense += weaponDef.equipment.defenseBonus ?? 0;
			hp += weaponDef.equipment.hpBonus ?? 0;
			attackSpeed *= weaponDef.equipment.attackSpeedMultiplier ?? 1;
		}
	}
	if (unit.shield) {
		const shieldDef = ITEMS[unit.shield];
		if (shieldDef?.equipment) {
			damage += shieldDef.equipment.damageBonus ?? 0;
			range += shieldDef.equipment.rangeBonus ?? 0;
			defense += shieldDef.equipment.defenseBonus ?? 0;
			hp += shieldDef.equipment.hpBonus ?? 0;
			attackSpeed *= shieldDef.equipment.attackSpeedMultiplier ?? 1;
		}
	}
	if (unit.helmet) {
		const helmDef = ITEMS[unit.helmet];
		if (helmDef?.equipment) {
			hp += helmDef.equipment.hpBonus ?? 0;
			defense += helmDef.equipment.defenseBonus ?? 0;
		}
	}
	return {
		hp: Math.max(1, hp),
		damage: Math.max(0, damage),
		range: Math.max(0, range),
		defense: Math.min(.85, Math.max(0, defense)),
		attackSpeed: Math.max(.5, attackSpeed),
		role: base.role
	};
}
var ENEMY_STATS = {
	kooda: {
		name: "Swift Kooda",
		sprite: "kooda-idle",
		hp: 22,
		damage: 0,
		range: 160,
		speed: 75,
		scale: .8,
		isFleeing: true
	},
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
		hp: 95,
		damage: 15,
		range: 82,
		speed: 32,
		scale: 1.28
	},
	stag: {
		name: "Golden Antler",
		sprite: "stag-idle",
		hp: 58,
		damage: 0,
		range: 180,
		speed: 80,
		scale: 1.05,
		isFleeing: true
	},
	"sand-crab": {
		name: "Ironback Scuttler",
		sprite: "crab-idle",
		hp: 120,
		damage: 12,
		range: 65,
		speed: 26,
		scale: 1.15
	},
	barricade: {
		name: "Wood Palisade",
		sprite: "barricade-idle",
		hp: 150,
		damage: 0,
		range: 0,
		speed: 0,
		scale: 1.1,
		isStationary: true
	},
	"stone-wall": {
		name: "Stone Gate Rampart",
		sprite: "stone-wall-idle",
		hp: 340,
		damage: 0,
		range: 0,
		speed: 0,
		scale: 1.35,
		isStationary: true
	},
	watchtower: {
		name: "Archer Watchtower",
		sprite: "watchtower-idle",
		hp: 220,
		damage: 10,
		range: 320,
		speed: 0,
		scale: 1.3,
		isStationary: true,
		isRanged: true
	},
	"catapult-tower": {
		name: "Ballista Bastion",
		sprite: "catapult-tower-idle",
		hp: 450,
		damage: 24,
		range: 420,
		speed: 0,
		scale: 1.55,
		isStationary: true,
		isRanged: true
	},
	"tribe-spear": {
		name: "Redmask Lancer",
		sprite: "tribe-spear-idle",
		hp: 36,
		damage: 9,
		range: 240,
		speed: 40,
		scale: .95,
		isRanged: true
	},
	"tribe-shield": {
		name: "Redmask Bulwark",
		sprite: "tribe-shield-idle",
		hp: 75,
		damage: 7,
		range: 60,
		speed: 36,
		scale: .98
	},
	"tribe-bow": {
		name: "Redmask Archer",
		sprite: "tribe-bow-idle",
		hp: 30,
		damage: 8,
		range: 340,
		speed: 34,
		scale: .92,
		isRanged: true
	},
	"tribe-kiba": {
		name: "Redmask Rider",
		sprite: "tribe-kiba-idle",
		hp: 70,
		damage: 16,
		range: 75,
		speed: 70,
		scale: 1.05
	},
	"tribe-deka": {
		name: "Redmask Crusher",
		sprite: "tribe-deka-idle",
		hp: 140,
		damage: 22,
		range: 75,
		speed: 25,
		scale: 1.35
	},
	"tribe-tori": {
		name: "Redmask Skystriker",
		sprite: "tribe-tori-idle",
		hp: 48,
		damage: 12,
		range: 220,
		speed: 48,
		scale: 1,
		flying: true,
		isRanged: true
	},
	howl: {
		name: "Iron Howl",
		sprite: "howl-idle",
		hp: 420,
		damage: 22,
		range: 110,
		speed: 22,
		scale: 1.7,
		isBoss: true
	},
	"drake-titan": {
		name: "Pyro Drake Volcan",
		sprite: "drake-idle",
		hp: 780,
		damage: 32,
		range: 140,
		speed: 18,
		scale: 2.1,
		isBoss: true
	},
	"colossus-golem": {
		name: "Ruin Golem Colossus",
		sprite: "golem-idle",
		hp: 1150,
		damage: 40,
		range: 130,
		speed: 14,
		scale: 2.3,
		isBoss: true
	}
};
var STARTER_ARMY = [
	"banner",
	"bow",
	"bow",
	"spear",
	"spear",
	"spear",
	"aegis",
	"aegis"
];
var MAX_UNITS_PER_CLASS = {
	banner: 1,
	spear: 6,
	aegis: 6,
	bow: 6,
	kiba: 3,
	deka: 3,
	mega: 3,
	tori: 3,
	maho: 3,
	robo: 3
};
var UNIT_CREATION_RECIPES = {
	spear: { materials: {
		"mat-meat-leather": 2,
		"mat-wood-bitan": 2,
		"mat-stone-rock": 1
	} },
	aegis: { materials: {
		"mat-meat-leather": 2,
		"mat-stone-rock": 2,
		"mat-alloy-sloppy": 1
	} },
	bow: { materials: {
		"mat-meat-leather": 2,
		"mat-wood-bitan": 3,
		"mat-stone-rock": 1
	} },
	kiba: { materials: {
		"mat-meat-tender": 2,
		"mat-alloy-hard": 2,
		"mat-wood-hinoki": 1
	} },
	deka: { materials: {
		"mat-meat-tender": 3,
		"mat-stone-hardiron": 2,
		"mat-alloy-hard": 1
	} },
	mega: { materials: {
		"mat-wood-cherry": 2,
		"mat-alloy-hard": 2,
		"mat-meat-tender": 1
	} },
	tori: { materials: {
		"mat-meat-tender": 2,
		"mat-wood-cherry": 2,
		"mat-stone-titanium": 1
	} },
	maho: { materials: {
		"mat-wood-cherry": 2,
		"mat-alloy-awesome": 1,
		"mat-meat-dream": 1
	} },
	robo: { materials: {
		"mat-stone-hardiron": 3,
		"mat-alloy-hard": 2,
		"mat-meat-tender": 2
	} }
};
function canCreateUnit(cls, roster, inventory) {
	if (cls === "banner") return {
		allowed: false,
		reason: "Bannerkin is unique and cannot be cloned."
	};
	const currentCount = roster.filter((u) => u.cls === cls).length;
	const maxAllowed = MAX_UNITS_PER_CLASS[cls] ?? 3;
	if (currentCount >= maxAllowed) return {
		allowed: false,
		reason: `Maximum limit reached (${maxAllowed}/${maxAllowed}).`
	};
	const recipe = UNIT_CREATION_RECIPES[cls];
	if (!recipe) return {
		allowed: false,
		reason: "No creation recipe found."
	};
	for (const [matId, reqQty] of Object.entries(recipe.materials)) if ((inventory[matId] ?? 0) + (inventory[getMaterialAlias(matId)] ?? 0) < reqQty) return {
		allowed: false,
		reason: `Missing materials.`
	};
	return { allowed: true };
}
function getMaterialAlias(matId) {
	return {
		"mat-meat-leather": "beast-meat",
		"mat-wood-bitan": "wood-branch",
		"mat-stone-rock": "stone-chunk",
		"mat-stone-hardiron": "iron-scrap",
		"mat-alloy-sloppy": "iron-scrap",
		"beast-meat": "mat-meat-leather",
		"wood-branch": "mat-wood-bitan",
		"stone-chunk": "mat-stone-rock",
		"iron-scrap": "mat-stone-hardiron"
	}[matId] ?? "";
}
function getDefaultStarterGear(cls) {
	switch (cls) {
		case "spear": return {
			weapon: "spear-wood",
			helmet: "helm-leather"
		};
		case "aegis": return {
			weapon: "sword-wood",
			shield: "shield-wood",
			helmet: "helm-leather"
		};
		case "bow": return {
			weapon: "bow-wood",
			helmet: "helm-leather"
		};
		case "kiba": return {
			weapon: "spear-wood",
			helmet: "helm-leather"
		};
		case "deka": return {
			weapon: "club-wood",
			helmet: "helm-leather"
		};
		case "mega": return {
			weapon: "horn-wood",
			helmet: "helm-leather"
		};
		case "tori": return {
			weapon: "spear-wood",
			helmet: "helm-leather"
		};
		case "maho": return {
			weapon: "staff-wood",
			helmet: "helm-leather"
		};
		case "robo": return {
			weapon: "arm-wood",
			helmet: "helm-leather"
		};
		case "banner": return { helmet: "helm-leather" };
	}
}
function createStarterRoster() {
	return STARTER_ARMY.map((cls, idx) => {
		const gear = getDefaultStarterGear(cls);
		return {
			id: `starter-${cls}-${idx}`,
			cls,
			level: 1,
			weapon: gear.weapon,
			shield: gear.shield,
			helmet: gear.helmet
		};
	});
}
/**
* Calculates a power/effectiveness score for a piece of gear when equipped on a specific unit class.
*/
function getGearScore(itemId, cls) {
	const item = ITEMS[itemId];
	if (!item || !item.equipment) return 0;
	if (!item.equipment.allowedClasses.includes(cls)) return -1;
	const eq = item.equipment;
	let score = 0;
	score += {
		common: 10,
		uncommon: 25,
		rare: 50,
		epic: 90
	}[item.rarity] ?? 10;
	if (eq.damageBonus) score += eq.damageBonus * 4;
	if (eq.hpBonus) score += eq.hpBonus * 1.2;
	if (eq.defenseBonus) score += eq.defenseBonus * 120;
	if (eq.rangeBonus) score += eq.rangeBonus * .3;
	if (eq.attackSpeedMultiplier && eq.attackSpeedMultiplier > 1) score += (eq.attackSpeedMultiplier - 1) * 100;
	if (cls === "aegis") {
		if (eq.defenseBonus) score += eq.defenseBonus * 80;
		if (eq.hpBonus) score += eq.hpBonus * 1.5;
	} else if (cls === "bow" || cls === "mega" || cls === "maho") {
		if (eq.rangeBonus) score += eq.rangeBonus * .5;
		if (eq.damageBonus) score += eq.damageBonus * 3;
	} else if (cls === "spear" || cls === "kiba" || cls === "tori") {
		if (eq.damageBonus) score += eq.damageBonus * 3;
		if (eq.attackSpeedMultiplier && eq.attackSpeedMultiplier > 1) score += (eq.attackSpeedMultiplier - 1) * 80;
	} else if (cls === "deka" || cls === "robo") {
		if (eq.damageBonus) score += eq.damageBonus * 5;
		if (eq.hpBonus) score += eq.hpBonus * 2;
	}
	return Math.round(score);
}
/**
* Optimizes equipment for all units of a given class (or all units in the roster if targetClass is omitted).
* Pulls currently equipped gear for target units back into the candidate pool, sorts available items by score,
* and equips the highest-scoring weapons, shields, and helmets to all units of that class.
*/
function optimizeUnitsEquipment(roster, inventory, targetClass) {
	if ((targetClass ? roster.filter((u) => u.cls === targetClass) : roster).length === 0) return {
		updatedRoster: [...roster],
		updatedInventory: { ...inventory },
		changesCount: 0
	};
	const updatedInv = { ...inventory };
	let changesCount = 0;
	const classesToOptimize = targetClass ? [targetClass] : Array.from(new Set(roster.map((u) => u.cls)));
	const newRosterMap = new Map(roster.map((u) => [u.id, { ...u }]));
	for (const cls of classesToOptimize) {
		const classUnits = roster.filter((u) => u.cls === cls);
		if (classUnits.length === 0) continue;
		const availableWeapons = [];
		const availableShields = [];
		const availableHelmets = [];
		for (const [itemId, qty] of Object.entries(updatedInv)) {
			if (qty <= 0) continue;
			const item = ITEMS[itemId];
			if (!item?.equipment) continue;
			if (!item.equipment.allowedClasses.includes(cls)) continue;
			for (let i = 0; i < qty; i++) if (item.equipment.slot === "weapon") availableWeapons.push(itemId);
			else if (item.equipment.slot === "shield") availableShields.push(itemId);
			else if (item.equipment.slot === "helmet") availableHelmets.push(itemId);
		}
		for (const unit of classUnits) {
			if (unit.weapon) availableWeapons.push(unit.weapon);
			if (unit.shield) availableShields.push(unit.shield);
			if (unit.helmet) availableHelmets.push(unit.helmet);
		}
		availableWeapons.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));
		availableShields.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));
		availableHelmets.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));
		for (const itemId of /* @__PURE__ */ new Set([
			...availableWeapons,
			...availableShields,
			...availableHelmets
		])) delete updatedInv[itemId];
		let weaponIdx = 0;
		let shieldIdx = 0;
		let helmetIdx = 0;
		for (const unit of classUnits) {
			const currentMember = newRosterMap.get(unit.id);
			let newWeapon = void 0;
			let newShield = void 0;
			let newHelmet = void 0;
			if (cls !== "banner" && weaponIdx < availableWeapons.length) newWeapon = availableWeapons[weaponIdx++];
			if (cls === "aegis" && shieldIdx < availableShields.length) newShield = availableShields[shieldIdx++];
			if (helmetIdx < availableHelmets.length) newHelmet = availableHelmets[helmetIdx++];
			if (currentMember.weapon !== newWeapon || currentMember.shield !== newShield || currentMember.helmet !== newHelmet) changesCount++;
			newRosterMap.set(unit.id, {
				...currentMember,
				weapon: newWeapon,
				shield: newShield,
				helmet: newHelmet
			});
		}
		for (let i = weaponIdx; i < availableWeapons.length; i++) {
			const id = availableWeapons[i];
			updatedInv[id] = (updatedInv[id] ?? 0) + 1;
		}
		for (let i = shieldIdx; i < availableShields.length; i++) {
			const id = availableShields[i];
			updatedInv[id] = (updatedInv[id] ?? 0) + 1;
		}
		for (let i = helmetIdx; i < availableHelmets.length; i++) {
			const id = availableHelmets[i];
			updatedInv[id] = (updatedInv[id] ?? 0) + 1;
		}
	}
	return {
		updatedRoster: roster.map((u) => newRosterMap.get(u.id) ?? u),
		updatedInventory: updatedInv,
		changesCount
	};
}
var KEY = "rhythm-army-save";
var defaultSave = () => ({
	version: 3,
	completed: [],
	bestCombo: 0,
	offsetMs: 0,
	roster: createStarterRoster(),
	inventory: {},
	settings: {
		master: .85,
		music: .45,
		sfx: .9,
		shake: .7
	}
});
function migrate(raw) {
	const base = defaultSave();
	let roster = base.roster;
	if (Array.isArray(raw.roster) && raw.roster.length > 0) {
		roster = raw.roster.filter((u) => Boolean(u && typeof u.id === "string" && typeof u.cls === "string")).map((u) => {
			const defaultGear = getDefaultStarterGear(u.cls);
			return {
				id: u.id,
				cls: u.cls,
				level: typeof u.level === "number" && u.level > 0 ? u.level : 1,
				weapon: typeof u.weapon === "string" ? u.weapon : defaultGear.weapon,
				shield: typeof u.shield === "string" ? u.shield : defaultGear.shield,
				helmet: typeof u.helmet === "string" ? u.helmet : defaultGear.helmet
			};
		});
		if (roster.length === 0) roster = base.roster;
	}
	const inventory = {};
	if (raw.inventory && typeof raw.inventory === "object" && !Array.isArray(raw.inventory)) {
		for (const [k, v] of Object.entries(raw.inventory)) if (typeof v === "number" && v > 0) inventory[k] = Math.floor(v);
	}
	return {
		...base,
		...raw,
		version: 3,
		completed: Array.isArray(raw.completed) ? raw.completed : [],
		roster,
		inventory,
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
		if (typeof localStorage === "undefined") return defaultSave();
		const v = localStorage.getItem(KEY);
		if (!v) return defaultSave();
		return migrate(JSON.parse(v));
	} catch {
		return defaultSave();
	}
}
function writeSave(save) {
	try {
		if (typeof localStorage === "undefined") return;
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}
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
		hint: "Raise shields & counter"
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
/**
* Timing windows, measured either side of the beat. This is the one place to tune how
* forgiving the drums feel. A tap inside `perfectMs` is Perfect, inside `goodMs` is Good.
* Anything further out is an off-beat tap: it is ignored, it does not reset the sequence.
*/
var TIMING = {
	perfectMs: 85,
	goodMs: 190
};
/** The good window never grows past this share of a beat, so neighbouring beats can't overlap. */
var MAX_GOOD_BEAT_SHARE = .45;
/**
* Drop table per enemy type.
* At most 1 item drops per defeated mob.
*/
var ENEMY_MOB_DROP_RATES = {
	kooda: .85,
	goretusk: .5,
	brute: .7,
	stag: .9,
	"sand-crab": .65,
	barricade: .5,
	"stone-wall": .6,
	watchtower: .75,
	"catapult-tower": .85,
	"tribe-spear": .55,
	"tribe-shield": .6,
	"tribe-bow": .55,
	"tribe-kiba": .65,
	"tribe-deka": .75,
	"tribe-tori": .7,
	howl: 1,
	"drake-titan": 1,
	"colossus-golem": 1
};
var ENEMY_LOOT_TABLE = {
	kooda: [
		{
			itemId: "mat-meat-leather",
			weight: 35
		},
		{
			itemId: "mat-veg-eyeball",
			weight: 35
		},
		{
			itemId: "mat-wood-bitan",
			weight: 20
		},
		{
			itemId: "mat-meat-tender",
			weight: 10
		}
	],
	goretusk: [
		{
			itemId: "mat-meat-leather",
			weight: 28
		},
		{
			itemId: "mat-wood-bitan",
			weight: 22
		},
		{
			itemId: "mat-stone-rock",
			weight: 18
		},
		{
			itemId: "goretusk-fang",
			weight: 12
		},
		{
			itemId: "mat-veg-eyeball",
			weight: 10
		},
		{
			itemId: "spear-wood",
			weight: 4
		},
		{
			itemId: "sword-wood",
			weight: 3
		},
		{
			itemId: "helm-leather",
			weight: 3
		}
	],
	brute: [
		{
			itemId: "mat-meat-tender",
			weight: 20
		},
		{
			itemId: "mat-stone-hardiron",
			weight: 20
		},
		{
			itemId: "mat-alloy-hard",
			weight: 16
		},
		{
			itemId: "mat-wood-hinoki",
			weight: 14
		},
		{
			itemId: "brute-hide",
			weight: 10
		},
		{
			itemId: "mat-veg-crying",
			weight: 8
		},
		{
			itemId: "spear-iron",
			weight: 3
		},
		{
			itemId: "sword-iron",
			weight: 3
		},
		{
			itemId: "shield-iron",
			weight: 3
		},
		{
			itemId: "bow-recurve",
			weight: 3
		}
	],
	stag: [
		{
			itemId: "mat-meat-tender",
			weight: 30
		},
		{
			itemId: "mat-meat-dream",
			weight: 20
		},
		{
			itemId: "mat-veg-crying",
			weight: 25
		},
		{
			itemId: "mat-wood-cherry",
			weight: 15
		},
		{
			itemId: "mat-stone-titanium",
			weight: 10
		}
	],
	"sand-crab": [
		{
			itemId: "mat-stone-hardiron",
			weight: 30
		},
		{
			itemId: "mat-meat-tender",
			weight: 25
		},
		{
			itemId: "mat-alloy-hard",
			weight: 25
		},
		{
			itemId: "shield-iron",
			weight: 10
		},
		{
			itemId: "helm-iron",
			weight: 10
		}
	],
	barricade: [
		{
			itemId: "mat-wood-bitan",
			weight: 50
		},
		{
			itemId: "mat-wood-hinoki",
			weight: 30
		},
		{
			itemId: "mat-stone-rock",
			weight: 20
		}
	],
	"stone-wall": [
		{
			itemId: "mat-stone-rock",
			weight: 40
		},
		{
			itemId: "mat-stone-hardiron",
			weight: 35
		},
		{
			itemId: "mat-alloy-sloppy",
			weight: 25
		}
	],
	watchtower: [
		{
			itemId: "mat-wood-hinoki",
			weight: 30
		},
		{
			itemId: "mat-wood-cherry",
			weight: 25
		},
		{
			itemId: "bow-wood",
			weight: 15
		},
		{
			itemId: "bow-recurve",
			weight: 15
		},
		{
			itemId: "helm-leather",
			weight: 15
		}
	],
	"catapult-tower": [
		{
			itemId: "mat-stone-titanium",
			weight: 30
		},
		{
			itemId: "mat-alloy-awesome",
			weight: 25
		},
		{
			itemId: "mat-wood-cedar",
			weight: 20
		},
		{
			itemId: "bow-great",
			weight: 15
		},
		{
			itemId: "shield-tower",
			weight: 10
		}
	],
	"tribe-spear": [
		{
			itemId: "mat-wood-bitan",
			weight: 30
		},
		{
			itemId: "mat-stone-rock",
			weight: 25
		},
		{
			itemId: "spear-wood",
			weight: 25
		},
		{
			itemId: "spear-iron",
			weight: 20
		}
	],
	"tribe-shield": [
		{
			itemId: "mat-stone-hardiron",
			weight: 30
		},
		{
			itemId: "mat-alloy-sloppy",
			weight: 25
		},
		{
			itemId: "shield-wood",
			weight: 25
		},
		{
			itemId: "shield-iron",
			weight: 20
		}
	],
	"tribe-bow": [
		{
			itemId: "mat-wood-bitan",
			weight: 35
		},
		{
			itemId: "mat-meat-leather",
			weight: 25
		},
		{
			itemId: "bow-wood",
			weight: 25
		},
		{
			itemId: "bow-recurve",
			weight: 15
		}
	],
	"tribe-kiba": [
		{
			itemId: "mat-meat-tender",
			weight: 30
		},
		{
			itemId: "mat-alloy-hard",
			weight: 25
		},
		{
			itemId: "spear-iron",
			weight: 25
		},
		{
			itemId: "spear-storm",
			weight: 20
		}
	],
	"tribe-deka": [
		{
			itemId: "mat-stone-hardiron",
			weight: 30
		},
		{
			itemId: "mat-stone-titanium",
			weight: 25
		},
		{
			itemId: "club-wood",
			weight: 25
		},
		{
			itemId: "club-iron",
			weight: 20
		}
	],
	"tribe-tori": [
		{
			itemId: "mat-wood-cherry",
			weight: 30
		},
		{
			itemId: "mat-stone-titanium",
			weight: 25
		},
		{
			itemId: "spear-iron",
			weight: 25
		},
		{
			itemId: "horn-sonic",
			weight: 20
		}
	],
	howl: [
		{
			itemId: "mat-meat-dream",
			weight: 18
		},
		{
			itemId: "mat-stone-titanium",
			weight: 16
		},
		{
			itemId: "mat-alloy-awesome",
			weight: 14
		},
		{
			itemId: "mat-wood-cherry",
			weight: 14
		},
		{
			itemId: "howl-core",
			weight: 10
		},
		{
			itemId: "ancient-sigil",
			weight: 8
		},
		{
			itemId: "sword-flame",
			weight: 4
		},
		{
			itemId: "shield-tower",
			weight: 4
		},
		{
			itemId: "bow-great",
			weight: 4
		},
		{
			itemId: "club-crusher",
			weight: 4
		},
		{
			itemId: "horn-sonic",
			weight: 2
		},
		{
			itemId: "staff-thunder",
			weight: 2
		}
	],
	"drake-titan": [
		{
			itemId: "mat-meat-mystery",
			weight: 20
		},
		{
			itemId: "mat-wood-cedar",
			weight: 18
		},
		{
			itemId: "mat-stone-mythril",
			weight: 16
		},
		{
			itemId: "mat-alloy-magic",
			weight: 16
		},
		{
			itemId: "ancient-sigil",
			weight: 10
		},
		{
			itemId: "sword-divine",
			weight: 5
		},
		{
			itemId: "spear-storm",
			weight: 5
		},
		{
			itemId: "shield-aegis-core",
			weight: 5
		},
		{
			itemId: "bow-cyclone",
			weight: 5
		}
	],
	"colossus-golem": [
		{
			itemId: "mat-stone-mythril",
			weight: 24
		},
		{
			itemId: "mat-alloy-magic",
			weight: 22
		},
		{
			itemId: "mat-wood-cedar",
			weight: 18
		},
		{
			itemId: "mat-meat-mystery",
			weight: 16
		},
		{
			itemId: "ancient-sigil",
			weight: 10
		},
		{
			itemId: "helm-crown",
			weight: 5
		},
		{
			itemId: "club-crusher",
			weight: 5
		}
	]
};
var MISSION_CLEAR_REWARDS = {
	training: [
		{
			itemId: "mat-meat-leather",
			qty: 3
		},
		{
			itemId: "mat-wood-bitan",
			qty: 3
		},
		{
			itemId: "mat-stone-rock",
			qty: 2
		},
		{
			itemId: "spear-wood",
			qty: 1
		},
		{
			itemId: "sword-wood",
			qty: 1
		},
		{
			itemId: "helm-leather",
			qty: 1
		}
	],
	"coast-hunt": [
		{
			itemId: "mat-meat-leather",
			qty: 4
		},
		{
			itemId: "mat-veg-eyeball",
			qty: 3
		},
		{
			itemId: "mat-wood-bitan",
			qty: 3
		},
		{
			itemId: "spear-wood",
			qty: 1
		},
		{
			itemId: "bow-wood",
			qty: 1
		}
	],
	"shadowmask-clash": [
		{
			itemId: "mat-meat-tender",
			qty: 3
		},
		{
			itemId: "mat-stone-hardiron",
			qty: 3
		},
		{
			itemId: "mat-alloy-sloppy",
			qty: 2
		},
		{
			itemId: "shield-wood",
			qty: 1
		},
		{
			itemId: "helm-iron",
			qty: 1
		}
	],
	"drake-caldera": [
		{
			itemId: "mat-meat-tender",
			qty: 4
		},
		{
			itemId: "mat-stone-hardiron",
			qty: 3
		},
		{
			itemId: "mat-alloy-hard",
			qty: 2
		},
		{
			itemId: "arm-iron",
			qty: 1
		},
		{
			itemId: "sword-iron",
			qty: 1
		},
		{
			itemId: "spear-iron",
			qty: 1
		}
	],
	"swamp-hunt": [
		{
			itemId: "mat-meat-tender",
			qty: 3
		},
		{
			itemId: "mat-veg-crying",
			qty: 3
		},
		{
			itemId: "mat-wood-hinoki",
			qty: 3
		},
		{
			itemId: "mat-alloy-hard",
			qty: 2
		},
		{
			itemId: "bow-recurve",
			qty: 1
		}
	],
	"jungle-gate": [
		{
			itemId: "mat-meat-dream",
			qty: 3
		},
		{
			itemId: "mat-wood-cherry",
			qty: 4
		},
		{
			itemId: "mat-alloy-awesome",
			qty: 3
		},
		{
			itemId: "sword-flame",
			qty: 1
		},
		{
			itemId: "shield-tower",
			qty: 1
		},
		{
			itemId: "bow-great",
			qty: 1
		}
	],
	"bastion-siege": [
		{
			itemId: "mat-meat-dream",
			qty: 3
		},
		{
			itemId: "mat-stone-titanium",
			qty: 4
		},
		{
			itemId: "mat-alloy-awesome",
			qty: 3
		},
		{
			itemId: "arm-crusher",
			qty: 1
		},
		{
			itemId: "staff-thunder",
			qty: 1
		},
		{
			itemId: "horn-sonic",
			qty: 1
		},
		{
			itemId: "club-crusher",
			qty: 1
		}
	],
	"iron-ridge": [
		{
			itemId: "mat-meat-dream",
			qty: 4
		},
		{
			itemId: "mat-wood-cherry",
			qty: 4
		},
		{
			itemId: "mat-stone-titanium",
			qty: 4
		},
		{
			itemId: "howl-core",
			qty: 1
		},
		{
			itemId: "club-iron",
			qty: 1
		},
		{
			itemId: "horn-iron",
			qty: 1
		}
	],
	"golem-altar": [
		{
			itemId: "mat-meat-mystery",
			qty: 2
		},
		{
			itemId: "mat-wood-cedar",
			qty: 2
		},
		{
			itemId: "mat-stone-mythril",
			qty: 2
		},
		{
			itemId: "mat-alloy-magic",
			qty: 2
		},
		{
			itemId: "ancient-sigil",
			qty: 1
		},
		{
			itemId: "arm-divine",
			qty: 1
		},
		{
			itemId: "spear-storm",
			qty: 1
		},
		{
			itemId: "sword-divine",
			qty: 1
		},
		{
			itemId: "shield-aegis-core",
			qty: 1
		},
		{
			itemId: "bow-cyclone",
			qty: 1
		},
		{
			itemId: "helm-crown",
			qty: 1
		}
	]
};
/**
* Calculates battle spoils based on defeated enemies and mission clear bonus.
* Guarantees that at most 1 item drops per defeated enemy mob.
* Accepts an optional random generator function for deterministic testing.
*/
function rollBattleLoot(missionId, killedEnemies, rng = Math.random) {
	const accumulated = {};
	const missionGuaranteed = MISSION_CLEAR_REWARDS[missionId] ?? [];
	for (const reward of missionGuaranteed) accumulated[reward.itemId] = (accumulated[reward.itemId] ?? 0) + reward.qty;
	for (const kind of killedEnemies) {
		const dropRate = ENEMY_MOB_DROP_RATES[kind] ?? .5;
		if (rng() < dropRate) {
			const table = ENEMY_LOOT_TABLE[kind] ?? [];
			const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
			if (totalWeight > 0) {
				let rolledWeight = rng() * totalWeight;
				let chosenItem = table[0].itemId;
				for (const entry of table) {
					if (rolledWeight < entry.weight) {
						chosenItem = entry.itemId;
						break;
					}
					rolledWeight -= entry.weight;
				}
				accumulated[chosenItem] = (accumulated[chosenItem] ?? 0) + 1;
			}
		}
	}
	return Object.entries(accumulated).map(([itemId, qty]) => ({
		itemId,
		qty
	}));
}
/**
* Merges loot rewards into an existing inventory record.
*/
function addLootToInventory(currentInventory, rewards) {
	const updated = { ...currentInventory };
	for (const reward of rewards) if (reward.qty > 0) updated[reward.itemId] = (updated[reward.itemId] ?? 0) + reward.qty;
	return updated;
}
var MISSIONS = [
	{
		id: "training",
		name: "Prologue: Sacred Ground of Awakening",
		blurb: "Learn the ancient drums, then MARCH and ATTACK toward the sun-disk shrine.",
		bpm: 120,
		worldLength: 2400,
		goalX: 1680,
		tutorial: true,
		waves: []
	},
	{
		id: "coast-hunt",
		name: "1. Hunting on the Coral Coast",
		blurb: "Hunt swift Kooda runners and wild Goretusks along the tropical shores for camp provisions.",
		bpm: 120,
		worldLength: 3200,
		goalX: 2800,
		unlockAfter: "training",
		waves: [{
			atX: 700,
			enemies: [{
				kind: "kooda",
				count: 3
			}, {
				kind: "goretusk",
				count: 2
			}]
		}, {
			atX: 1550,
			enemies: [{
				kind: "kooda",
				count: 4
			}, {
				kind: "goretusk",
				count: 2
			}]
		}]
	},
	{
		id: "shadowmask-clash",
		name: "2. The Masked Clan in the Jungle",
		blurb: "The mysterious Redmask Clan blocks the jungle pass with spearmen, shield guards, and archers.",
		bpm: 120,
		worldLength: 3600,
		goalX: 3100,
		unlockAfter: "coast-hunt",
		waves: [{
			atX: 750,
			enemies: [{
				kind: "tribe-spear",
				count: 3
			}, {
				kind: "tribe-shield",
				count: 2
			}]
		}, {
			atX: 1800,
			enemies: [
				{
					kind: "tribe-bow",
					count: 3
				},
				{
					kind: "tribe-shield",
					count: 2
				},
				{
					kind: "tribe-spear",
					count: 2
				}
			]
		}]
	},
	{
		id: "drake-caldera",
		name: "3. Volcanic Drake of the Caldera",
		blurb: "The volcanic Drake Titan awakens! Time your DODGE and JUMP to avoid searing infernos.",
		bpm: 120,
		worldLength: 3800,
		goalX: 3300,
		unlockAfter: "shadowmask-clash",
		waves: [{
			atX: 800,
			enemies: [{
				kind: "goretusk",
				count: 2
			}, {
				kind: "brute",
				count: 1
			}]
		}, {
			atX: 2e3,
			enemies: [{
				kind: "drake-titan",
				count: 1
			}]
		}]
	},
	{
		id: "swamp-hunt",
		name: "4. Wild Game in the Misty Swamps",
		blurb: "Pursue elusive Golden Antler stags, swift Kooda, and Armored Sand Crabs in the deep mist.",
		bpm: 120,
		worldLength: 4200,
		goalX: 3650,
		unlockAfter: "drake-caldera",
		waves: [
			{
				atX: 750,
				enemies: [{
					kind: "kooda",
					count: 3
				}, {
					kind: "sand-crab",
					count: 2
				}]
			},
			{
				atX: 1650,
				enemies: [{
					kind: "stag",
					count: 2
				}, {
					kind: "sand-crab",
					count: 2
				}]
			},
			{
				atX: 2600,
				enemies: [{
					kind: "stag",
					count: 2
				}, {
					kind: "kooda",
					count: 2
				}]
			}
		]
	},
	{
		id: "jungle-gate",
		name: "5. Assault on the Jungle Gate",
		blurb: "Smash through fortified wooden barricades and bring down reinforced archer watchtowers.",
		bpm: 120,
		worldLength: 4600,
		goalX: 4e3,
		unlockAfter: "swamp-hunt",
		waves: [
			{
				atX: 800,
				enemies: [{
					kind: "barricade",
					count: 1
				}, {
					kind: "tribe-spear",
					count: 3
				}]
			},
			{
				atX: 1750,
				enemies: [
					{
						kind: "watchtower",
						count: 1
					},
					{
						kind: "tribe-shield",
						count: 2
					},
					{
						kind: "tribe-bow",
						count: 2
					}
				]
			},
			{
				atX: 2850,
				enemies: [
					{
						kind: "barricade",
						count: 1
					},
					{
						kind: "watchtower",
						count: 1
					},
					{
						kind: "tribe-deka",
						count: 2
					},
					{
						kind: "tribe-spear",
						count: 2
					}
				]
			}
		]
	},
	{
		id: "bastion-siege",
		name: "6. Siege of the Iron Bastion",
		blurb: "Breach the massive stone gate ramparts, destroy heavy catapult towers, and defeat the Redmask elite.",
		bpm: 120,
		worldLength: 5e3,
		goalX: 4400,
		unlockAfter: "jungle-gate",
		waves: [
			{
				atX: 850,
				enemies: [
					{
						kind: "stone-wall",
						count: 1
					},
					{
						kind: "tribe-shield",
						count: 3
					},
					{
						kind: "tribe-bow",
						count: 3
					}
				]
			},
			{
				atX: 1950,
				enemies: [
					{
						kind: "catapult-tower",
						count: 1
					},
					{
						kind: "tribe-kiba",
						count: 2
					},
					{
						kind: "tribe-tori",
						count: 2
					}
				]
			},
			{
				atX: 3100,
				enemies: [
					{
						kind: "stone-wall",
						count: 1
					},
					{
						kind: "catapult-tower",
						count: 1
					},
					{
						kind: "tribe-deka",
						count: 2
					},
					{
						kind: "tribe-spear",
						count: 3
					}
				]
			}
		]
	},
	{
		id: "iron-ridge",
		name: "7. Iron Howl the Mountain Behemoth",
		blurb: "The thunderous Iron Howl behemoth guards the apex ridge. JUMP ground slams and press the assault!",
		bpm: 120,
		worldLength: 5400,
		goalX: 4800,
		unlockAfter: "bastion-siege",
		waves: [
			{
				atX: 850,
				enemies: [{
					kind: "tribe-shield",
					count: 3
				}, {
					kind: "tribe-spear",
					count: 3
				}]
			},
			{
				atX: 1900,
				enemies: [
					{
						kind: "tribe-kiba",
						count: 2
					},
					{
						kind: "tribe-deka",
						count: 2
					},
					{
						kind: "tribe-bow",
						count: 2
					}
				]
			},
			{
				atX: 3100,
				enemies: [{
					kind: "howl",
					count: 1
				}, {
					kind: "tribe-shield",
					count: 3
				}]
			}
		]
	},
	{
		id: "golem-altar",
		name: "8. Awakening of the Ruin Colossus",
		blurb: "The ancient Ruin Golem Colossus awakens at the sacred shrine! Maintain rhythm and strike with full might!",
		bpm: 120,
		worldLength: 5800,
		goalX: 5200,
		unlockAfter: "iron-ridge",
		waves: [
			{
				atX: 900,
				enemies: [{
					kind: "tribe-shield",
					count: 3
				}, {
					kind: "tribe-tori",
					count: 2
				}]
			},
			{
				atX: 2050,
				enemies: [
					{
						kind: "catapult-tower",
						count: 1
					},
					{
						kind: "tribe-deka",
						count: 2
					},
					{
						kind: "tribe-kiba",
						count: 2
					}
				]
			},
			{
				atX: 3200,
				enemies: [
					{
						kind: "stone-wall",
						count: 1
					},
					{
						kind: "tribe-shield",
						count: 3
					},
					{
						kind: "tribe-bow",
						count: 3
					}
				]
			},
			{
				atX: 4200,
				enemies: [
					{
						kind: "colossus-golem",
						count: 1
					},
					{
						kind: "tribe-deka",
						count: 1
					},
					{
						kind: "tribe-tori",
						count: 2
					}
				]
			}
		]
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
function getNextPlayableMissionId(completed) {
	if (MISSIONS.length === 0) return "training";
	const uncleared = MISSIONS.find((m) => !completed.includes(m.id) && isUnlocked(m.id, completed));
	if (uncleared) return uncleared.id;
	for (let i = MISSIONS.length - 1; i >= 0; i--) if (completed.includes(MISSIONS[i].id)) return MISSIONS[i].id;
	return MISSIONS[0].id;
}
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
	started = false;
	constructor(opts = {}) {
		this.bpm = opts.bpm ?? 120;
		this.startTime = opts.startTime ?? null;
		this.started = opts.startTime != null;
		this.inputOffsetMs = opts.inputOffsetMs ?? 0;
		this.commands = opts.commands ?? COMMANDS;
		this.beatLength = 60 / this.bpm;
		const cap = this.beatLength * 1e3 * MAX_GOOD_BEAT_SHARE;
		this.goodMs = Math.min(opts.goodMs ?? TIMING.goodMs, cap);
		this.perfectMs = Math.min(opts.perfectMs ?? TIMING.perfectMs, this.goodMs);
	}
	get fever() {
		return this.combo >= 4;
	}
	start(time) {
		const adjusted = time - this.inputOffsetMs / 1e3;
		this.startTime = adjusted;
		this.started = true;
		this.slots.clear();
		this.nextBeat = 0;
		this.nextMeasure = 0;
	}
	reset() {
		this.started = false;
		this.startTime = null;
		this.slots.clear();
		this.combo = 0;
		this.nextBeat = 0;
		this.nextMeasure = 0;
	}
	beatTime(n) {
		if (this.startTime === null) return Infinity;
		return this.startTime + n * this.beatLength;
	}
	beatPosition(time) {
		if (this.startTime === null) return -1;
		return (time - this.startTime) / this.beatLength;
	}
	judgeTap(drum, time) {
		if (!this.started || this.startTime === null) return {
			drum,
			beat: 0,
			deltaMs: 0,
			grade: "perfect"
		};
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
		if (!this.started || this.startTime === null) {
			this.start(time);
			const row = new Array(4).fill(null);
			const j = {
				drum,
				beat: 0,
				deltaMs: 0,
				grade: "perfect",
				measure: 0,
				slot: 0,
				ignored: false
			};
			row[0] = j;
			this.slots.set(0, row);
			return j;
		}
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
		if (!this.started || this.startTime === null) return [];
		const events = [];
		while (this.started && this.beatTime(this.nextBeat) <= time) {
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
		while (this.started) {
			const m = this.nextMeasure;
			const decideAt = this.beatTime(m * 8 + 4);
			if (time < decideAt) break;
			const row = this.slots.get(m);
			if (!(row !== void 0 && row.every((s) => s !== null)) && time < decideAt + grace) break;
			this.nextMeasure++;
			const ev = this.evaluate(m);
			if (ev) events.push(ev);
		}
		return events;
	}
	evaluate(measure) {
		const row = this.slots.get(measure);
		this.slots.delete(measure);
		const beat = measure * 8 + 4;
		if (!row || row.some((s) => s === null)) {
			this.combo = 0;
			this.failCount += 1;
			this.reset();
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
			this.reset();
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
function PhaserGame({ missionId }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let game;
		let dead = false;
		(async () => {
			const { createGame } = await import("./createGame-BLOVfLD1.mjs");
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
			bestCombo: Math.max(s.bestCombo, result.bestCombo),
			inventory: result.rewards ? addLootToInventory(s.inventory, result.rewards) : s.inventory
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
function CommandsModal({ open, onClose }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "commands-modal-title",
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-bg text-fg shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "commands-modal-title",
							className: "font-display text-xl tracking-wide",
							children: "Drum Commands"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: onClose,
						className: "h-8 w-8 rounded-full p-0",
						"aria-label": "Close commands",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-5 py-4 space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
						children: "Drums & Keys"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: DRUMS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-surface p-2.5 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-sm font-bold block",
								style: { color: d.color },
								children: d.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 font-mono text-[11px] text-muted block uppercase",
								children: d.keys.join(" / ")
							})]
						}, d.id))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
							children: "Command Sequences"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Enter 4 beats in rhythm during your turn:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-col gap-2",
							children: COMMANDS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm tracking-wide text-fg",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: c.hint
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap items-center gap-1.5 font-mono text-xs",
									children: c.pattern.map((drumId, i) => {
										const drum = DRUMS[drumId];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-lg px-2 py-1 font-bold text-[11px] shadow-sm border border-border/50",
											style: {
												backgroundColor: `${drum.color}22`,
												color: drum.color,
												borderColor: `${drum.color}44`
											},
											children: drum.name
										}, i);
									})
								})]
							}, c.id))
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border p-4 bg-surface/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: onClose,
						children: "Back"
					})
				})
			]
		})
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg px-5 pb-12 text-fg pt-[max(1rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => go("title"),
					className: "mb-4 gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Back"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-6 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl tracking-wide",
						children: "How to Drum"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: [
						"Each measure is eight beats. You drum the first four beats. The army answers on the next four — marching, striking, or holding. Hit the beat. Chain commands to ignite ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-accent",
							children: "Fever Mode"
						}),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
						children: "Drums & Keys"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4",
						children: DRUMS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-surface p-3 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-base font-bold block",
								style: { color: d.color },
								children: d.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 font-mono text-[11px] text-muted block uppercase",
								children: d.keys.join(" / ")
							})]
						}, d.id))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
							children: "Command Sequences"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Enter 4 beats in rhythm during your turn:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2.5 flex flex-col gap-2.5",
							children: COMMANDS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-base tracking-wide text-fg",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: c.hint
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap items-center gap-1.5 font-mono text-xs",
									children: c.pattern.map((drumId, i) => {
										const drum = DRUMS[drumId];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-lg px-2.5 py-1 font-bold text-xs shadow-sm border",
											style: {
												backgroundColor: `${drum.color}22`,
												color: drum.color,
												borderColor: `${drum.color}44`
											},
											children: drum.name
										}, i);
									})
								})]
							}, c.id))
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						size: "lg",
						onClick: () => go("title"),
						children: "Got it, Let's Drum"
					})
				})
			]
		})
	});
}
var PORTRAITS$2 = {
	spear: "/assets/sprites/spearkin-portrait.png",
	bow: "/assets/sprites/bowkin-portrait.png",
	aegis: "/assets/sprites/aegiskin-portrait.png",
	banner: "/assets/sprites/bannerkin-portrait.png",
	kiba: "/assets/sprites/spearkin-portrait.png",
	deka: "/assets/sprites/aegiskin-portrait.png",
	mega: "/assets/sprites/bowkin-portrait.png",
	tori: "/assets/sprites/spearkin-portrait.png",
	maho: "/assets/sprites/bowkin-portrait.png",
	robo: "/assets/sprites/aegiskin-portrait.png"
};
function EquipmentModal({ open, onClose, unitClass }) {
	const save = useGame((s) => s.save);
	const patchSave = useGame((s) => s.patchSave);
	const allRoster = save.roster ?? [];
	const filteredRoster = unitClass ? allRoster.filter((u) => u.cls === unitClass) : allRoster;
	const [selectedUnitId, setSelectedUnitId] = (0, import_react.useState)(() => filteredRoster[0]?.id ?? "");
	const [selectingSlot, setSelectingSlot] = (0, import_react.useState)(null);
	const [optimizeNotice, setOptimizeNotice] = (0, import_react.useState)(null);
	const [recruitNotice, setRecruitNotice] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (open) {
			if (filteredRoster.length > 0 && !filteredRoster.some((u) => u.id === selectedUnitId)) setSelectedUnitId(filteredRoster[0].id);
		} else {
			setSelectingSlot(null);
			setOptimizeNotice(null);
			setRecruitNotice(null);
		}
	}, [open, unitClass]);
	if (!open) return null;
	const currentUnit = filteredRoster.find((u) => u.id === selectedUnitId) ?? filteredRoster[0];
	const activeClass = unitClass ?? currentUnit?.cls ?? "bow";
	const classDef = CLASSES[activeClass] ?? CLASSES.banner;
	const currentCount = (save.roster ?? []).filter((u) => u.cls === activeClass).length;
	const maxAllowed = MAX_UNITS_PER_CLASS[activeClass] ?? 3;
	const isCraftable = activeClass !== "banner";
	const recruitCheck = isCraftable ? canCreateUnit(activeClass, save.roster ?? [], save.inventory ?? {}) : { allowed: false };
	const recipe = isCraftable ? UNIT_CREATION_RECIPES[activeClass] : void 0;
	const handleOptimizeGear = () => {
		patchSave((prev) => {
			const result = optimizeUnitsEquipment(prev.roster ?? [], prev.inventory ?? {}, activeClass);
			if (result.changesCount > 0) setOptimizeNotice(`Optimized gear for all ${classDef.name}s!`);
			else setOptimizeNotice(`All ${classDef.name}s already have the best available gear.`);
			setTimeout(() => setOptimizeNotice(null), 3e3);
			return {
				...prev,
				roster: result.updatedRoster,
				inventory: result.updatedInventory
			};
		});
	};
	const handleRecruitUnit = () => {
		if (!recruitCheck.allowed || !recipe || !isCraftable) return;
		patchSave((prev) => {
			const updatedInv = { ...prev.inventory };
			for (const [matId, reqQty] of Object.entries(recipe.materials)) {
				updatedInv[matId] = (updatedInv[matId] ?? 0) - reqQty;
				if (updatedInv[matId] <= 0) delete updatedInv[matId];
			}
			const starterGear = getDefaultStarterGear(activeClass);
			const newUnitId = `unit-${activeClass}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
			const newUnit = {
				id: newUnitId,
				cls: activeClass,
				level: 1,
				weapon: starterGear.weapon,
				helmet: starterGear.helmet
			};
			const updatedRoster = [...prev.roster ?? [], newUnit];
			const optResult = optimizeUnitsEquipment(updatedRoster, updatedInv, activeClass);
			setRecruitNotice(`Recruited new ${classDef.name} (#${updatedRoster.filter((u) => u.cls === activeClass).length})!`);
			setTimeout(() => setRecruitNotice(null), 3500);
			setSelectedUnitId(newUnitId);
			return {
				...prev,
				inventory: optResult.updatedInventory,
				roster: optResult.updatedRoster
			};
		});
	};
	if (!currentUnit) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col w-full max-w-md rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-3 border-b border-border/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-xl text-fg",
						children: [classDef.name, " Equipment"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "flex h-8 w-8 items-center justify-center rounded-full bg-surface-2/60 text-muted hover:text-fg hover:bg-surface-2 cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-6 text-center text-sm text-muted",
					children: [
						"No ",
						classDef.name,
						"s currently in your squad (",
						currentCount,
						"/",
						maxAllowed,
						")."
					]
				}),
				isCraftable && recipe && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 p-3.5 rounded-2xl bg-surface-2/50 border border-border/60 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-fg",
								children: ["Recruit ", classDef.name]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-muted font-mono",
								children: [
									currentCount,
									"/",
									maxAllowed
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1.5 text-xs",
							children: Object.entries(recipe.materials).map(([matId, reqQty]) => {
								const item = ITEMS[matId];
								const has = (save.inventory ?? {})[matId] ?? 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between px-2 py-1 rounded-lg bg-surface/70",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										item?.icon ?? "📦",
										" ",
										item?.name ?? matId
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: has >= reqQty ? "text-emerald-400 font-bold" : "text-red-400",
										children: [
											has,
											"/",
											reqQty
										]
									})]
								}, matId);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: handleRecruitUnit,
							disabled: !recruitCheck.allowed,
							className: "w-full mt-2 rounded-xl font-bold gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }),
								"Recruit ",
								classDef.name
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-3 border-t border-border/60 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onClose,
						className: "rounded-xl px-5",
						children: "Close"
					})
				})
			]
		})
	});
	const stats = computeUnitStats(currentUnit);
	const currentWeapon = currentUnit.weapon ? ITEMS[currentUnit.weapon] : void 0;
	const currentShield = currentUnit.shield ? ITEMS[currentUnit.shield] : void 0;
	const currentHelmet = currentUnit.helmet ? ITEMS[currentUnit.helmet] : void 0;
	const availableGear = Object.entries(save.inventory ?? {}).filter(([, qty]) => qty > 0).map(([id]) => ITEMS[id]).filter((item) => {
		if (!item || !item.equipment) return false;
		if (selectingSlot && item.equipment.slot !== selectingSlot) return false;
		return item.equipment.allowedClasses.includes(currentUnit.cls);
	});
	const handleEquip = (itemId, slot) => {
		patchSave((prev) => {
			const oldEquippedId = slot === "weapon" ? currentUnit.weapon : slot === "shield" ? currentUnit.shield : currentUnit.helmet;
			const updatedInv = { ...prev.inventory };
			if ((updatedInv[itemId] ?? 0) > 0) {
				updatedInv[itemId] = (updatedInv[itemId] ?? 1) - 1;
				if (updatedInv[itemId] <= 0) delete updatedInv[itemId];
			}
			if (oldEquippedId && oldEquippedId !== itemId) updatedInv[oldEquippedId] = (updatedInv[oldEquippedId] ?? 0) + 1;
			const updatedRoster = prev.roster.map((u) => {
				if (u.id === currentUnit.id) return {
					...u,
					[slot]: itemId
				};
				return u;
			});
			return {
				...prev,
				roster: updatedRoster,
				inventory: updatedInv
			};
		});
		setSelectingSlot(null);
	};
	const handleUnequip = (slot) => {
		const oldEquippedId = slot === "weapon" ? currentUnit.weapon : slot === "shield" ? currentUnit.shield : currentUnit.helmet;
		if (!oldEquippedId) return;
		patchSave((prev) => {
			const updatedInv = { ...prev.inventory };
			updatedInv[oldEquippedId] = (updatedInv[oldEquippedId] ?? 0) + 1;
			const updatedRoster = prev.roster.map((u) => {
				if (u.id === currentUnit.id) return {
					...u,
					[slot]: void 0
				};
				return u;
			});
			return {
				...prev,
				roster: updatedRoster,
				inventory: updatedInv
			};
		});
		setSelectingSlot(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col max-h-[92dvh] w-full max-w-2xl rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-3 border-b border-border/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-display text-xl tracking-wide text-fg",
								children: [classDef.name, " Squad"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted",
								children: [
									currentCount,
									"/",
									maxAllowed
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								"Optimize gear & manage units in your ",
								classDef.name,
								" division"
							]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "flex h-8 w-8 items-center justify-center rounded-full bg-surface-2/60 text-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				optimizeNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/20 border border-accent/40 text-xs text-accent font-medium my-2 animate-fade-in",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: optimizeNotice })]
				}),
				recruitNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-medium my-2 animate-fade-in",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: recruitNotice })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 overflow-x-auto py-2.5 border-b border-border/40 scrollbar-none",
					children: [filteredRoster.map((u, i) => {
						const isSelected = u.id === currentUnit.id;
						const cDef = CLASSES[u.cls] ?? CLASSES.banner;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setSelectedUnitId(u.id);
								setSelectingSlot(null);
							},
							className: cn("flex items-center gap-2 shrink-0 rounded-2xl border px-3 py-2 text-left transition-all cursor-pointer", isSelected ? "border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30" : "border-border/60 bg-surface/50 hover:bg-surface-2"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: PORTRAITS$2[u.cls],
								alt: "",
								className: "h-9 w-9 rounded-lg object-contain bg-surface-2/40 p-0.5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-bold leading-tight text-fg",
								children: [
									cDef.name,
									" #",
									i + 1
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted capitalize",
								children: u.cls
							})] })]
						}, u.id);
					}), isCraftable && currentCount < maxAllowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleRecruitUnit,
						disabled: !recruitCheck.allowed,
						className: cn("flex items-center gap-2 shrink-0 rounded-2xl border border-dashed px-3 py-2 text-left transition-all", recruitCheck.allowed ? "border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 cursor-pointer" : "border-border/60 bg-surface/30 opacity-60 cursor-not-allowed text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-bold leading-tight",
							children: ["+ Recruit #", currentCount + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px]",
							children: recruitCheck.allowed ? "Ready to Train" : "Need Mats"
						})] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto py-3 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border/80 bg-surface/60 p-4 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: PORTRAITS$2[currentUnit.cls],
											alt: "",
											className: "h-14 w-14 object-contain rounded-xl bg-surface-2/50 border border-border/50 p-1"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "font-display text-lg text-fg",
											children: [classDef.name, filteredRoster.length > 1 ? ` #${filteredRoster.findIndex((u) => u.id === currentUnit.id) + 1}` : ""]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider",
											children: stats.role
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 pt-2 border-t border-border/50",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 text-emerald-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted block leading-none",
													children: "Health (HP)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-sm font-bold text-fg",
													children: stats.hp
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-amber-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted block leading-none",
													children: "Damage"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-sm font-bold text-fg",
													children: stats.damage
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-4 text-blue-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted block leading-none",
													children: "Attack Range"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-sm font-bold text-fg",
													children: [stats.range, "px"]
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 text-purple-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted block leading-none",
													children: "Defense"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-sm font-bold text-fg",
													children: [Math.round(stats.defense * 100), "%"]
												})] })]
											})
										]
									}),
									stats.attackSpeed !== 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-amber-300/90 font-medium",
										children: [
											"⚡ Attack Speed: ",
											Math.round(stats.attackSpeed * 100),
											"%"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									currentUnit.cls !== "banner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("rounded-2xl border p-3.5 transition-all", selectingSlot === "weapon" ? "border-accent bg-accent/10 ring-1 ring-accent/30" : "border-border/80 bg-surface/60"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between mb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5",
												children: "⚔️ Weapon / Main Armament"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setSelectingSlot(selectingSlot === "weapon" ? null : "weapon"),
												className: "h-7 text-xs gap-1 text-accent hover:text-accent",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-3.5" }), selectingSlot === "weapon" ? "Cancel" : "Change"]
											})]
										}), currentWeapon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center justify-between bg-surface-2/50 p-2.5 rounded-xl border border-border/40",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-2xl",
													children: currentWeapon.icon
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-bold text-fg leading-snug",
													children: currentWeapon.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-muted",
													children: [
														"+",
														currentWeapon.equipment?.damageBonus ?? 0,
														" Dmg · +",
														currentWeapon.equipment?.rangeBonus ?? 0,
														" Range",
														currentWeapon.equipment?.attackSpeedMultiplier && currentWeapon.equipment.attackSpeedMultiplier !== 1 ? ` · ${Math.round(currentWeapon.equipment.attackSpeedMultiplier * 100)}% Spd` : ""
													]
												})] })]
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted border border-dashed border-border rounded-xl",
											children: "No weapon equipped"
										})]
									}),
									currentUnit.cls === "aegis" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("rounded-2xl border p-3.5 transition-all", selectingSlot === "shield" ? "border-accent bg-accent/10 ring-1 ring-accent/30" : "border-border/80 bg-surface/60"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between mb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5",
												children: "🛡️ Shield / Offhand"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setSelectingSlot(selectingSlot === "shield" ? null : "shield"),
												className: "h-7 text-xs gap-1 text-accent hover:text-accent",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-3.5" }), selectingSlot === "shield" ? "Cancel" : "Change"]
											})]
										}), currentShield ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center justify-between bg-surface-2/50 p-2.5 rounded-xl border border-border/40",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-2xl",
													children: currentShield.icon
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-bold text-fg leading-snug",
													children: currentShield.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-muted",
													children: [
														"+",
														currentShield.equipment?.hpBonus ?? 0,
														" HP · +",
														Math.round((currentShield.equipment?.defenseBonus ?? 0) * 100),
														"% Def · +",
														currentShield.equipment?.damageBonus ?? 0,
														" Dmg"
													]
												})] })]
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted border border-dashed border-border rounded-xl",
											children: "No shield equipped"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("rounded-2xl border p-3.5 transition-all", selectingSlot === "helmet" ? "border-accent bg-accent/10 ring-1 ring-accent/30" : "border-border/80 bg-surface/60"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between mb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5",
												children: "🪖 Helmet & Headgear"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setSelectingSlot(selectingSlot === "helmet" ? null : "helmet"),
												className: "h-7 text-xs gap-1 text-accent hover:text-accent",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-3.5" }), selectingSlot === "helmet" ? "Cancel" : "Change"]
											})]
										}), currentHelmet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center justify-between bg-surface-2/50 p-2.5 rounded-xl border border-border/40",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-2xl",
													children: currentHelmet.icon
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-bold text-fg leading-snug",
													children: currentHelmet.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-muted",
													children: [
														"+",
														currentHelmet.equipment?.hpBonus ?? 0,
														" HP · +",
														Math.round((currentHelmet.equipment?.defenseBonus ?? 0) * 100),
														"% Def"
													]
												})] })]
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted border border-dashed border-border rounded-xl",
											children: "No helmet equipped"
										})]
									})
								]
							})]
						}),
						selectingSlot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-accent/40 bg-surface-2/60 p-4 space-y-3 animate-fade-in",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }),
										"Select ",
										selectingSlot === "weapon" ? "Weapon" : "Helmet",
										" from Inventory"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => handleUnequip(selectingSlot),
									className: "h-6 text-[11px] text-red-400 hover:text-red-300",
									children: "Unequip"
								})]
							}), availableGear.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center text-xs text-muted border border-dashed border-border rounded-xl bg-surface/40",
								children: [
									"No matching ",
									selectingSlot,
									" items available in your inventory. Win missions to find more drops!"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto",
								children: availableGear.map((item) => {
									const qty = save.inventory[item.id] ?? 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => handleEquip(item.id, selectingSlot),
										className: "flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/70 bg-surface hover:bg-surface-2 hover:border-accent text-left transition-all cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xl",
												children: item.icon
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold text-fg",
												children: item.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted",
												children: selectingSlot === "weapon" ? `+${item.equipment?.damageBonus ?? 0} Dmg · +${item.equipment?.rangeBonus ?? 0} Rng` : `+${item.equipment?.hpBonus ?? 0} HP · +${Math.round((item.equipment?.defenseBonus ?? 0) * 100)}% Def`
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-xs font-bold text-accent shrink-0",
											children: ["×", qty]
										})]
									}, item.id);
								})
							})]
						}),
						isCraftable && currentCount < maxAllowed && recipe && !selectingSlot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border/80 bg-surface/50 p-3.5 space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5 text-accent" }),
											"Recruit Another ",
											classDef.name,
											" (",
											currentCount,
											"/",
											maxAllowed,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted font-mono",
										children: recruitCheck.allowed ? "Materials ready" : "Requires materials"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
									children: Object.entries(recipe.materials).map(([matId, reqQty]) => {
										const item = ITEMS[matId];
										const available = (save.inventory ?? {})[matId] ?? 0;
										const hasEnough = available >= reqQty;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: cn("flex items-center justify-between p-2 rounded-xl border text-xs", hasEnough ? "border-border/60 bg-surface/80" : "border-red-500/30 bg-red-950/20"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 truncate",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item?.icon ?? "📦" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate font-medium text-fg",
													children: item?.name ?? matId
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: cn("font-mono font-bold text-[11px] ml-1 shrink-0 px-1.5 py-0.5 rounded", hasEnough ? "text-emerald-400 bg-surface-2" : "text-red-400 bg-red-900/40"),
												children: [
													available,
													"/",
													reqQty
												]
											})]
										}, matId);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-end pt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: handleRecruitUnit,
										disabled: !recruitCheck.allowed,
										className: "rounded-xl font-bold gap-1.5 text-xs h-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5" }),
											"Train & Recruit ",
											classDef.name,
											" #",
											currentCount + 1
										]
									})
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-3 border-t border-border/60 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleOptimizeGear,
						className: "rounded-xl text-xs gap-1.5 text-accent border-accent/40 hover:bg-accent/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "size-3.5" }),
							"Auto-Optimize ",
							classDef.name,
							" Gear"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onClose,
						className: "rounded-xl px-5",
						children: "Done"
					})]
				})
			]
		})
	});
}
var PORTRAITS$1 = {
	spear: "/assets/sprites/spearkin-portrait.png",
	bow: "/assets/sprites/bowkin-portrait.png",
	aegis: "/assets/sprites/aegiskin-portrait.png",
	banner: "/assets/sprites/bannerkin-portrait.png",
	kiba: "/assets/sprites/spearkin-portrait.png",
	deka: "/assets/sprites/aegiskin-portrait.png",
	mega: "/assets/sprites/bowkin-portrait.png",
	tori: "/assets/sprites/spearkin-portrait.png",
	maho: "/assets/sprites/bowkin-portrait.png",
	robo: "/assets/sprites/aegiskin-portrait.png"
};
var CRAFTABLE_CLASSES = [
	"spear",
	"aegis",
	"bow",
	"kiba",
	"deka",
	"mega",
	"tori",
	"maho",
	"robo"
];
function CreateUnitModal({ open, onClose, initialClass }) {
	const save = useGame((s) => s.save);
	const patchSave = useGame((s) => s.patchSave);
	const [selectedCls, setSelectedCls] = (0, import_react.useState)(() => {
		if (initialClass && initialClass !== "banner") return initialClass;
		return "bow";
	});
	const [createdSuccess, setCreatedSuccess] = (0, import_react.useState)(null);
	if (!open) return null;
	const currentCount = (save.roster ?? []).filter((u) => u.cls === selectedCls).length;
	const maxAllowed = MAX_UNITS_PER_CLASS[selectedCls] ?? 3;
	const recipe = UNIT_CREATION_RECIPES[selectedCls];
	const check = canCreateUnit(selectedCls, save.roster ?? [], save.inventory ?? {});
	const classDef = CLASSES[selectedCls];
	const handleCreate = () => {
		if (!check.allowed || !recipe) return;
		patchSave((prev) => {
			const updatedInv = { ...prev.inventory };
			for (const [matId, reqQty] of Object.entries(recipe.materials)) {
				updatedInv[matId] = (updatedInv[matId] ?? 0) - reqQty;
				if (updatedInv[matId] <= 0) delete updatedInv[matId];
			}
			const starterGear = getDefaultStarterGear(selectedCls);
			const newUnit = {
				id: `unit-${selectedCls}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
				cls: selectedCls,
				level: 1,
				weapon: starterGear.weapon,
				helmet: starterGear.helmet
			};
			return {
				...prev,
				inventory: updatedInv,
				roster: [...prev.roster ?? [], newUnit]
			};
		});
		setCreatedSuccess(`${classDef.name} recruited!`);
		setTimeout(() => {
			setCreatedSuccess(null);
		}, 2500);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col max-h-[92dvh] w-full max-w-lg rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-3 border-b border-border/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl tracking-wide text-fg",
							children: "Barracks · Train Units"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Use camp materials to recruit and expand your squad"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "flex h-8 w-8 items-center justify-center rounded-full bg-surface-2/60 text-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-2 py-3 border-b border-border/40 max-h-40 overflow-y-auto",
					children: CRAFTABLE_CLASSES.map((cls) => {
						const isSelected = selectedCls === cls;
						const cDef = CLASSES[cls];
						const count = (save.roster ?? []).filter((u) => u.cls === cls).length;
						const max = MAX_UNITS_PER_CLASS[cls] ?? 3;
						const isFull = count >= max;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setSelectedCls(cls);
								setCreatedSuccess(null);
							},
							className: cn("flex flex-col items-center gap-1 p-2 rounded-2xl border text-center transition-all cursor-pointer", isSelected ? "border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30" : "border-border/60 bg-surface/60 hover:bg-surface-2"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: PORTRAITS$1[cls],
								alt: "",
								className: "h-9 w-9 object-contain rounded-lg bg-surface-2/40 p-0.5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-bold text-fg leading-tight truncate max-w-[70px]",
									children: cDef.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[9px] text-muted",
									children: cDef.roleTitle
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("text-[9px] font-mono font-semibold", isFull ? "text-amber-400" : "text-muted"),
									children: [
										count,
										"/",
										max
									]
								})
							] })]
						}, cls);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto py-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3.5 rounded-2xl border border-border/80 bg-surface/60 p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: PORTRAITS$1[selectedCls],
								alt: "",
								className: "h-14 w-14 object-contain rounded-xl bg-surface-2/50 border border-border/50 p-1"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg text-fg",
									children: classDef.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase",
									children: classDef.role
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted mt-0.5",
								children: [
									"Base HP: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-fg font-bold",
										children: classDef.hp
									}),
									" · Damage:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-fg font-bold",
										children: classDef.damage
									}),
									" · Range:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-fg font-bold",
										children: [classDef.range, "px"]
									})
								]
							})] })]
						}),
						createdSuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-300 font-semibold animate-fade-in",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [createdSuccess, " Added to your active squad."] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Required Resources" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-mono normal-case text-muted",
									children: [
										"Limit: ",
										currentCount,
										"/",
										maxAllowed
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2",
								children: Object.entries(recipe.materials).map(([matId, reqQty]) => {
									const item = ITEMS[matId];
									const available = save.inventory?.[matId] ?? 0;
									const hasEnough = available >= reqQty;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors", hasEnough ? "border-border/80 bg-surface/80" : "border-red-500/30 bg-red-950/20 text-red-200"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-lg",
												children: item?.icon ?? "📦"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-fg leading-tight",
												children: item?.name ?? matId
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted",
												children: ["Cost: ", reqQty]
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("font-mono font-bold text-xs px-2 py-0.5 rounded-md", hasEnough ? "bg-surface-2 text-fg" : "bg-red-500/20 text-red-400 border border-red-500/30"),
											children: [
												available,
												"/",
												reqQty
											]
										})]
									}, matId);
								})
							})]
						}),
						!check.allowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-xl bg-surface-2/60 border border-border/80 p-3 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-amber-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentCount >= maxAllowed ? `You have reached the maximum quota of ${maxAllowed} ${classDef.name}s.` : "Collect more meat, wood, stone, or iron scraps by clearing battle stages." })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-3 border-t border-border/60 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: onClose,
						className: "rounded-xl",
						children: "Close"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleCreate,
						disabled: !check.allowed,
						className: "rounded-xl px-5 gap-1.5 font-bold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }),
							"Recruit ",
							classDef.name
						]
					})]
				})
			]
		})
	});
}
function InventoryModal({ open, onClose }) {
	const save = useGame((s) => s.save);
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	if (!open) return null;
	const inventoryEntries = Object.entries(save.inventory ?? {}).filter(([, qty]) => qty > 0).map(([itemId, qty]) => {
		return {
			item: ITEMS[itemId] ?? {
				id: itemId,
				name: itemId,
				description: "Tribal item or craft material",
				category: "material",
				rarity: "common",
				icon: "📦"
			},
			qty
		};
	});
	const filteredEntries = inventoryEntries.filter(({ item }) => {
		if (activeTab === "all") return true;
		if (activeTab === "materials") return item.category !== "gear";
		if (activeTab === "gear") return item.category === "gear";
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col max-h-[92dvh] w-full max-w-2xl rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-3 border-b border-border/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl tracking-wide text-fg",
							children: "Camp Inventory & Materials"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Stockpiled resources, craft alloys, meats, and armaments"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-elevated hover:text-fg transition cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 py-3 border-b border-border/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveTab("all"),
							className: cn("px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer", activeTab === "all" ? "bg-accent text-accent-fg shadow-sm" : "bg-surface-elevated text-muted hover:text-fg"),
							children: [
								"All Items (",
								inventoryEntries.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveTab("materials"),
							className: cn("px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer", activeTab === "materials" ? "bg-accent text-accent-fg shadow-sm" : "bg-surface-elevated text-muted hover:text-fg"),
							children: "Materials & Food"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveTab("gear"),
							className: cn("px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer", activeTab === "gear" ? "bg-accent text-accent-fg shadow-sm" : "bg-surface-elevated text-muted hover:text-fg"),
							children: "Weapons & Armor"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto py-3 space-y-2 max-h-[60vh] pr-1",
					children: filteredEntries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-muted text-sm border border-dashed border-border/60 rounded-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-8 mx-auto mb-2 text-muted/60" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No items in this category yet." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted/70 mt-1",
								children: "Complete campaign hunts and battles to gather spoils!"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
						children: filteredEntries.map(({ item, qty }) => {
							const rarityColor = item.rarity === "epic" ? "text-purple-400 border-purple-500/30 bg-purple-500/10" : item.rarity === "rare" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : item.rarity === "uncommon" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-amber-300 border-amber-500/20 bg-amber-500/5";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-surface-elevated/70 hover:border-accent/30 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-border/80 text-xl shrink-0",
										children: item.icon
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-sm text-fg leading-tight",
											children: item.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border", rarityColor),
											children: item.rarity
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted line-clamp-1 mt-0.5",
										children: item.description
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-right shrink-0 pl-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-sm font-bold text-accent",
										children: ["×", qty]
									})
								})]
							}, item.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-3 border-t border-border/60 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "px-5 py-2 rounded-xl bg-surface-elevated text-sm font-semibold text-fg hover:bg-surface-elevated/80 transition cursor-pointer",
						children: "Close"
					})
				})
			]
		})
	});
}
var PORTRAITS = {
	spear: "/assets/sprites/spearkin-portrait.png",
	bow: "/assets/sprites/bowkin-portrait.png",
	aegis: "/assets/sprites/aegiskin-portrait.png",
	banner: "/assets/sprites/bannerkin-portrait.png",
	kiba: "/assets/sprites/spearkin-portrait.png",
	deka: "/assets/sprites/aegiskin-portrait.png",
	mega: "/assets/sprites/bowkin-portrait.png",
	tori: "/assets/sprites/spearkin-portrait.png",
	maho: "/assets/sprites/bowkin-portrait.png",
	robo: "/assets/sprites/aegiskin-portrait.png"
};
var CAMPAIGN_UNIT_ORDER = [
	"banner",
	"maho",
	"mega",
	"bow",
	"spear",
	"tori",
	"kiba",
	"deka",
	"robo",
	"aegis"
];
function HubScreen({ onPlay }) {
	const go = useGame((s) => s.go);
	const save = useGame((s) => s.save);
	const [showCommands, setShowCommands] = (0, import_react.useState)(false);
	const [showBarracks, setShowBarracks] = (0, import_react.useState)(false);
	const [showInventory, setShowInventory] = (0, import_react.useState)(false);
	const [selectedEquipClass, setSelectedEquipClass] = (0, import_react.useState)(null);
	const totalInvCount = Object.values(save.inventory ?? {}).filter((qty) => qty > 0).length;
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setShowBarracks(true),
								"aria-label": "Barracks",
								className: "gap-1.5 text-accent hover:text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline text-xs font-semibold",
									children: "Barracks"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setShowInventory(true),
								"aria-label": "Inventory",
								className: "gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden sm:inline text-xs font-semibold",
									children: [
										"Inventory (",
										totalInvCount,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setShowCommands(true),
								"aria-label": "Commands",
								className: "gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline text-xs font-semibold",
									children: "Commands"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => go("settings"),
								"aria-label": "Settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-4 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
						children: "Your army (battle formation order)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted",
						children: "Rear (Back) ➔ Front Line · Tap unit to manage & equip"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setShowInventory(true),
							className: "h-7 text-xs gap-1 rounded-xl text-fg border-border hover:bg-surface cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5" }), "Inventory"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setShowBarracks(true),
							className: "h-7 text-xs gap-1 rounded-xl text-accent border-accent/40 hover:bg-accent/10 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5" }), "Train Units"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2",
					children: CAMPAIGN_UNIT_ORDER.map((id) => {
						const c = CLASSES[id];
						const countInRoster = (save.roster ?? []).filter((u) => u.cls === id).length;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedEquipClass(id),
							className: cn("rounded-2xl border p-2 text-center transition-all cursor-pointer group", countInRoster > 0 ? "border-border bg-surface hover:bg-surface-2 hover:border-accent" : "border-border/40 bg-surface/30 opacity-60 hover:opacity-100 hover:border-accent"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: PORTRAITS[id],
									alt: "",
									className: "mx-auto h-12 w-12 object-contain group-hover:scale-105 transition-transform"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs font-semibold group-hover:text-accent transition-colors truncate",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-faint truncate",
									children: c.roleTitle
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-mono font-bold text-accent",
									children: countInRoster > 0 ? `×${countInRoster}` : "0"
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandsModal, {
				open: showCommands,
				onClose: () => setShowCommands(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateUnitModal, {
				open: showBarracks,
				onClose: () => setShowBarracks(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryModal, {
				open: showInventory,
				onClose: () => setShowInventory(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquipmentModal, {
				open: selectedEquipClass !== null,
				unitClass: selectedEquipClass ?? void 0,
				onClose: () => setSelectedEquipClass(null)
			})
		]
	});
}
var RARITY_COLORS = {
	common: "text-muted border-border bg-surface",
	uncommon: "text-[#59cd90] border-[#59cd90]/40 bg-[#59cd90]/10",
	rare: "text-[#3fa7d6] border-[#3fa7d6]/40 bg-[#3fa7d6]/10",
	epic: "text-[#f2b134] border-[#f2b134]/40 bg-[#f2b134]/10"
};
function ResultScreen({ onPlay }) {
	const result = useGame((s) => s.result);
	const go = useGame((s) => s.go);
	const save = useGame((s) => s.save);
	if (!result) return null;
	const next = MISSIONS[MISSIONS.findIndex((m) => m.id === result.missionId) + 1];
	const nextOpen = next ? isUnlocked(next.id, save.completed) : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-bg px-5 py-8 text-center text-fg",
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
				className: "mt-6 grid w-full max-w-sm grid-cols-2 gap-3 text-sm",
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
			result.win && result.rewards && result.rewards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 w-full max-w-sm text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-[0.2em] text-muted uppercase",
					children: "Spoils of Battle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2.5 flex flex-wrap gap-2",
					children: result.rewards.map((r) => {
						const item = ITEMS[r.itemId];
						const name = item?.name ?? r.itemId;
						const icon = item?.icon ?? "📦";
						const rarityStyle = RARITY_COLORS[item?.rarity ?? "common"];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium ${rarityStyle}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: icon }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-bold text-fg",
									children: ["+", r.qty]
								})
							]
						}, r.itemId);
					})
				})]
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
						children: "Campaign & Army"
					})
				]
			})
		]
	});
}
var GAME_VERSION = "0.00020";
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
					"v",
					GAME_VERSION,
					" · Input offset ",
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
							"v",
							GAME_VERSION,
							" · Offset ",
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
	const [showCommands, setShowCommands] = (0, import_react.useState)(false);
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
				unlockAndPlay(getNextPlayableMissionId(useGame.getState().save.completed));
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
	if (screen === "title") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, { onPlay: () => {
		unlockAndPlay(getNextPlayableMissionId(save.completed));
	} });
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
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: () => {
								setPaused(false);
								bus.emit("pause", false);
							},
							children: "Resume"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "lg",
							onClick: () => setShowCommands(true),
							children: "View Commands"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "lg",
							onClick: () => go("hub"),
							children: "Abandon march"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandsModal, {
				open: showCommands,
				onClose: () => setShowCommands(false)
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameShell, {});
}
//#endregion
export { rollBattleLoot as a, CLASSES as c, computeUnitStats as d, audio as f, missionById as i, ENEMY_STATS as l, RhythmEngine as n, COMMANDS as o, bus as r, loadSave as s, routes_exports as t, STARTER_ARMY as u };
