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

// Add South Africa, NZ, Pakistan from our hand-crafted files if available
import southAfricaRaw from "@cricket-clash/data/players/south-africa.json";
import newZealandRaw  from "@cricket-clash/data/players/new-zealand.json";

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
];
