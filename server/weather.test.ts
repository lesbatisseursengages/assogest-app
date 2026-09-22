import { describe, expect, it, vi } from "vitest";
import { getWeatherForecast } from "./weather";

describe("Open-Meteo weather service", () => {
  it("normalizes current conditions and seven daily forecasts", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toContain("latitude=12.1348");
      expect(url).toContain("forecast_days=7");
      return new Response(JSON.stringify({
        timezone: "Africa/Ndjamena",
        current: { temperature_2m: 31, relative_humidity_2m: 48, apparent_temperature: 34, rain: 0, wind_speed_10m: 18 },
        daily: {
          time: ["2026-09-22", "2026-09-23"],
          weather_code: [1, 80],
          temperature_2m_max: [36, 34],
          temperature_2m_min: [24, 23],
          rain_sum: [0, 4.2],
          precipitation_probability_max: [5, 70],
          wind_speed_10m_max: [24, 28],
        },
      }), { status: 200 });
    });

    const result = await getWeatherForecast({ latitude: 12.1348, longitude: 15.0557, label: "N’Djamena, Tchad" }, fetchMock as unknown as typeof fetch);
    expect(result.location).toBe("N’Djamena, Tchad");
    expect(result.current?.temperature_2m).toBe(31);
    expect(result.daily).toHaveLength(2);
    expect(result.daily[1]).toMatchObject({ date: "2026-09-23", rain: 4.2, precipitationProbability: 70 });
  });

  it("returns a useful error when Open-Meteo is unavailable", async () => {
    const fetchMock = vi.fn(async () => new Response("upstream error", { status: 503 }));
    await expect(getWeatherForecast(undefined, fetchMock as unknown as typeof fetch)).rejects.toThrow("HTTP 503");
  });
});
