/**
 * simulateInnings.ts
 *
 * Runs a full T20 match and prints:
 *   - Ball-by-ball for both innings
 *   - Full scorecard (batting + bowling figures)
 *
 * Usage (from repo root):
 *   pnpm --filter @cricket-clash/simulation simulate
 *
 * Or directly:
 *   tsx packages/simulation/scripts/simulateInnings.ts [seed]
 */

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "../src/domain/player/Player";
import { Team } from "../src/domain/team/Team";
import { TeamSelection } from "../src/domain/team/TeamSelection";
import { STANDARD_T20_TEAM_RULES } from "../src/domain/rules";
import { Match } from "../src/domain/match/Match";
import { MatchConditions } from "../src/domain/match/conditions/MatchConditions";
import { PitchType } from "../src/domain/match/conditions/PitchType";
import { WeatherCondition } from "../src/domain/match/conditions/WeatherCondition";
import { Stadium } from "../src/domain/match/conditions/Stadium";
import { T20Configuration } from "../src/domain/match/configuration/T20Configuration";
import { InningsResult } from "../src/domain/match/innings/InningsResult";
import { InningsStatistics } from "../src/domain/match/statistics/InningsStatistics";
import { SimulationEngine } from "../src/SimulationEngine";
import { DeliveryOutcome } from "../src/domain/match/delivery/DeliveryOutcome";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePlayer(
  id: string,
  name: string,
  role: PlayerRole,
  batting: number,
  bowling: number,
): Player {
  return new Player(
    id,
    name,
    Country.INDIA,
    role,
    Handedness.RIGHT,
    BattingStyle.RIGHT_HAND,
    role === PlayerRole.BATTER || role === PlayerRole.WICKET_KEEPER
      ? null
      : BowlingStyle.RIGHT_ARM_FAST,
    { batting, bowling, fielding: 75, fitness: 85, experience: 70 },
  );
}

function buildTeam(
  name: string,
  players: Array<{ player: Player; position: number; isCaptain?: boolean }>,
): Team {
  const team = new Team(STANDARD_T20_TEAM_RULES);
  for (const { player, position, isCaptain } of players) {
    team.addSelection(new TeamSelection(player, position, isCaptain ?? false));
  }
  return team;
}

// ── Outcome display ────────────────────────────────────────────────────────────

const OUTCOME_DISPLAY: Record<DeliveryOutcome, string> = {
  [DeliveryOutcome.DOT]:    "·",
  [DeliveryOutcome.ONE]:    "1",
  [DeliveryOutcome.TWO]:    "2",
  [DeliveryOutcome.THREE]:  "3",
  [DeliveryOutcome.FOUR]:   "4",
  [DeliveryOutcome.SIX]:    "6",
  [DeliveryOutcome.WICKET]: "W",
  [DeliveryOutcome.WIDE]:   "wd",
  [DeliveryOutcome.NO_BALL]:"nb",
  [DeliveryOutcome.BYE]:    "b",
  [DeliveryOutcome.LEG_BYE]:"lb",
  [DeliveryOutcome.RUN_OUT]:"ro",
};

// ── Team Definitions ──────────────────────────────────────────────────────────

const indiaPlayers = [
  makePlayer("ind-1",  "Rohit Sharma",    PlayerRole.BATTER,       88, 10),
  makePlayer("ind-2",  "Virat Kohli",     PlayerRole.BATTER,       95, 10),
  makePlayer("ind-3",  "Shubman Gill",    PlayerRole.BATTER,       82, 10),
  makePlayer("ind-4",  "Hardik Pandya",   PlayerRole.ALL_ROUNDER,  80, 82),
  makePlayer("ind-5",  "Ravindra Jadeja", PlayerRole.ALL_ROUNDER,  75, 85),
  makePlayer("ind-6",  "KL Rahul",        PlayerRole.WICKET_KEEPER,84, 10),
  makePlayer("ind-7",  "Jasprit Bumrah",  PlayerRole.BOWLER,       18, 95),
  makePlayer("ind-8",  "Mohammed Siraj",  PlayerRole.BOWLER,       16, 87),
  makePlayer("ind-9",  "Kuldeep Yadav",   PlayerRole.BOWLER,       20, 85),
  makePlayer("ind-10", "Yuzvendra Chahal",PlayerRole.BOWLER,       15, 83),
  makePlayer("ind-11", "Arshdeep Singh",  PlayerRole.BOWLER,       15, 81),
];

const ausPlayers = [
  makePlayer("aus-1",  "David Warner",    PlayerRole.BATTER,       88, 10),
  makePlayer("aus-2",  "Travis Head",     PlayerRole.BATTER,       85, 20),
  makePlayer("aus-3",  "Steve Smith",     PlayerRole.BATTER,       90, 35),
  makePlayer("aus-4",  "Glen Maxwell",    PlayerRole.ALL_ROUNDER,  85, 78),
  makePlayer("aus-5",  "Mitchell Marsh",  PlayerRole.ALL_ROUNDER,  80, 75),
  makePlayer("aus-6",  "Matthew Wade",    PlayerRole.WICKET_KEEPER,78, 10),
  makePlayer("aus-7",  "Pat Cummins",     PlayerRole.BOWLER,       25, 93),
  makePlayer("aus-8",  "Mitchell Starc",  PlayerRole.BOWLER,       20, 91),
  makePlayer("aus-9",  "Josh Hazlewood",  PlayerRole.BOWLER,       15, 89),
  makePlayer("aus-10", "Adam Zampa",      PlayerRole.BOWLER,       18, 85),
  makePlayer("aus-11", "Nathan Ellis",    PlayerRole.BOWLER,       16, 80),
];

const india = buildTeam("India", [
  { player: indiaPlayers[0],  position: 1, isCaptain: true },
  { player: indiaPlayers[1],  position: 2 },
  { player: indiaPlayers[2],  position: 3 },
  { player: indiaPlayers[5],  position: 4 },  // KL Rahul (keeper)
  { player: indiaPlayers[3],  position: 5 },  // Hardik
  { player: indiaPlayers[4],  position: 6 },  // Jadeja
  { player: indiaPlayers[6],  position: 7 },  // Bumrah
  { player: indiaPlayers[7],  position: 8 },  // Siraj
  { player: indiaPlayers[8],  position: 9 },  // Kuldeep
  { player: indiaPlayers[9],  position: 10 }, // Chahal
  { player: indiaPlayers[10], position: 11 }, // Arshdeep
]);

const australia = buildTeam("Australia", [
  { player: ausPlayers[0],  position: 1, isCaptain: true },
  { player: ausPlayers[1],  position: 2 },
  { player: ausPlayers[2],  position: 3 },
  { player: ausPlayers[5],  position: 4 },  // Wade (keeper)
  { player: ausPlayers[3],  position: 5 },  // Maxwell
  { player: ausPlayers[4],  position: 6 },  // Marsh
  { player: ausPlayers[6],  position: 7 },  // Cummins
  { player: ausPlayers[7],  position: 8 },  // Starc
  { player: ausPlayers[8],  position: 9 },  // Hazlewood
  { player: ausPlayers[9],  position: 10 }, // Zampa
  { player: ausPlayers[10], position: 11 }, // Ellis
]);

// ── Match ─────────────────────────────────────────────────────────────────────

const seed = parseInt(process.argv[2] ?? "42");

const conditions = new MatchConditions(
  PitchType.FLAT,
  WeatherCondition.SUNNY,
  new Stadium("Melbourne Cricket Ground"),
);

const match = new Match(india, australia, conditions, new T20Configuration());

// ── Simulate ──────────────────────────────────────────────────────────────────

const result = SimulationEngine.standard(seed).simulate(match);
const scorecard = result.getScorecard();

// ── Printing helpers ──────────────────────────────────────────────────────────

const line = (char = "─", len = 60) => char.repeat(len);
const col = (s: string | number, width: number) =>
  String(s).padEnd(width).slice(0, width);
const colR = (s: string | number, width: number) =>
  String(s).padStart(width).slice(-width);

function printBallByBall(inningsResult: InningsResult, inningsNo: number): void {
  const innings = inningsResult.getInnings();
  const overs   = inningsResult.getOvers();
  const score   = innings.getScore();
  const toss    = scorecard.getToss();

  const battingTeam  = innings.getBattingTeam();
  const bowlingTeam  = innings.getBowlingTeam();

  console.log(`\n${line("═")}`);
  console.log(`  INNINGS ${inningsNo}`);
  console.log(line("═"));
  console.log();

  let runningRuns    = 0;
  let runningWickets = 0;
  let runningBalls   = 0;

  for (let i = 0; i < overs.length; i++) {
    const over         = overs[i];
    const deliveries   = over.getDeliveries();
    const overBalls    = deliveries.map(d => OUTCOME_DISPLAY[d.getEvent().getOutcome()]);
    const overRuns     = deliveries.reduce((s, d) => s + d.runs(), 0);
    const overWickets  = deliveries.filter(d => d.isWicket()).length;

    runningRuns    += overRuns;
    runningWickets += overWickets;
    runningBalls   += deliveries.filter(d => d.getEvent().isLegal()).length;

    const overStr  = `  Over ${String(i + 1).padStart(2)}  │ ${overBalls.join("  ")}  │`;
    const statsStr = `  +${String(overRuns).padStart(2)} runs${overWickets ? ` ${overWickets}W` : "   "}  │  ${runningRuns}/${runningWickets}`;

    console.log(overStr + statsStr);
  }

  console.log();
  console.log(`  Final Score: ${score.getRuns()}/${score.getWickets()} (${score.getOvers()} overs)`);
}

function printBattingCard(stats: InningsStatistics): void {
  console.log();
  console.log(`  ${"BATTER".padEnd(22)} ${"R".padStart(4)} ${"B".padStart(4)} ${"4s".padStart(3)} ${"6s".padStart(3)} ${"SR".padStart(6)}`);
  console.log(`  ${line("-", 46)}`);

  const records = stats.getAllBatterRecords()
    .filter(r => r.getBalls() > 0 || r.isOut());

  for (const r of records) {
    const name    = r.getBatter().name.padEnd(22).slice(0, 22);
    const status  = r.isOut() ? " out" : " not out";
    const runs    = colR(r.getRuns(), 4);
    const balls   = colR(r.getBalls(), 4);
    const fours   = colR(r.getFours(), 3);
    const sixes   = colR(r.getSixes(), 3);
    const sr      = colR(r.getStrikeRate().toFixed(1), 6);
    console.log(`  ${name} ${runs} ${balls} ${fours} ${sixes} ${sr}${status}`);
  }
}

function printBowlingCard(stats: InningsStatistics): void {
  console.log();
  console.log(`  ${"BOWLER".padEnd(22)} ${"O".padStart(5)} ${"R".padStart(4)} ${"W".padStart(3)} ${"ECO".padStart(6)}`);
  console.log(`  ${line("-", 44)}`);

  const records = stats.getAllBowlerRecords()
    .filter(r => r.getBalls() > 0);

  for (const r of records) {
    const name   = r.getBowler().name.padEnd(22).slice(0, 22);
    const overs  = colR(r.getOvers(), 5);
    const runs   = colR(r.getRuns(), 4);
    const wkts   = colR(r.getWickets(), 3);
    const eco    = colR(r.getEconomy().toFixed(2), 6);
    console.log(`  ${name} ${overs} ${runs} ${wkts} ${eco}`);
  }
}

function printScorecard(
  inningsResult: InningsResult,
  stats: InningsStatistics,
  title: string,
): void {
  console.log(`\n${line("═")}`);
  console.log(`  ${title} — SCORECARD`);
  console.log(line("═"));
  printBattingCard(stats);
  console.log();
  printBowlingCard(stats);
}

// ── Output ────────────────────────────────────────────────────────────────────

console.clear();
console.log();
console.log(`  ╔${"═".repeat(56)}╗`);
console.log(`  ║${"  🏏  CRICKET CLASH  —  T20  SIMULATION".padEnd(56)}║`);
console.log(`  ║${"  India vs Australia  |  MCG".padEnd(56)}║`);
console.log(`  ║${"  Seed: " + seed + "  |  Pitch: FLAT  |  Weather: SUNNY".padEnd(56)}║`);
console.log(`  ╚${"═".repeat(56)}╝`);

// Toss
const toss = scorecard.getToss();
if (toss) {
  const tossWinner = toss.getWinner();
  const decision   = toss.getDecision();
  console.log(`\n  Toss: ${tossWinner === india ? "India" : "Australia"} won the toss and elected to ${decision}`);
}

// Ball-by-ball
printBallByBall(result.getFirstInnings(), 1);
printBallByBall(result.getSecondInnings(), 2);

// Scorecards
const firstBattingTeam  = result.getFirstInnings().getInnings().getBattingTeam();
const secondBattingTeam = result.getSecondInnings().getInnings().getBattingTeam();

printScorecard(
  result.getFirstInnings(),
  scorecard.getFirstInningsStats(),
  firstBattingTeam === india ? "India" : "Australia",
);

printScorecard(
  result.getSecondInnings(),
  scorecard.getSecondInningsStats(),
  secondBattingTeam === india ? "India" : "Australia",
);

// Result
console.log(`\n${line("═")}`);
const firstScore  = result.getFirstInnings().getInnings().getScore();
const secondScore = result.getSecondInnings().getInnings().getScore();
const winner      = result.getWinner();
const winnerName  = winner === india ? "India" : winner === australia ? "Australia" : null;
const margin      = winner === firstBattingTeam
  ? `by ${firstScore.getRuns() - secondScore.getRuns()} runs`
  : winner
    ? `by ${10 - secondScore.getWickets()} wickets`
    : "";

console.log(`\n  RESULT:  ${winnerName ? `${winnerName} won ${margin}` : "Match Tied"}`);
console.log(`  India      ${firstBattingTeam === india ? firstScore.getRuns() : secondScore.getRuns()}/${firstBattingTeam === india ? firstScore.getWickets() : secondScore.getWickets()}`);
console.log(`  Australia  ${firstBattingTeam === australia ? firstScore.getRuns() : secondScore.getRuns()}/${firstBattingTeam === australia ? firstScore.getWickets() : secondScore.getWickets()}`);
console.log(`\n${line("═")}\n`);
