import { useState } from "react";
import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";
import type { DraftSession } from "@cricket-clash/simulation/domain/draft/DraftSession";

import HomePage      from "./pages/HomePage";
import DraftPage     from "./pages/DraftPage";
import MatchPage     from "./pages/MatchPage";
import ScorecardPage from "./pages/ScorecardPage";

// ── Screen state machine ───────────────────────────────────────────────────────

type Screen =
  | { id: "home" }
  | { id: "draft"; player1: string; player2: string }
  | { id: "match"; result: MatchResult; player1: string; player2: string }
  | { id: "scorecard"; result: MatchResult; player1: string; player2: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ id: "home" });

  if (screen.id === "home") {
    return (
      <HomePage
        onStart={(p1, p2) => setScreen({ id: "draft", player1: p1, player2: p2 })}
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
