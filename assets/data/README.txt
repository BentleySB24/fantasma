The public GitHub release is labeled rc Grass build 11.57 (23 November 2026). This data folder was built from the 11.37 source, as described below; the public patch uses CRC32 5CA9429D.

Fantasma rc Grass 11.37: data for the website
=============================================

Built on 2026-11-22 from the 11.37 source (commit d5a878794c), the same source the
"Fantasma 11.37 Part I PUBLIC" ROM was built from. This is the full set for 11.37; the changes
since rc Water 11.12 are listed in CHANGES.txt and in changes_11.12_to_11.37 (CSV and JSON). Each set comes as CSV and as JSON with the
same rows (the JSON keeps lists as lists).

Scope: Part I, which is Hoenn. Kanto and the Sevii Islands (Part II) are left out on purpose.

Checked against the 11.37 Part I ROM file itself: all 1,576 species rows (six base stats, both types,
three ability slots) match the bytes in the ROM, and all 684 Hoenn encounter tables match
src/data/wild_encounters.json.


1. wild_encounters  (3,305 rows, 119 areas)
-------------------------------------------
One row per area, method, time of day and species.

  area                 name as the in-game Dex shows it
  map, table           source names, for joining or debugging
  method               grass (walking, including cave floors), surf, old_rod, good_rod, super_rod,
                       rock_smash, dexnav_hidden (only found with the DexNav)
  time_of_day          morning/day/evening, night, or any (the day and night tables are the same)
  species, species_key name and source constant
  min_level, max_level levels in the table (see the note on the level cap below)
  chance_percent       share of that method's encounters in that area; each table adds up to 100
  area_encounter_rate  the table's raw rate number (higher means more encounters per step);
                       it is not a percent
  access               ordinary / optional or secret area / DexNav hidden only
  hidden_until_found   true where the in-game Dex hides the place until the player finds it
  note                 Altering Cave only: which set the table belongs to

Level cap: the game lowers wild levels so they stay 2 under the player's current level cap
(3 under in the Safari Zone). The numbers here are the table's own levels, the most a fully
progressed player sees.

Not included: the Battle Pyramid and Battle Pike tables (the Battle Frontier is closed) and the
separate tables of the Remix mode.


2. don_dex  (1,576 rows)
------------------------
One row per species or form, in National Dex order; forms follow their base species.

  dex_number, species_id, species_key, name
  type_1, type_2
  hp, attack, defense, sp_attack, sp_defense, speed, base_stat_total
  ability_1, ability_2, hidden_ability
  sigils               Sigils that carry one of this species' abilities and can be obtained in
                       Part I. In the JSON each has found_at (places) and
                       found_at_hidden_until_discovered (places the in-game Dex hides until found,
                       the Golden Grave among them).
  evolves_from, evolves_to   with the method in plain words. Trade evolutions also work with a
                       Linking Cord. Evolutions tied to a real-world region the game never uses
                       (Alola and so on) are left out.
  obtainable_in_part_1 true for 720 rows: the species has a source in Hoenn
  where_to_find        the Hoenn sources the in-game Dex lists: wild areas with method and time,
                       gifts, trades, special encounters, and "Evolve X"
  where_to_find_secret sources the in-game Dex hides until discovered (CSV only; in the JSON each
                       source has a "secret" flag)

Gods (the legendary boss fights) have no source: they are fought and reaved, never caught.
A few species are listed only in Altering Cave "Mystery Gift" sets; the text says so.


3. gifts_statics_trades  (41 rows)
----------------------------------
  kind       gift, gift egg, fossil revival, trade, special fishing, static encounter (can be
             caught), static battle (cannot be caught), god battle (cannot be caught)
  species, species_key, level, location, map
  catchable, reachable, hidden_until_found, note, source (file and line in the 11.37 source)

Spoilers: the god battles and the "hidden_until_found" rows are late-game or secret content.
SUDOWOODO at the Battle Frontier is in the source but cannot be reached, because the Frontier is
closed in this release (reachable = false).
