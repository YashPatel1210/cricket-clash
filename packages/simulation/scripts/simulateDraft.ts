/**
 * simulateDraft.ts
 *
 * Simulates a complete two-player draft in the terminal.
 * Both players auto-pick (best available by rating).
 *
 * Usage:
 *   pnpm --filter @cricket-clash/simulation simulate:draft
 *   pnpm --filter @cricket-clash/simulation simulate:draft 99
 */

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "../src/domain/player/Player";
import { PlayerPool } from "../src/domain/draft/PlayerPool";
import { BattingPosition } from "../src/domain/draft/BattingPosition";
import { PositionRange } from "../src/domain/draft/PositionRange";
import { DraftSession } from "../src/domain/draft/DraftSession";
import { DraftPickStatus } from "../src/domain/draft/DraftPickStatus";
import { DraftParticipant } from "../src/domain/draft/DraftParticipant";
import { DraftPickOption } from "../src/domain/draft/DraftPickOption";
import { DraftSessionEngine } from "../src/domain/draft/DraftSessionEngine";
import { DraftSessionStatus } from "../src/domain/draft/DraftSessionStatus";
import { DEFAULT_DRAFT_CONFIG } from "../src/domain/draft/DraftSessionConfig";
import { RandomGenerator } from "../src/infrastructure/random";

// ── Player database ────────────────────────────────────────────────────────────

type PlayerDef = {
  id: string; name: string; country: Country; role: PlayerRole;
  style: BattingStyle; bowling?: BowlingStyle; bat: number; bowl: number;
  deathHitting?: number; deathBowling?: number; againstPace?: number; againstSpin?: number;
};

function p(def: PlayerDef): Player {
  return new Player(
    def.id, def.name, def.country, def.role,
    Handedness.RIGHT, def.style, def.bowling ?? null,
    {
      batting: def.bat, bowling: def.bowl,
      fielding: 75, fitness: 85, experience: 70,
      deathHitting: def.deathHitting,
      deathBowling: def.deathBowling,
      againstPace: def.againstPace,
      againstSpin: def.againstSpin,
    },
  );
}

const DB: Player[] = [
  // ── INDIA ────────────────────────────────────────────────────────────
  p({ id:"ind-01", name:"Rohit Sharma",     country:Country.INDIA, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:88, bowl:10, deathHitting:82, againstPace:86 }),
  p({ id:"ind-02", name:"Virat Kohli",      country:Country.INDIA, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:95, bowl:8,  deathHitting:85, againstPace:90, againstSpin:88 }),
  p({ id:"ind-03", name:"Shubman Gill",     country:Country.INDIA, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:82, bowl:5,  againstPace:80 }),
  p({ id:"ind-04", name:"Suryakumar Yadav", country:Country.INDIA, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:90, bowl:5,  deathHitting:94 }),
  p({ id:"ind-05", name:"KL Rahul",         country:Country.INDIA, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.RIGHT_HAND, bat:84, bowl:5,  deathHitting:80 }),
  p({ id:"ind-06", name:"Rishabh Pant",     country:Country.INDIA, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.LEFT_HAND,  bat:86, bowl:5,  deathHitting:88 }),
  p({ id:"ind-07", name:"Hardik Pandya",    country:Country.INDIA, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_MEDIUM,  bat:80, bowl:82, deathHitting:86, deathBowling:80 }),
  p({ id:"ind-08", name:"Ravindra Jadeja",  country:Country.INDIA, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_ORTHODOX, bat:75, bowl:85 }),
  p({ id:"ind-09", name:"Jasprit Bumrah",   country:Country.INDIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:18, bowl:95, deathBowling:97 }),
  p({ id:"ind-10", name:"Mohammed Siraj",   country:Country.INDIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:16, bowl:87, deathBowling:82 }),
  p({ id:"ind-11", name:"Kuldeep Yadav",    country:Country.INDIA, role:PlayerRole.BOWLER,        style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_WRIST_SPIN,bat:20, bowl:85 }),
  p({ id:"ind-12", name:"Yuzvendra Chahal", country:Country.INDIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN, bat:15, bowl:83 }),
  p({ id:"ind-13", name:"Arshdeep Singh",   country:Country.INDIA, role:PlayerRole.BOWLER,        style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_FAST,     bat:15, bowl:81, deathBowling:84 }),

  // ── AUSTRALIA ─────────────────────────────────────────────────────────
  p({ id:"aus-01", name:"David Warner",     country:Country.AUSTRALIA, role:PlayerRole.BATTER,        style:BattingStyle.LEFT_HAND,  bat:88, bowl:10, deathHitting:82 }),
  p({ id:"aus-02", name:"Travis Head",      country:Country.AUSTRALIA, role:PlayerRole.BATTER,        style:BattingStyle.LEFT_HAND,  bat:85, bowl:20, deathHitting:88 }),
  p({ id:"aus-03", name:"Steve Smith",      country:Country.AUSTRALIA, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:90, bowl:35, againstSpin:88 }),
  p({ id:"aus-04", name:"Josh Inglis",      country:Country.AUSTRALIA, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.RIGHT_HAND, bat:78, bowl:5 }),
  p({ id:"aus-05", name:"Matthew Wade",     country:Country.AUSTRALIA, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.LEFT_HAND,  bat:76, bowl:5,  deathHitting:78 }),
  p({ id:"aus-06", name:"Glenn Maxwell",    country:Country.AUSTRALIA, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_OFF_SPIN, bat:85, bowl:78, deathHitting:92 }),
  p({ id:"aus-07", name:"Mitchell Marsh",   country:Country.AUSTRALIA, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:80, bowl:75 }),
  p({ id:"aus-08", name:"Pat Cummins",      country:Country.AUSTRALIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:25, bowl:93, deathBowling:90 }),
  p({ id:"aus-09", name:"Mitchell Starc",   country:Country.AUSTRALIA, role:PlayerRole.BOWLER,        style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_FAST,      bat:20, bowl:91, deathBowling:88 }),
  p({ id:"aus-10", name:"Josh Hazlewood",   country:Country.AUSTRALIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:15, bowl:89 }),
  p({ id:"aus-11", name:"Adam Zampa",       country:Country.AUSTRALIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN, bat:18, bowl:85 }),
  p({ id:"aus-12", name:"Nathan Ellis",     country:Country.AUSTRALIA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:16, bowl:80, deathBowling:82 }),

  // ── ENGLAND ───────────────────────────────────────────────────────────
  p({ id:"eng-01", name:"Jos Buttler",      country:Country.ENGLAND, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.RIGHT_HAND, bat:88, bowl:5,  deathHitting:90 }),
  p({ id:"eng-02", name:"Jason Roy",        country:Country.ENGLAND, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:84, bowl:5,  deathHitting:82 }),
  p({ id:"eng-03", name:"Dawid Malan",      country:Country.ENGLAND, role:PlayerRole.BATTER,        style:BattingStyle.LEFT_HAND,  bat:83, bowl:5 }),
  p({ id:"eng-04", name:"Ben Stokes",       country:Country.ENGLAND, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:84, bowl:82 }),
  p({ id:"eng-05", name:"Liam Livingstone", country:Country.ENGLAND, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN,bat:82, bowl:75, deathHitting:90 }),
  p({ id:"eng-06", name:"Sam Curran",       country:Country.ENGLAND, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_FAST,     bat:75, bowl:82 }),
  p({ id:"eng-07", name:"Chris Woakes",     country:Country.ENGLAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_MEDIUM,  bat:28, bowl:84 }),
  p({ id:"eng-08", name:"Jofra Archer",     country:Country.ENGLAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:22, bowl:91, deathBowling:89 }),
  p({ id:"eng-09", name:"Mark Wood",        country:Country.ENGLAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:18, bowl:87 }),
  p({ id:"eng-10", name:"Adil Rashid",      country:Country.ENGLAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN,bat:22, bowl:86 }),
  p({ id:"eng-11", name:"Chris Jordan",     country:Country.ENGLAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:20, bowl:82, deathBowling:84 }),
  p({ id:"eng-12", name:"Phil Salt",        country:Country.ENGLAND, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.RIGHT_HAND, bat:80, bowl:5 }),

  // ── PAKISTAN ──────────────────────────────────────────────────────────
  p({ id:"pak-01", name:"Babar Azam",       country:Country.PAKISTAN, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:93, bowl:5,  againstPace:88 }),
  p({ id:"pak-02", name:"Mohammad Rizwan",  country:Country.PAKISTAN, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.RIGHT_HAND, bat:86, bowl:5,  deathHitting:80 }),
  p({ id:"pak-03", name:"Fakhar Zaman",     country:Country.PAKISTAN, role:PlayerRole.BATTER,        style:BattingStyle.LEFT_HAND,  bat:84, bowl:5 }),
  p({ id:"pak-04", name:"Shadab Khan",      country:Country.PAKISTAN, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN, bat:72, bowl:84 }),
  p({ id:"pak-05", name:"Iftikhar Ahmed",   country:Country.PAKISTAN, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_OFF_SPIN, bat:78, bowl:72, deathHitting:84 }),
  p({ id:"pak-06", name:"Wasim Jr",         country:Country.PAKISTAN, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_FAST,      bat:70, bowl:80 }),
  p({ id:"pak-07", name:"Shaheen Afridi",   country:Country.PAKISTAN, role:PlayerRole.BOWLER,        style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_FAST,      bat:18, bowl:91, deathBowling:86 }),
  p({ id:"pak-08", name:"Naseem Shah",      country:Country.PAKISTAN, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:16, bowl:87 }),
  p({ id:"pak-09", name:"Haris Rauf",       country:Country.PAKISTAN, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:15, bowl:86, deathBowling:88 }),
  p({ id:"pak-10", name:"Usman Qadir",      country:Country.PAKISTAN, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN, bat:18, bowl:82 }),
  p({ id:"pak-11", name:"Agha Salman",      country:Country.PAKISTAN, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:78, bowl:30 }),

  // ── SOUTH AFRICA ──────────────────────────────────────────────────────
  p({ id:"sa-01",  name:"Quinton de Kock",  country:Country.SOUTH_AFRICA, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.LEFT_HAND,  bat:87, bowl:5 }),
  p({ id:"sa-02",  name:"Temba Bavuma",     country:Country.SOUTH_AFRICA, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:80, bowl:5 }),
  p({ id:"sa-03",  name:"Rilee Rossouw",    country:Country.SOUTH_AFRICA, role:PlayerRole.BATTER,        style:BattingStyle.LEFT_HAND,  bat:83, bowl:5,  deathHitting:86 }),
  p({ id:"sa-04",  name:"David Miller",     country:Country.SOUTH_AFRICA, role:PlayerRole.BATTER,        style:BattingStyle.LEFT_HAND,  bat:85, bowl:5,  deathHitting:92 }),
  p({ id:"sa-05",  name:"Aiden Markram",    country:Country.SOUTH_AFRICA, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_OFF_SPIN, bat:82, bowl:72 }),
  p({ id:"sa-06",  name:"Dwaine Pretorius", country:Country.SOUTH_AFRICA, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_MEDIUM,   bat:72, bowl:78 }),
  p({ id:"sa-07",  name:"Kagiso Rabada",    country:Country.SOUTH_AFRICA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:22, bowl:92, deathBowling:88 }),
  p({ id:"sa-08",  name:"Anrich Nortje",    country:Country.SOUTH_AFRICA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:16, bowl:89 }),
  p({ id:"sa-09",  name:"Tabraiz Shamsi",   country:Country.SOUTH_AFRICA, role:PlayerRole.BOWLER,        style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_WRIST_SPIN,bat:15, bowl:85 }),
  p({ id:"sa-10",  name:"Lungi Ngidi",      country:Country.SOUTH_AFRICA, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,     bat:18, bowl:83 }),
  p({ id:"sa-11",  name:"Tristan Stubbs",   country:Country.SOUTH_AFRICA, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.RIGHT_HAND, bat:78, bowl:5 }),

  // ── NEW ZEALAND ────────────────────────────────────────────────────────
  p({ id:"nz-01",  name:"Kane Williamson",  country:Country.NEW_ZEALAND, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:89, bowl:25, againstPace:85, againstSpin:88 }),
  p({ id:"nz-02",  name:"Devon Conway",     country:Country.NEW_ZEALAND, role:PlayerRole.WICKET_KEEPER, style:BattingStyle.LEFT_HAND,  bat:84, bowl:5 }),
  p({ id:"nz-03",  name:"Glenn Phillips",   country:Country.NEW_ZEALAND, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:82, bowl:30, deathHitting:86 }),
  p({ id:"nz-04",  name:"Finn Allen",       country:Country.NEW_ZEALAND, role:PlayerRole.BATTER,        style:BattingStyle.RIGHT_HAND, bat:80, bowl:5,  deathHitting:84 }),
  p({ id:"nz-05",  name:"Daryl Mitchell",   country:Country.NEW_ZEALAND, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_MEDIUM, bat:80, bowl:72, deathHitting:85 }),
  p({ id:"nz-06",  name:"Mitchell Santner", country:Country.NEW_ZEALAND, role:PlayerRole.ALL_ROUNDER,   style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_ORTHODOX, bat:72, bowl:82 }),
  p({ id:"nz-07",  name:"Trent Boult",      country:Country.NEW_ZEALAND, role:PlayerRole.BOWLER,        style:BattingStyle.LEFT_HAND,  bowling:BowlingStyle.LEFT_ARM_FAST,     bat:18, bowl:90 }),
  p({ id:"nz-08",  name:"Tim Southee",      country:Country.NEW_ZEALAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_MEDIUM,  bat:22, bowl:85 }),
  p({ id:"nz-09",  name:"Lockie Ferguson",  country:Country.NEW_ZEALAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:16, bowl:88 }),
  p({ id:"nz-10",  name:"Ish Sodhi",        country:Country.NEW_ZEALAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_LEG_SPIN,bat:18, bowl:84 }),
  p({ id:"nz-11",  name:"Adam Milne",       country:Country.NEW_ZEALAND, role:PlayerRole.BOWLER,        style:BattingStyle.RIGHT_HAND, bowling:BowlingStyle.RIGHT_ARM_FAST,    bat:14, bowl:82 }),
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<PlayerRole, string> = {
  [PlayerRole.BATTER]:        "BAT",
  [PlayerRole.WICKET_KEEPER]: "WK ",
  [PlayerRole.ALL_ROUNDER]:   "AR ",
  [PlayerRole.BOWLER]:        "BOW",
};

const COUNTRY_FLAG: Partial<Record<Country, string>> = {
  [Country.INDIA]:        "🇮🇳",
  [Country.AUSTRALIA]:    "🇦🇺",
  [Country.ENGLAND]:      "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  [Country.PAKISTAN]:     "🇵🇰",
  [Country.SOUTH_AFRICA]: "🇿🇦",
  [Country.NEW_ZEALAND]:  "🇳🇿",
};

const STATUS_ICON: Record<DraftPickStatus, string> = {
  [DraftPickStatus.AVAILABLE]:            "✓",
  [DraftPickStatus.ALREADY_PICKED]:       "✗ already picked",
  [DraftPickStatus.NO_ELIGIBLE_POSITION]: "✗ no position",
  [DraftPickStatus.ROLE_LIMIT_REACHED]:   "✗ role full",
  [DraftPickStatus.SQUAD_FULL]:           "✗ squad full",
};

const line  = (n = 70) => "─".repeat(n);
const colL  = (s: string | number, w: number) => String(s).padEnd(w).slice(0, w);
const colR  = (s: string | number, w: number) => String(s).padStart(w);

// ── Auto-pick logic ─────────────────────────────────────────────────────────────

/**
 * Auto-pick strategy: pick the best available player by overall rating.
 * Prioritises required roles (to satisfy squad minimum).
 */
function autoPick(
  participant: DraftParticipant,
): { player: Player; position: BattingPosition } | null {
  const options    = participant.getCurrentOptions();
  const selectable = options.filter((o) => o.isSelectable());
  if (selectable.length === 0) return null;

  const required = participant.squad.requiredRoles();

  // Sort: required roles first, then by overall rating (bat + bowl)
  const sorted = [...selectable].sort((a, b) => {
    const aRequired = required.includes(a.player.role) ? 1 : 0;
    const bRequired = required.includes(b.player.role) ? 1 : 0;
    if (bRequired !== aRequired) return bRequired - aRequired;
    const ratingA = a.player.attributes.batting + a.player.attributes.bowling;
    const ratingB = b.player.attributes.batting + b.player.attributes.bowling;
    return ratingB - ratingA;
  });

  const best     = sorted[0];
  // Place at the most natural position (middle of their eligible range)
  const midIdx   = Math.floor(best.eligiblePositions.length / 2);
  const position = best.eligiblePositions[midIdx];

  return { player: best.player, position };
}

// ── Display helpers ────────────────────────────────────────────────────────────

function printRoundHeader(turn: number, participant: DraftParticipant, label: string): void {
  const round = participant.getCurrentRound()!;
  const flag  = COUNTRY_FLAG[round.country] ?? "🌍";
  const comp  = round.composition;
  const compStr = `${comp.batters}B ${comp.allRounders}AR ${comp.bowlers}BOW ${comp.wicketKeepers}WK`;
  const range = PositionRange.forRole;

  console.log(`\n  ${label.padEnd(7)} ${flag} ${round.country.padEnd(16)} [${compStr}]`);
  console.log(`  ${colL("Player", 22)} ${colL("Role", 4)} ${colL("Positions", 8)} Status`);
  console.log(`  ${line(60)}`);

  for (const opt of participant.getCurrentOptions()) {
    const roleRange = PositionRange.forRole(opt.player.role);
    const posStr    = `${roleRange.min}-${roleRange.max}`;
    const statusStr = opt.status === DraftPickStatus.AVAILABLE
      ? `✓  [${opt.eligiblePositions.map((p) => p.getValue()).join(",")}]`
      : STATUS_ICON[opt.status];

    console.log(
      `  ${colL(opt.player.name, 22)} ${ROLE_LABEL[opt.player.role]} ` +
      `${colR(posStr, 5)}    ${statusStr}`,
    );
  }
}

function printPick(label: string, player: Player, position: BattingPosition): void {
  console.log(
    `\n  → ${label} picks: ${player.name} (${ROLE_LABEL[player.role].trim()})` +
    ` → Position #${position.getValue()}`,
  );
}

function printSquad(participant: DraftParticipant, label: string): void {
  const picks = participant.squad.getAllPicks();
  console.log(`\n  ${label}'s XI:`);
  console.log(`  ${colL("Pos", 4)} ${colL("Player", 22)} ${colL("Role", 14)} ${colL("Bat", 4)} ${colL("Bowl", 5)}`);
  console.log(`  ${line(55)}`);

  for (let i = 1; i <= 11; i++) {
    const pick = picks.find((p) => p.position.getValue() === i);
    if (pick) {
      const { player } = pick;
      const role  = ROLE_LABEL[player.role];
      const flag  = COUNTRY_FLAG[player.country] ?? "  ";
      console.log(
        `  ${colR(i, 2)}.  ${colL(player.name, 22)} ${flag} ${role}   ` +
        `${colR(player.attributes.batting, 3)}  ${colR(player.attributes.bowling, 4)}`,
      );
    } else {
      console.log(`  ${colR(i, 2)}.  ${"(empty)".padEnd(22)}`);
    }
  }

  // Squad summary
  const rules = participant.squad.getRules();
  console.log(`\n  Composition:`);
  for (const role of [PlayerRole.BATTER, PlayerRole.WICKET_KEEPER, PlayerRole.ALL_ROUNDER, PlayerRole.BOWLER]) {
    const count = participant.squad.roleCount(role);
    const { min, max } = rules.limits[role];
    const ok = count >= min && count <= max ? "✓" : "✗";
    console.log(`    ${ok} ${ROLE_LABEL[role]}  ${count}  (min ${min}, max ${max})`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────────

const seed     = parseInt(process.argv[2] ?? "42");
const pool     = new PlayerPool(DB);
const engine   = new DraftSessionEngine(pool, new RandomGenerator(seed));

const draftConfig = {
  ...DEFAULT_DRAFT_CONFIG,
  totalRounds: 14,
  countries: [
    Country.INDIA, Country.AUSTRALIA, Country.ENGLAND,
    Country.PAKISTAN, Country.SOUTH_AFRICA, Country.NEW_ZEALAND,
  ],
};

let session = engine.createSession("Alice", "Bob", draftConfig);

console.clear();
console.log();
console.log(`  ╔${"═".repeat(56)}╗`);
console.log(`  ║${"  🏏  CRICKET CLASH  —  DRAFT SIMULATOR".padEnd(56)}║`);
console.log(`  ║${"  Alice vs Bob  |  T20 Squad Rules  |  Seed: " + seed}`.padEnd(57) + "║");
console.log(`  ╚${"═".repeat(56)}╝`);
console.log(`\n  Rules: 3-6 Batters | 1-3 All-Rounders | 3-6 Bowlers | 1-2 WK | Total 11`);
console.log(`  Each player gets their own independent country draw each turn.\n`);

let turnCount = 0;

while (session.status === DraftSessionStatus.ACTIVE) {
  turnCount++;
  console.log(`\n${"═".repeat(72)}`);
  console.log(`  TURN ${turnCount}  —  ${session.summary()}`);
  console.log("═".repeat(72));

  // ── Alice's round ─────────────────────────────────────────────────
  printRoundHeader(turnCount, session.participantA, "ALICE");

  const pickA = autoPick(session.participantA);
  let result: ReturnType<typeof session.pick | typeof session.pass>;

  if (pickA) {
    printPick("Alice", pickA.player, pickA.position);
    result = session.pick("Alice", pickA.player, pickA.position);
  } else {
    console.log(`\n  → Alice PASSES (no valid pick available)`);
    result = session.pass("Alice");
  }

  if (!result.success) {
    console.error(`  ERROR (Alice): ${result.reason}`);
    break;
  }
  session = result.session;

  // ── Bob's round ────────────────────────────────────────────────────
  printRoundHeader(turnCount, session.participantB, "BOB  ");

  const pickB = autoPick(session.participantB);
  if (pickB) {
    printPick("Bob", pickB.player, pickB.position);
    result = session.pick("Bob", pickB.player, pickB.position);
  } else {
    console.log(`\n  → Bob PASSES (no valid pick available)`);
    result = session.pass("Bob");
  }

  if (!result.success) {
    console.error(`  ERROR (Bob): ${result.reason}`);
    break;
  }
  session = result.session;

  // Brief pause marker for readability
  console.log(
    `\n  After turn ${turnCount}: Alice ${session.participantA.pickedCount()}/11` +
    ` | Bob ${session.participantB.pickedCount()}/11`,
  );
}

// ── Final Squads ────────────────────────────────────────────────────────────────
console.log(`\n\n${"═".repeat(72)}`);
console.log(`  DRAFT COMPLETE — ${turnCount} turns`);
console.log("═".repeat(72));

printSquad(session.participantA, "ALICE");
printSquad(session.participantB, "BOB");

console.log(`\n${"═".repeat(72)}\n`);
