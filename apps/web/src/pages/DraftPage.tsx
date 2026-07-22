import { useState, useCallback, useEffect } from "react";
import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";
import type { DraftSession } from "@cricket-clash/simulation/domain/draft/DraftSession";
import { DraftSessionStatus } from "@cricket-clash/simulation/domain/draft/DraftSessionStatus";
import type { BattingPosition } from "@cricket-clash/simulation/domain/draft/BattingPosition";
import type { Player } from "@cricket-clash/simulation/domain/player/Player";

import { createDraftSession, simulateMatchFromDraft } from "../services/GameService";
import { PlayerCard } from "../components/PlayerCard";
import { SquadPanel } from "../components/SquadPanel";

const ROUND_COMPOSITION_LABEL = (comp: {
  batters: number; allRounders: number; bowlers: number; wicketKeepers: number;
}) => `${comp.batters}B  ${comp.allRounders}AR  ${comp.bowlers}BOW  ${comp.wicketKeepers}WK`;

const COUNTRY_FLAG: Record<string, string> = {
  "India": "🇮🇳", "Australia": "🇦🇺", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Pakistan": "🇵🇰",
  "South Africa": "🇿🇦", "New Zealand": "🇳🇿", "Bangladesh": "🇧🇩",
  "Afghanistan": "🇦🇫", "Ireland": "🇮🇪",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  player1: string;
  player2: string;
  onMatchReady: (result: MatchResult) => void;
  onBack: () => void;
}

// ── Entry point — handles init errors gracefully ──────────────────────────────

export default function DraftPage({ player1, player2, onMatchReady, onBack }: Props) {
  const [session, setSession] = useState<DraftSession | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSession(createDraftSession(player1, player2, Date.now()));
    } catch (e) {
      const msg = (e as Error).message;
      setInitError(msg);
      console.error("[DraftPage] Failed to create draft session:", e);
    }
  }, [player1, player2]);

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Draft Setup Failed</h2>
          <p className="text-slate-400 text-sm mb-6">{initError}</p>
          <button
            onClick={onBack}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">⚙️</div>
          <p className="text-slate-400">Loading player pool…</p>
        </div>
      </div>
    );
  }

  return (
    <DraftUI
      session={session}
      setSession={setSession}
      player1={player1}
      player2={player2}
      onMatchReady={onMatchReady}
      onBack={onBack}
    />
  );
}

// ── Draft UI ──────────────────────────────────────────────────────────────────

interface UIProps extends Props {
  session:    DraftSession;
  setSession: (s: DraftSession) => void;
}

function DraftUI({ session, setSession, player1, player2, onMatchReady, onBack }: UIProps) {
  const [activeTurn, setActiveTurn]   = useState<"A" | "B">("A");
  const [simulating, setSimulating]   = useState(false);
  const [positionPicker, setPositionPicker] = useState<{
    player: Player; options: BattingPosition[];
  } | null>(null);

  const activeParticipant = activeTurn === "A" ? session.participantA : session.participantB;
  const activeName        = activeTurn === "A" ? player1 : player2;
  const currentRound      = activeParticipant.getCurrentRound();
  const activeUserId      = activeTurn === "A"
    ? session.participantA.userId
    : session.participantB.userId;
  const options = session.getOptionsFor(activeUserId);

  // ── Pick ───────────────────────────────────────────────────────────────────

  const confirmPick = useCallback((player: Player, position: BattingPosition) => {
    setPositionPicker(null);
    const result = session.pick(activeUserId, player, position);

    if (!result.success) {
      console.warn("[DraftUI] Pick failed:", result.reason);
      return;
    }

    const updated = result.session;
    setSession(updated);

    if (updated.status === DraftSessionStatus.COMPLETED) {
      setSimulating(true);
      setTimeout(() => {
        try {
          const matchResult = simulateMatchFromDraft(updated, Date.now());
          onMatchReady(matchResult);
        } catch (e) {
          console.error("[DraftUI] Simulation failed:", e);
          setSimulating(false);
        }
      }, 300);
      return;
    }

    setActiveTurn(activeTurn === "A" ? "B" : "A");
  }, [session, activeUserId, activeTurn, onMatchReady]);

  const handlePass = useCallback(() => {
    const result = session.pass(activeUserId);
    if (result.success) {
      setSession(result.session);
      setActiveTurn(activeTurn === "A" ? "B" : "A");
    }
  }, [session, activeUserId, activeTurn]);

  // ── Simulating overlay ─────────────────────────────────────────────────────

  if (simulating) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏏</div>
          <h2 className="text-2xl font-bold">Simulating Match…</h2>
          <p className="text-slate-400 mt-2">Calculating ball by ball…</p>
        </div>
      </div>
    );
  }

  // ── Draft UI ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="font-bold text-white">
            Round {activeParticipant.getRoundNumber()} / {activeParticipant.getTotalRounds()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {player1}: {session.participantA.pickedCount()}/11
            &nbsp;|&nbsp;
            {player2}: {session.participantB.pickedCount()}/11
          </div>
        </div>
        <div className="text-sm font-semibold text-green-400">
          {activeName}'s Pick
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">

        {/* Active player's round */}
        <div className="flex-1">
          {currentRound && (
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{COUNTRY_FLAG[currentRound.country] ?? "🌍"}</div>
              <div>
                <h2 className="font-bold text-xl">{currentRound.country}</h2>
                <div className="text-xs text-slate-500">
                  {ROUND_COMPOSITION_LABEL(currentRound.composition)}
                </div>
              </div>
              <div className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1">
                {activeName}'s round
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((opt) => (
              <PlayerCard
                key={opt.player.id}
                option={opt}
                onPick={(pos) => {
                  const all = opt.eligiblePositions;
                  if (all.length <= 1) {
                    confirmPick(opt.player, all[0] ?? pos);
                  } else {
                    setPositionPicker({ player: opt.player, options: [...all] });
                  }
                }}
              />
            ))}
          </div>

          <button
            onClick={handlePass}
            className="mt-4 w-full rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 py-2 text-sm transition-colors"
          >
            Skip this round (Pass)
          </button>
        </div>

        {/* Squad panels */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          <SquadPanel participant={session.participantA} name={player1} isActive={activeTurn === "A"} />
          <SquadPanel participant={session.participantB} name={player2} isActive={activeTurn === "B"} />
        </div>
      </div>

      {/* Position picker modal */}
      {positionPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">Choose batting position</h3>
            <p className="text-slate-400 text-sm mb-4">{positionPicker.player.name}</p>
            <div className="grid grid-cols-4 gap-2">
              {positionPicker.options.map((pos) => (
                <button
                  key={pos.getValue()}
                  onClick={() => confirmPick(positionPicker.player, pos)}
                  className="rounded-lg bg-slate-700 hover:bg-green-600 py-3 font-bold text-lg transition-colors"
                >
                  #{pos.getValue()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPositionPicker(null)}
              className="mt-4 w-full text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
