const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

export type WeatherCoordinates = {
  latitude: number;
  longitude: number;
  label?: string;
};

type OpenMeteoResponse = {
  timezone: string;
  current?: {
    time: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    rain?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    rain_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
  };
};

export const NDJAMENA_WEATHER: Required<WeatherCoordinates> = {
  latitude: 12.1348,
  longitude: 15.0557,
  label: "N’Djamena, Tchad",
};

export async function getWeatherForecast(
  coordinates: WeatherCoordinates = NDJAMENA_WEATHER,
  fetchImpl: typeof fetch = fetch,
) {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,rain,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,wind_speed_10m_max",
    forecast_days: "7",
    timezone: "Africa/Ndjamena",
  });
  const response = await fetchImpl(`${OPEN_METEO_ENDPOINT}?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Open-Meteo a refusé la requête (HTTP ${response.status}).`);
  }
  const payload = (await response.json()) as OpenMeteoResponse;
  if (!payload.daily?.time?.length) {
    throw new Error("Open-Meteo n’a retourné aucune prévision exploitable.");
  }
  return {
    location: coordinates.label ?? `${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`,
    timezone: payload.timezone,
    current: payload.current ?? null,
    daily: payload.daily.time.map((date, index) => ({
      date,
      weatherCode: payload.daily?.weather_code?.[index] ?? null,
      max: payload.daily?.temperature_2m_max?.[index] ?? null,
      min: payload.daily?.temperature_2m_min?.[index] ?? null,
      rain: payload.daily?.rain_sum?.[index] ?? null,
      precipitationProbability: payload.daily?.precipitation_probability_max?.[index] ?? null,
      windMax: payload.daily?.wind_speed_10m_max?.[index] ?? null,
    })),
  };
}
