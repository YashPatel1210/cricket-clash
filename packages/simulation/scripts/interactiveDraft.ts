/**
 * interactiveDraft.ts
 *
 * Interactive two-player draft in the terminal.
 * Both players pick manually, then the match is simulated.
 *
 * Usage:
 *   pnpm --filter @cricket-clash/simulation draft
 *   pnpm --filter @cricket-clash/simulation draft 99
 *
 * Controls per turn:
 *   <number>          — pick that player (auto-assigns best available position)
 *   <number> <pos>    — pick that player at a specific position (e.g. "3 5")
 *   p                 — pass / skip this round
 *   q                 — quit
 */

import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

import { Country, PlayerRole } from "@cricket-clash/shared";
import { PlayerLoader } from "@cricket-clash/data";

import { PlayerFactory }      from "../src/domain/player/PlayerFactory";
import { PlayerPool }         from "../src/domain/draft/PlayerPool";
import { BattingPosition }    from "../src/domain/draft/BattingPosition";
import { PositionRange }      from "../src/domain/draft/PositionRange";
import { DraftSession }       from "../src/domain/draft/DraftSession";
import { DraftPickStatus }    from "../src/domain/draft/DraftPickStatus";
import { DraftParticipant }   from "../src/domain/draft/DraftParticipant";
import { DraftSessionEngine } from "../src/domain/draft/DraftSessionEngine";
import { DraftSessionStatus } from "../src/domain/draft/DraftSessionStatus";
import { DEFAULT_DRAFT_CONFIG } from "../src/domain/draft/DraftSessionConfig";
import { RandomGenerator }    from "../src/infrastructure/random";
import { Team }               from "../src/domain/team/Team";
import { TeamSelection }      from "../src/domain/team/TeamSelection";
import { Match }              from "../src/domain/match/Match";
import { MatchConditions }    from "../src/domain/match/conditions/MatchConditions";
import { PitchType }          from "../src/domain/match/conditions/PitchType";
import { WeatherCondition }   from "../src/domain/match/conditions/WeatherCondition";
import { Stadium }            from "../src/domain/match/conditions/Stadium";
import { BoundarySize }       from "../src/domain/match/conditions/BoundarySize";
import { T20Configuration }   from "../src/domain/match/configuration/T20Configuration";
import { SimulationEngine }   from "../src/SimulationEngine";
import { InningsResult }      from "../src/domain/match/innings/InningsResult";
import { InningsStatistics }  from "../src/domain/match/statistics/InningsStatistics";
import { T20TuningProfile }   from "../src/domain/simulation/config/T20TuningProfile";

// ── Player pool loaded from @cricket-clash/data ────────────────────────────────

const PLAYERS = PlayerFactory.fromDataList(PlayerLoader.loadAll());

// ── Display constants ──────────────────────────────────────────────────────────

const ROLE_LABEL: Record<PlayerRole, string> = {
  [PlayerRole.BATTER]:        "BAT",
  [PlayerRole.WICKET_KEEPER]: "WK ",
  [PlayerRole.ALL_ROUNDER]:   "AR ",
  [PlayerRole.BOWLER]:        "BOW",
};

const COUNTRY_FLAG: Partial<Record<Country, string>> = {
  [Country.INDIA]:        "IND 🇮🇳",
  [Country.AUSTRALIA]:    "AUS 🇦🇺",
  [Country.ENGLAND]:      "ENG 🏴",
  [Country.PAKISTAN]:     "PAK 🇵🇰",
  [Country.SOUTH_AFRICA]: "SA  🇿🇦",
  [Country.NEW_ZEALAND]:  "NZ  🇳🇿",
};

const line  = (n = 68) => "─".repeat(n);
const colL  = (s: string | number, w: number) => String(s).padEnd(w).slice(0, w);
const colR  = (s: string | number, w: number) => String(s).padStart(w);

// ── Squad state display ────────────────────────────────────────────────────────

function squadStatus(p: DraftParticipant): string {
  const sq    = p.squad;
  const rules = sq.getRules();
  const parts = Object.entries(rules.limits).map(([role, lim]) => {
    const r     = role as PlayerRole;
    const count = sq.roleCount(r);
    const label = ROLE_LABEL[r].trim();
    const mark  = count < lim.min ? "!" : count >= lim.max ? "✓" : "";
    return `${label}:${count}/${lim.max}${mark}`;
  });
  const req = sq.requiredRoles();
  const reqStr = req.length ? `  ⚠ Need: ${req.map((r) => ROLE_LABEL[r].trim()).join(",")}` : "";
  return `Squad ${sq.size()}/11  [${parts.join("  ")}]${reqStr}`;
}

// ── Print round for one participant ───────────────────────────────────────────

function printRound(participant: DraftParticipant, name: string): void {
  const round   = participant.getCurrentRound()!;
  const options = participant.getCurrentOptions();
  const comp    = round.composition;

  console.log(`\n  ┌${"─".repeat(66)}┐`);
  console.log(`  │  ${name.padEnd(10)} ${COUNTRY_FLAG[round.country] ?? round.country.padEnd(10)}   ` +
    `${comp.batters}B ${comp.allRounders}AR ${comp.bowlers}BOW ${comp.wicketKeepers}WK`.padEnd(24) + "│");
  console.log(`  │  ${squadStatus(participant).padEnd(64)}│`);
  console.log(`  ├${"─".repeat(66)}┤`);
  console.log(`  │  ${"#".padEnd(3)} ${"Player".padEnd(22)} ${"Role".padEnd(5)} ${"Positions".padEnd(10)} Status`.padEnd(67) + "│");
  console.log(`  ├${"─".repeat(66)}┤`);

  let selectable = 0;
  options.forEach((opt, idx) => {
    const num      = String(idx + 1).padStart(2);
    const name_    = opt.player.name.padEnd(22).slice(0, 22);
    const role     = ROLE_LABEL[opt.player.role];
    const range    = PositionRange.forRole(opt.player.role);
    const posRange = `${range.min}-${range.max}`;

    if (opt.status === DraftPickStatus.AVAILABLE) {
      selectable++;
      const eligPos = opt.eligiblePositions.map((p) => p.getValue()).join(",");
      console.log(`  │  ${num}. ${name_} ${role}  ${posRange.padEnd(6)}  ✓ pos [${eligPos}]`.padEnd(67) + "│");
    } else {
      const reason =
        opt.status === DraftPickStatus.ALREADY_PICKED       ? "already picked" :
        opt.status === DraftPickStatus.ROLE_LIMIT_REACHED   ? "role limit full" :
        opt.status === DraftPickStatus.NO_ELIGIBLE_POSITION ? "positions full"  :
        opt.status === DraftPickStatus.SQUAD_FULL           ? "squad full"      : "unavailable";
      console.log(`  │  ${num}. ${name_} ${role}  ${posRange.padEnd(6)}  ✗ ${reason}`.padEnd(67) + "│");
    }
  });

  console.log(`  └${"─".repeat(66)}┘`);

  if (selectable === 0) {
    console.log(`  ℹ  No selectable players — you must PASS this round (type "p")`);
  }
}

// ── Get validated pick from user ──────────────────────────────────────────────

async function getUserPick(
  rl: readline.Interface,
  participant: DraftParticipant,
  name: string,
  session: DraftSession,
): Promise<{ type: "pick"; player: Player; position: BattingPosition } | { type: "pass" } | { type: "quit" }> {
  const options = participant.getCurrentOptions();
  const selectable = options.filter((o) => o.isSelectable());

  while (true) {
    const raw = await rl.question(
      `\n  ${name}  › Enter pick [1-${options.length}] [pos optional], "p" to pass, "q" to quit: `,
    );
    const trimmed = raw.trim().toLowerCase();

    if (trimmed === "q") return { type: "quit" };
    if (trimmed === "p") return { type: "pass" };

    const parts = trimmed.split(/\s+/);
    const idx   = parseInt(parts[0]);

    if (isNaN(idx) || idx < 1 || idx > options.length) {
      console.log(`  ✗ Invalid number. Enter 1–${options.length}, "p" to pass, or "q" to quit.`);
      continue;
    }

    const opt = options[idx - 1];

    if (!opt.isSelectable()) {
      const reason =
        opt.status === DraftPickStatus.ALREADY_PICKED       ? "You already picked this player." :
        opt.status === DraftPickStatus.ROLE_LIMIT_REACHED   ? "You have reached the role limit." :
        opt.status === DraftPickStatus.NO_ELIGIBLE_POSITION ? "All valid positions are filled."  :
        opt.status === DraftPickStatus.SQUAD_FULL           ? "Your squad is already full."      : "Player not available.";
      console.log(`  ✗ ${reason}`);
      continue;
    }

    // Determine position
    let position: BattingPosition;

    if (parts.length >= 2) {
      const posNum = parseInt(parts[1]);
      if (isNaN(posNum)) {
        console.log(`  ✗ Invalid position. Use a number 1–11.`);
        continue;
      }
      try {
        position = BattingPosition.of(posNum);
      } catch {
        console.log(`  ✗ Position must be 1–11.`);
        continue;
      }
      if (!opt.eligiblePositions.some((p) => p.getValue() === posNum)) {
        const eligible = opt.eligiblePositions.map((p) => p.getValue()).join(", ");
        console.log(`  ✗ Position ${posNum} is not valid for ${opt.player.name}. Valid: ${eligible}`);
        continue;
      }
    } else {
      // Auto-assign: prefer middle of eligible range or first unoccupied natural position
      const squad = participant.squad;
      const unoccupied = opt.eligiblePositions.filter(
        (p) => !squad.getPlayerAt(p)
      );
      if (unoccupied.length === 0) {
        console.log(`  ✗ No open positions available for this player.`);
        continue;
      }
      // Pick midpoint
      position = unoccupied[Math.floor(unoccupied.length / 2)];
      console.log(`  ℹ Auto-assigned position #${position.getValue()} (add a position number to choose manually)`);
    }

    return { type: "pick", player: opt.player, position };
  }
}

// ── Print final squad ──────────────────────────────────────────────────────────

function printFinalSquad(participant: DraftParticipant, name: string): void {
  const picks = participant.squad.getAllPicks();
  console.log(`\n  ┌${"─".repeat(62)}┐`);
  console.log(`  │  ${(name + "'s Playing XI").padEnd(60)}│`);
  console.log(`  ├${"─".repeat(62)}┤`);
  console.log(`  │  ${"Pos".padEnd(4)} ${"Player".padEnd(22)} ${"Role".padEnd(5)} ${"Country".padEnd(12)} ${"Bat".padEnd(4)} Bowl │`);
  console.log(`  ├${"─".repeat(62)}┤`);

  for (let i = 1; i <= 11; i++) {
    const pick = picks.find((p) => p.position.getValue() === i);
    if (pick) {
      const { player: pl } = pick;
      const flag = COUNTRY_FLAG[pl.country]?.slice(0, 3) ?? "   ";
      console.log(
        `  │  ${colR(i, 2)}.  ${colL(pl.name, 22)} ` +
        `${ROLE_LABEL[pl.role]}  ${flag.padEnd(4)} ${pl.country.padEnd(8)}  ` +
        `${colR(pl.attributes.batting, 3)}   ${colR(pl.attributes.bowling, 3)} │`,
      );
    } else {
      console.log(`  │  ${colR(i, 2)}.  ${"(empty slot)".padEnd(56)}│`);
    }
  }
  console.log(`  └${"─".repeat(62)}┘`);

  // Composition
  const rules = participant.squad.getRules();
  const sq    = participant.squad;
  console.log(`  Composition: `, Object.entries(rules.limits).map(([role, lim]) => {
    const count = sq.roleCount(role as PlayerRole);
    const ok    = count >= lim.min && count <= lim.max ? "✓" : "✗";
    return `${ok} ${ROLE_LABEL[role as PlayerRole].trim()} ${count}`;
  }).join("  "));
}

// ── Convert DraftSquad → Team for simulation ──────────────────────────────────

function squadToTeam(participant: DraftParticipant): Team {
  // Use permissive rules for match simulation — draft already validated composition
  const permissiveRules = {
    maxPlayers: 11,
    roleLimits: {
      [PlayerRole.BATTER]:        { min: 0, max: 11 },
      [PlayerRole.BOWLER]:        { min: 0, max: 11 },
      [PlayerRole.ALL_ROUNDER]:   { min: 0, max: 11 },
      [PlayerRole.WICKET_KEEPER]: { min: 0, max: 11 },
    },
  };

  const team  = new Team(permissiveRules);
  const picks = participant.squad.getAllPicks();

  // Captain = highest (batting + bowling) rating
  const captain = picks.reduce((best, p) => {
    const ratingA = p.player.attributes.batting + p.player.attributes.bowling;
    const ratingB = best.player.attributes.batting + best.player.attributes.bowling;
    return ratingA > ratingB ? p : best;
  });

  // WK = first wicket keeper
  const keeper = picks.find((p) => p.player.role === PlayerRole.WICKET_KEEPER);

  for (const { position, player } of picks) {
    const isCapt = player.id === captain.player.id;
    const isWK   = keeper ? player.id === keeper.player.id : false;
    const result = team.addSelection(
      new TeamSelection(player, position.getValue(), isCapt, isWK),
    );
    if (!result.success) {
      throw new Error(`Team build error for ${player.name}: ${result.message}`);
    }
  }

  return team;
}

// ── Scorecard display ──────────────────────────────────────────────────────────

function printScorecard(result: ReturnType<typeof SimulationEngine.prototype.simulate>): void {
  const sc         = result.getScorecard();
  const firstTeam  = result.getFirstInnings().getInnings().getBattingTeam();
  const secondTeam = result.getSecondInnings().getInnings().getBattingTeam();

  const printInnings = (inningsRes: InningsResult, stats: InningsStatistics, title: string) => {
    const score = inningsRes.getInnings().getScore();
    console.log(`\n  ── ${title}: ${score.getRuns()}/${score.getWickets()} (${score.getOvers()} ov) ─────────`);

    // Batting
    console.log(`\n  ${"BATTER".padEnd(22)} ${"DISMISSAL".padEnd(26)} ${"R".padStart(4)} ${"B".padStart(4)} ${"4s".padStart(3)} ${"6s".padStart(3)} ${"SR".padStart(6)}`);
    console.log(`  ${line(72)}`);
    for (const r of stats.getAllBatterRecords().filter((r) => r.getBalls() > 0 || r.isOut())) {
      console.log(
        `  ${colL(r.getBatter().name, 22)} ` +
        `${colL(r.getDismissalDisplay(), 26)} ` +
        `${colR(r.getRuns(), 4)} ${colR(r.getBalls(), 4)} ` +
        `${colR(r.getFours(), 3)} ${colR(r.getSixes(), 3)} ` +
        `${colR(r.getStrikeRate().toFixed(1), 6)}`,
      );
    }
    const extras = stats.getExtras();
    if (extras.getTotal() > 0) {
      console.log(`  ${"Extras".padEnd(50)} ${colR(extras.getTotal(), 4)}  (${extras.toDisplay()})`);
    }
    console.log(`  ${"TOTAL".padEnd(50)} ${colR(score.getRuns(), 4)}`);

    // Bowling
    console.log(`\n  ${"BOWLER".padEnd(22)} ${"O".padStart(5)} ${"R".padStart(4)} ${"W".padStart(3)} ${"WD".padStart(3)} ${"ECO".padStart(6)}`);
    console.log(`  ${line(47)}`);
    for (const r of stats.getAllBowlerRecords().filter((r) => r.getBalls() > 0 || r.getWides() > 0)) {
      console.log(
        `  ${colL(r.getBowler().name, 22)} ` +
        `${colR(r.getOvers(), 5)} ${colR(r.getRuns(), 4)} ` +
        `${colR(r.getWickets(), 3)} ${colR(r.getWides(), 3)} ` +
        `${colR(r.getEconomy().toFixed(2), 6)}`,
      );
    }
  };

  const getTeamName = (team: Team) => team.getCaptain()?.country ?? "Team";

  printInnings(result.getFirstInnings(),  sc.getFirstInningsStats(),  getTeamName(firstTeam));
  printInnings(result.getSecondInnings(), sc.getSecondInningsStats(), getTeamName(secondTeam));

  // Result
  const winner    = result.getWinner();
  const firstScore  = result.getFirstInnings().getInnings().getScore();
  const secondScore = result.getSecondInnings().getInnings().getScore();
  const margin    = winner === firstTeam
    ? `by ${firstScore.getRuns() - secondScore.getRuns()} runs`
    : winner ? `by ${10 - secondScore.getWickets()} wickets` : "";
  const winnerName = winner ? getTeamName(winner) : null;

  console.log(`\n${"═".repeat(72)}`);
  console.log(`  RESULT: ${winnerName ? `${winnerName} won ${margin}` : "Match Tied!"}`);
  console.log(`${"═".repeat(72)}\n`);
}

// ── Main ────────────────────────────────────────────────────────────────────────

const seed = parseInt(process.argv[2] ?? "42");
const rl   = readline.createInterface({ input, output });

async function main() {
  console.clear();
  console.log(`\n  ╔${"═".repeat(56)}╗`);
  console.log(`  ║${"  🏏  CRICKET CLASH  —  INTERACTIVE DRAFT".padEnd(56)}║`);
  console.log(`  ║${"  Player 1 vs Player 2  |  T20  |  Seed: " + seed}`.padEnd(57) + "║");
  console.log(`  ╚${"═".repeat(56)}╝`);
  console.log(`\n  HOW TO PLAY:`);
  console.log(`  Each turn you see 11 players from a randomly drawn country.`);
  console.log(`  Type the player's number to pick them.`);
  console.log(`  Optionally add a position:  "3 5"  = pick #3 at batting position 5`);
  console.log(`  Type "p" to skip the round.  "q" to quit.\n`);

  const nameA = (await rl.question("  Enter Player 1 name (default: Alice): ")).trim() || "Alice";
  const nameB = (await rl.question("  Enter Player 2 name (default: Bob):   ")).trim() || "Bob";

  const pool    = new PlayerPool(PLAYERS);
  const engine  = new DraftSessionEngine(pool, new RandomGenerator(seed));
  const config  = {
    ...DEFAULT_DRAFT_CONFIG,
    totalRounds: 14,
    countries: [
      Country.INDIA, Country.AUSTRALIA, Country.ENGLAND,
      Country.PAKISTAN, Country.SOUTH_AFRICA, Country.NEW_ZEALAND,
    ],
  };

  let session = engine.createSession(nameA, nameB, config);

  console.log(`\n  Draft created. ${nameA} and ${nameB} will each draft 11 players.`);
  console.log(`  Squad rules: 3-5 BAT | 1-3 AR | 3-5 BOW | 1-3 WK | Total 11\n`);

  // ── Draft loop ───────────────────────────────────────────────────────────────
  while (session.status === DraftSessionStatus.ACTIVE) {
    const turn = session.turnNumber;
    console.log(`\n${"═".repeat(70)}`);
    console.log(`  TURN ${turn}  —  ${nameA}: ${session.participantA.pickedCount()}/11 | ${nameB}: ${session.participantB.pickedCount()}/11`);
    console.log(`${"═".repeat(70)}`);

    // ── Player A's pick ──────────────────────────────────────────────────────
    if (!session.participantA.isSquadComplete()) {
      printRound(session.participantA, nameA);

      const pickA = await getUserPick(rl, session.participantA, nameA, session);

      if (pickA.type === "quit") {
        console.log("\n  Draft cancelled. Goodbye!\n");
        rl.close();
        return;
      }

      let result: ReturnType<typeof session.pick | typeof session.pass>;
      if (pickA.type === "pass") {
        result = session.pass(nameA);
        console.log(`  ${nameA} passed this round.`);
      } else {
        result = session.pick(nameA, pickA.player, pickA.position);
        if (result.success) {
          console.log(`  ✓ ${nameA} picked ${pickA.player.name} at #${pickA.position.getValue()}`);
        }
      }

      if (!result.success) {
        console.log(`  ✗ Error: ${result.reason}`);
        rl.close();
        return;
      }
      session = result.session;
    } else {
      // Auto-pass if squad is complete
      const r = session.pass(nameA);
      if (r.success) session = r.session;
    }

    // ── Player B's pick ──────────────────────────────────────────────────────
    if (!session.participantB.isSquadComplete()) {
      printRound(session.participantB, nameB);

      const pickB = await getUserPick(rl, session.participantB, nameB, session);

      if (pickB.type === "quit") {
        console.log("\n  Draft cancelled. Goodbye!\n");
        rl.close();
        return;
      }

      let result: ReturnType<typeof session.pick | typeof session.pass>;
      if (pickB.type === "pass") {
        result = session.pass(nameB);
        console.log(`  ${nameB} passed this round.`);
      } else {
        result = session.pick(nameB, pickB.player, pickB.position);
        if (result.success) {
          console.log(`  ✓ ${nameB} picked ${pickB.player.name} at #${pickB.position.getValue()}`);
        }
      }

      if (!result.success) {
        console.log(`  ✗ Error: ${result.reason}`);
        rl.close();
        return;
      }
      session = result.session;
    } else {
      const r = session.pass(nameB);
      if (r.success) session = r.session;
    }
  }

  // ── Final squads ─────────────────────────────────────────────────────────────
  console.log(`\n\n${"═".repeat(70)}`);
  console.log(`  DRAFT COMPLETE`);
  console.log(`${"═".repeat(70)}`);

  printFinalSquad(session.participantA, nameA);
  printFinalSquad(session.participantB, nameB);

  // ── Simulate match? ──────────────────────────────────────────────────────────
  const aComplete = session.participantA.isSquadComplete();
  const bComplete = session.participantB.isSquadComplete();

  if (!aComplete || !bComplete) {
    console.log(`\n  ⚠ One or both squads are incomplete (need 11 players each).`);
    if (!aComplete) console.log(`  ${nameA}: ${session.participantA.pickedCount()}/11 players`);
    if (!bComplete) console.log(`  ${nameB}: ${session.participantB.pickedCount()}/11 players`);
    console.log(`  Cannot simulate match.\n`);
    rl.close();
    return;
  }

  const simRaw = (await rl.question(`\n  Simulate the match? (y/n): `)).trim().toLowerCase();

  if (simRaw !== "y") {
    console.log(`\n  OK — no simulation. See you next time!\n`);
    rl.close();
    return;
  }

  // ── Run simulation ───────────────────────────────────────────────────────────
  console.log(`\n  Building teams and simulating...`);

  try {
    const teamA = squadToTeam(session.participantA);
    const teamB = squadToTeam(session.participantB);

    const match = new Match(
      teamA, teamB,
      new MatchConditions(PitchType.FLAT, WeatherCondition.SUNNY, new Stadium("Cricket Ground", BoundarySize.MEDIUM)),
      new T20Configuration(),
    );

    const simResult = SimulationEngine.standard(seed, T20TuningProfile).simulate(match);

    console.log(`\n${"═".repeat(72)}`);
    console.log(`  MATCH RESULT — ${nameA} vs ${nameB}`);
    console.log(`${"═".repeat(72)}`);

    printScorecard(simResult);

  } catch (err) {
    console.error(`\n  Simulation error: ${(err as Error).message}`);
  }

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
