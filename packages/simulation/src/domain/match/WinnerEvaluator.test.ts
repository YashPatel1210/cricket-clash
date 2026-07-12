import { describe, expect, it } from "vitest";
import { TeamBuilder } from "../../test";
import { InningsBuilder } from "../../test";
import { InningsResult } from "./innings";
import { WinnerEvaluator } from "./WinnerEvaluator";

describe("WinnerEvaluator", () => {
  it("should declare the chasing team as the winner", () => {
    const firstTeam = TeamBuilder.standard().build();
    const secondTeam = TeamBuilder.standard().build();

    const first = new InningsResult(
      InningsBuilder.standard()
        .withBattingTeam(firstTeam)
        .withScore(150, 8, 120)
        .build(),
      [],
    );

    const second = new InningsResult(
      InningsBuilder.standard()
        .withBattingTeam(secondTeam)
        .withScore(151, 3, 100)
        .build(),
      [],
    );

    const evaluator = new WinnerEvaluator();

    expect(evaluator.evaluate(first, second)).toBe(secondTeam);
  });

  it("should declare the defending team as the winner", () => {
    const firstTeam = TeamBuilder.standard().build();
    const secondTeam = TeamBuilder.standard().build();

    const first = new InningsResult(
      InningsBuilder.standard()
        .withBattingTeam(firstTeam)
        .withScore(175, 5, 120)
        .build(),
      [],
    );

    const second = new InningsResult(
      InningsBuilder.standard()
        .withBattingTeam(secondTeam)
        .withScore(170, 8, 120)
        .build(),
      [],
    );

    const evaluator = new WinnerEvaluator();

    expect(evaluator.evaluate(first, second)).toBe(firstTeam);
  });

  it("should return undefined for a tie", () => {
    const firstTeam = TeamBuilder.standard().build();
    const secondTeam = TeamBuilder.standard().build();

    const first = new InningsResult(
      InningsBuilder.standard()
        .withBattingTeam(firstTeam)
        .withScore(165, 7, 120)
        .build(),
      [],
    );

    const second = new InningsResult(
      InningsBuilder.standard()
        .withBattingTeam(secondTeam)
        .withScore(165, 9, 120)
        .build(),
      [],
    );

    const evaluator = new WinnerEvaluator();

    expect(evaluator.evaluate(first, second)).toBeUndefined();
  });
});
