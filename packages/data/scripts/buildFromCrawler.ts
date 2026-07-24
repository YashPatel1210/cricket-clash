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
const IMAGE_CDN_PREFIX = "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50";

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
  imageUrl?:    string | null;
  headshotImageUrl?: string | null;
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
  imageUrl?: string;
  handedness: string; battingStyle: string; bowlingStyle: string | null;
  archetype: string; dna: Record<string, number>; meta: Record<string, unknown>;
  // Internal — removed before final output
  _rawBatEff?: number;
  _rawBowlEff?: number;
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
 * Raw batting efficiency score (used for two-pass normalisation).
 *
 * Returns null if insufficient data.
 *
 * Design: combine strike rate and average into a single "T20 batting quality"
 * number. This raw score is normalised globally across all batters in pass 2.
 *
 * Using geometric-mean style: sqrt(SR * avg) captures both dimensions.
 * A batter with SR 137 and avg 49 (Kohli): sqrt(137*49) = sqrt(6713) = 81.9
 * A batter with SR 169 and avg 46 (SKY):   sqrt(169*46) = sqrt(7774) = 88.2
 * A batter with SR 142 and avg 33 (Warner): sqrt(142*33) = sqrt(4686) = 68.5
 * A tail-ender SR 67 avg 6:                 sqrt(67*6)  = sqrt(402)  = 20.1
 */
function battingEfficiency(b: Stat): number | null {
  if (!b.sr || !b.avg || b.innings < 5) return null;
  // Guard against negative/zero
  if (b.sr <= 0 || b.avg <= 0) return null;

  // Geometric mean of SR and avg scaled to a comparable range
  // sqrt(SR * avg) gives ~68-90 for good T20I batters
  const geoMean = Math.sqrt(b.sr * b.avg);

  // Innings volume bonus (up to 8 points for 150+ innings)
  const volumeBonus = clamp((b.innings / 150) * 8, 0, 8);

  return geoMean + volumeBonus;
}

/**
 * Raw bowling efficiency score (used for two-pass normalisation).
 */
function bowlingEfficiency(b: Stat): number | null {
  if (!b.economy || !b.wickets || b.wickets < 5) return null;

  // Economy (lower = better): invert so higher = better
  const ecoQuality = clamp(12.0 - b.economy, 0, 8);  // eco 6=6, eco 7=5, eco 8=4, eco 9=3

  // Bowling SR (lower = better): invert
  const bsr = b.bowlingSR ?? 30;
  const srQuality = clamp(45 - bsr, 0, 35);  // bsr 14=31, bsr 20=25, bsr 30=15, bsr 40=5

  // Wickets volume bonus
  const volumeBonus = clamp((b.wickets / 100) * 5, 0, 5);

  return ecoQuality * 2.5 + srQuality * 1.5 + volumeBonus;
}

/**
 * Map a raw efficiency score to a 0-99 rating using the global pool
 * of all players (percentile-based normalisation).
 *
 * The allScores array contains the raw efficiency scores of ALL players
 * in the same category (e.g. all batters globally).
 *
 * Percentile → Rating mapping:
 *   Top 3%   → 93-99  (Bumrah, Kohli, SKY tier)
 *   Top 10%  → 85-93  (very good international player)
 *   Top 25%  → 72-85  (solid international)
 *   Top 50%  → 55-72  (average T20I player)
 *   Bottom   → 10-55  (fringe/tail-ender)
 */
function normaliseRating(rawScore: number, allScores: number[]): number {
  if (allScores.length === 0) return 50;

  const sorted = [...allScores].sort((a, b) => a - b);
  const rank   = sorted.filter((s) => s < rawScore).length;
  const pct    = rank / sorted.length;  // 0.0 = worst, 1.0 = best

  // Map percentile to rating curve:
  // 0.0→10, 0.3→45, 0.5→60, 0.7→74, 0.85→83, 0.93→90, 0.97→95, 1.0→99
  let rating: number;
  if      (pct >= 0.97) rating = 93 + (pct - 0.97) / 0.03 * 6;
  else if (pct >= 0.90) rating = 85 + (pct - 0.90) / 0.07 * 8;
  else if (pct >= 0.80) rating = 76 + (pct - 0.80) / 0.10 * 9;
  else if (pct >= 0.65) rating = 65 + (pct - 0.65) / 0.15 * 11;
  else if (pct >= 0.50) rating = 55 + (pct - 0.50) / 0.15 * 10;
  else if (pct >= 0.30) rating = 40 + (pct - 0.30) / 0.20 * 15;
  else                  rating = 10 + (pct / 0.30)         * 30;

  return r(clamp(rating, 8, 99));
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

  // Raw efficiency scores — will be normalised globally in pass 2
  const rawBatEff  = hasBat  ? (battingEfficiency(bat!) ?? undefined)  : undefined;
  const rawBowlEff = hasBowl ? (bowlingEfficiency(bowl!) ?? undefined) : undefined;

  const t20Matches = Math.max(t20iBat?.matches ?? 0, t20iBowl?.matches ?? 0);

  // Placeholder ratings — replaced in pass 2
  const dna: Record<string, number> = {
    batting:    rawBatEff  ? 50 : 15,
    bowling:    rawBowlEff ? 50 : 12,
    fielding:   fielding(role),
    fitness:    fitness(raw.dateOfBirth?.year),
    experience: experience(t20Matches),
  };

  // Derived batting DNA (from raw stats, not normalised)
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
    const db = deathBowling(bowl!, 50);  // recalculated in pass 2
    if (db != null) dna.deathBowling = db;
    dna.variations = r(clamp(40 + ((rawBowlEff ?? 30) - 30) * 0.8, 28, 92));
  }

  for (const k of Object.keys(dna)) {
    dna[k] = clamp(r(dna[k]), 1, 99);
  }

  const id = `${COUNTRY_TO_FILE[country] ?? "unknown"}-${raw.objectId}`;

  return {
    id, name: raw.longName, country, role,
    imageUrl: raw.imageUrl || raw.headshotImageUrl
      ? `${IMAGE_CDN_PREFIX}${raw.imageUrl ?? raw.headshotImageUrl}`
      : undefined,
    handedness: "RIGHT",
    battingStyle: batStyle,
    bowlingStyle: bStyle,
    archetype: archetype(role, bat ?? null, bowl ?? null, bStyle),
    dna,
    _rawBatEff:  rawBatEff,
    _rawBowlEff: rawBowlEff,
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

console.log(`\n  ${total} players collected, ${skipped} skipped`);

// ── Pass 2: Global percentile normalisation ──────────────────────────────────
// Collect ALL raw efficiency scores globally (across all countries)
const allPlayers    = [...byCountry.values()].flat();
const allBatScores  = allPlayers.map((p) => p._rawBatEff).filter((s): s is number => s != null);
const allBowlScores = allPlayers.map((p) => p._rawBowlEff).filter((s): s is number => s != null);

console.log(`  Normalising: ${allBatScores.length} batters, ${allBowlScores.length} bowlers across all countries\n`);

for (const players of byCountry.values()) {
  for (const p of players) {
    if (p._rawBatEff != null) {
      p.dna.batting = normaliseRating(p._rawBatEff, allBatScores);
    }
    if (p._rawBowlEff != null) {
      const normBowl = normaliseRating(p._rawBowlEff, allBowlScores);
      p.dna.bowling  = normBowl;
      // Recalculate death bowling from normalised base
      const eco = p.meta.t20iBowlEco as number | undefined;
      if (eco != null) {
        const ecoBonus = eco < 7.2 ? 3 : eco > 8.8 ? -4 : 0;
        p.dna.deathBowling = clamp(r(normBowl + ecoBonus), 1, 99);
      }
      p.dna.variations = clamp(r(normBowl * 0.85 + (p.dna.variations ?? 50) * 0.15), 1, 99);
    }
    // Scale derived batting DNA relative to normalised batting rating
    const bat = p.dna.batting;
    if (p.dna.powerHitting != null) p.dna.powerHitting = clamp(r(bat * 0.85 + (p.dna.powerHitting - 50) * 0.4), 1, 99);
    if (p.dna.technique    != null) p.dna.technique    = clamp(r(bat * 0.80 + (p.dna.technique    - 50) * 0.3), 1, 99);
    if (p.dna.timing       != null) p.dna.timing       = clamp(r(bat * 0.88 + (p.dna.timing       - 50) * 0.2), 1, 99);
    if (p.dna.deathHitting != null) p.dna.deathHitting = clamp(r(bat * 0.75 + (p.dna.deathHitting - 50) * 0.35), 1, 99);
    // Clamp all
    for (const k of Object.keys(p.dna)) p.dna[k] = clamp(p.dna[k], 1, 99);
  }
}

// ── Write output ───────────────────────────────────────────────────────────────
console.log(`  Writing output files...\n`);

for (const [country, players] of byCountry) {
  const fileName = COUNTRY_TO_FILE[country];
  if (!fileName) {
    console.log(`  ⚠  No mapping for: ${country} (${players.length} players) — skipped`);
    continue;
  }

  players.sort((a, b) => (b.dna.batting + b.dna.bowling) - (a.dna.batting + a.dna.bowling));

  const file = join(OUTPUT_DIR, `${fileName}.json`);
  const output = {
    version: VERSION, country, source: "espncricinfo",
    players: players.map(({ id, name, imageUrl, country: c, role, handedness, battingStyle, bowlingStyle, archetype: a, dna, meta }) =>
      ({ id, name, imageUrl, country: c, role, handedness, battingStyle, bowlingStyle, archetype: a, dna, meta })
    ),
  };

  writeFileSync(file, JSON.stringify(output, null, 2));
  console.log(`  ✓  ${fileName}.json  (${players.length} players)`);
}

console.log(`\n  Done ✓  ${total} players written\n`);
