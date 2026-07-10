# Draft System

Version: 1.0

Status: Draft

Owner: Cricket Clash

Related Documents:
- GDD/00-Vision.md
- GDD/01-Gameplay-Loop.md
- GDD/02-Match-Environment.md
- CC-ADR-001 Independent Draft
- CC-ADR-002 Weighted Randomness

---

# Purpose

The Draft System is the primary strategic phase of Cricket Clash.

Players build their Playing XI by selecting one player from a series of generated Draft Packs.

Unlike traditional fantasy cricket games, drafting itself is designed to be a competitive strategic experience.

---

# Core Philosophy

Winning should begin during the draft.

The match simulation should reward good drafting decisions rather than compensate for poor ones.

---

# Independent Draft

Each player receives their own Draft Packs.

Players never steal players from their opponent.

Both players may select the same cricketer.

Different match outcomes arise from:

- Daily Form
- Captain Selection
- Batting Order
- Traits
- Confidence
- Match Conditions
- Simulation Decisions

---

# Draft Pack

A Draft Pack represents one realistic Playing XI.

Each Draft Pack should resemble a genuine international cricket team.

Example composition:

- 1–3 Wicket Keepers
- 4–6 Batsmen
- 2–3 All Rounders
- 3–5 Bowlers

A Draft Pack should never contain an unrealistic team composition.

---

# Previously Selected Players

Previously drafted players may appear again.

However:

- Already selected players are disabled.
- They remain visible.
- Players must choose another available player.

This preserves randomness while preventing duplicate selections.

---

# Role Limits

Playing XI must satisfy minimum and maximum role constraints.

Initial values (subject to balancing):

WK
Minimum 1
Maximum 2

BAT
Minimum 3
Maximum 6

AR
Minimum 1
Maximum 4

BOWL
Minimum 3
Maximum 6

These values will be configurable.

---

# Weighted Randomness

The Draft Director AI continuously evaluates:

- Draft Progress
- Missing Roles
- Team Balance
- Draft Quality
- Remaining Picks

Weighted Randomness should only influence probability.

It should never guarantee elite players.

The player should never feel that the game is helping them.

---

# Draft Progress

The Draft Director should avoid overreacting during the early draft.

During the first few selections, randomness should dominate.

As the draft progresses, the engine gradually gives more weight to:

- Missing roles
- Team balance
- Overall draft quality

This ensures fairness without making the draft predictable.

---

# Draft Quality

The game calculates an internal Draft Quality score.

Factors include:

- Overall ratings
- Current form
- Role balance
- Captain compatibility
- Squad balance

Draft Quality influences Weighted Randomness but never determines match results directly.

---

# Match Environment Influence

Draft Packs are influenced by the generated Match Environment.

Example:

Green Pitch

↓

Higher probability of quality fast bowlers.

Dusty Pitch

↓

Higher probability of quality spinners.

Flat Pitch

↓

Greater batting depth.

The Draft Director adapts probabilities without guaranteeing outcomes.

---

# User Decisions

During drafting the player chooses:

- Which player to draft
- Captain
- Batting order

The player does NOT control:

- Bowling rotation
- Field settings
- Match tactics

These are handled by Captain AI.

---

# Alternatives Considered

## Shared Draft

Rejected.

Reason:

Players may feel that desired players were stolen by the opponent.

This creates frustration rather than strategic satisfaction.

---

# Success Criteria

Players should finish the draft believing:

"I built the strongest possible team using the options I was given."

The draft should feel:

- Fair
- Strategic
- Replayable
- Different every match

---

# Future Extensions

- Ban Phase
- Tournament Draft Rules
- Franchise Draft Pools
- Historic Teams
- Custom Player Pools
- Limited-Time Events





<<<<<<<<<<<New Draft After sprint 4>>>>>>>>>>>
# 03 - Draft System

## Purpose

The Draft System is the core gameplay mechanic of Cricket Clash.

Instead of selecting an entire squad from a player database, players build their team through multiple draft rounds. Every decision should feel meaningful and create different team combinations.

---

# Draft Overview

Each player participates in an independent draft.

Player A and Player B never compete for the same draft players.

This avoids frustration while still allowing both users to create unique teams.

---

# Draft Flow

Draft begins

↓

Generate Playing XI

↓

Player selects ONE player

↓

Selected player added to team

↓

Generate next Playing XI

↓

Repeat until team complete

---

# Number of Draft Rounds

Each player receives:

- 12 draft opportunities
- Final team size = 11 players

This allows one skipped draft if desired.

---

# Playing XI Generation

Each draft presents a complete Playing XI.

A Playing XI contains:

- Batters
- Bowlers
- All Rounders
- Wicket Keepers

The Playing XI should resemble a realistic cricket team.

Example:

5 Batters

3 Bowlers

2 All Rounders

1 Wicket Keeper

The country is selected randomly.

---

# Duplicate Players

A player already selected cannot be selected again.

If the same player appears in a future Playing XI:

- Player remains visible
- Selection is disabled
- User must choose another player

---

# Role Limits

The draft respects Team Rules.

Current limits:

| Role | Min | Max |
|------|----:|----:|
| Batter | 3 | 5 |
| Bowler | 3 | 5 |
| All Rounder | 1 | 3 |
| Wicket Keeper | 1 | 3 |

The UI should disable players that would violate these rules.

---

# Batting Order

When selecting a player, the user immediately assigns:

- Batting Position

This becomes part of Team Selection.

---

# Captain

Once the team reaches eleven players,

the player chooses:

- Captain

Captain affects match strategy during simulation.

---

# Wicket Keeper

The user selects exactly one wicket keeper from the drafted players.

---

# Goals

The draft should feel:

- Random
- Fair
- Strategic
- Replayable

Every draft should produce a different team.