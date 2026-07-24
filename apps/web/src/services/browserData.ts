/**
 * browserData.ts
 *
 * Imports all player JSON files as static ES modules.
 * Vite bundles these at build time — no filesystem access needed in the browser.
 */

import type { PlayerData } from "@cricket-clash/data";

import indiaRaw       from "@cricket-clash/data/players/india.json";
import australiaRaw   from "@cricket-clash/data/players/australia.json";
import englandRaw     from "@cricket-clash/data/players/england.json";
import bangladeshRaw  from "@cricket-clash/data/players/bangladesh.json";
import afghansitanRaw from "@cricket-clash/data/players/afghanistan.json";
import irelandRaw     from "@cricket-clash/data/players/ireland.json";

// Country files are statically imported so Vite includes their players in the browser bundle.
import southAfricaRaw from "@cricket-clash/data/players/south-africa.json";
import newZealandRaw  from "@cricket-clash/data/players/new-zealand.json";
import pakistanRaw    from "@cricket-clash/data/players/pakistan.json";
import sriLankaRaw    from "@cricket-clash/data/players/sri-lanka.json";
import westIndiesRaw  from "@cricket-clash/data/players/west-indies.json";
import zimbabweRaw    from "@cricket-clash/data/players/zimbabwe.json";

type CountryFile = { players: PlayerData[] };

export const ALL_PLAYER_DATA: ReadonlyArray<PlayerData> = [
  ...(indiaRaw        as CountryFile).players,
  ...(australiaRaw    as CountryFile).players,
  ...(englandRaw      as CountryFile).players,
  ...(bangladeshRaw   as CountryFile).players,
  ...(afghansitanRaw  as CountryFile).players,
  ...(irelandRaw      as CountryFile).players,
  ...(southAfricaRaw  as CountryFile).players,
  ...(newZealandRaw   as CountryFile).players,
  ...(pakistanRaw     as CountryFile).players,
  ...(sriLankaRaw     as CountryFile).players,
  ...(westIndiesRaw   as CountryFile).players,
  ...(zimbabweRaw     as CountryFile).players,
];
