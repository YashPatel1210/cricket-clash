import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";
import type { InningsResult } from "@cricket-clash/simulation/domain/match/innings/InningsResult";
import type { InningsStatistics } from "@cricket-clash/simulation/domain/match/statistics/InningsStatistics";

interface Props {
  result: MatchResult;
  player1: string;
  player2: string;
  onPlayAgain: () => void;
}

export default function ScorecardPage({ result, player1, player2, onPlayAgain }: Props) {
  const sc     = result.getScorecard();
  const first  = result.getFirstInnings();
  const second = result.getSecondInnings();
  const winner = result.getWinner();

  // Teams are the players' drafted XIs, so label every result view with the
  // participant names rather than a country from one randomly drafted player.
  const team1 = player1;
  const team2 = player2;

  const firstScore  = first.getInnings().getScore();
  const secondScore = second.getInnings().getScore();

  const winnerTeam = winner
    ? (winner === first.getInnings().getBattingTeam() ? team1 : team2)
    : null;

  const margin = winner
    ? (winner === first.getInnings().getBattingTeam()
        ? `by ${firstScore.getRuns() - secondScore.getRuns()} runs`
        : `by ${10 - secondScore.getWickets()} wickets`)
    : "";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Result header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 px-6 py-8 text-center">
        <div className="text-4xl mb-3">🏆</div>
        {winner ? (
          <>
            <h1 className="text-2xl font-black text-white">{winnerTeam} wins!</h1>
            <p className="text-slate-400 mt-1">{margin}</p>
          </>
        ) : (
          <h1 className="text-2xl font-black text-white">Match Tied!</h1>
        )}

        {/* Score summary */}
        <div className="mt-6 flex justify-center gap-8">
          <ScoreBox team={team1} score={firstScore.getRuns()} wickets={firstScore.getWickets()} overs={firstScore.getOvers()} />
          <div className="text-slate-600 flex items-center font-bold">vs</div>
          <ScoreBox team={team2} score={secondScore.getRuns()} wickets={secondScore.getWickets()} overs={secondScore.getOvers()} />
        </div>
      </div>

      {/* Scorecards */}
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-8">
        <InningsCard
          title={`${team1} — Batting`}
          innings={first}
          stats={sc.getFirstInningsStats()}
        />
        <InningsCard
          title={`${team2} — Batting`}
          innings={second}
          stats={sc.getSecondInningsStats()}
        />
      </div>

      {/* Play again */}
      <div className="px-4 pb-8 max-w-4xl mx-auto">
        <button
          onClick={onPlayAgain}
          className="w-full bg-green-500 hover:bg-green-400 text-slate-950 font-bold rounded-xl py-4 text-lg transition-colors"
        >
          Play Again →
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBox({ team, score, wickets, overs }: { team: string; score: number; wickets: number; overs: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-500 uppercase tracking-widest">{team}</div>
      <div className="text-3xl font-black tabular-nums">{score}/{wickets}</div>
      <div className="text-xs text-slate-500">({overs} ov)</div>
    </div>
  );
}

function InningsCard({ title, innings, stats }: { title: string; innings: InningsResult; stats: InningsStatistics }) {
  const batRecords  = stats.getAllBatterRecords().filter((r) => r.getBalls() > 0 || r.isOut());
  const bowlRecords = stats.getAllBowlerRecords().filter((r) => r.getBalls() > 0 || r.getWides() > 0);
  const extras      = stats.getExtras();
  const score       = innings.getInnings().getScore();

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/40">
        <h2 className="font-bold text-white">{title}</h2>
        <div className="text-slate-400 text-sm">{score.getRuns()}/{score.getWickets()} ({score.getOvers()} overs)</div>
      </div>

      {/* Batting */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-800">
              <th className="text-left px-4 py-2 font-medium">Batter</th>
              <th className="text-left px-4 py-2 font-medium">Dismissal</th>
              <th className="text-right px-3 py-2 font-medium">R</th>
              <th className="text-right px-3 py-2 font-medium">B</th>
              <th className="text-right px-3 py-2 font-medium">4s</th>
              <th className="text-right px-3 py-2 font-medium">6s</th>
              <th className="text-right px-3 py-2 font-medium">SR</th>
            </tr>
          </thead>
          <tbody>
            {batRecords.map((r, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-2 text-white font-medium">{r.getBatter().name}</td>
                <td className="px-4 py-2 text-slate-400 text-xs">{r.getDismissalDisplay()}</td>
                <td className="px-3 py-2 text-right font-bold text-white">{r.getRuns()}</td>
                <td className="px-3 py-2 text-right text-slate-400">{r.getBalls()}</td>
                <td className="px-3 py-2 text-right text-blue-400">{r.getFours()}</td>
                <td className="px-3 py-2 text-right text-purple-400">{r.getSixes()}</td>
                <td className="px-3 py-2 text-right text-slate-400">{r.getStrikeRate().toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extras + Total */}
      {extras.getTotal() > 0 && (
        <div className="px-4 py-2 border-t border-slate-800/50 text-sm text-slate-400">
          Extras: {extras.toDisplay()} — {extras.getTotal()}
        </div>
      )}

      {/* Bowling */}
      <div className="border-t border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-800">
              <th className="text-left px-4 py-2 font-medium">Bowler</th>
              <th className="text-right px-3 py-2 font-medium">O</th>
              <th className="text-right px-3 py-2 font-medium">R</th>
              <th className="text-right px-3 py-2 font-medium">W</th>
              <th className="text-right px-3 py-2 font-medium">Eco</th>
            </tr>
          </thead>
          <tbody>
            {bowlRecords.map((r, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-2 text-white font-medium">{r.getBowler().name}</td>
                <td className="px-3 py-2 text-right text-slate-400">{r.getOvers()}</td>
                <td className="px-3 py-2 text-right text-slate-400">{r.getRuns()}</td>
                <td className="px-3 py-2 text-right font-bold text-white">{r.getWickets()}</td>
                <td className="px-3 py-2 text-right text-slate-400">{r.getEconomy().toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
