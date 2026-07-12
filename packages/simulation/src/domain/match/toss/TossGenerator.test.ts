import { describe, expect, it } from "vitest";

import { RandomGenerator } from "../../../infrastructure/random";
import { MatchBuilder } from "../../../test";

import { TossDecision } from "./TossDecision";
import { TossGenerator } from "./TossGenerator";

describe("TossGenerator", () => {
  it("should generate a toss", () => {
    // Arrange

    const match = MatchBuilder.standard().build();

    const generator = new TossGenerator(new RandomGenerator(42));

    // Act

    const toss = generator.generate(match);

    // Assert

    expect(toss).toBeDefined();
  });

  it("should select one of the participating teams", () => {
    // Arrange

    const match = MatchBuilder.standard().build();

    const generator = new TossGenerator(new RandomGenerator(42));

    // Act

    const toss = generator.generate(match);

    // Assert

    expect([match.getTeamA(), match.getTeamB()]).toContain(toss.getWinner());
  });

  it("should generate a valid toss decision", () => {
    // Arrange

    const match = MatchBuilder.standard().build();

    const generator = new TossGenerator(new RandomGenerator(42));

    // Act

    const toss = generator.generate(match);

    // Assert

    expect([TossDecision.BAT, TossDecision.BOWL]).toContain(toss.getDecision());
  });

  it("should generate deterministic tosses for the same seed", () => {
    // Arrange
    const match = MatchBuilder.standard().build();

    const firstGenerator = new TossGenerator(new RandomGenerator(42));

    const secondGenerator = new TossGenerator(new RandomGenerator(42));

    const first = firstGenerator.generate(match);
    const second = secondGenerator.generate(match);

    expect(first.getWinner()).toBe(second.getWinner());
    expect(first.getDecision()).toBe(second.getDecision());
  });

  it("should generate different tosses for different seeds", () => {
    // Arrange

    const firstMatch = MatchBuilder.standard().build();

    const secondMatch = MatchBuilder.standard().build();

    const firstGenerator = new TossGenerator(new RandomGenerator(42));

    const secondGenerator = new TossGenerator(new RandomGenerator(100));

    // Act

    const first = firstGenerator.generate(firstMatch);

    const second = secondGenerator.generate(secondMatch);

    // Assert

    expect(
      first.getWinner() !== second.getWinner() ||
        first.getDecision() !== second.getDecision(),
    ).toBe(true);
  });
});
