import { a as rollBattleLoot, c as CLASSES, d as computeUnitStats, f as audio, i as missionById, l as ENEMY_STATS, n as RhythmEngine, o as COMMANDS, r as bus, s as loadSave, u as STARTER_ARMY } from "./routes-VU-Tbi2O.mjs";
import { a as __webpack_exports__Scene, i as __webpack_exports__Scale, n as __webpack_exports__Game, r as __webpack_exports__Geom, t as __webpack_exports__AUTO } from "../_libs/phaser.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createGame-e0Q8PpNw.js
var SHEETS = [
	"spearkin-idle",
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
		lunge: true,
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
/** How much each enemy resists being shoved. Bigger enemies barely move. */
var KNOCKBACK_WEIGHT = {
	goretusk: 1,
	brute: .55,
	howl: .12
};
/** Fever makes the army move faster and enemies a little slower. */
var FEVER_ARMY_SPEED = 1.32;
var FEVER_ENEMY_SPEED = .9;
/** The army can't be marched past these distances from the ends of the map. */
var ARMY_MIN_X = 80;
var ARMY_END_MARGIN = 200;
function armyAdvance(armyX, commandSpeed, fever, dt, worldLength) {
	const speed = commandSpeed * (fever ? FEVER_ARMY_SPEED : 1);
	return Math.min(worldLength - ARMY_END_MARGIN, Math.max(ARMY_MIN_X, armyX + speed * dt));
}
/** Damage and knockback multipliers for one volley of ATTACK, CHARGE or DEFEND. */
function attackModifiers(o) {
	return {
		damage: (o.fever ? 1.45 : 1) * (o.charged ? 1.7 : 1) * (o.defend ? .45 : 1),
		power: (o.charged ? 1.7 : 1) * (o.fever ? 1.25 : 1)
	};
}
/** Base damage scaled by a multiplier. Every hit does at least 1. */
function scaledDamage(base, multiplier) {
	return Math.max(1, Math.round(base * multiplier));
}
/** Enemy knockback is a velocity (px/s): hits stack up to a cap. Heavy enemies barely move. */
function enemyKnockback(current, power, kind) {
	return Math.min(520, current + 260 * power * KNOCKBACK_WEIGHT[kind]);
}
/** Army knockback is an offset (px, negative is backwards) from formation. Shields and DEFEND resist it. */
function unitKnockback(current, power, cls, defending) {
	const resist = (cls === "aegis" ? .6 : 1) * (defending ? .4 : 1);
	return Math.max(-46, current - 26 * power * resist);
}
/** Damage an enemy blow deals to the army. DEFEND cuts it sharply, and equipment defense further mitigates it. */
function damageToUnit(damage, defending, defenseBonus = 0) {
	const mitigated = (defending ? damage * .38 : damage) * (1 - Math.min(.75, Math.max(0, defenseBonus)));
	return Math.max(1, Math.round(mitigated));
}
/** The boss's slam damage before it reaches the army. DEFEND softens it. */
function bossSlamDamage(base, defending) {
	return defending ? Math.round(base * .4) : base;
}
/** Offset easing back to zero for army units. */
function easeUnitKnockback(kb, dt) {
	const v = kb * Math.exp(-dt * 9);
	return Math.abs(v) < .3 ? 0 : v;
}
/** Velocity easing back to zero for enemies. */
function easeEnemyKnockback(kb, dt) {
	const v = kb * Math.exp(-dt * 6.5);
	return v < 4 ? 0 : v;
}
/** How far an enemy walks this frame: forward until in range, backing off if the army is past it. */
function enemyWalk(distToFront, range, speed, fever, dt) {
	if (distToFront > range) return -speed * (fever ? FEVER_ENEMY_SPEED : 1) * dt;
	if (distToFront < -36) return speed * dt;
	return 0;
}
/** The target ahead of `x` within `range`, closest first. Ignores anything that is dead or too close. */
function nearestAhead(items, x, range, xOf, isAlive) {
	let best = null;
	let bestD = range;
	for (const item of items) {
		if (!isAlive(item)) continue;
		const d = xOf(item) - x;
		if (d > 8 && d < bestD) {
			bestD = d;
			best = item;
		}
	}
	return best;
}
/** Where the front rank is. Falls back to the army's anchor once every unit is dead. */
function frontX(unitXs, fallback) {
	return unitXs.length ? Math.max(...unitXs) : fallback;
}
function shouldTelegraphSlam(measure, bossX, front) {
	return measure % 3 === 2 && bossX - front <= 340;
}
/** Has the battle been won or lost? Null while it is still going. Losing is checked first. */
function evaluateEnd(s) {
	const bannerFell = s.hasBanner && !s.bannerAlive;
	if (s.unitsAlive === 0 || bannerFell) return {
		win: false,
		cause: bannerFell ? "The banner fell." : "The army was wiped out."
	};
	if (s.tutorial && s.armyX >= s.goalX - 40) return {
		win: true,
		cause: "The shrine is yours."
	};
	if (!s.tutorial && s.wavesTotal > 0) {
		if (s.wavesSpawned >= s.wavesTotal && s.enemiesSpawned > 0 && s.enemiesAlive === 0) return {
			win: true,
			cause: "The road is clear."
		};
	}
	return null;
}
/** Squash and stretch about the feet: taller on the beat or when airborne, flatter when hit. */
function squash(f, stretch, narrow) {
	const hit = Math.min(1, f.flash / .12);
	f.sprite.setScale(f.sx * (1 - narrow + hit * .12), f.sy * (1 + stretch - hit * .1));
}
function drawBar(f, x, y, w) {
	const g = f.bar;
	g.clear();
	if (!f.alive) return;
	const t = f.hp / f.maxHp;
	g.fillStyle(1117208, .7);
	g.fillRect(x - w / 2, y, w, 5);
	g.fillStyle(t > .4 ? 5885328 : 14964526, 1);
	g.fillRect(x - w / 2, y, Math.max(2, w * t), 5);
}
/** Where the army's front rank currently is. */
function frontOf(s) {
	return frontX(s.units.filter((u) => u.alive).map((u) => u.sprite.x), s.armyX);
}
/** Iron Howl, while he is alive. */
function liveBoss(s) {
	return s.enemies.find((e) => e.alive && e.kind === "howl");
}
/** Position within the current beat, 0 to 1. */
function beatFraction(beatPos) {
	return beatPos - Math.floor(beatPos);
}
/** Where each class stands relative to the banner, front rank on the right. */
var FORMATION = {
	banner: [-200],
	bow: [-92, -52],
	spear: [
		8,
		48,
		88
	],
	aegis: [128, 168]
};
/** The player's marching army: spawning it in formation and animating it each frame. */
var Army = class {
	scene;
	s;
	constructor(scene, state) {
		this.scene = scene;
		this.s = state;
	}
	spawn() {
		const { scene, s } = this;
		const save = loadSave();
		const roster = save.roster && save.roster.length > 0 ? save.roster : STARTER_ARMY.map((cls, idx) => ({
			id: `starter-${cls}-${idx}`,
			cls,
			level: 1
		}));
		const used = {
			banner: 0,
			aegis: 0,
			spear: 0,
			bow: 0
		};
		roster.forEach((member, i) => {
			const cls = member.cls;
			const classDef = CLASSES[cls] ?? CLASSES.banner;
			const stats = computeUnitStats(member);
			const idx = used[cls] ?? 0;
			used[cls] = idx + 1;
			const formX = FORMATION[cls]?.[idx] ?? idx * 36;
			const formY = i % 2 * 8;
			const sprite = scene.add.sprite(s.armyX + formX, s.groundY + formY, classDef.sprite, 0);
			sprite.setOrigin(.5, .92);
			sprite.setDepth(10 + i * .01);
			const display = cls === "banner" ? 92 : 80;
			sprite.setDisplaySize(display, display);
			sprite.play(`${classDef.sprite}-anim`);
			const bar = scene.add.graphics().setDepth(40);
			s.units.push({
				sprite,
				hp: stats.hp,
				maxHp: stats.hp,
				cls,
				member,
				damage: stats.damage,
				range: stats.range,
				defense: stats.defense,
				attackSpeed: stats.attackSpeed,
				alive: true,
				formX,
				formY,
				lunge: 0,
				flash: 0,
				bar,
				kb: 0,
				sx: sprite.scaleX,
				sy: sprite.scaleY
			});
		});
	}
	update(dt, beatPos) {
		const { s } = this;
		const frac = beatFraction(beatPos);
		const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
		const act = s.action ? ACTION[s.action.id] : null;
		const hop = act?.jump ? Math.abs(Math.sin(Math.min(1, (beatPos - s.action.beat) / 4) * Math.PI * 2)) * 64 : 0;
		const thrust = act?.lunge ? Math.max(0, Math.sin(frac * Math.PI)) * 18 : 0;
		for (const u of s.units) {
			if (!u.alive) continue;
			const lungeDecay = 3 * (u.attackSpeed ?? 1);
			u.lunge = Math.max(0, u.lunge - dt * lungeDecay);
			u.flash = Math.max(0, u.flash - dt);
			u.kb = easeUnitKnockback(u.kb, dt);
			const x = s.armyX + u.formX + thrust + u.lunge * 16 + u.kb;
			const y = s.groundY + u.formY - idleBeat * 6 - hop;
			u.sprite.x = x;
			u.sprite.y = y;
			squash(u, idleBeat * .08, idleBeat * .045);
			if (u.flash > 0) u.sprite.setTintFill(16777215);
			else u.sprite.clearTint();
			drawBar(u, x, y - 72, 36);
		}
	}
};
/** The parallax scenery, the ground, the sun and the goal shrine. */
var Backdrop = class {
	scene;
	s;
	sky;
	far;
	mid;
	near;
	ground;
	sun;
	shrine;
	constructor(scene, state) {
		this.scene = scene;
		this.s = state;
	}
	build() {
		const { scene, s } = this;
		const w = s.viewW;
		const h = s.viewH;
		this.sky = scene.add.tileSprite(0, 0, w, h, "sky").setOrigin(0).setScrollFactor(0).setDepth(-20);
		this.makeHillTex("hill-far", 1024, 280, 5911664, .12, .38);
		this.makeHillTex("hill-mid", 1024, 260, 4007e3, .1, .48);
		this.makeHillTex("hill-near", 1024, 220, 2758720, .08, .58);
		this.makeGroundTex("ground-tex", 512, 220);
		this.far = scene.add.tileSprite(0, h * .28, w, 280, "hill-far").setOrigin(0, 0).setScrollFactor(0).setDepth(-15);
		this.mid = scene.add.tileSprite(0, h * .4, w, 260, "hill-mid").setOrigin(0, 0).setScrollFactor(0).setDepth(-12);
		this.near = scene.add.tileSprite(0, h * .5, w, 220, "hill-near").setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
		this.sun = scene.add.circle(w * .72, h * .22, h * .09, 16772266, .92).setScrollFactor(0).setDepth(-18);
		this.ground = scene.add.tileSprite(0, s.groundY + 8, Math.max(w, s.mission.worldLength), 240, "ground-tex").setOrigin(0, 0).setDepth(-5);
		this.drawShrine();
	}
	/** Scroll each layer at its own rate to fake depth. */
	parallax(scrollX) {
		this.far.tilePositionX = scrollX * .12;
		this.mid.tilePositionX = scrollX * .28;
		this.near.tilePositionX = scrollX * .5;
		this.sky.tilePositionX = scrollX * .04;
	}
	relayout() {
		const { s } = this;
		const w = s.viewW;
		const h = s.viewH;
		this.sky.setSize(w, h);
		this.far.setPosition(0, h * .28).setSize(w, 280);
		this.mid.setPosition(0, h * .4).setSize(w, 260);
		this.near.setPosition(0, h * .5).setSize(w, 220);
		this.sun.setPosition(w * .72, h * .22);
		this.sun.setRadius(h * .09);
		this.ground.y = s.groundY + 8;
		this.ground.setSize(Math.max(w, s.mission.worldLength), 240);
		if (this.shrine) this.shrine.y = s.groundY;
	}
	/** A quick pop on every beat. */
	pulseSun() {
		this.scene.tweens.add({
			targets: this.sun,
			scale: 1.08,
			yoyo: true,
			duration: 90
		});
	}
	setSunScale(scale) {
		this.sun.setScale(scale);
	}
	/** Warm the sky while fever is on. */
	setSkyFever(on) {
		if (on) this.sky.setTint(16763060);
		else this.sky.clearTint();
	}
	makeHillTex(key, w, h, color, freq, baseT) {
		const { scene } = this;
		if (scene.textures.exists(key)) return;
		const g = scene.add.graphics();
		g.setVisible(false);
		const base = h * baseT;
		const amp = h * .22;
		g.fillStyle(color, 1);
		g.beginPath();
		g.moveTo(0, h);
		g.lineTo(0, base);
		for (let x = 0; x <= w; x += 6) {
			const t = x * freq;
			const y = base - (Math.sin(t) * amp + Math.sin(t * 2.17 + 1.1) * amp * .38);
			g.lineTo(x, y);
		}
		g.lineTo(w, h);
		g.closePath();
		g.fillPath();
		g.generateTexture(key, w, h);
		g.destroy();
	}
	makeGroundTex(key, w, h) {
		const { scene } = this;
		if (scene.textures.exists(key)) return;
		const g = scene.add.graphics();
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
		const { scene, s } = this;
		const c = scene.add.container(s.mission.goalX, s.groundY).setDepth(2);
		const g = scene.add.graphics();
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
};
/** Follows the army, shakes on impact, and eases the fever tint in and out. */
var CameraRig = class {
	scene;
	s;
	backdrop;
	constructor(scene, state, backdrop) {
		this.scene = scene;
		this.s = state;
		this.backdrop = backdrop;
	}
	/** Keep the camera's bounds matched to the map and the window. */
	setBounds() {
		const { s } = this;
		this.scene.cameras.main.setBounds(0, 0, s.mission.worldLength, s.viewH);
	}
	update(dt, beatPos) {
		const { s, backdrop } = this;
		const cam = this.scene.cameras.main;
		const look = s.armyX - s.viewW * .28 + (s.action && ACTION[s.action.id].speed > 0 ? 40 : 0);
		const target = Math.min(Math.max(0, s.mission.worldLength - s.viewW), Math.max(0, look));
		const k = 1 - Math.exp(-3.2 * dt);
		cam.scrollX += (target - cam.scrollX) * k;
		cam.scrollY = 0;
		s.trauma = Math.max(0, s.trauma - dt * 1.7);
		const shake = s.trauma * s.trauma * s.shakeMul;
		if (shake > .002) {
			cam.scrollX += (Math.random() - .5) * shake * 22;
			cam.scrollY += (Math.random() - .5) * shake * 10;
		}
		const frac = beatPos - Math.floor(beatPos);
		const pulse = beatPos >= 0 ? Math.exp(-frac * 5) : 0;
		backdrop.setSunScale(1 + pulse * .06 + s.feverT * .08);
		const targetFever = s.engine.fever ? 1 : 0;
		s.feverT += (targetFever - s.feverT) * Math.min(1, dt * 3);
		backdrop.setSkyFever(s.feverT > .05);
	}
};
/** Landing hits, taking hits and dying. Decides what happens; Effects decides how it looks. */
var Combat = class {
	scene;
	s;
	fx;
	constructor(scene, state, fx) {
		this.scene = scene;
		this.s = state;
		this.fx = fx;
	}
	/** The army answers an ATTACK, CHARGE or DEFEND command: everyone in range strikes. */
	resolveAttack(charged, defend = false) {
		const { s, fx } = this;
		const mod = attackModifiers({
			charged,
			defend,
			fever: s.engine.fever
		});
		for (const u of s.units) {
			if (!u.alive || !u.cls) continue;
			const classDef = CLASSES[u.cls];
			const damage = u.damage ?? classDef.damage;
			const range = u.range ?? classDef.range;
			const role = classDef.role;
			if (damage <= 0) continue;
			const target = this.nearestEnemy(u.sprite.x, range + (charged ? 40 : 0));
			if (!target) continue;
			u.lunge = defend ? .6 : 1;
			const dmg = scaledDamage(damage, mod.damage);
			if (role === "ranged") {
				const isSpear = u.cls === "spear";
				this.fireRanged(u.sprite.x, u.sprite.y - 40, target, dmg, isSpear, .7 * mod.power);
			} else {
				this.hit(target, dmg, 1.2 * mod.power);
				fx.impact(target.sprite.x - 20, target.sprite.y - 36);
			}
		}
		audio.hit();
	}
	/** An enemy blow lands on the army. Shield-bearers take it first. */
	enemyStrike(e, damage, power = 1) {
		const { s, fx } = this;
		e.lunge = 1;
		audio.hit();
		const living = s.units.filter((u) => u.alive);
		if (!living.length) return;
		living.sort((a, b) => b.sprite.x - a.sprite.x);
		const target = living.find((u) => u.cls === "aegis") ?? living[0];
		this.hit(target, damageToUnit(damage, s.defending, target.defense ?? 0), power);
		fx.impact(target.sprite.x + 16, target.sprite.y - 30);
	}
	/** Apply damage, knockback and feedback to one fighter, and kill it if it runs out of health. */
	hit(f, dmg, power = 1) {
		const { s, fx } = this;
		if (!f.alive) return;
		f.hp = Math.max(0, f.hp - dmg);
		f.flash = .12;
		f.kb = f.kind ? enemyKnockback(f.kb, power, f.kind) : unitKnockback(f.kb, power, f.cls, s.defending);
		const burst = Math.round(5 + Math.min(10, dmg * .6));
		fx.sparks(f.kind ? "hit" : "hurt", burst, f.sprite.x, f.sprite.y - 38);
		fx.floatText(f.sprite.x, f.sprite.y - 70, String(dmg), "#ffe08a", Math.round(16 + Math.min(14, dmg * .5)));
		s.addTrauma(.2);
		s.freeze(.045);
		if (f.hp <= 0) this.kill(f);
	}
	kill(f) {
		const { s, fx, scene } = this;
		f.alive = false;
		f.hp = 0;
		if (f.kind) s.killedEnemies.push(f.kind);
		const boss = f.kind === "howl";
		s.freeze(boss ? .16 : .08);
		const sprite = f.sprite;
		const hx = sprite.x;
		const hy = sprite.y - 36;
		fx.sparks(f.kind ? "hit" : "hurt", boss ? 36 : 16, hx, hy);
		fx.puff(hx, sprite.y, boss ? 9 : 4);
		fx.ring(hx, hy, f.kind ? 16769162 : 16747115);
		if (boss) {
			s.trauma = 1;
			fx.flash(120, 255, 240, 200);
		}
		const dir = f.kind ? 1 : -1;
		scene.tweens.add({
			targets: sprite,
			y: sprite.y - 34,
			x: sprite.x + dir * 26,
			angle: dir * 18,
			duration: 150,
			ease: "Quad.easeOut",
			onComplete: () => {
				scene.tweens.add({
					targets: sprite,
					y: sprite.y + 52,
					x: sprite.x + dir * 20,
					angle: dir * 72,
					alpha: 0,
					duration: 380,
					ease: "Quad.easeIn",
					onComplete: () => {
						sprite.setVisible(false);
						f.bar.clear();
					}
				});
			}
		});
		audio.whoosh();
	}
	fireRanged(startX, startY, target, dmg, isSpear = false, power = 1) {
		const { scene, fx } = this;
		const startPos = {
			x: startX + 10,
			y: startY
		};
		const projectile = scene.add.sprite(startPos.x, startPos.y, "arrow", 0).setDepth(35).setDisplaySize(isSpear ? 52 : 42, isSpear ? 52 : 42);
		if (isSpear) projectile.setTint(16766366);
		projectile.play("arrow-fly");
		const targetX = target.sprite.x - 16;
		const targetY = target.sprite.y - 42;
		const dist = Math.max(60, targetX - startPos.x);
		const arcHeight = Math.min(140, Math.max(70, dist * .38));
		const duration = Math.min(480, Math.max(260, dist * .95));
		const flight = { t: 0 };
		let prevX = startPos.x;
		let prevY = startPos.y;
		scene.tweens.add({
			targets: flight,
			t: 1,
			duration,
			ease: "Linear",
			onUpdate: () => {
				const t = flight.t;
				const currX = startPos.x + (targetX - startPos.x) * t;
				const currY = startPos.y + (targetY - startPos.y) * t - 4 * arcHeight * t * (1 - t);
				const dx = currX - prevX;
				const dy = currY - prevY;
				if (Math.abs(dx) > .001 || Math.abs(dy) > .001) projectile.setRotation(Math.atan2(dy, dx));
				projectile.setPosition(currX, currY);
				prevX = currX;
				prevY = currY;
			},
			onComplete: () => {
				projectile.destroy();
				if (target.alive) {
					this.hit(target, dmg, power);
					fx.impact(target.sprite.x - 10, target.sprite.y - 36);
				}
			}
		});
	}
	nearestEnemy(x, range) {
		return nearestAhead(this.s.enemies, x, range, (e) => e.sprite.x, (e) => e.alive);
	}
};
/**
* Particles, rings, floating text and the fever glow. All procedural, so nothing
* here needs art files. Other modules ask for effects; none of them touch emitters.
*/
var Effects = class {
	scene;
	s;
	sparkHit;
	sparkHurt;
	dust;
	embers;
	feverGlow;
	wasFever = false;
	constructor(scene, state) {
		this.scene = scene;
		this.s = state;
		this.build();
	}
	sparks(kind, count, x, y) {
		(kind === "hit" ? this.sparkHit : this.sparkHurt).explode(count, x, y);
	}
	puff(x, y, n = 2) {
		this.dust.emitParticleAt(x, y, n);
	}
	/** An expanding ring, used for shockwaves and big moments. */
	ring(x, y, color) {
		const c = this.scene.add.circle(x, y, 12, color, 0).setStrokeStyle(2, color, 1).setDepth(51);
		this.scene.tweens.add({
			targets: c,
			scale: 9,
			alpha: 0,
			duration: 420,
			ease: "Cubic.easeOut",
			onComplete: () => c.destroy()
		});
	}
	impact(x, y) {
		const s = this.scene.add.sprite(x, y, "impact", 0).setDepth(50).setDisplaySize(72, 72);
		s.play("fx-impact");
		s.once("animationcomplete", () => s.destroy());
	}
	floatText(x, y, text, color, size = 18) {
		const t = this.scene.add.text(x, y, text, {
			fontFamily: "Nunito, sans-serif",
			fontSize: `${size}px`,
			fontStyle: "800",
			color,
			stroke: "#110c18",
			strokeThickness: Math.max(4, Math.round(size / 5))
		}).setOrigin(.5).setDepth(60);
		this.scene.tweens.add({
			targets: t,
			y: y - 42,
			alpha: 0,
			duration: 720,
			ease: "Cubic.easeOut",
			onComplete: () => t.destroy()
		});
	}
	flash(durationMs, r, g, b) {
		this.scene.cameras.main.flash(durationMs, r, g, b);
	}
	/** Call every frame: starts and stops the fever effects as fever turns on and off. */
	updateFever(beatPos) {
		const { s } = this;
		const fever = s.engine.fever;
		if (fever && !this.wasFever) this.enterFever();
		if (!fever && this.wasFever) this.embers.stop();
		this.wasFever = fever;
		if (fever) this.embers.setPosition(s.armyX - 20, s.groundY + 6);
		const pulse = beatPos >= 0 ? Math.exp(-(beatPos - Math.floor(beatPos)) * 5) : 0;
		this.feverGlow.setFillStyle(16751165, s.feverT * (.06 + pulse * .07));
	}
	resize(w, h) {
		this.feverGlow.setSize(w, h);
	}
	enterFever() {
		const { s } = this;
		this.embers.start();
		this.flash(160, 255, 210, 110);
		s.addTrauma(.3);
		this.floatText(s.armyX + 60, s.groundY - 230, "FEVER!", "#ffe08a", 40);
		this.ring(s.armyX + 20, s.groundY - 40, 16765803);
		this.sparks("hit", 24, s.armyX + 20, s.groundY - 60);
	}
	build() {
		const { scene, s } = this;
		if (!scene.textures.exists("fx-spark")) {
			const g = scene.add.graphics();
			g.setVisible(false);
			g.fillStyle(16777215, 1);
			g.fillCircle(6, 6, 5);
			g.generateTexture("fx-spark", 12, 12);
			g.clear();
			for (let r = 16; r > 0; r -= 2) {
				g.fillStyle(16777215, .06 + (16 - r) * .012);
				g.fillCircle(16, 16, r);
			}
			g.generateTexture("fx-puff", 32, 32);
			g.destroy();
		}
		const sparkEmitter = (tint) => scene.add.particles(0, 0, "fx-spark", {
			emitting: false,
			lifespan: {
				min: 220,
				max: 480
			},
			speed: {
				min: 90,
				max: 280
			},
			angle: {
				min: 0,
				max: 360
			},
			gravityY: 520,
			scale: {
				start: .9,
				end: 0
			},
			alpha: {
				start: 1,
				end: 0
			},
			tint,
			blendMode: "ADD"
		}).setDepth(52);
		this.sparkHit = sparkEmitter([16773808, 16762967]);
		this.sparkHurt = sparkEmitter([16747115, 14964526]);
		this.dust = scene.add.particles(0, 0, "fx-puff", {
			emitting: false,
			lifespan: {
				min: 380,
				max: 700
			},
			speedX: {
				min: -50,
				max: 20
			},
			speedY: {
				min: -40,
				max: -10
			},
			scale: {
				start: .5,
				end: 1.3
			},
			alpha: {
				start: .38,
				end: 0
			},
			tint: 12166798
		}).setDepth(9);
		this.embers = scene.add.particles(0, 0, "fx-spark", {
			emitting: false,
			frequency: 55,
			lifespan: {
				min: 700,
				max: 1200
			},
			speedY: {
				min: -120,
				max: -60
			},
			speedX: {
				min: -18,
				max: 18
			},
			scale: {
				start: .7,
				end: 0
			},
			alpha: {
				start: .9,
				end: 0
			},
			tint: [
				16765803,
				16751165,
				16737860
			],
			blendMode: "ADD",
			emitZone: {
				type: "random",
				source: new __webpack_exports__Geom.Rectangle(-230, -10, 420, 20)
			}
		}).setDepth(11);
		this.feverGlow = scene.add.rectangle(0, 0, s.viewW, s.viewH, 16751165, 0).setOrigin(0).setScrollFactor(0).setDepth(45);
	}
};
/** How far ahead of the army a wave appears, in px. */
var SPAWN_AHEAD = 520;
/** Enemy waves: spawning, advancing, swinging, and the boss's telegraphed slam. */
var Enemies = class {
	scene;
	s;
	fx;
	combat;
	constructor(scene, state, fx, combat) {
		this.scene = scene;
		this.s = state;
		this.fx = fx;
		this.combat = combat;
	}
	/** Spawn any wave the army has marched close enough to. */
	spawnDue() {
		const { s } = this;
		s.mission.waves.forEach((w, i) => {
			if (s.spawnedWaves.has(i)) return;
			if (s.armyX > w.atX - SPAWN_AHEAD) {
				s.spawnedWaves.add(i);
				this.spawnWave(i);
			}
		});
	}
	update(dt, beatPos) {
		const { s } = this;
		const frac = beatFraction(beatPos);
		const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
		const front = frontOf(s);
		for (const e of s.enemies) {
			if (!e.alive || !e.kind) continue;
			const stats = ENEMY_STATS[e.kind];
			const dist = e.sprite.x - front;
			e.kb = easeEnemyKnockback(e.kb, dt);
			if (!(e.kb > 40)) e.sprite.x += enemyWalk(dist, stats.range, stats.speed, s.engine.fever, dt);
			e.sprite.x += e.kb * dt;
			e.lunge = Math.max(0, e.lunge - dt * 3);
			e.flash = Math.max(0, e.flash - dt);
			e.sprite.x -= e.lunge * 40 * dt;
			e.sprite.y = s.groundY + e.formY - idleBeat * 4;
			squash(e, idleBeat * .05, idleBeat * .03);
			if (e.flash > 0) e.sprite.setTintFill(16777215);
			else if (e.kind === "howl" && s.telegraph) e.sprite.setTint(16737860);
			else e.sprite.clearTint();
			const bw = e.kind === "howl" ? 86 : 40;
			drawBar(e, e.sprite.x, e.sprite.y - (e.kind === "howl" ? 110 : 74), bw);
		}
	}
	/** On the army's first answering beat, every enemy in reach swings. The boss slams instead. */
	swing() {
		const { s } = this;
		const front = frontOf(s);
		for (const e of s.enemies) {
			if (!e.alive || !e.kind) continue;
			const stats = ENEMY_STATS[e.kind];
			if (e.kind === "howl") continue;
			const d = e.sprite.x - front;
			if (d > 8 && d < stats.range + 12) this.combat.enemyStrike(e, stats.damage);
		}
	}
	/** Wind up the boss's slam, giving the player a measure to answer with JUMP. */
	maybeTelegraph(beat) {
		const { s, fx } = this;
		const boss = liveBoss(s);
		if (!boss) return;
		if (!shouldTelegraphSlam(Math.floor(beat / 8), boss.sprite.x, frontOf(s))) return;
		s.telegraph = {
			until: beat + 4,
			kind: "SLAM — JUMP"
		};
		boss.sprite.setTint(16737860);
		fx.floatText(boss.sprite.x, boss.sprite.y - 110, "SLAM", "#e4572e");
	}
	/** The slam lands, unless the army jumped. */
	maybeSlam() {
		const { s, fx } = this;
		const boss = liveBoss(s);
		if (!boss || !s.telegraph) return;
		boss.sprite.clearTint();
		const stats = ENEMY_STATS.howl;
		fx.impact(boss.sprite.x - 40, s.groundY - 20);
		fx.ring(boss.sprite.x - 40, s.groundY - 10, 16737860);
		fx.puff(boss.sprite.x - 40, s.groundY, 10);
		s.addTrauma(.55);
		fx.flash(80, 40, 10, 8);
		if (s.jumping) fx.floatText(s.armyX + 40, s.groundY - 150, "DODGED", "#59cd90");
		else this.combat.enemyStrike(boss, bossSlamDamage(stats.damage, s.defending), 2.4);
		s.telegraph = null;
	}
	spawnWave(index) {
		const { scene, s } = this;
		const wave = s.mission.waves[index];
		if (!wave) return;
		let n = 0;
		for (const pack of wave.enemies) for (let i = 0; i < pack.count; i++) {
			const stats = ENEMY_STATS[pack.kind];
			const x = wave.atX + n * 54;
			const y = s.groundY + n % 2 * 10;
			const sprite = scene.add.sprite(x, y, stats.sprite, 0);
			sprite.setOrigin(.5, .92);
			sprite.setDepth(8);
			const size = 86 * stats.scale;
			sprite.setDisplaySize(size, size);
			sprite.play(`${stats.sprite}-anim`);
			const bar = scene.add.graphics().setDepth(40);
			s.enemies.push({
				sprite,
				hp: stats.hp,
				maxHp: stats.hp,
				kind: pack.kind,
				alive: true,
				formX: 0,
				formY: n % 2 * 10,
				lunge: 0,
				flash: 0,
				bar,
				kb: 0,
				sx: sprite.scaleX,
				sy: sprite.scaleY
			});
			n += 1;
		}
	}
};
/** Turn battle state into what the React HUD shows. Pure, so it can be tested. */
function buildHud(i) {
	const n = Math.floor(i.beatPos);
	const slot = i.beatPos >= 0 ? (n % 8 + 8) % 8 : -1;
	return {
		combo: i.combo,
		fever: i.fever,
		command: i.commandName ?? i.lastGrade,
		commandColor: i.fever ? "#ffe08a" : "#f4ead8",
		slot,
		phase: i.beatPos < 0 ? "wait" : slot < 4 ? "input" : "response",
		beatPos: i.beatPos,
		armyHp: i.armyHp,
		armyMax: i.armyMax,
		bannerHp: i.banner?.hp ?? 0,
		bannerMax: i.banner?.maxHp ?? 1,
		msg: i.commandName,
		msgColor: "#f4ead8",
		ready: i.beatPos < 0,
		tutorial: i.tutorial || null,
		boss: i.boss ? {
			name: i.boss.name,
			hp: i.boss.hp,
			max: i.boss.maxHp
		} : null,
		telegraph: i.telegraph
	};
}
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
/** How far ahead of the audio clock beats are scheduled, in seconds. */
var LOOKAHEAD = .22;
/**
* Queue the drums, chant and melody for upcoming beats on the audio clock.
* Called every frame; it only schedules beats that haven't been queued yet.
*/
function scheduleMusic(s, now) {
	const e = s.engine;
	if (!e.started || e.startTime === null) return;
	while (e.beatTime(s.nextTick) < now + LOOKAHEAD) {
		const slot = s.nextTick % 8;
		const when = e.beatTime(s.nextTick);
		if (s.nextTick >= 0 && when > e.startTime - .01) {
			if (slot < 4) audio.tick(when, slot === 0);
			else {
				audio.thump(when);
				audio.chant(when, e.fever);
			}
			const scale = e.fever ? MUSIC_FEVER : MUSIC;
			if (slot === 0 || slot === 4) audio.pluck(when, scale[s.nextTick % scale.length], e.fever);
			if (e.fever && slot === 2) audio.pluck(when, scale[2], true);
		}
		s.nextTick += 1;
	}
}
/**
* Everything the battle modules share. There is one per battle, created in
* BattleScene.create(), so a restarted mission always begins from a clean slate.
*/
var BattleState = class {
	mission;
	engine;
	ended = false;
	paused = false;
	/** The army's anchor on the map. Units sit at this plus their formation offset. */
	armyX = 280;
	groundY = 420;
	viewW = 1280;
	viewH = 720;
	/** The next beat whose audio has not been scheduled yet. */
	nextTick = 0;
	action = null;
	charged = false;
	defending = false;
	jumping = false;
	/** Camera shake, 0 to 1, decaying. */
	trauma = 0;
	/** Seconds the whole battle is frozen for, to give hits weight. */
	hitstop = 0;
	/** 0 to 1, eases towards 1 while fever is active. */
	feverT = 0;
	shakeMul;
	units = [];
	enemies = [];
	killedEnemies = [];
	spawnedWaves = /* @__PURE__ */ new Set();
	lastGrade = null;
	telegraph = null;
	feverReached = false;
	tutorial = "";
	constructor(mission, engine, view, shakeMul) {
		this.mission = mission;
		this.engine = engine;
		this.shakeMul = shakeMul;
		this.resize(view.w, view.h);
	}
	resize(w, h) {
		this.viewW = w;
		this.viewH = h;
		this.groundY = h * .64;
	}
	addTrauma(amount) {
		this.trauma = Math.min(1, this.trauma + amount);
	}
	/** Freeze the battle for at least this many seconds. */
	freeze(seconds) {
		this.hitstop = Math.max(this.hitstop, seconds);
	}
	clearAction() {
		this.action = null;
		this.defending = false;
		this.jumping = false;
	}
};
/**
* Runs one battle. The scene is only the coordinator: it turns rhythm events into
* commands and calls the modules in src/game/battle in the right order each frame.
*
*   rules.ts     damage, knockback, targeting, win and lose (pure, tested)
*   state.ts     the state every module shares
*   backdrop.ts  scenery, ground, sun, shrine
*   effects.ts   particles, rings, floating text, fever glow
*   army.ts      the player's units
*   enemies.ts   waves and the boss
*   combat.ts    hits, knockback and deaths
*   camera.ts    follow, shake and fever tint
*   music.ts     scheduling drums and melody on the audio clock
*/
var BattleScene = class extends __webpack_exports__Scene {
	constructor() {
		super("battle");
	}
	s;
	backdrop;
	fx;
	army;
	enemies;
	combat;
	rig;
	lastHud = 0;
	offDrum;
	offPause;
	onResize;
	create() {
		const id = String(this.registry.get("missionId") ?? "training");
		const mission = missionById(id);
		if (!mission) {
			this.scene.stop();
			return;
		}
		const save = loadSave();
		audio.setVolumes(save.settings);
		const s = new BattleState(mission, new RhythmEngine({
			bpm: mission.bpm,
			inputOffsetMs: save.offsetMs
		}), {
			w: this.scale.width,
			h: this.scale.height
		}, save.settings.shake);
		this.s = s;
		this.lastHud = 0;
		this.physics.world.setBounds(0, 0, mission.worldLength, s.viewH);
		this.backdrop = new Backdrop(this, s);
		this.backdrop.build();
		this.fx = new Effects(this, s);
		this.combat = new Combat(this, s, this.fx);
		this.army = new Army(this, s);
		this.army.spawn();
		this.enemies = new Enemies(this, s, this.fx, this.combat);
		this.rig = new CameraRig(this, s, this.backdrop);
		this.rig.setBounds();
		if (mission.tutorial) s.tutorial = "Drum on the four white beats. Miss the army’s four.";
		this.offDrum = bus.on("drum", (payload) => {
			const p = payload;
			this.onDrum(p.drum, p.time);
		});
		this.offPause = bus.on("pause", (payload) => {
			s.paused = Boolean(payload);
		});
		this.onResize = (size) => this.relayout(size.width, size.height);
		this.scale.on("resize", this.onResize);
		this.events.once("shutdown", () => this.cleanup());
		this.emitHud();
	}
	update(_time, delta) {
		if (!this.s) return;
		try {
			this.tick(delta);
		} catch (err) {
			window.__battleErr = err;
			console.error(err);
		}
	}
	cleanup() {
		this.offDrum?.();
		this.offPause?.();
		if (this.onResize) this.scale.off("resize", this.onResize);
		this.tweens.killAll();
	}
	tick(delta) {
		const s = this.s;
		const dt = Math.min(.05, delta / 1e3);
		if (s.ended) return;
		if (s.paused) return;
		if (s.hitstop > 0) {
			s.hitstop -= dt;
			return;
		}
		const now = audio.now();
		scheduleMusic(s, now);
		for (const ev of s.engine.advance(now)) if (ev.type === "command") this.applyCommand(ev.command.id, ev.beat, ev.fever, ev.perfects);
		else if (ev.type === "fail") this.applyFail(ev.reason);
		else if (ev.type === "beat") this.onBeat(ev.slot, ev.phase, ev.beat);
		const beatPos = s.engine.beatPosition(now);
		if (s.action && beatPos >= s.action.beat + 4) s.clearAction();
		const act = s.action ? ACTION[s.action.id] : null;
		s.armyX = armyAdvance(s.armyX, act?.speed ?? 0, s.engine.fever, dt, s.mission.worldLength);
		this.enemies.spawnDue();
		this.army.update(dt, beatPos);
		this.enemies.update(dt, beatPos);
		this.rig.update(dt, beatPos);
		this.fx.updateFever(beatPos);
		this.backdrop.parallax(this.cameras.main.scrollX);
		this.checkEnd();
		this.lastHud += dt;
		if (this.lastHud > .05) {
			this.lastHud = 0;
			this.emitHud();
		}
	}
	onDrum(drum, time) {
		const s = this.s;
		if (s.ended || s.paused) return;
		const wasStarted = s.engine.started;
		const j = s.engine.tap(drum, time);
		if (!wasStarted && s.engine.started) s.nextTick = 1;
		if (j.ignored) return;
		const ms = `${j.deltaMs >= 0 ? "+" : ""}${Math.round(j.deltaMs)}ms`;
		if (j.grade === "miss") {
			s.lastGrade = "OFF BEAT";
			this.fx.floatText(s.armyX + 40, s.groundY - 130, `OFF BEAT  ${ms}`, "#c9b8a6");
			return;
		}
		const label = j.grade === "perfect" ? "PERFECT" : "GOOD";
		const color = j.grade === "perfect" ? "#59cd90" : "#f2b134";
		s.lastGrade = label;
		this.fx.floatText(s.armyX + 40, s.groundY - 130, `${label}  ${ms}`, color);
	}
	applyCommand(id, beat, fever, perfects) {
		const s = this.s;
		s.action = {
			id,
			beat
		};
		s.defending = id === "defend";
		s.jumping = id === "jump";
		if (id === "charge") s.charged = true;
		if (fever) s.feverReached = true;
		if (id === "attack" || id === "charge" || id === "defend") this.combat.resolveAttack(id === "charge" || s.charged, id === "defend");
		if (id === "attack") s.charged = false;
		const label = fever ? `${id.toUpperCase()}  FEVER` : id.toUpperCase();
		this.fx.floatText(s.armyX + 90, s.groundY - 180, label, fever ? "#ffe08a" : "#f4ead8");
		s.addTrauma((fever ? .28 : .12) + perfects * .03);
		if (perfects >= 4) this.fx.ring(s.armyX + 20, s.groundY - 40, 5885328);
		if (s.mission.tutorial) {
			if (id === "march") s.tutorial = "Keep marching. The sun-disk shrine is ahead.";
			else s.tutorial = "MARCH is TAK TAK TAK BOOM. Drive them to the shrine.";
		}
	}
	applyFail(reason) {
		const s = this.s;
		s.clearAction();
		s.charged = false;
		s.nextTick = 0;
		this.fx.floatText(s.armyX + 80, s.groundY - 170, reason === "unknown" ? "UNKNOWN BEAT" : "MISSED BEAT", "#ff8a6b");
		s.addTrauma(.22);
		if (s.mission.tutorial) s.tutorial = "Four drums in a row. TAK TAK TAK BOOM to MARCH.";
	}
	onBeat(slot, phase, beat) {
		const s = this.s;
		this.backdrop.pulseSun();
		if (s.action && ACTION[s.action.id].walk) {
			const n = s.action.id === "charge" ? 3 : 2;
			for (const u of s.units) if (u.alive) this.fx.puff(u.sprite.x - 20, s.groundY + u.formY + 4, n);
		}
		if (phase === "response" && slot === 4) this.enemies.maybeTelegraph(beat);
		if (phase === "response" && slot === 5) {
			this.enemies.swing();
			this.enemies.maybeSlam();
		}
		if (s.mission.tutorial && s.engine.combo === 0 && beat === 8) s.tutorial = "Try MARCH: TAK TAK TAK BOOM on the four white beats.";
	}
	relayout(w, h) {
		this.s.resize(w, h);
		this.backdrop.relayout();
		this.fx.resize(w, h);
		this.rig.setBounds();
	}
	checkEnd() {
		const s = this.s;
		if (s.ended) return;
		const banner = s.units.find((u) => u.cls === "banner");
		const verdict = evaluateEnd({
			unitsAlive: s.units.filter((u) => u.alive).length,
			hasBanner: banner !== void 0,
			bannerAlive: banner?.alive ?? false,
			tutorial: Boolean(s.mission.tutorial),
			armyX: s.armyX,
			goalX: s.mission.goalX,
			wavesTotal: s.mission.waves.length,
			wavesSpawned: s.spawnedWaves.size,
			enemiesSpawned: s.enemies.length,
			enemiesAlive: s.enemies.filter((e) => e.alive).length
		});
		if (verdict) this.finish(verdict.win, verdict.cause);
	}
	finish(win, cause) {
		const s = this.s;
		s.ended = true;
		const result = {
			win,
			missionId: s.mission.id,
			missionName: s.mission.name,
			commands: s.engine.commandCount,
			fails: s.engine.failCount,
			bestCombo: s.engine.bestCombo,
			feverReached: s.feverReached,
			cause,
			rewards: win ? rollBattleLoot(s.mission.id, s.killedEnemies) : void 0
		};
		this.time.delayedCall(700, () => bus.emit("battle-end", result));
	}
	emitHud() {
		const s = this.s;
		const e = s.engine;
		const banner = s.units.find((u) => u.cls === "banner");
		const boss = liveBoss(s);
		const cmd = s.action ? COMMANDS.find((c) => c.id === s.action.id) : null;
		bus.emit("hud", buildHud({
			combo: e.combo,
			fever: e.fever,
			beatPos: e.beatPosition(audio.now()),
			commandName: cmd?.name ?? null,
			lastGrade: s.lastGrade,
			armyHp: s.units.reduce((sum, u) => sum + Math.max(0, u.hp), 0),
			armyMax: s.units.reduce((sum, u) => sum + u.maxHp, 0),
			banner: banner ? {
				hp: banner.hp,
				maxHp: banner.maxHp
			} : null,
			boss: boss ? {
				name: ENEMY_STATS.howl.name,
				hp: boss.hp,
				maxHp: boss.maxHp
			} : null,
			tutorial: s.tutorial,
			telegraph: s.telegraph?.kind ?? null
		}));
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
