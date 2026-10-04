# Changelog

All notable changes, version milestones, and feature updates for **Rhythm Army** will be documented in this file.

---

## [0.00025] - 2026-10-03

### Fixed
- **Obstacle & Barricade Collision and Attack Sticking**:
  - Fixed army advance stopping distance calculation in `BattleScene.ts` and `army.ts` so the front rank closes to within true melee strike distance (~20px) of barricades and enemies, preventing units from getting stuck out of attack range.
  - Re-tightened `FORMATION` coordinates across all classes so rear and midline ranged squads (Spearkin, Bowkin, Magekin, Warhornkin) stay well within firing range while frontline tanks (Aegiskin, Dekakin, Mechakin) engage obstacles directly.
  - Adjusted `nearestAhead` in `rules.ts` to allow melee and close-quarter attacks to register seamlessly against static fortifications.
  - Registered procedural animation for `robokin-idle` in `PreloadScene.ts`.

---

## [0.00024] - 2026-10-03

### Changed
- **Obstacle & Barricade Collision Stopping**:
  - Implemented physical collision clamping in `BattleScene.ts`, `army.ts`, and `rules.ts` so the army's march and individual unit attack rushes are physically stopped by barricades, stone wall ramparts, watchtowers, catapult towers, and frontline enemies instead of passing through them.
  - Defined explicit collision bounding radii (`ENEMY_COLLISION_RADIUS`) for all enemy and obstacle archetypes.
- **Authentic Attack Styles, Animations & Ranges**:
  - **Bludgeonkin (Dekapon)**: Giant overhead club ground smash delivering an area shockwave, ground ring, heavy damage, stun, and massive knockback.
  - **Horsekin (Kibapon)**: Fast cavalry sprint, forward lance lunge with high knockback shove that pushes enemies back.
  - **Mechakin (Robopon)**: Rapid mechanical gauntlet combo with 2.5x structure damage bonus against barricades, walls, and towers.
  - **Magekin (Mahopon)**: Mystic staff channel summoning celestial/arcane lightning meteor strikes descending directly onto targets.
  - **Warhornkin (Megapon)**: Piercing resonant sonic soundwaves that pierce through enemy ranks.
  - **Wingkin (Toripon)**: High-altitude aerial flight with downward dive javelin throws.
  - **Spearkin (Yaripon)**: High leap jump-throws with arched ballistic spear trajectories.
  - **Bowkin (Yumipon)**: High arcing arrow volleys with 3-arrow spread in Fever mode.
  - **Aegiskin (Tatepon)**: Frontline sword slashes and shield blocking wall.

---

## [0.00023] - 2026-10-03

### Changed
- **Faithful Unit & Enemy Visual Scaling**:
  - Aligned all friendly kin unit proportions with authentic Patapon dimensions: Dekakin (giant heavyweight ~116px), Kibakin (mounted cavalry ~104px), Bannerkin (standard with battle banner ~92px), Wingkin (aerial sky lancer ~86px), and standard infantry kin (Aegiskin, Spearkin, Bowkin, Magekin, Warhornkin, Mechakin ~80px).
  - Scaled enemy units, wildlife, fortifications, and bosses: Colossus Golem (2.8x / ~224px), Pyro Drake Titan (2.5x / ~200px), Iron Howl (2.1x / ~168px), Catapult Towers (1.95x / ~156px), Archer Watchtowers (1.75x / ~140px), Stone Gate Ramparts (1.5x / ~120px), Wood Palisades (1.25x / ~100px), Tuskbrutes (1.35x), Golden Antler Stags (1.15x), and Ironback Scuttlers (1.05x).
  - Adjusted dynamic health bar widths and vertical offsets across all unit categories.
- **Patapon Campaign Stage Lengths & Layouts**:
  - Expanded and tuned campaign mission world lengths (2600px - 6800px) and wave spawn coordinates across all 8 Patapon 2 campaign missions to reflect authentic march pacing, obstacle encounters, and boss arenas.

---

## [0.00022] - 2026-10-03

### Changed
- **Dynamic Combat Attacks Based on Live Unit Position**:
  - Refactored attack resolution so melee strikes, leaping javelins, arrow volleys, and magic bolts trigger directly during the rhythm response beats (`beats 4-5`) from each unit's exact live position in the world.
  - Non-banner units dynamically rush forward toward the enemy line to close distance up to their weapon engagement range, and then strike from their active positions.
  - Aligned unit sizes (e.g. Dekakin giant scaling, Kibakin mounted frame), speeds, and combat ranges with authentic Patapon 1 & 2 mechanics.
- **Flight & Altitude Mechanics**: Wingkin (`tori`) hover smoothly above the ground plane with diving javelin animations.

---

## [0.00021] - 2026-10-03

### Added
- **Project Changelog**: Created `CHANGELOG.md` to track version history, feature milestones, bug fixes, and development progress across all game releases.

---

## [0.00020] - 2026-10-03

### Added
- **Mechakin (`robo`) Unit Class**: Introduced the mechanical gauntlet powerhouse unit class (Robopon archetype) with unique equipment progression (`arm-wood`, `arm-iron`, `arm-crusher`, `arm-divine`), high stagger resistance, and heavy structure demolish bonuses.
- **Dedicated Camp Inventory Modal**: Added `InventoryModal.tsx` accessible directly from the campaign camp header, displaying stockpiled materials, food, weapons, shields, and helmets with rarity badges and category filtering.
- **Dynamic Combat Rush Movement**: Frontline and ranged units (excluding Bannerkin) now actively rush forward toward enemy lines during `PON PON PATA PON` (Attack) commands and smoothly return to formation.
- **Spearkin Jump-Throw Ballistics & Miss Physics**: Spearkin units perform leaping javelin throws with realistic ballistic arc calculations that collide with terrain and kick up dust on misses.
- **8 Patapon 2-Style Campaign Missions**:
  - `coast-hunt` ("1. Hunting on the Coral Coast")
  - `shadowmask-clash` ("2. The Masked Clan in the Jungle")
  - `drake-caldera` ("3. Volcanic Drake of the Caldera")
  - `swamp-hunt` ("4. Wild Game in the Misty Swamps")
  - `jungle-gate` ("5. Breaking the Jungle Fort Gate")
  - `bastion-siege` ("6. Siege of the Iron Bastion")
  - `iron-ridge` ("7. Iron Howl the Mountain Behemoth")
  - `golem-altar` ("8. Awakening of the Ruin Colossus")

### Changed
- Replaced the redundant equipment shortcut button on the campaign camp header with the new Camp Inventory & Materials manager.
- Updated Spearkin weapon engagement range to 380px.

---

## [0.00019] - 2026-10-03

### Added
- **Stage Completion & Fleeing AI Fixes**: Hunting beasts that flee beyond the stage edge safely despawn without blocking level completion, and stages instantly award victory upon crossing the finish line.
- **8-Stage Campaign Progression**: Structured initial campaign missions mirroring classic rhythm-strategy progression.

### Changed
- Streamlined win/loss conditions in `rules.ts` to ensure consistent triggers for combat and hunt levels.

---

## [0.00018] - 2026-10-03

### Added
- **Original Enemy Ecosystem**:
  - *Wildlife*: Kooda runners, Golden Antler stags, Ironback sand crabs.
  - *Fortifications*: Wood palisades, stone gate ramparts, archer watchtowers, ballista catapult towers.
  - *Rival Clan Squads*: Redmask spearmen, bulwarks, archers, riders, crushers, and skystrikers.
  - *Colossal Bosses*: Pyro Drake Volcan and Ruin Golem Colossus with multi-phase attack telegraphs (`INFERNO — JUMP`, `QUAKE — JUMP`, `SLAM — JUMP`).
- **Enemy Ranged Projectiles**: Fortifications and enemy backlines dynamically launch retaliatory arrows and javelins targeting the player army.

---

## [0.00017] - 2026-10-03

### Added
- **Authentic Combat Stats & Formulas**: Implemented accurate stat formulas, damage mitigation during Shield Wall (`CHAKA CHAKA PATA PON`), knockback thresholds, and multi-shot volleys (3-arrow volleys for Bowkin during Fever/Charge).
- **Aegiskin Dual Armaments**: Enforced sword in weapon slot and shield in shield slot for Aegiskin.

---

## [0.00016] - 2026-10-03

### Added
- **Expanded Squad Capacities**: Scaled squad limits to 6 units for core divisions (Spearkin, Aegiskin, Bowkin) and 3 units for specialist classes (Horsekin, Bludgeonkin, Warhornkin, Wingkin, Magekin).
- **Multi-Unit Formation Layouts**: Formations dynamically space and animate squads up to 6 units wide without overlap.

---

## [0.00015] - 2026-10-03

### Changed
- **Original Trademark-Safe Naming**: Fully renamed all 9 unit classes, materials, and equipment items to original tribal names (Bannerkin, Spearkin, Aegiskin, Bowkin, Horsekin, Bludgeonkin, Warhornkin, Wingkin, Magekin).
- Replaced raw material names with original lore-friendly materials (Tough Jerky, Birch Timber, Quarry Stone, Slag Alloy, Sun Cabbage, etc.).

---

## [0.00014] - 2026-10-03

### Added
- **9 Unit Classes**: Implemented full roster of unit archetypes including banner bearers, spear throwers, shield guards, storm archers, cavalry riders, heavy smashers, sonic warhorns, sky lancers, and mystic mages.
- **Dual Gear & Full Weapon Categories**: Added comprehensive gear lines for Swords, Shields, Spears, Bows, Clubs, Horns, and Staves.

---

## [0.00013] - 2026-10-03

### Changed
- **Cleaned Equipment UI**: Removed duplicate top action strip in the equipment modal to streamline unit customization.

---

## [0.00012] - 2026-10-03

### Added
- **Auto-Optimize Gear**: One-click optimization algorithm calculating gear score across damage, defense, and range to automatically equip the best weapons and armor across an entire unit class.
- **Integrated Unit Recruitment**: Added in-place squad recruitment tab within the unit management modal.

---

## [0.00011] - 2026-10-03

### Changed
- **Consistent 120 BPM Tempo**: Standardized rhythm tempo to a steady 120 BPM across all campaign stages for reliable drum command execution.

---

## [0.00010] - 2026-10-03

### Added
- **Epic Equipment Tier**: Introduced Thunder Lance (`spear-storm`), Cyclone Warbow (`bow-cyclone`), and Aegis Bastion (`shield-aegis-core`).
- **Extended Campaign Missions**: Added higher difficulty levels with multi-wave boss encounters.

---

## [0.00009] - 2026-10-03

### Added
- **Barracks & Unit Crafting**: Added unit creation system requiring gathered meats, wood, stone, and iron.
- **Battle Formation Order in Hub**: Arranged army cards from rear to frontline (Bannerkin ➔ Bowkin ➔ Spearkin ➔ Aegiskin).

---

## [0.00008] - 2026-10-03

### Fixed
- Fixed Equipment modal flashing and auto-closing bug when selecting slots.
- Rebalanced enemy mob drop tables to limit drops to at most 1 item per enemy kill.

---

## [0.00001 - 0.00007] - Initial Releases

### Added
- Core 4-beat rhythm drum engine (PATA, PON, CHAKA, DON) with beat window quantization and audio synthesis.
- Drum combo progression and FEVER mode triggers.
- Basic army march, attack, and defend commands.
- Canvas sprite rendering and battle scene management.
- Campaign progression and save system.
