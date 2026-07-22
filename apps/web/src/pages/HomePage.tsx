import { useState } from "react";

interface Props {
  onStart: (player1: string, player2: string) => void;
}

export default function HomePage({ onStart }: Props) {
  const [p1, setP1] = useState("Player 1");
  const [p2, setP2] = useState("Player 2");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md w-full px-6">

        {/* Logo */}
        <div className="text-7xl mb-4">🏏</div>
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          Cricket Clash
        </h1>
        <p className="mt-3 text-slate-400 text-lg">
          Draft your squad. Simulate the match. Claim the trophy.
        </p>

        {/* Player names */}
        <div className="mt-10 space-y-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Player 1
            </label>
            <input
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter name"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Player 2
            </label>
            <input
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter name"
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onStart(p1.trim() || "Player 1", p2.trim() || "Player 2")}
          className="mt-8 w-full rounded-xl bg-green-500 hover:bg-green-400 active:bg-green-600 px-8 py-4 text-lg font-bold text-slate-950 transition-colors shadow-lg shadow-green-900/40"
        >
          Start Draft →
        </button>

        {/* Info pills */}
        <div className="mt-8 flex justify-center gap-3 flex-wrap text-xs text-slate-500">
          <span className="bg-slate-800 rounded-full px-3 py-1">⚡ T20 Format</span>
          <span className="bg-slate-800 rounded-full px-3 py-1">🌍 Real Players</span>
          <span className="bg-slate-800 rounded-full px-3 py-1">🎯 AI Simulation</span>
          <span className="bg-slate-800 rounded-full px-3 py-1">🏆 2-Player Draft</span>
        </div>
      </div>
    </div>
  );
}
