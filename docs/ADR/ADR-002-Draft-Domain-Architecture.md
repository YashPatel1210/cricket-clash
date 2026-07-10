# ADR-002

## Title

Draft Domain Architecture

## Status

Accepted

## Decision

The draft system is modeled using the following hierarchy:

Draft
 ├── DraftRound
 │     └── PlayingXI
 │            └── DraftOption
 │                   └── Player

Draft owns the lifecycle.

DraftRound records one completed spin.

PlayingXI represents the generated eleven.

DraftOption represents one selectable card.

Player remains immutable and reusable.

## Consequences

Pros

- Replay support
- Analytics
- Clear separation of responsibilities
- Easy to extend

Cons

- More classes
- Slightly more boilerplate