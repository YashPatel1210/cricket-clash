import { RandomGenerator } from "../../infrastructure/random";
import { MatchContextFactory } from "../../domain/match/context/MatchContextFactory";
import { DeliveryGenerator } from "../../domain/match/delivery/DeliveryGenerator";
import { DefaultBatterIntentResolver } from "../../domain/match/intent/DefaultBatterIntentResolver";
import { DefaultBowlerIntentResolver } from "../../domain/match/intent/DefaultBowlerIntentResolver";
import { IntentEngine } from "../../domain/match/intent/IntentEngine";
import { MatchConditions } from "../../domain/match/conditions/MatchConditions";
import { PitchType } from "../../domain/match/conditions/PitchType";
import { WeatherCondition } from "../../domain/match/conditions/WeatherCondition";
import { Stadium } from "../../domain/match/conditions/Stadium";
import { T20Configuration } from "../../domain/match/configuration/T20Configuration";
import { DefaultProbabilityEngineFactory } from "../../domain/simulation/probability/DefaultProbabilityEngineFactory";

/**
 * Creates a fully wired DeliveryGenerator for use in unit tests.
 *
 * Uses T20 / FLAT / SUNNY defaults as the test context.
 */
export function createTestDeliveryGenerator(seed: number): DeliveryGenerator {
  const random = new RandomGenerator(seed);
  const config = new T20Configuration();
  const conditions = new MatchConditions(
    PitchType.FLAT,
    WeatherCondition.SUNNY,
    new Stadium("Test Ground"),
  );

  return new DeliveryGenerator(
    random,
    new MatchContextFactory(config, conditions),
    new IntentEngine(
      new DefaultBatterIntentResolver(),
      new DefaultBowlerIntentResolver(),
    ),
    DefaultProbabilityEngineFactory.create(),
  );
}
