import { a as CLASSES, c as missionById, i as bus, l as COMMANDS, n as loadSave, o as ENEMY_STATS, r as RhythmEngine, s as STARTER_ARMY, u as audio } from "./routes-DFHPFkVF.mjs";
import { a as __webpack_exports__Scale, i as __webpack_exports__Math, n as __webpack_exports__Display, o as __webpack_exports__Scene, r as __webpack_exports__Game, t as __webpack_exports__AUTO } from "../_libs/phaser.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createGame-BL-HY92g.js
var SHEETS = [
	"pikekin-idle",
	"bowkin-idle",
	"aegiskin-idle",
	"bannerkin-idle",
	"goretusk-idle",
	"howl-idle",
	"arrow",
	"impact"
];
var PreloadScene = class extends __webpack_exports__Scene {
	constructor() {
		super("preload");
	}
	preload() {
		const w = this.scale.width;
		const h = this.scale.height;
		const bar = this.add.graphics();
		const label = this.add.text(w / 2, h / 2 + 28, "Drumming up the army…", {
			fontFamily: "Nunito, sans-serif",
			fontSize: "16px",
			color: "#b9a58c"
		}).setOrigin(.5);
		this.load.on("progress", (v) => {
			bar.clear();
			bar.fillStyle(2760760, 1);
			bar.fillRoundedRect(w / 2 - 140, h / 2 - 8, 280, 10, 5);
			bar.fillStyle(14964526, 1);
			bar.fillRoundedRect(w / 2 - 140, h / 2 - 8, 280 * v, 10, 5);
		});
		this.load.on("complete", () => {
			bar.destroy();
			label.destroy();
		});
		this.load.image("sky", "/assets/map/dusk-sky.jpg");
		for (const key of SHEETS) this.load.spritesheet(key, `/assets/sprites/${key}.png`, {
			frameWidth: 128,
			frameHeight: 128
		});
	}
	create() {
		const mk = (key, anim, rate, repeat) => {
			if (this.anims.exists(anim)) return;
			this.anims.create({
				key: anim,
				frames: this.anims.generateFrameNumbers(key, {
					start: 0,
					end: 3
				}),
				frameRate: rate,
				repeat
			});
		};
		for (const key of SHEETS) if (key === "impact") mk(key, "fx-impact", 18, 0);
		else if (key === "arrow") mk(key, "arrow-fly", 12, -1);
		else mk(key, `${key}-anim`, 7, -1);
		this.scene.start("battle");
	}
};
var ACTION = {
	march: {
		speed: 155,
		walk: true
	},
	attack: {
		speed: 12,
		lunge: true,
		walk: false
	},
	defend: {
		speed: 0,
		defend: true,
		walk: false
	},
	retreat: {
		speed: -125,
		walk: true
	},
	charge: {
		speed: 310,
		walk: true,
		lunge: true
	},
	jump: {
		speed: 20,
		jump: true,
		walk: false
	}
};
var MUSIC = [
	196,
	233,
	262,
	311,
	349
];
var MUSIC_FEVER = [
	262,
	311,
	349,
	392,
	466
];
var BattleScene = class extends __webpack_exports__Scene {
	constructor() {
		super("battle");
	}
	mission;
	engine;
	ended = false;
	paused = false;
	armyX = 280;
	groundY = 420;
	viewW = 1280;
	viewH = 720;
	nextTick = 0;
	action = null;
	charged = false;
	defending = false;
	jumping = false;
	trauma = 0;
	hitstop = 0;
	feverT = 0;
	shakeMul = .7;
	units = [];
	enemies = [];
	spawnedWaves = /* @__PURE__ */ new Set();
	sky;
	far;
	mid;
	near;
	ground;
	sun;
	shrine;
	pops = [];
	lastHud = 0;
	lastGrade = null;
	telegraph = null;
	feverReached = false;
	offDrum;
	offPause;
	tutorial = "";
	init() {
		this.ended = false;
		this.paused = false;
		this.armyX = 280;
		this.nextTick = 0;
		this.action = null;
		this.charged = false;
		this.defending = false;
		this.jumping = false;
		this.trauma = 0;
		this.hitstop = 0;
		this.feverT = 0;
		this.units = [];
		this.enemies = [];
		this.spawnedWaves = /* @__PURE__ */ new Set();
		this.pops = [];
		this.lastHud = 0;
		this.lastGrade = null;
		this.telegraph = null;
		this.feverReached = false;
		this.tutorial = "";
	}
	create() {
		const id = String(this.registry.get("missionId") ?? "training");
		const mission = missionById(id);
		if (!mission) {
			this.scene.stop();
			return;
		}
		this.mission = mission;
		const save = loadSave();
		this.shakeMul = save.settings.shake;
		audio.setVolumes(save.settings);
		this.viewW = this.scale.width;
		this.viewH = this.scale.height;
		this.groundY = this.viewH * .64;
		this.physics.world.setBounds(0, 0, mission.worldLength, this.viewH);
		this.cameras.main.setBounds(0, 0, mission.worldLength, this.viewH);
		this.buildBackdrop();
		this.spawnArmy();
		this.drawShrine();
		const start = audio.now() + 1.35;
		this.engine = new RhythmEngine({
			bpm: mission.bpm,
			startTime: start,
			inputOffsetMs: save.offsetMs
		});
		if (mission.tutorial) this.tutorial = "Drum on the four white beats. Miss the army’s four.";
		this.offDrum = bus.on("drum", (payload) => {
			const p = payload;
			this.onDrum(p.drum, p.time);
		});
		this.offPause = bus.on("pause", (payload) => {
			this.paused = Boolean(payload);
		});
		this.scale.on("resize", (size) => this.relayout(size.width, size.height));
		this.events.once("shutdown", () => this.cleanup());
		this.emitHud();
	}
	cleanup() {
		this.offDrum?.();
		this.offPause?.();
		this.tweens.killAll();
	}
	buildBackdrop() {
		const w = this.viewW;
		const h = this.viewH;
		this.sky = this.add.tileSprite(0, 0, w, h, "sky").setOrigin(0).setScrollFactor(0).setDepth(-20);
		this.makeHillTex("hill-far", 1024, 280, 5911664, .12, .38);
		this.makeHillTex("hill-mid", 1024, 260, 4007e3, .1, .48);
		this.makeHillTex("hill-near", 1024, 220, 2758720, .08, .58);
		this.makeGroundTex("ground-tex", 512, 220);
		this.far = this.add.tileSprite(0, h * .28, w, 280, "hill-far").setOrigin(0, 0).setScrollFactor(0).setDepth(-15);
		this.mid = this.add.tileSprite(0, h * .4, w, 260, "hill-mid").setOrigin(0, 0).setScrollFactor(0).setDepth(-12);
		this.near = this.add.tileSprite(0, h * .5, w, 220, "hill-near").setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
		this.sun = this.add.circle(w * .72, h * .22, h * .09, 16772266, .92).setScrollFactor(0).setDepth(-18);
		this.ground = this.add.tileSprite(0, this.groundY + 8, Math.max(w, this.mission.worldLength), 240, "ground-tex").setOrigin(0, 0).setDepth(-5);
	}
	makeHillTex(key, w, h, color, freq, baseT) {
		if (this.textures.exists(key)) return;
		const g = this.add.graphics();
		g.setVisible(false);
		const base = h * baseT;
		const amp = h * .22;
		g.fillStyle(color, 1);
		g.beginPath();
		g.moveTo(0, h);
		g.lineTo(0, base);
		for (let x = 0; x <= w; x += 6) {
			const s = x * freq;
			const y = base - (Math.sin(s) * amp + Math.sin(s * 2.17 + 1.1) * amp * .38);
			g.lineTo(x, y);
		}
		g.lineTo(w, h);
		g.closePath();
		g.fillPath();
		g.generateTexture(key, w, h);
		g.destroy();
	}
	makeGroundTex(key, w, h) {
		if (this.textures.exists(key)) return;
		const g = this.add.graphics();
		g.setVisible(false);
		g.fillStyle(1774630, 1);
		g.fillRect(0, 0, w, h);
		g.fillStyle(2891840, 1);
		for (let x = 0; x < w; x += 60) g.fillRect(x, 10, 28, 4);
		g.fillStyle(2365486, 1);
		g.fillRect(0, 0, w, 6);
		g.generateTexture(key, w, h);
		g.destroy();
	}
	drawShrine() {
		const x = this.mission.goalX;
		const y = this.groundY;
		const c = this.add.container(x, y).setDepth(2);
		const g = this.add.graphics();
		g.fillStyle(4861984, 1);
		g.fillRect(-7, -118, 14, 118);
		g.fillStyle(14964526, 1);
		g.fillCircle(0, -132, 24);
		g.fillStyle(15905076, 1);
		g.fillCircle(0, -132, 10);
		g.fillStyle(16050904, .85);
		g.fillRect(-2, -154, 4, 16);
		c.add(g);
		this.shrine = c;
	}
	spawnArmy() {
		const used = {
			banner: 0,
			aegis: 0,
			pike: 0,
			bow: 0
		};
		const slots = {
			banner: [-200],
			aegis: [8, 44],
			pike: [
				88,
				128,
				168
			],
			bow: [-92, -52]
		};
		STARTER_ARMY.forEach((cls, i) => {
			const stats = CLASSES[cls];
			const idx = used[cls] ?? 0;
			used[cls] = idx + 1;
			const formX = slots[cls][idx] ?? idx * 36;
			const formY = i % 2 * 8;
			const sprite = this.add.sprite(this.armyX + formX, this.groundY + formY, stats.sprite, 0);
			sprite.setOrigin(.5, .92);
			sprite.setDepth(10 + i * .01);
			const display = cls === "banner" ? 92 : 80;
			sprite.setDisplaySize(display, display);
			sprite.play(`${stats.sprite}-anim`);
			const bar = this.add.graphics().setDepth(40);
			this.units.push({
				sprite,
				hp: stats.hp,
				maxHp: stats.hp,
				cls,
				alive: true,
				formX,
				formY,
				lunge: 0,
				jump: 0,
				flash: 0,
				bar,
				atkCd: 0
			});
		});
	}
	spawnWave(index) {
		const wave = this.mission.waves[index];
		if (!wave) return;
		let n = 0;
		for (const pack of wave.enemies) for (let i = 0; i < pack.count; i++) {
			const stats = ENEMY_STATS[pack.kind];
			const x = wave.atX + n * 54;
			const y = this.groundY + n % 2 * 10;
			const sprite = this.add.sprite(x, y, stats.sprite, 0);
			sprite.setOrigin(.5, .92);
			sprite.setDepth(8);
			const size = 86 * stats.scale;
			sprite.setDisplaySize(size, size);
			sprite.play(`${stats.sprite}-anim`);
			const bar = this.add.graphics().setDepth(40);
			this.enemies.push({
				sprite,
				hp: stats.hp,
				maxHp: stats.hp,
				kind: pack.kind,
				alive: true,
				formX: 0,
				formY: n % 2 * 10,
				lunge: 0,
				jump: 0,
				flash: 0,
				bar,
				atkCd: .4 + n * .15
			});
			n += 1;
		}
	}
	onDrum(drum, time) {
		if (this.ended || this.paused) return;
		const j = this.engine.tap(drum, time);
		if (j.ignored) return;
		const label = j.grade === "perfect" ? "PERFECT" : j.grade === "good" ? "GOOD" : "MISS";
		const color = j.grade === "perfect" ? "#59cd90" : j.grade === "good" ? "#f2b134" : "#e4572e";
		this.lastGrade = label;
		this.floatText(this.armyX + 40, this.groundY - 130, `${label}  ${j.deltaMs >= 0 ? "+" : ""}${Math.round(j.deltaMs)}ms`, color);
		if (j.grade === "miss") this.trauma = Math.min(1, this.trauma + .18);
	}
	floatText(x, y, text, color) {
		const t = this.add.text(x, y, text, {
			fontFamily: "Nunito, sans-serif",
			fontSize: "18px",
			fontStyle: "800",
			color,
			stroke: "#110c18",
			strokeThickness: 4
		}).setOrigin(.5).setDepth(60);
		this.pops.push(t);
		this.tweens.add({
			targets: t,
			y: y - 42,
			alpha: 0,
			duration: 720,
			ease: "Cubic.easeOut",
			onComplete: () => t.destroy()
		});
	}
	update(_time, delta) {
		const dt = Math.min(.05, delta / 1e3);
		if (this.ended) return;
		if (this.paused) return;
		if (this.hitstop > 0) {
			this.hitstop -= dt;
			return;
		}
		const now = audio.now();
		this.scheduleAudio(now);
		for (const ev of this.engine.advance(now)) if (ev.type === "command") this.applyCommand(ev.command.id, ev.beat, ev.fever, ev.perfects);
		else if (ev.type === "fail") this.applyFail(ev.reason);
		else if (ev.type === "beat") this.onBeat(ev.slot, ev.phase, ev.beat);
		const beatPos = this.engine.beatPosition(now);
		if (this.action && beatPos >= this.action.beat + 4) {
			this.action = null;
			this.defending = false;
			this.jumping = false;
		}
		const speed = ((this.action ? ACTION[this.action.id] : null)?.speed ?? 0) * (this.engine.fever ? 1.32 : 1);
		this.armyX = __webpack_exports__Math.Clamp(this.armyX + speed * dt, 80, this.mission.worldLength - 200);
		this.spawnWavesIfNeeded();
		this.updateUnits(dt, beatPos, now);
		this.updateEnemies(dt, beatPos);
		this.updateCamera(dt, beatPos);
		this.updateParallax();
		this.checkEnd();
		this.lastHud += dt;
		if (this.lastHud > .05) {
			this.lastHud = 0;
			this.emitHud();
		}
	}
	scheduleAudio(now) {
		const e = this.engine;
		while (e.beatTime(this.nextTick) < now + .22) {
			const slot = this.nextTick % 8;
			const when = e.beatTime(this.nextTick);
			if (this.nextTick >= 0 && when > e.startTime - .01) {
				if (slot < 4) audio.tick(when, slot === 0);
				else {
					audio.thump(when);
					audio.chant(when, e.fever);
				}
				const scale = e.fever ? MUSIC_FEVER : MUSIC;
				if (slot === 0 || slot === 4) audio.pluck(when, scale[this.nextTick % scale.length], e.fever);
				if (e.fever && slot === 2) audio.pluck(when, scale[2], true);
			}
			this.nextTick += 1;
		}
	}
	applyCommand(id, beat, fever, perfects) {
		this.action = {
			id,
			beat
		};
		this.defending = id === "defend";
		this.jumping = id === "jump";
		if (id === "charge") this.charged = true;
		if (fever) this.feverReached = true;
		if (id === "attack" || id === "charge") this.resolveAttack(id === "charge" || this.charged);
		if (id === "attack") this.charged = false;
		const label = fever ? `${id.toUpperCase()}  FEVER` : id.toUpperCase();
		this.floatText(this.armyX + 90, this.groundY - 180, label, fever ? "#ffe08a" : "#f4ead8");
		this.trauma = Math.min(1, this.trauma + (fever ? .28 : .12) + perfects * .03);
		if (this.mission.tutorial) {
			if (id === "march") this.tutorial = "Keep marching. The sun-disk shrine is ahead.";
			else this.tutorial = "MARCH is TAK TAK TAK BOOM. Drive them to the shrine.";
		}
	}
	applyFail(reason) {
		this.action = null;
		this.defending = false;
		this.jumping = false;
		this.charged = false;
		this.floatText(this.armyX + 80, this.groundY - 170, reason === "unknown" ? "UNKNOWN BEAT" : "MISSED BEAT", "#ff8a6b");
		this.trauma = Math.min(1, this.trauma + .22);
		if (this.mission.tutorial) this.tutorial = "Four drums in a row. TAK TAK TAK BOOM to MARCH.";
	}
	onBeat(slot, phase, beat) {
		const pulse = this.sun;
		this.tweens.add({
			targets: pulse,
			scale: 1.08,
			yoyo: true,
			duration: 90
		});
		if (phase === "response" && slot === 4) this.maybeBossTelegraph(beat);
		if (phase === "response" && slot === 5) {
			this.enemySwing();
			this.maybeBossSlam();
		}
		if (this.mission.tutorial && this.engine.combo === 0 && beat === 8) this.tutorial = "Try MARCH: TAK TAK TAK BOOM on the four white beats.";
	}
	spawnWavesIfNeeded() {
		this.mission.waves.forEach((w, i) => {
			if (this.spawnedWaves.has(i)) return;
			if (this.armyX > w.atX - 520) {
				this.spawnedWaves.add(i);
				this.spawnWave(i);
			}
		});
	}
	frontX() {
		const living = this.units.filter((u) => u.alive);
		if (!living.length) return this.armyX;
		return Math.max(...living.map((u) => u.sprite.x));
	}
	resolveAttack(charged) {
		const mul = (this.engine.fever ? 1.45 : 1) * (charged ? 1.7 : 1);
		for (const u of this.units) {
			if (!u.alive || !u.cls) continue;
			const stats = CLASSES[u.cls];
			if (stats.damage <= 0) continue;
			const target = this.nearestEnemy(u.sprite.x, stats.range + (charged ? 40 : 0));
			if (!target) continue;
			u.lunge = 1;
			const dmg = Math.round(stats.damage * mul);
			if (stats.role === "ranged") this.fireArrow(u.sprite.x, u.sprite.y - 40, target, dmg);
			else {
				this.hitFighter(target, dmg);
				this.spawnImpact(target.sprite.x - 20, target.sprite.y - 36);
			}
		}
		audio.hit();
	}
	fireArrow(x, y, target, dmg) {
		const arrow = this.add.sprite(x + 10, y, "arrow", 0).setDepth(30).setDisplaySize(42, 42);
		arrow.play("arrow-fly");
		this.tweens.add({
			targets: arrow,
			x: target.sprite.x - 16,
			y: target.sprite.y - 42,
			duration: 220,
			ease: "Cubic.easeIn",
			onComplete: () => {
				arrow.destroy();
				if (target.alive) {
					this.hitFighter(target, dmg);
					this.spawnImpact(target.sprite.x - 10, target.sprite.y - 36);
				}
			}
		});
	}
	spawnImpact(x, y) {
		const s = this.add.sprite(x, y, "impact", 0).setDepth(50).setDisplaySize(72, 72);
		s.play("fx-impact");
		s.once("animationcomplete", () => s.destroy());
	}
	nearestEnemy(x, range) {
		let best = null;
		let bestD = range;
		for (const e of this.enemies) {
			if (!e.alive) continue;
			const d = e.sprite.x - x;
			if (d > 8 && d < bestD) {
				bestD = d;
				best = e;
			}
		}
		return best;
	}
	hitFighter(f, dmg) {
		if (!f.alive) return;
		f.hp = Math.max(0, f.hp - dmg);
		f.flash = .12;
		f.sprite.x += f.kind ? 18 : -10;
		this.floatText(f.sprite.x, f.sprite.y - 70, String(dmg), "#ffe08a");
		this.trauma = Math.min(1, this.trauma + .2);
		this.hitstop = Math.max(this.hitstop, .045);
		if (f.hp <= 0) this.killFighter(f);
	}
	killFighter(f) {
		f.alive = false;
		f.hp = 0;
		this.hitstop = Math.max(this.hitstop, .08);
		this.tweens.add({
			targets: f.sprite,
			alpha: 0,
			y: f.sprite.y + 24,
			angle: f.kind ? -40 : 40,
			duration: 420,
			ease: "Cubic.easeIn",
			onComplete: () => {
				f.sprite.setVisible(false);
				f.bar.clear();
			}
		});
		audio.whoosh();
	}
	enemySwing() {
		const front = this.frontX();
		for (const e of this.enemies) {
			if (!e.alive || !e.kind) continue;
			const stats = ENEMY_STATS[e.kind];
			if (e.kind === "howl") continue;
			const d = e.sprite.x - front;
			if (d > 8 && d < stats.range + 12) this.enemyStrike(e, stats.damage);
		}
	}
	maybeBossTelegraph(beat) {
		const boss = this.enemies.find((e) => e.alive && e.kind === "howl");
		if (!boss) return;
		if (Math.floor(beat / 8) % 3 !== 2) return;
		const front = this.frontX();
		if (boss.sprite.x - front > 340) return;
		this.telegraph = {
			until: beat + 4,
			kind: "SLAM — JUMP"
		};
		boss.sprite.setTint(16737860);
		this.floatText(boss.sprite.x, boss.sprite.y - 110, "SLAM", "#e4572e");
	}
	maybeBossSlam() {
		const boss = this.enemies.find((e) => e.alive && e.kind === "howl");
		if (!boss || !this.telegraph) return;
		boss.sprite.clearTint();
		const stats = ENEMY_STATS.howl;
		this.spawnImpact(boss.sprite.x - 40, this.groundY - 20);
		this.trauma = Math.min(1, this.trauma + .55);
		this.cameras.main.flash(80, 40, 10, 8);
		if (this.jumping) this.floatText(this.armyX + 40, this.groundY - 150, "DODGED", "#59cd90");
		else this.enemyStrike(boss, this.defending ? Math.round(stats.damage * .4) : stats.damage);
		this.telegraph = null;
	}
	enemyStrike(e, damage) {
		e.lunge = 1;
		audio.hit();
		const living = this.units.filter((u) => u.alive);
		if (!living.length) return;
		living.sort((a, b) => b.sprite.x - a.sprite.x);
		const target = living.find((u) => u.cls === "aegis") ?? living[0];
		let dmg = damage;
		if (this.defending) dmg = Math.round(dmg * .38);
		this.hitFighter(target, dmg);
		this.spawnImpact(target.sprite.x + 16, target.sprite.y - 30);
	}
	updateUnits(dt, beatPos, _now) {
		const frac = beatPos - Math.floor(beatPos);
		const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
		const act = this.action ? ACTION[this.action.id] : null;
		const hop = act?.jump ? Math.abs(Math.sin(Math.min(1, (beatPos - this.action.beat) / 4) * Math.PI * 2)) * 64 : 0;
		const thrust = act?.lunge ? Math.max(0, Math.sin(frac * Math.PI)) * 18 : 0;
		for (const u of this.units) {
			if (!u.alive) continue;
			u.lunge = Math.max(0, u.lunge - dt * 3);
			u.flash = Math.max(0, u.flash - dt);
			const x = this.armyX + u.formX + thrust + u.lunge * 16;
			const y = this.groundY + u.formY - idleBeat * 6 - hop;
			u.sprite.x = x;
			u.sprite.y = y;
			if (u.flash > 0) u.sprite.setTintFill(16777215);
			else u.sprite.clearTint();
			this.drawBar(u, x, y - 72, 36);
		}
	}
	updateEnemies(dt, beatPos) {
		const frac = beatPos - Math.floor(beatPos);
		const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
		const front = this.frontX();
		for (const e of this.enemies) {
			if (!e.alive || !e.kind) continue;
			const stats = ENEMY_STATS[e.kind];
			const dist = e.sprite.x - front;
			if (dist > stats.range) e.sprite.x -= stats.speed * (this.engine.fever ? .9 : 1) * dt;
			else if (dist < -36) e.sprite.x += stats.speed * dt;
			e.lunge = Math.max(0, e.lunge - dt * 3);
			e.flash = Math.max(0, e.flash - dt);
			e.sprite.x -= e.lunge * 40 * dt;
			e.sprite.y = this.groundY + e.formY - idleBeat * 4;
			if (e.flash > 0) e.sprite.setTintFill(16777215);
			else e.sprite.clearTint();
			const bw = e.kind === "howl" ? 86 : 40;
			this.drawBar(e, e.sprite.x, e.sprite.y - (e.kind === "howl" ? 110 : 74), bw);
		}
	}
	drawBar(f, x, y, w) {
		const g = f.bar;
		g.clear();
		if (!f.alive) return;
		const t = f.hp / f.maxHp;
		g.fillStyle(1117208, .7);
		g.fillRoundedRect(x - w / 2, y, w, 5, 2);
		g.fillStyle(t > .4 ? 5885328 : 14964526, 1);
		g.fillRoundedRect(x - w / 2, y, Math.max(2, w * t), 5, 2);
	}
	updateCamera(dt, beatPos) {
		const cam = this.cameras.main;
		const look = this.armyX - this.viewW * .28 + (this.action && ACTION[this.action.id].speed > 0 ? 40 : 0);
		const target = __webpack_exports__Math.Clamp(look, 0, Math.max(0, this.mission.worldLength - this.viewW));
		const k = 1 - Math.exp(-3.2 * dt);
		cam.scrollX += (target - cam.scrollX) * k;
		cam.scrollY = 0;
		this.trauma = Math.max(0, this.trauma - dt * 1.7);
		const shake = this.trauma * this.trauma * this.shakeMul;
		if (shake > .002) {
			cam.scrollX += (Math.random() - .5) * shake * 22;
			cam.scrollY += (Math.random() - .5) * shake * 10;
		}
		const frac = beatPos - Math.floor(beatPos);
		const pulse = beatPos >= 0 ? Math.exp(-frac * 5) : 0;
		this.sun.setScale(1 + pulse * .06 + this.feverT * .08);
		const targetFever = this.engine.fever ? 1 : 0;
		this.feverT += (targetFever - this.feverT) * Math.min(1, dt * 3);
		this.sky.setTint(this.feverT > .05 ? __webpack_exports__Display.Color.GetColor(255, 210 - this.feverT * 40, 180) : 16777215);
	}
	updateParallax() {
		const x = this.cameras.main.scrollX;
		this.far.tilePositionX = x * .12;
		this.mid.tilePositionX = x * .28;
		this.near.tilePositionX = x * .5;
		this.sky.tilePositionX = x * .04;
	}
	relayout(w, h) {
		this.viewW = w;
		this.viewH = h;
		this.groundY = h * .64;
		this.sky.setSize(w, h);
		this.far.setPosition(0, h * .28).setSize(w, 280);
		this.mid.setPosition(0, h * .4).setSize(w, 260);
		this.near.setPosition(0, h * .5).setSize(w, 220);
		this.sun.setPosition(w * .72, h * .22);
		this.sun.setRadius(h * .09);
		this.ground.y = this.groundY + 8;
		this.ground.setSize(Math.max(w, this.mission.worldLength), 240);
		this.cameras.main.setBounds(0, 0, this.mission.worldLength, h);
		if (this.shrine) this.shrine.y = this.groundY;
	}
	checkEnd() {
		if (this.ended) return;
		const banner = this.units.find((u) => u.cls === "banner");
		if (!this.units.filter((u) => u.alive).length || banner && !banner.alive) {
			this.finish(false, banner && !banner.alive ? "The banner fell." : "The army was wiped out.");
			return;
		}
		if (this.mission.tutorial && this.armyX >= this.mission.goalX - 40) {
			this.finish(true, "The shrine is yours.");
			return;
		}
		if (!this.mission.tutorial && this.mission.waves.length) {
			const allSpawned = this.spawnedWaves.size >= this.mission.waves.length;
			const noneLeft = this.enemies.every((e) => !e.alive);
			if (allSpawned && noneLeft && this.enemies.length > 0) this.finish(true, "The road is clear.");
		}
	}
	finish(win, cause) {
		this.ended = true;
		const result = {
			win,
			missionId: this.mission.id,
			missionName: this.mission.name,
			commands: this.engine.commandCount,
			fails: this.engine.failCount,
			bestCombo: this.engine.bestCombo,
			feverReached: this.feverReached,
			cause
		};
		this.time.delayedCall(700, () => bus.emit("battle-end", result));
	}
	emitHud() {
		const e = this.engine;
		const beatPos = e.beatPosition(audio.now());
		const slot = beatPos >= 0 ? (Math.floor(beatPos) % 8 + 8) % 8 : -1;
		const armyHp = this.units.reduce((s, u) => s + Math.max(0, u.hp), 0);
		const armyMax = this.units.reduce((s, u) => s + u.maxHp, 0);
		const banner = this.units.find((u) => u.cls === "banner");
		const boss = this.enemies.find((en) => en.kind === "howl" && en.alive);
		const cmd = this.action ? COMMANDS.find((c) => c.id === this.action.id) : null;
		const hud = {
			combo: e.combo,
			fever: e.fever,
			command: cmd?.name ?? this.lastGrade,
			commandColor: e.fever ? "#ffe08a" : "#f4ead8",
			slot,
			phase: beatPos < 0 ? "wait" : slot < 4 ? "input" : "response",
			beatPos,
			armyHp,
			armyMax,
			bannerHp: banner?.hp ?? 0,
			bannerMax: banner?.maxHp ?? 1,
			msg: cmd?.name ?? null,
			msgColor: "#f4ead8",
			ready: beatPos < 0,
			tutorial: this.tutorial || null,
			boss: boss ? {
				name: "Iron Howl",
				hp: boss.hp,
				max: boss.maxHp
			} : null,
			telegraph: this.telegraph?.kind ?? null
		};
		bus.emit("hud", hud);
	}
};
function createGame(parent, missionId) {
	const w = Math.max(320, parent.clientWidth || 1280);
	const h = Math.max(240, parent.clientHeight || 720);
	return new __webpack_exports__Game({
		type: __webpack_exports__AUTO,
		parent,
		width: w,
		height: h,
		backgroundColor: "#110c18",
		scale: {
			mode: __webpack_exports__Scale.RESIZE,
			autoCenter: __webpack_exports__Scale.CENTER_BOTH
		},
		render: {
			antialias: true,
			powerPreference: "high-performance"
		},
		physics: {
			default: "arcade",
			arcade: {
				gravity: {
					x: 0,
					y: 0
				},
				debug: false
			}
		},
		audio: {
			disableWebAudio: true,
			noAudio: true
		},
		scene: [PreloadScene, BattleScene],
		callbacks: { preBoot: (game) => {
			game.registry.set("missionId", missionId);
		} }
	});
}
//#endregion
export { createGame };
