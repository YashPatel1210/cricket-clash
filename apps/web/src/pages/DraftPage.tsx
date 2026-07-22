import { useState, useCallback } from "react";
import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";
import type { DraftSession } from "@cricket-clash/simulation/domain/draft/DraftSession";
import { DraftSessionStatus } from "@cricket-clash/simulation/domain/draft/DraftSessionStatus";
import type { BattingPosition } from "@cricket-clash/simulation/domain/draft/BattingPosition";
import type { Player } from "@cricket-clash/simulation/domain/player/Player";

import { createDraftSession, simulateMatchFromDraft } from "../services/GameService";
import { PlayerCard } from "../components/PlayerCard";
import { SquadPanel } from "../components/SquadPanel";

const ROUND_COMPOSITION_LABEL = (comp: { batters: number; allRounders: number; bowlers: number; wicketKeepers: number }) =>
  `${comp.batters}B  ${comp.allRounders}AR  ${comp.bowlers}BOW  ${comp.wicketKeepers}WK`;

const COUNTRY_FLAG: Record<string, string> = {
  "India":"🇮🇳","Australia":"🇦🇺","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Pakistan":"🇵🇰",
  "South Africa":"🇿🇦","New Zealand":"🇳🇿","Bangladesh":"🇧🇩","Afghanistan":"🇦🇫","Ireland":"🇮🇪",
};

interface Props {
  player1: string;
  player2: string;
  onMatchReady: (result: MatchResult) => void;
  onBack: () => void;
}

export default function DraftPage({ player1, player2, onMatchReady, onBack }: Props) {
  // Each player gets their own draft session state
  const [session, setSession] = useState<DraftSession>(() =>
    createDraftSession(player1, player2, Date.now())
  );

  // Turn tracking: whose turn is it on this shared device?
  const [activeTurn, setActiveTurn] = useState<"A" | "B">("A");
  const [simulating, setSimulating] = useState(false);
  const [positionPicker, setPositionPicker] = useState<{
    player: Player; options: BattingPosition[];
  } | null>(null);

  const activeParticipant = activeTurn === "A" ? session.participantA : session.participantB;
  const otherParticipant  = activeTurn === "A" ? session.participantB : session.participantA;
  const activeName = activeTurn === "A" ? player1 : player2;

  const currentRound = activeParticipant.getCurrentRound();
  const options      = session.getOptionsFor(activeTurn === "A" ? session.participantA.userId : session.participantB.userId);

  // ── Pick handler ────────────────────────────────────────────────────────────

  const handleCardTap = useCallback((player: Player, positions: BattingPosition[]) => {
    if (positions.length === 1) {
      // Auto-assign if only one valid position
      confirmPick(player, positions[0]);
    } else {
      setPositionPicker({ player, options: positions });
    }
  }, [session, activeTurn]);

  const confirmPick = useCallback((player: Player, position: BattingPosition) => {
    setPositionPicker(null);
    const userId = activeTurn === "A" ? session.participantA.userId : session.participantB.userId;
    const result = session.pick(userId, player, position);

    if (result.success) {
      const updated = result.session;
      setSession(updated);

      if (updated.status === DraftSessionStatus.COMPLETED) {
        // Both squads done — simulate!
        setSimulating(true);
        setTimeout(() => {
          const matchResult = simulateMatchFromDraft(updated, Date.now());
          onMatchReady(matchResult);
        }, 200);
        return;
      }

      // Switch turn: A picked → now B's turn, or B picked → advance session (already done) → A's turn
      if (activeTurn === "A") {
        // If B already picked this round (shouldn't happen in turn-based), round already advanced
        // In turn-based: A picks → now B's turn
        if (!updated.participantA.hasMadePickThisRound || updated.currentRoundIndex !== session.currentRoundIndex) {
          setActiveTurn("B");
        } else {
          setActiveTurn("B");
        }
      } else {
        // B just picked → round advanced → A's turn
        setActiveTurn("A");
      }
    }
  }, [session, activeTurn, onMatchReady]);

  const handlePass = useCallback(() => {
    const userId = activeTurn === "A" ? session.participantA.userId : session.participantB.userId;
    const result = session.pass(userId);
    if (result.success) {
      setSession(result.session);
      setActiveTurn(activeTurn === "A" ? "B" : "A");
    }
  }, [session, activeTurn]);

  if (simulating) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏏</div>
          <h2 className="text-2xl font-bold text-white">Simulating Match…</h2>
          <p className="text-slate-400 mt-2">Calculating ball by ball…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ── */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-500 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <div className="text-center">
          <div className="font-bold text-white">
            Round {activeParticipant.getRoundNumber()} / {activeParticipant.getTotalRounds()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {player1}: {session.participantA.pickedCount()}/11 &nbsp;|&nbsp; {player2}: {session.participantB.pickedCount()}/11
          </div>
        </div>
        <div className="text-sm font-semibold text-green-400">
          {activeName}'s Pick
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">

        {/* ── Active player's round (main panel) ── */}
        <div className="flex-1">
          {/* Round header */}
          {currentRound && (
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{COUNTRY_FLAG[currentRound.country] ?? "🌍"}</div>
              <div>
                <h2 className="font-bold text-xl text-white">{currentRound.country}</h2>
                <div className="text-xs text-slate-500">
                  {ROUND_COMPOSITION_LABEL(currentRound.composition)}
                </div>
              </div>
              <div className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1">
                {activeName}'s round
              </div>
            </div>
          )}

          {/* Player grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((opt) => (
              <PlayerCard
                key={opt.player.id}
                option={opt}
                onPick={(pos) => {
                  const positions = opt.eligiblePositions;
                  if (positions.length <= 1) {
                    confirmPick(opt.player, pos);
                  } else {
                    setPositionPicker({ player: opt.player, options: [...positions] });
                  }
                }}
              />
            ))}
          </div>

          {/* Pass button */}
          <button
            onClick={handlePass}
            className="mt-4 w-full rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 py-2 text-sm transition-colors"
          >
            Skip this round (Pass)
          </button>
        </div>

        {/* ── Squad panels ── */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          <SquadPanel participant={session.participantA} name={player1} isActive={activeTurn === "A"} />
          <SquadPanel participant={session.participantB} name={player2} isActive={activeTurn === "B"} />
        </div>
      </div>

      {/* ── Position picker modal ── */}
      {positionPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-white text-lg mb-1">Choose batting position</h3>
            <p className="text-slate-400 text-sm mb-4">
              {positionPicker.player.name}
            </p>
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
