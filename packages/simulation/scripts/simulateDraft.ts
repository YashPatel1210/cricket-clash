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

import { Country, PlayerRole } from "@cricket-clash/shared";
import { PlayerLoader } from "@cricket-clash/data";

import { PlayerFactory } from "../src/domain/player/PlayerFactory";
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

// ── Player pool loaded from @cricket-clash/data ────────────────────────────────

const DB = PlayerFactory.fromDataList(PlayerLoader.loadAll());

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
