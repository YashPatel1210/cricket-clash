import { useState, Component } from "react";
import type { ReactNode } from "react";
import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";

import HomePage      from "./pages/HomePage";
import DraftPage     from "./pages/DraftPage";
import MatchPage     from "./pages/MatchPage";
import ScorecardPage from "./pages/ScorecardPage";
import RoomPage      from "./pages/RoomPage";

// ── Error boundary ─────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-4">{this.state.error.message}</p>
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-auto max-h-64">
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Screen state machine ───────────────────────────────────────────────────────

type Screen =
  | { id: "home" }
  | { id: "draft"; player1: string; player2: string }
  | { id: "room"; roomCode: string; accessToken: string }
  | { id: "match"; result: MatchResult; player1: string; player2: string }
  | { id: "scorecard"; result: MatchResult; player1: string; player2: string };

function AppContent() {
  const [screen, setScreen] = useState<Screen>({ id: "home" });

  if (screen.id === "home") {
    return (
      <HomePage
        onRoomReady={(roomCode, accessToken) => setScreen({ id: "room", roomCode, accessToken })}
      />
    );
  }

  if (screen.id === "draft") {
    return (
      <DraftPage
        player1={screen.player1}
        player2={screen.player2}
        onMatchReady={(result) =>
          setScreen({ id: "match", result, player1: screen.player1, player2: screen.player2 })
        }
        onBack={() => setScreen({ id: "home" })}
      />
    );
  }

  if (screen.id === "room") {
    return <RoomPage roomCode={screen.roomCode} accessToken={screen.accessToken} onLeave={() => setScreen({ id: "home" })} />;
  }

  if (screen.id === "match") {
    return (
      <MatchPage
        result={screen.result}
        player1={screen.player1}
        player2={screen.player2}
        onFinished={() =>
          setScreen({ id: "scorecard", result: screen.result, player1: screen.player1, player2: screen.player2 })
        }
      />
    );
  }

  return (
    <ScorecardPage
      result={screen.result}
      player1={screen.player1}
      player2={screen.player2}
      onPlayAgain={() => setScreen({ id: "home" })}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
