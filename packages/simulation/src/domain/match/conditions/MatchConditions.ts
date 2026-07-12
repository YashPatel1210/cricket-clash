import { PitchType } from "./PitchType";
import { Stadium } from "./Stadium";
import { WeatherCondition } from "./WeatherCondition";

export class MatchConditions {
  public constructor(
    private readonly pitch: PitchType,
    private readonly weather: WeatherCondition,
    private readonly stadium: Stadium,
  ) {}

  public getPitch(): PitchType {
    return this.pitch;
  }

  public getWeather(): WeatherCondition {
    return this.weather;
  }

  public getStadium(): Stadium {
    return this.stadium;
  }
}
