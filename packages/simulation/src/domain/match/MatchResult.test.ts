import { describe, expect, it } from "vitest";

import { TeamBuilder } from "../../test";
import { InningsResult } from "./innings";
import { InningsBuilder } from "../../test";
import { MatchResult } from "./MatchResult";

describe("MatchResult", () => {
  it("should create a match result", () => {
    const result = new MatchResult(
      new InningsResult(InningsBuilder.standard().build(), []),
      new InningsResult(InningsBuilder.standard().build(), []),
      TeamBuilder.standard().build(),
    );

    expect(result).toBeDefined();
  });

  it("should expose the first innings", () => {
    const first = new InningsResult(InningsBuilder.standard().build(), []);

    const result = new MatchResult(
      first,
      new InningsResult(InningsBuilder.standard().build(), []),
      TeamBuilder.standard().build(),
    );

    expect(result.getFirstInnings()).toBe(first);
  });

  it("should expose the second innings", () => {
    const second = new InningsResult(InningsBuilder.standard().build(), []);

    const result = new MatchResult(
      new InningsResult(InningsBuilder.standard().build(), []),
      second,
      TeamBuilder.standard().build(),
    );

    expect(result.getSecondInnings()).toBe(second);
  });

  it("should expose the winner", () => {
    const winner = TeamBuilder.standard().build();

    const result = new MatchResult(
      new InningsResult(InningsBuilder.standard().build(), []),
      new InningsResult(InningsBuilder.standard().build(), []),
      winner,
    );

    expect(result.getWinner()).toBe(winner);
  });
});
