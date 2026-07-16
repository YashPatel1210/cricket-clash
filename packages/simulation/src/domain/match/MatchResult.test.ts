import { describe, expect, it } from "vitest";

import { TeamBuilder, InningsBuilder } from "../../test";
import { InningsResult } from "./innings";
import { MatchResult } from "./MatchResult";
import { Scorecard } from "./scorecard/Scorecard";

function makeInningsResult() {
  return new InningsResult(InningsBuilder.standard().build(), []);
}

function makeScorecard(
  first: InningsResult,
  second: InningsResult,
  winner = TeamBuilder.standard().build(),
): Scorecard {
  return new Scorecard(
    undefined,
    first,
    second,
    first.getInnings().getStatistics(),
    second.getInnings().getStatistics(),
    winner,
  );
}

describe("MatchResult", () => {
  it("should create a match result", () => {
    const first = makeInningsResult();
    const second = makeInningsResult();
    const scorecard = makeScorecard(first, second);
    const result = new MatchResult(first, second, TeamBuilder.standard().build(), scorecard);
    expect(result).toBeDefined();
  });

  it("should expose the first innings", () => {
    const first = makeInningsResult();
    const second = makeInningsResult();
    const result = new MatchResult(
      first,
      second,
      TeamBuilder.standard().build(),
      makeScorecard(first, second),
    );
    expect(result.getFirstInnings()).toBe(first);
  });

  it("should expose the second innings", () => {
    const first = makeInningsResult();
    const second = makeInningsResult();
    const result = new MatchResult(
      first,
      second,
      TeamBuilder.standard().build(),
      makeScorecard(first, second),
    );
    expect(result.getSecondInnings()).toBe(second);
  });

  it("should expose the winner", () => {
    const winner = TeamBuilder.standard().build();
    const first = makeInningsResult();
    const second = makeInningsResult();
    const result = new MatchResult(
      first,
      second,
      winner,
      makeScorecard(first, second, winner),
    );
    expect(result.getWinner()).toBe(winner);
  });

  it("should expose the scorecard", () => {
    const first = makeInningsResult();
    const second = makeInningsResult();
    const scorecard = makeScorecard(first, second);
    const result = new MatchResult(
      first,
      second,
      TeamBuilder.standard().build(),
      scorecard,
    );
    expect(result.getScorecard()).toBe(scorecard);
  });
});
