# Gameplay Loop

Version: 1.0

Status: Approved

---

# Purpose

This document defines the complete player journey from matchmaking until the final result.

Every feature added to Cricket Clash should fit naturally into this gameplay loop.

---

# Gameplay Philosophy

The gameplay is divided into three phases:

1. Preparation
2. Simulation
3. Analysis

The player spends most of their time making strategic decisions before the match begins.

The simulation rewards those decisions.

---

# Complete Match Flow

```text
Find Match

↓

Generate Shared Match Environment

↓

Display Match Preview

↓

Independent Draft

↓

Select Captain

↓

Arrange Batting Order

↓

Generate Draft Quality

↓

Toss

↓

Captain AI chooses Batting/Bowling

↓

Ball-by-Ball Simulation

↓

Match Story

↓

Scorecard

↓

Statistics

↓

Return to Lobby
```

---

# Phase 1 – Preparation

Player decisions:

- Draft players
- Build balanced Playing XI
- Select Captain
- Arrange batting order

The player cannot influence the match once the simulation begins.

This makes preparation the most important phase of the game.

---

# Phase 2 – Simulation

The simulation engine controls:

- Toss
- Bowling changes
- Match tactics
- Trait activation
- Confidence
- Momentum

The player becomes a spectator.

This ensures fairness and prevents mid-match exploits.

---

# Phase 3 – Analysis

After every match the player receives:

- Full Scorecard
- Match Story
- Turning Point
- Player of the Match
- Best Partnership
- Best Bowling Spell
- Win Probability Timeline (Future)

This phase helps players improve future drafting decisions.

---

# Design Decisions

## Accepted

- Independent Draft
- Shared Match Environment
- AI-controlled bowling
- Manual batting order
- Watch Live or Skip Match

---

# Alternatives Considered

## Live Player Control

Rejected.

Reason:

Cricket Clash is a strategy game, not an action game.

---

# Future Extensions

- Live tournaments
- Spectator mode
- AI commentary
- Match replay
- Tournament statistics

---

# Success Criteria

A player should complete one full match within a few minutes while feeling that every pre-match decision had a meaningful impact on the result.