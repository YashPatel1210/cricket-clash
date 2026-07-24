import { useState, useEffect, useRef } from "react";
import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";
import { DeliveryOutcome } from "@cricket-clash/simulation/domain/match/delivery/DeliveryOutcome";

interface DeliveryEntry {
  outcome: DeliveryOutcome;
  runs: number;
  isDismissal: boolean;
  overIndex: number;
  inningsIndex: number;
  runningRuns: number;
  runningWickets: number;
}

const BALL_COLOR: Record<DeliveryOutcome, string> = {
  [DeliveryOutcome.DOT]:    "bg-slate-600 text-slate-300",
  [DeliveryOutcome.ONE]:    "bg-slate-500 text-white",
  [DeliveryOutcome.TWO]:    "bg-slate-500 text-white",
  [DeliveryOutcome.THREE]:  "bg-slate-500 text-white",
  [DeliveryOutcome.FOUR]:   "bg-blue-600 text-white",
  [DeliveryOutcome.SIX]:    "bg-purple-600 text-white font-black",
  [DeliveryOutcome.WICKET]: "bg-red-600 text-white font-black",
  [DeliveryOutcome.RUN_OUT]:"bg-red-500 text-white",
  [DeliveryOutcome.WIDE]:   "bg-yellow-600 text-slate-900",
  [DeliveryOutcome.NO_BALL]:"bg-orange-500 text-slate-900",
  [DeliveryOutcome.BYE]:    "bg-slate-600 text-slate-400",
  [DeliveryOutcome.LEG_BYE]:"bg-slate-600 text-slate-400",
};

const BALL_LABEL: Record<DeliveryOutcome, string> = {
  [DeliveryOutcome.DOT]: "·",   [DeliveryOutcome.ONE]: "1",
  [DeliveryOutcome.TWO]: "2",   [DeliveryOutcome.THREE]: "3",
  [DeliveryOutcome.FOUR]: "4",  [DeliveryOutcome.SIX]: "6",
  [DeliveryOutcome.WICKET]: "W",[DeliveryOutcome.RUN_OUT]: "ro",
  [DeliveryOutcome.WIDE]: "wd", [DeliveryOutcome.NO_BALL]: "nb",
  [DeliveryOutcome.BYE]: "b",   [DeliveryOutcome.LEG_BYE]: "lb",
};

const SPEED_MS = 400; // ms per ball

interface Props {
  result: MatchResult;
  player1: string;
  player2: string;
  onFinished: () => void;
}

export default function MatchPage({ result, player1, player2, onFinished }: Props) {
  // Flatten all deliveries from both innings into a timeline
  const timeline = useRef<DeliveryEntry[]>(buildTimeline(result)).current;

  const [revealed, setRevealed] = useState(0);
  const [inningsBreak, setInningsBreak] = useState(false);

  useEffect(() => {
    if (inningsBreak) {
      const t = setTimeout(() => setInningsBreak(false), 2500);
      return () => clearTimeout(t);
    }

    if (revealed >= timeline.length) return;

    const t = setTimeout(() => {
      const next = revealed + 1;
      setRevealed(next);

      // Check if we just finished innings 1
      if (next < timeline.length &&
          timeline[next - 1].inningsIndex === 0 &&
          timeline[next].inningsIndex === 1) {
        setInningsBreak(true);
      }
    }, SPEED_MS);

    return () => clearTimeout(t);
  }, [revealed, inningsBreak, timeline]);

  const current = revealed > 0 ? timeline[Math.min(revealed, timeline.length) - 1] : null;
  const inInnings1 = !current || current.inningsIndex === 0;

  // Current score
  const currentRuns    = current?.runningRuns    ?? 0;
  const currentWickets = current?.runningWickets ?? 0;

  // Draft squads belong to the people playing, not to the country of whichever
  // player happens to be first in the selected XI.
  const team1Name = player1;
  const team2Name = player2;

  const firstScore = result.getFirstInnings().getInnings().getScore();

  if (inningsBreak) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🏏</div>
          <h2 className="text-2xl font-bold">Innings Break</h2>
          <p className="text-slate-400 mt-2">
            {team1Name}: {firstScore.getRuns()}/{firstScore.getWickets()} ({firstScore.getOvers()})
          </p>
          <p className="text-slate-500 mt-1 text-sm">
            Target: {firstScore.getRuns() + 1}
          </p>
        </div>
      </div>
    );
  }

  // Group deliveries by over for display
  const displayDeliveries = timeline.slice(0, revealed);
  const overs = groupByOver(displayDeliveries.filter((d) => d.inningsIndex === (inInnings1 ? 0 : 1)));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Score bar ── */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">
            Innings {inInnings1 ? "1" : "2"} — {inInnings1 ? team1Name : team2Name}
          </div>
          <div className="text-4xl font-black tabular-nums">
            {currentRuns}/{currentWickets}
          </div>
        </div>
        {!inInnings1 && (
          <div className="text-right">
            <div className="text-xs text-slate-500">Target</div>
            <div className="text-2xl font-bold text-amber-400">{firstScore.getRuns() + 1}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Need {Math.max(0, firstScore.getRuns() + 1 - currentRuns)} more
            </div>
          </div>
        )}
        {inInnings1 && (
          <div className="text-right text-slate-500 text-sm">
            {player1} vs {player2}
          </div>
        )}
      </div>

      {/* ── Over-by-over ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {overs.map((over, i) => {
          const overRuns    = over.reduce((s, d) => s + d.runs, 0);
          const overWickets = over.filter((d) => d.isDismissal).length;
          return (
            <div key={i} className="bg-slate-800/50 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-mono">Over {i + 1}</span>
                <span className="text-xs text-slate-400">
                  +{overRuns}{overWickets > 0 ? ` · ${overWickets}W` : ""}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {over.map((d, j) => (
                  <div
                    key={j}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${BALL_COLOR[d.outcome]}`}
                  >
                    {BALL_LABEL[d.outcome]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Latest ball highlight */}
        {current && (
          <div className="text-center py-2">
            <span className={`text-xs px-3 py-1 rounded-full ${
              current.isDismissal ? "bg-red-900/50 text-red-400" :
              current.outcome === DeliveryOutcome.SIX ? "bg-purple-900/50 text-purple-400" :
              current.outcome === DeliveryOutcome.FOUR ? "bg-blue-900/50 text-blue-400" :
              "bg-slate-800 text-slate-400"
            }`}>
              {current.isDismissal ? "WICKET!" :
               current.outcome === DeliveryOutcome.SIX ? "SIX! 🚀" :
               current.outcome === DeliveryOutcome.FOUR ? "FOUR! 🏏" :
               BALL_LABEL[current.outcome]}
            </span>
          </div>
        )}
      </div>

      {/* ── Done button ── */}
      {revealed >= timeline.length && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onFinished}
            className="w-full bg-green-500 hover:bg-green-400 text-slate-950 font-bold rounded-xl py-4 text-lg transition-colors"
          >
            View Scorecard →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildTimeline(result: MatchResult): DeliveryEntry[] {
  const entries: DeliveryEntry[] = [];

  [result.getFirstInnings(), result.getSecondInnings()].forEach((inn, inningsIndex) => {
    let runs = 0;
    let wickets = 0;

    inn.getOvers().forEach((over, overIndex) => {
      over.getDeliveries().forEach((d) => {
        const isDismissal = d.getEvent().isDismissal();
        runs    += d.runs();
        if (isDismissal) wickets++;
        entries.push({
          outcome: d.getEvent().getOutcome(),
          runs: d.runs(),
          isDismissal,
          overIndex,
          inningsIndex,
          runningRuns: runs,
          runningWickets: wickets,
        });
      });
    });
  });

  return entries;
}

function groupByOver(deliveries: DeliveryEntry[]) {
  const overs: DeliveryEntry[][] = [];
  let current: DeliveryEntry[] = [];
  let lastOver = -1;

  for (const d of deliveries) {
    if (d.overIndex !== lastOver) {
      if (current.length) overs.push(current);
      current = [];
      lastOver = d.overIndex;
    }
    current.push(d);
  }
  if (current.length) overs.push(current);
  return overs;
}
