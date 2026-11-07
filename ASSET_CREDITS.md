# Third-Party Asset Credits

Fantasma uses free-to-use community assets. This file credits every external
asset imported into the tree, per the asset authors' licensing wishes. When you
import a new asset, add a line here in the same commit.

## Source: Team Aqua's Asset Repo
A community library of free-to-use Gen-3 decomp assets.
<https://github.com/TeamAquasHideout/Team-Aquas-Asset-Repo>

License posture: assets are free to use and edit by default; a few are marked
"not free to edit" in their folder README and we respect that. Credit to the
original creator is required for every asset used.

### Battle backgrounds
Every battle background in the game is an original Fantasma painting, made with
Gemini at the owner's direction (owner attestation 2026-10-22; 70 board folders).
No community battle-background art ships, so none is credited (DEC-620). The
source ledger is `tools/qa/battle_environment_gemini_sources.json`; live
map-to-board routing is `tools/qa/battle_environment_master.json`.

### Character sprites (in use)
- **spilledpizza** — DP_Scientist overworld sprite, the shared base for the
  Kanto color-coat lab aides (`graphics/object_events/pics/people/kanto_lab_aide/`).
- **hyo** (Steven and Wally overworld redraws), via the GBA Sprites Pack. Regeneration: `dev_scripts/fantasma_pack_sprites/`.

### Hoenn overworld tiles (in use)
- **Game Freak / Nintendo** — Pokémon Diamond/Pearl/Platinum long grass,
  via **Bulbapedia**; source archived in
  `story/drafts/assets/town_art_2026_10_13/grass_v2/source_DPPt_Long_Grass.png`.
  Fantasma maps its shading to moonlit greens, joins and varies its blades,
  and bakes the original tips/roots into ragged cell borders. Reproduction:
  `tools/fantasma/town_art/grass_v2.py`. It replaced the earlier Minish Quest
  grass, none of which ships any more.
- **Roger Wrightshoe (aka Gray Ninja)** — plain ground art from
  `Tilesets/Other Tilesets/Roger Wrightshoe/greenery.png` in **Team Aqua's Asset
  Repo**. Fantasma quantizes and recolors the ground for its moonlit palette.
  Unbound's park was a ground color reference;
  its pixels are not imported. Source credit request: the folder's `README.md`.
- **LeoB (leob0505)** — ORAS-style Hoenn General terrain, Petalburg town
  tiles and matching door animations, from **Team Aqua's Asset Repo**, folder
  `Tilesets/The Great Tileset Exchange/Full Tilesets/LeoB ORAS/`.
  Inspired by **TheDeadHeroAlistair** and **Pokemon Omega Ruby/Alpha Sapphire**,
  as credited in the author's `credits.md`. Fantasma preserves gameplay
  attributes and merges its custom town dressing and legacy-town palettes.

## Source: Platinum OW/Trainer Sprite Pack (SPRITEPACK-PLATINUM)
A pokeemerald-format D/P (Sinnoh) trainer and overworld sprite pack by
**spilledpizza**, with **TheWiggliestJiggliest**, **RichardPT**, **robloxmaster376**,
**The Spriters Resource** and the **Radiant Quartz / Prismatic Platinum team**
([PokéCommunity thread](https://www.pokecommunity.com/threads/platinum-ow-trainer-sprite-pack-for-pokeemerald-pokefirered.537257/)).
License: "use as you please, but credit all those below". Used as the base art for the
recast Hoenn gym leaders (e.g. Regina from Cynthia, Bruno from Crasher Wake,
Fortuna from Fantina, Lucia from Maylene, Spettro from Volkner), the Kanto cast and the HQ crew. Local copy: the owner's private archive.

## Source: FRLG Accurate NPC Megapack (Relic Castle Edition)
Compiled by **SoulfulLex**, who asks that the original spriters be credited.
- **Kalarie** — the Anime Butch overworld, used for the Rocket Admin
  (`graphics/object_events/pics/people/rocket_admin.png`).

## Source: Unbound-style start menu
The 23 current START/Tools replacement icons are **Fantasma originals, painted
with Gemini at the owner's direction**. Approved source JPEGs are retained in
`story/drafts/assets/start_menu_icons_2026_10_17/raw/`; sampled to a shared
16-colour GBA palette. **miriamlefae** and the USM branch
authors (framework) are credited; see root `CREDITS.md`.

## Lorenzo's Ledger statues

The five League trophies (Aggron, Goodra, Duraludon, Zoroark and Kingambit)
are Fantasma originals painted with Gemini at the owner's direction.
Sources and the approved sampled previews are retained in
`story/drafts/assets/trainer_card_2026_10_17/gemini_statues/`.
The card conversion uses the existing HQ trophy stone palette; Kingambit's
plinth retains its tarnished gold band.

The five Ledger page paintings (gym cabinet, League altar, god reliquary,
sealed page and ledger front) and the replacement front-view Fantasma Zone
battle painting are also owner-commissioned Gemini art, received 2026-10-17.
Original JPEGs are retained under `story/drafts/assets/trainer_card_2026_10_17/gemini_pages/`
and `story/drafts/assets/battle_fixes_2026_10_17/gemini/`. The Fantasma Zone painting
was replaced by the batch 7 repaint on 2026-10-22 (see the battle board batches below).

## Credits-roll backgrounds

Sky Pillar's tower-interior battle board is owner-commissioned Gemini art. The
2026-10-17 ruined-tower painting was replaced by the batch 7 repaint on 2026-10-22
(8.92); the source is now
`graphics/fantasma_sources/battle_environment/sky_pillar.png` (owner delivery:
`sky_pillar.png` (owner's private archive)).
`dev_scripts/generate_sky_pillar_battle_environment.py` uses the existing painted
board pipeline, raises the painting two tiles, reduces the pale floor highlights
one RGB555 step and writes identical day/night boards. No third-party art was reused.

The five paintings behind the end-credits text (`graphics/credits/scenes/`)
are Gemini-generated source art commissioned by the owner on 2026-10-13 from
the prompts in `CREDITS_BACKGROUND_GEMINI_PROMPTS.txt` (owner's private archive). The
originals are kept in `graphics/credits/scenes/source/`;
`tools/fantasma/credits_scene_convert.py` reduces each to 4bpp tiles with eight
BG palettes. Not attributed to a third party.

The Hall of Fame backdrop (`graphics/hall_of_fame/scene/`, source in its
`source/` folder) is owner-commissioned Gemini art from 2026-10-14
(`HALL_OF_FAME_GEMINI_PROMPT.txt` (owner's private archive)), converted with the same tool.

Five battle boards (ship_deck, laboratory, hoenn_laboratory, kanto_gym,
spectrum_hall) were repainted 2026-10-14 from owner-commissioned Gemini art
(`BATTLE_BACKGROUND_GEMINI_PROMPTS.txt` (owner's private archive)); sources are in
`graphics/fantasma_sources/gemini_boards_2026_10_14/` and they are converted
with `tools/fantasma/bg_convert_multi.py` (two 15-color banks).
A second batch on the same day repainted the most-seen boards (tall_grass,
cave, water, rock, hoenn_gym) from
`BATTLE_BACKGROUND_GEMINI_PROMPTS_BATCH2.txt` (owner's private archive); boards with an
intro entry layer convert with `--keep-entry`, which recolors bank 4 from the
new art. The rest of batch 2 (long_grass, building, sand, plain, pond_water)
followed the same day. The owner ruled the paintings moody enough to need no
night versions, so tall_grass_night and sand_night are copies of the day
boards. The Pokéblock feeding screen used to borrow the building board's
tiles; it now keeps its own frozen copy (`graphics/pokeblock/feeding_bg_tiles.png`).
Batch 3 (kanto_enforcer, rocket_hideout, stadium, pyre_hall, ghost_tower)
came from `BATTLE_BACKGROUND_GEMINI_PROMPTS_BATCH3.txt` (owner's private archive). The
stadium is one neutral painting; `tools/fantasma/stadium_tints.py` writes the
Magma, Aqua, Sidney, Phoebe, Glacia and Drake palettes from it.
`battle_frontier.pal` is left alone because the Pokéblock feeding screen still
loads it, and `wallace.pal` is unused.
Batch 4 (power_plant, ruined_mansion, fantasma_hq, groudon_cave, kyogre_sea)
came from `BATTLE_BACKGROUND_GEMINI_PROMPTS_BATCH4.txt` (owner's private archive).
Batch 5 (underwater, fire_vein, maris_court, regi_tomb, nonna_house) came
from `BATTLE_BACKGROUND_GEMINI_PROMPTS_BATCH5.txt` (owner's private archive).
Batch 6 (sanctum, snow, still_ice, depths, sky) came from
`BATTLE_BACKGROUND_GEMINI_PROMPTS_BATCH6.txt` (owner's private archive).
Redo pass (kanto_enforcer, rocket_hideout, maris_court, underwater,
nonna_house) came from `BATTLE_BACKGROUND_GEMINI_PROMPTS_REDO.txt` (owner's private archive).
2026-10-15 restyle: every remaining off-style board was repainted in the
violet-teal look (prompts given in chat; sources in
`graphics/fantasma_sources/gemini_boards_2026_10_14/`), and 17 new location
boards were added: sogno, seafloor_cavern, meteor_falls, ship_interior,
silph_co, safari_zone, trick_house, victory_road, granite_cave, forest, mt_moon,
rock_tunnel, seafoam_islands, cave_of_origin, shoal_cave, altering_cave and
mirage_tower. All are owner-commissioned Gemini paintings.
Batch 7 (2026-10-22, released in 8.92) repainted the three boards that still broke
the violet-teal look: kyogre_sea (a drowned sea-god temple), fantasma_zone and
fantasma_zone_night (the seized Safari preserve) and sky_pillar and
sky_pillar_night (the tower interior), from
`BATTLE_BACKGROUND_GEMINI_PROMPTS_BATCH7.txt` (owner's private archive). Sources are
`graphics/fantasma_sources/battle_environment/kyogre_sea.png`,
`fantasma_zone_front.png` and `sky_pillar.png`; each board is written by its
`dev_scripts/generate_*_battle_environment.py` generator. The Kyogre generator
applies the owner's pick of contrast 1.25, brightness 1.08 and saturation 1.5 so
the carving's red lines survive the 16-colour reduction. All three are
owner-commissioned Gemini paintings; no third-party art was reused.

## Music

Custom Fantasma music and sound (`sound/songs/midi/mus_fantasma_motif`, `sound/songs/midi/se_fantasma_boot_bell`) is original to this project: the owner confirms (2026-10-16) it was authored by Codex for Fantasma, with no third-party source. All other music is the original Pokémon Emerald soundtrack (Game Freak / Nintendo) carried by pokeemerald-expansion.
