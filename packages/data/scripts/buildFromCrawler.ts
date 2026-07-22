/**
 * buildFromCrawler.ts
 *
 * Converts ESPN Cricinfo crawled player data → @cricket-clash/data JSON format.
 *
 * Usage (from packages/data):
 *   pnpm build:players
 *   pnpm build:players -- --source C:\GIT\cricket-crawler\PlayerData
 *
 * Algorithm:
 *   1. Scan all player folders in the source directory
 *   2. Read player.json (basic info) + careerAverages.json (stats)
 *   3. Use T20I stats (cl=3) as primary; All T20 (cl=6) as fallback
 *   4. Compute DNA ratings from real statistics
 *   5. Filter players with insufficient T20 data
 *   6. Group by country → output to src/players/<country>.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ─────────────────────────────────────────────────────────────────────

const SOURCE_DIR =
  process.argv.includes("--source")
    ? process.argv[process.argv.indexOf("--source") + 1]
    : "C:\\GIT\\cricket-crawler\\PlayerData";

const OUTPUT_DIR = join(__dirname, "../src/players");
const VERSION    = new Date().toISOString().slice(0, 7);

const MIN_BATTING_INNINGS = 10;
const MIN_BOWLING_WICKETS = 10;

const SUPPORTED_COUNTRIES: Record<string, string> = {
  "India": "India", "Australia": "Australia", "England": "England",
  "Pakistan": "Pakistan", "South Africa": "South Africa",
  "New Zealand": "New Zealand", "West Indies": "West Indies",
  "Sri Lanka": "Sri Lanka", "Bangladesh": "Bangladesh",
  "Afghanistan": "Afghanistan", "Ireland": "Ireland",
  "Zimbabwe": "Zimbabwe", "Netherlands": "Netherlands", "Namibia": "Namibia", "Nepal": "Nepal",
};

const FOLDER_TO_COUNTRY: Record<string, string> = {
  "India": "India", "Australia": "Australia", "England": "England",
  "Pakistan": "Pakistan", "South-Africa": "South Africa",
  "New-Zealand": "New Zealand", "West-Indies": "West Indies",
  "Sri-Lanka": "Sri Lanka", "Bangladesh": "Bangladesh",
  "Afghanistan": "Afghanistan", "Ireland": "Ireland",
  "Zimbabwe": "Zimbabwe", "Netherlands": "Netherlands",
  "Germany": "Afghanistan",  // known misfiled Afghan player
};

const COUNTRY_TO_FILE: Record<string, string> = {
  "India": "india", "Australia": "australia", "England": "england",
  "Pakistan": "pakistan", "South Africa": "south-africa",
  "New Zealand": "new-zealand", "West Indies": "west-indies",
  "Sri Lanka": "sri-lanka", "Bangladesh": "bangladesh",
  "Afghanistan": "afghanistan", "Ireland": "ireland",
  "Zimbabwe": "zimbabwe",
};

// ── Raw data types ─────────────────────────────────────────────────────────────

interface RawPlayer {
  objectId:     number;
  longName:     string;
  dateOfBirth?: { year: number; month: number; date: number };
  battingStyles:  string[];
  bowlingStyles:  string[];
  playingRoles:   string[];
  country:        { name: string };
}

interface RawStat {
  type: "BATTING" | "BOWLING";
  cl:   number;
  mt:   number;
  in:   number;
  rn:   number;
  bl?:  number | null;
  avg:  number | string;
  sr:   number | string;
  no?:  number;
  fo?:  number;
  si?:  number;
  hs?:  string;
  hn?:  number;
  ft?:  number;
  wk?:  number;
  bwe?: number;
  bwsr?: number;
  bbi?: string;
  fwk?: number;
}

interface Stat {
  type:      "BATTING" | "BOWLING";
  matches:   number;
  innings:   number;
  runs:      number;
  avg:       number | null;
  sr:        number | null;
  fours?:    number;
  sixes?:    number;
  wickets?:  number;
  economy?:  number;
  bowlingSR?: number;
}

interface OutputPlayer {
  id: string; name: string; country: string; role: string;
  handedness: string; battingStyle: string; bowlingStyle: string | null;
  archetype: string; dna: Record<string, number>; meta: Record<string, unknown>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const r     = (v: number) => Math.round(v);
const num   = (v: number | string | undefined | null): number | null => {
  if (v == null || v === "-" || v === "") return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? null : n;
};

function extractStat(stats: RawStat[], type: "BATTING" | "BOWLING", cl: number): Stat | null {
  const s = stats.find((x) => x.type === type && x.cl === cl);
  if (!s) return null;
  return type === "BATTING"
    ? { type, matches: s.mt, innings: s.in, runs: s.rn, avg: num(s.avg), sr: num(s.sr), fours: s.fo, sixes: s.si }
    : { type, matches: s.mt, innings: s.in, runs: s.rn, avg: num(s.avg), sr: num(s.sr), wickets: s.wk, economy: num(s.bwe), bowlingSR: num(s.bwsr ?? s.sr) };
}

function mapBowlingStyle(code: string): string | null {
  const map: Record<string, string> = {
    rf:"Right Arm Fast", rfm:"Right Arm Fast", rm:"Right Arm Medium", rmf:"Right Arm Medium",
    ob:"Right Arm Off Spin", lb:"Right Arm Leg Spin", lbg:"Right Arm Leg Spin",
    lf:"Left Arm Fast", lfm:"Left Arm Fast", lm:"Left Arm Medium",
    sla:"Left Arm Orthodox", lob:"Left Arm Orthodox",
    ls:"Left Arm Wrist Spin", lcb:"Left Arm Wrist Spin", lws:"Left Arm Wrist Spin",
  };
  return map[code.toLowerCase().trim()] ?? null;
}

function mapRole(roles: string[]): "BATTER" | "WICKET_KEEPER" | "ALL_ROUNDER" | "BOWLER" {
  const s = roles.join(" ").toLowerCase();
  if (s.includes("wicket") || s.includes("keeper")) return "WICKET_KEEPER";
  if (s.includes("all-rounder") || s.includes("allrounder")) return "ALL_ROUNDER";
  if (s.includes("bowler")) return "BOWLER";
  return "BATTER";
}

// ── DNA formulas ───────────────────────────────────────────────────────────────

/**
 * Batting rating from T20 strike rate + average.
 *
 * Real T20I calibration:
 *   Virat Kohli: SR 137, avg 49 → should be ~92-95
 *   Rohit Sharma: SR 140, avg 32 → should be ~86-89
 *   Bumrah batting: SR 86, avg 6 → should be ~15-20
 */
function battingRating(b: Stat): number {
  if (!b.sr || !b.avg || b.innings < 3) return 15;
  // SR: 95→30, 120→55, 145→80, 165→95
  const srScore  = clamp(30 + ((b.sr  - 95)  / 75)  * 70, 15, 97);
  // Avg: 12→25, 30→60, 50→85, 65→95
  const avgScore = clamp(25 + ((b.avg - 12)  / 55)  * 75, 15, 97);
  const base     = srScore * 0.60 + avgScore * 0.40;
  const conf     = clamp(b.innings / 60, 0.15, 1.0);
  return r(clamp(50 + (base - 50) * conf, 10, 99));
}

/**
 * Bowling rating from T20 economy + bowling strike rate.
 *
 * Bumrah: eco 6.4, SR 14.7 → should be ~93-96
 * Average spinner: eco 7.8, SR 22 → should be ~72-78
 */
function bowlingRating(b: Stat): number {
  if (!b.economy || !b.wickets || b.wickets < 3) return 12;
  // Economy: 5.5→96, 7.0→75, 8.5→50, 10.5→20
  const ecoScore = clamp(96 - ((b.economy - 5.5) / 5.5) * 78, 15, 97);
  // Bowling SR (balls/wkt): 13→95, 20→70, 30→45, 42→20
  const bsr = b.bowlingSR ?? 30;
  const srScore  = clamp(95 - ((bsr - 13) / 32) * 80, 15, 97);
  const base     = ecoScore * 0.55 + srScore * 0.45;
  const conf     = clamp((b.wickets) / 50, 0.15, 1.0);
  return r(clamp(50 + (base - 50) * conf, 10, 99));
}

function powerHitting(b: Stat): number | undefined {
  if (b.innings < 5 || !b.sr) return undefined;
  const sixRate = (b.sixes ?? 0) / Math.max(b.innings, 1);
  // 0 sixes/inn→30, 1/inn→65, 2.5/inn→90, 4+/inn→99
  const sixScore = clamp(30 + (sixRate / 2.5) * 70, 20, 99);
  const srScore  = clamp(25 + ((b.sr - 95) / 75) * 70, 15, 97);
  return r(sixScore * 0.55 + srScore * 0.45);
}

function technique(b: Stat): number | undefined {
  if (b.innings < 5 || !b.avg) return undefined;
  return r(clamp(22 + ((b.avg - 12) / 55) * 75, 18, 99));
}

function timing(b: Stat): number | undefined {
  if (b.innings < 5 || !b.sr) return undefined;
  return r(clamp(22 + ((b.sr - 95) / 75) * 73, 18, 99));
}

function deathHitting(b: Stat): number | undefined {
  const ph = powerHitting(b);
  if (!ph) return undefined;
  const ti = timing(b);
  return r((ph * 0.6 + (ti ?? ph) * 0.4));
}

function deathBowling(bowl: Stat, baseRating: number): number | undefined {
  if (!bowl.economy || (bowl.wickets ?? 0) < 5) return undefined;
  const bonus = bowl.economy < 7.2 ? 3 : bowl.economy > 8.8 ? -4 : 0;
  return r(clamp(baseRating + bonus, 15, 99));
}

function experience(matches: number): number {
  return r(clamp(25 + (matches / 200) * 72, 25, 97));
}

function fitness(birthYear: number | undefined): number {
  if (!birthYear) return 78;
  const age = 2026 - birthYear;
  if (age < 20) return 82;
  if (age <= 27) return 88;
  if (age <= 31) return 84;
  if (age <= 35) return 76;
  return 65;
}

function fielding(role: string): number {
  return role === "WICKET_KEEPER" ? 88 : role === "ALL_ROUNDER" ? 78 : role === "BATTER" ? 74 : 68;
}

function archetype(
  role: string, bat: Stat | null, bowl: Stat | null, style: string | null,
): string {
  if (role === "WICKET_KEEPER") return (bat?.sr ?? 0) > 140 ? "aggressive-keeper-batter" : "classical-keeper-batter";
  if (role === "BOWLER") {
    if (!style) return "pace-bowler";
    if (style.includes("Leg"))   return "leg-spinner";
    if (style.includes("Off"))   return "off-spinner";
    if (style.includes("Ortho")) return "left-arm-orthodox";
    if (style.includes("Wrist")) return "wrist-spinner";
    return (bowl?.economy ?? 99) < 7.0 ? "death-pace-bowler" : "pace-bowler";
  }
  if (role === "ALL_ROUNDER") return style?.includes("Spin") ? "spin-all-rounder" : "pace-all-rounder";
  // BATTER
  if (!bat?.sr) return "batter";
  const sixR = (bat.sixes ?? 0) / Math.max(bat.innings, 1);
  if (bat.sr > 150 || sixR > 1.8) return "360-batter";
  if (bat.sr > 138)               return "aggressive-opener";
  if ((bat.avg ?? 0) > 38)        return "classical-batter";
  return "middle-order-batter";
}

// ── Player processing ──────────────────────────────────────────────────────────

function processPlayer(playerDir: string, folderCountry: string): OutputPlayer | null {
  const pPath = join(playerDir, "player.json");
  const sPath = join(playerDir, "careerAverages.json");
  if (!existsSync(pPath) || !existsSync(sPath)) return null;

  let raw: RawPlayer;
  let statsData: { stats: RawStat[] };
  try {
    raw       = JSON.parse(readFileSync(pPath, "utf-8"));
    statsData = JSON.parse(readFileSync(sPath, "utf-8"));
  } catch { return null; }

  const country = raw.country?.name ?? folderCountry;
  if (!SUPPORTED_COUNTRIES[country]) return null;

  const stats = statsData.stats;

  // Best batting: T20I (cl=3) if enough innings, else All T20 (cl=6)
  const t20iBat   = extractStat(stats, "BATTING", 3);
  const allT20Bat = extractStat(stats, "BATTING", 6);
  const bat = (t20iBat && t20iBat.innings >= MIN_BATTING_INNINGS)
    ? t20iBat
    : (allT20Bat && allT20Bat.innings >= MIN_BATTING_INNINGS) ? allT20Bat : t20iBat;

  // Best bowling: T20I if enough wickets, else All T20
  const t20iBowl   = extractStat(stats, "BOWLING", 3);
  const allT20Bowl = extractStat(stats, "BOWLING", 6);
  const bowl = (t20iBowl && (t20iBowl.wickets ?? 0) >= MIN_BOWLING_WICKETS)
    ? t20iBowl
    : (allT20Bowl && (allT20Bowl.wickets ?? 0) >= MIN_BOWLING_WICKETS) ? allT20Bowl : t20iBowl;

  const role  = mapRole(raw.playingRoles ?? []);
  const bCode = raw.bowlingStyles?.[0] ?? null;
  const bStyle = bCode ? mapBowlingStyle(bCode) : null;
  const batStyle = raw.battingStyles?.[0] === "lhb" ? "LEFT_HAND" : "RIGHT_HAND";

  const hasBat  = bat  && bat.innings >= 3;
  const hasBowl = bowl && (bowl.wickets ?? 0) >= 3;

  if (!hasBat && !hasBowl) return null;
  if ((role === "BATTER" || role === "WICKET_KEEPER") && !hasBat) return null;
  if (role === "BOWLER" && !hasBowl) return null;

  const batRating  = hasBat  ? battingRating(bat!)  : 15;
  const bowlRating = hasBowl ? bowlingRating(bowl!) : 12;

  const t20Matches = Math.max(t20iBat?.matches ?? 0, t20iBowl?.matches ?? 0);

  const dna: Record<string, number> = {
    batting:    batRating,
    bowling:    bowlRating,
    fielding:   fielding(role),
    fitness:    fitness(raw.dateOfBirth?.year),
    experience: experience(t20Matches),
  };

  if (hasBat) {
    const ph = powerHitting(bat!);
    const tc = technique(bat!);
    const ti = timing(bat!);
    const dh = deathHitting(bat!);
    if (ph != null && !isNaN(ph)) dna.powerHitting = ph;
    if (tc != null && !isNaN(tc)) dna.technique    = tc;
    if (ti != null && !isNaN(ti)) dna.timing       = ti;
    if (dh != null && !isNaN(dh)) dna.deathHitting = dh;
  }

  if (hasBowl) {
    const db = deathBowling(bowl!, bowlRating);
    if (db != null) dna.deathBowling = db;
    dna.variations = r(clamp(40 + (bowlRating - 40) * 0.7, 28, 92));
  }

  for (const k of Object.keys(dna)) {
    dna[k] = clamp(r(dna[k]), 1, 99);
  }

  const id = `${COUNTRY_TO_FILE[country] ?? "unknown"}-${raw.objectId}`;

  return {
    id, name: raw.longName, country, role,
    handedness: "RIGHT",   // not directly exposed in crawled data
    battingStyle: batStyle,
    bowlingStyle: bStyle,
    archetype: archetype(role, bat ?? null, bowl ?? null, bStyle),
    dna,
    meta: {
      espnId:      raw.objectId,
      age:         raw.dateOfBirth ? 2026 - raw.dateOfBirth.year : undefined,
      t20iMatches: t20Matches > 0 ? t20Matches : undefined,
      t20iBatSR:   hasBat ? bat!.sr : undefined,
      t20iBatAvg:  hasBat ? num(bat!.avg) : undefined,
      t20iBowlEco: hasBowl ? bowl!.economy : undefined,
      t20iWkts:    hasBowl ? bowl!.wickets : undefined,
      lastUpdated: VERSION,
    },
  };
}

// ── Run ────────────────────────────────────────────────────────────────────────

console.log(`\n🏏  Cricket Clash — Player Data Pipeline`);
console.log(`   Source:  ${SOURCE_DIR}`);
console.log(`   Output:  ${OUTPUT_DIR}`);
console.log(`   Version: ${VERSION}\n`);

if (!existsSync(SOURCE_DIR)) {
  console.error(`❌  Source not found: ${SOURCE_DIR}`);
  process.exit(1);
}

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const byCountry = new Map<string, OutputPlayer[]>();
let total = 0;
let skipped = 0;

for (const entry of readdirSync(SOURCE_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const folderName = entry.name;
  const folderPath = join(SOURCE_DIR, folderName);
  const countryHint = FOLDER_TO_COUNTRY[folderName];

  if (!countryHint) {
    console.log(`  ⚠  Skipping unknown folder: ${folderName}`);
    continue;
  }

  const playerFolders = readdirSync(folderPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  process.stdout.write(`  ${folderName.padEnd(18)} ${playerFolders.length} raw → `);

  let count = 0;
  for (const pFolder of playerFolders) {
    const player = processPlayer(join(folderPath, pFolder), countryHint);
    if (!player) { skipped++; continue; }

    const c = player.country;
    if (!byCountry.has(c)) byCountry.set(c, []);
    byCountry.get(c)!.push(player);
    total++;
    count++;
  }

  console.log(`${count} included`);
}

console.log(`\n  Writing output files...\n`);

for (const [country, players] of byCountry) {
  const fileName = COUNTRY_TO_FILE[country];
  if (!fileName) {
    console.log(`  ⚠  No file mapping for: ${country} (${players.length} players) — skipped`);
    continue;
  }

  // Sort: highest overall rating first
  players.sort((a, b) => (b.dna.batting + b.dna.bowling) - (a.dna.batting + a.dna.bowling));

  const file = join(OUTPUT_DIR, `${fileName}.json`);
  const output = {
    version: VERSION,
    country,
    source:  "espncricinfo",
    players: players.map(({ id, name, country: c, role, handedness, battingStyle, bowlingStyle, archetype: a, dna, meta }) =>
      ({ id, name, country: c, role, handedness, battingStyle, bowlingStyle, archetype: a, dna, meta })
    ),
  };

  writeFileSync(file, JSON.stringify(output, null, 2));
  console.log(`  ✓  ${fileName}.json  (${players.length} players)`);
}

console.log(`\n  Summary: ${total} players generated, ${skipped} skipped (< T20 threshold)\n`);
console.log("  Done ✓\n");
