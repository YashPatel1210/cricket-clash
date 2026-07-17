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

import { Country } from "@cricket-clash/shared";
import { PlayerLoader } from "@cricket-clash/data";

import { PlayerFactory } from "../src/domain/player/PlayerFactory";
import { Team } from "../src/domain/team/Team";
import { TeamSelection } from "../src/domain/team/TeamSelection";
import { STANDARD_T20_TEAM_RULES } from "../src/domain/rules";
import { Match } from "../src/domain/match/Match";
import { MatchConditions } from "../src/domain/match/conditions/MatchConditions";
import { PitchType } from "../src/domain/match/conditions/PitchType";
import { WeatherCondition } from "../src/domain/match/conditions/WeatherCondition";
import { Stadium } from "../src/domain/match/conditions/Stadium";
import { BoundarySize } from "../src/domain/match/conditions/BoundarySize";
import { T20Configuration } from "../src/domain/match/configuration/T20Configuration";
import { InningsResult } from "../src/domain/match/innings/InningsResult";
import { InningsStatistics } from "../src/domain/match/statistics/InningsStatistics";
import { SimulationEngine } from "../src/SimulationEngine";
import { DeliveryOutcome } from "../src/domain/match/delivery/DeliveryOutcome";
import { T20TuningProfile } from "../src/domain/simulation/config/T20TuningProfile";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTeam(
  players: Array<{ player: ReturnType<typeof PlayerFactory.fromData>; position: number; isCaptain?: boolean }>,
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

// ── Team Definitions ───────────────────────────────────────────────────────────
// Players loaded from @cricket-clash/data — no hardcoded attributes here.

const indiaData = PlayerLoader.loadCountry("india");
const ausData   = PlayerLoader.loadCountry("australia");

const byId = (data: ReturnType<typeof PlayerLoader.loadCountry>, id: string) => {
  const d = data.find((p) => p.id === id);
  if (!d) throw new Error(`Player ${id} not found`);
  return PlayerFactory.fromData(d);
};

const india = buildTeam([
  { player: byId(indiaData, "ind-rohit-sharma"),     position: 1, isCaptain: true },
  { player: byId(indiaData, "ind-virat-kohli"),       position: 2 },
  { player: byId(indiaData, "ind-shubman-gill"),      position: 3 },
  { player: byId(indiaData, "ind-kl-rahul"),          position: 4 },
  { player: byId(indiaData, "ind-suryakumar-yadav"),  position: 5 },
  { player: byId(indiaData, "ind-hardik-pandya"),     position: 6 },
  { player: byId(indiaData, "ind-ravindra-jadeja"),   position: 7 },
  { player: byId(indiaData, "ind-jasprit-bumrah"),    position: 8 },
  { player: byId(indiaData, "ind-mohammed-siraj"),    position: 9 },
  { player: byId(indiaData, "ind-kuldeep-yadav"),     position: 10 },
  { player: byId(indiaData, "ind-arshdeep-singh"),    position: 11 },
]);

const australia = buildTeam([
  { player: byId(ausData, "aus-david-warner"),    position: 1, isCaptain: true },
  { player: byId(ausData, "aus-travis-head"),      position: 2 },
  { player: byId(ausData, "aus-steve-smith"),      position: 3 },
  { player: byId(ausData, "aus-josh-inglis"),      position: 4 },
  { player: byId(ausData, "aus-glenn-maxwell"),    position: 5 },
  { player: byId(ausData, "aus-mitchell-marsh"),   position: 6 },
  { player: byId(ausData, "aus-pat-cummins"),      position: 7 },
  { player: byId(ausData, "aus-mitchell-starc"),   position: 8 },
  { player: byId(ausData, "aus-josh-hazlewood"),   position: 9 },
  { player: byId(ausData, "aus-adam-zampa"),       position: 10 },
  { player: byId(ausData, "aus-nathan-ellis"),     position: 11 },
]);

// ── Match ─────────────────────────────────────────────────────────────────────

const seed = parseInt(process.argv[2] ?? "42");

const conditions = new MatchConditions(
  PitchType.FLAT,
  WeatherCondition.SUNNY,
  new Stadium("Melbourne Cricket Ground", BoundarySize.LARGE),
);

const match = new Match(india, australia, conditions, new T20Configuration());

// ── Simulate ──────────────────────────────────────────────────────────────────

const result = SimulationEngine.standard(seed, T20TuningProfile).simulate(match);
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
    const overWickets  = deliveries.filter(d => d.getEvent().isDismissal()).length;

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

function printBattingCard(stats: InningsStatistics, score: ReturnType<typeof result.getFirstInnings>["getInnings"]): void {
  console.log();
  console.log(`  ${"BATTER".padEnd(24)} ${"DISMISSAL".padEnd(28)} ${"R".padStart(4)} ${"B".padStart(4)} ${"4s".padStart(3)} ${"6s".padStart(3)} ${"SR".padStart(6)}`);
  console.log(`  ${line("-", 76)}`);

  const records = stats.getAllBatterRecords()
    .filter(r => r.getBalls() > 0 || r.isOut());

  for (const r of records) {
    const name       = r.getBatter().name.padEnd(24).slice(0, 24);
    const dismissal  = r.getDismissalDisplay().padEnd(28).slice(0, 28);
    const runs       = colR(r.getRuns(), 4);
    const balls      = colR(r.getBalls(), 4);
    const fours      = colR(r.getFours(), 3);
    const sixes      = colR(r.getSixes(), 3);
    const sr         = colR(r.getStrikeRate().toFixed(1), 6);
    console.log(`  ${name} ${dismissal} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
  }

  // Extras + total
  const extras = stats.getExtras();
  const total  = score.getScore();
  console.log();
  if (extras.getTotal() > 0) {
    console.log(`  ${"Extras".padEnd(24)} (${extras.toDisplay()})${"".padEnd(18)} ${colR(extras.getTotal(), 4)}`);
  }
  console.log(`  ${"TOTAL".padEnd(24)} ${total.getWickets()} wkts  (${total.getOvers()} ov)        ${colR(total.getRuns(), 4)}`);
}

function printBowlingCard(stats: InningsStatistics): void {
  console.log();
  console.log(`  ${"BOWLER".padEnd(24)} ${"O".padStart(5)} ${"R".padStart(4)} ${"W".padStart(3)} ${"WD".padStart(4)} ${"NB".padStart(4)} ${"ECO".padStart(6)}`);
  console.log(`  ${line("-", 55)}`);

  const records = stats.getAllBowlerRecords()
    .filter(r => r.getBalls() > 0 || r.getWides() > 0 || r.getNoBalls() > 0);

  for (const r of records) {
    const name   = r.getBowler().name.padEnd(24).slice(0, 24);
    const overs  = colR(r.getOvers(), 5);
    const runs   = colR(r.getRuns(), 4);
    const wkts   = colR(r.getWickets(), 3);
    const wd     = colR(r.getWides(), 4);
    const nb     = colR(r.getNoBalls(), 4);
    const eco    = colR(r.getEconomy().toFixed(2), 6);
    console.log(`  ${name} ${overs} ${runs} ${wkts} ${wd} ${nb} ${eco}`);
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
  printBattingCard(stats, inningsResult.getInnings());
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
