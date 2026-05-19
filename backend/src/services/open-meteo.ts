import type { CityResult, ForecastDay, WeatherForecast } from "../types/weather"

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"
const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"
const DEFAULT_TIMEOUT_MS = 8_000

export class OpenMeteoError extends Error {
  constructor(
    message: string,
    public readonly kind: "external" | "unavailable",
  ) {
    super(message)
    this.name = "OpenMeteoError"
  }
}

type SearchCitiesInput = {
  query: string
  language: "pt"
}

type GetForecastInput = {
  latitude: number
  longitude: number
  timezone?: string
}

export async function searchCities(input: SearchCitiesInput): Promise<CityResult[]> {
  const url = new URL(GEOCODING_API_URL)
  url.searchParams.set("name", input.query)
  url.searchParams.set("language", input.language)
  url.searchParams.set("count", "10")
  url.searchParams.set("format", "json")

  const payload = await fetchJson(url)

  return normalizeCities(payload)
}

export async function getForecast(
  input: GetForecastInput,
): Promise<WeatherForecast> {
  const url = new URL(FORECAST_API_URL)
  url.searchParams.set("latitude", String(input.latitude))
  url.searchParams.set("longitude", String(input.longitude))
  url.searchParams.set("timezone", input.timezone ?? "auto")
  url.searchParams.set("forecast_days", "5")
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,wind_speed_10m,precipitation",
  )
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
  )

  const payload = await fetchJson(url)

  return normalizeForecast(payload)
}

export function normalizeCities(payload: unknown): CityResult[] {
  if (!isRecord(payload)) {
    throw invalidExternalResponse()
  }

  if (payload.results === undefined) {
    return []
  }

  if (!Array.isArray(payload.results)) {
    throw invalidExternalResponse()
  }

  return payload.results.map((item) => {
    if (!isRecord(item)) {
      throw invalidExternalResponse()
    }

    const id = numberField(item.id)
    const name = stringField(item.name)
    const country = stringField(item.country)
    const latitude = numberField(item.latitude)
    const longitude = numberField(item.longitude)
    const region = optionalStringField(item.admin1 ?? item.state ?? item.admin2)
    const timezone = optionalStringField(item.timezone)

    return {
      id,
      name,
      country,
      ...(region ? { region } : {}),
      latitude,
      longitude,
      ...(timezone ? { timezone } : {}),
    }
  })
}

export function normalizeForecast(payload: unknown): WeatherForecast {
  if (!isRecord(payload) || !isRecord(payload.daily) || !isRecord(payload.current)) {
    throw invalidExternalResponse()
  }

  const latitude = numberField(payload.latitude)
  const longitude = numberField(payload.longitude)
  const timezone = stringField(payload.timezone)
  const daily = normalizeDailyForecast(payload.daily)
  const current = normalizeCurrentForecast(payload.current, daily[0])

  return {
    latitude,
    longitude,
    timezone,
    current,
    daily,
  }
}

export function weatherDescriptionFromCode(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Condicao meteorologica indisponivel"
}

async function fetchJson(
  url: URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new OpenMeteoError("Open-Meteo retornou erro.", "external")
    }

    return await response.json()
  } catch (error) {
    if (error instanceof OpenMeteoError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OpenMeteoError("Open-Meteo demorou para responder.", "unavailable")
    }

    throw new OpenMeteoError("Open-Meteo indisponivel.", "unavailable")
  } finally {
    clearTimeout(timeoutId)
  }
}

function normalizeDailyForecast(daily: Record<string, unknown>): ForecastDay[] {
  const time = arrayField(daily.time)
  const weatherCode = arrayField(daily.weather_code)
  const maxTemperature = arrayField(daily.temperature_2m_max)
  const minTemperature = arrayField(daily.temperature_2m_min)
  const precipitation = arrayField(daily.precipitation_sum)
  const precipitationProbability = optionalArrayField(
    daily.precipitation_probability_max,
  )
  const wind = arrayField(daily.wind_speed_10m_max)

  if (time.length === 0) {
    throw invalidExternalResponse()
  }

  return time.map((date, index) => {
    const code = numberField(weatherCode[index])

    return {
      date: stringField(date),
      minTemperatureC: numberField(minTemperature[index]),
      maxTemperatureC: numberField(maxTemperature[index]),
      precipitationMm: numberField(precipitation[index]),
      ...(precipitationProbability
        ? {
            precipitationProbabilityPct: numberField(
              precipitationProbability[index],
            ),
          }
        : {}),
      maxWindKmh: numberField(wind[index]),
      weatherCode: code,
      weatherDescription: weatherDescriptionFromCode(code),
    }
  })
}

function normalizeCurrentForecast(
  current: Record<string, unknown>,
  fallbackDay: ForecastDay | undefined,
): ForecastDay {
  if (!fallbackDay) {
    throw invalidExternalResponse()
  }

  const code = numberField(current.weather_code)

  return {
    date: optionalStringField(current.time) ?? fallbackDay.date,
    minTemperatureC: fallbackDay.minTemperatureC,
    maxTemperatureC: numberField(current.temperature_2m),
    precipitationMm: numberField(current.precipitation),
    ...(fallbackDay.precipitationProbabilityPct !== undefined
      ? {
          precipitationProbabilityPct: fallbackDay.precipitationProbabilityPct,
        }
      : {}),
    maxWindKmh: numberField(current.wind_speed_10m),
    weatherCode: code,
    weatherDescription: weatherDescriptionFromCode(code),
  }
}

function arrayField(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw invalidExternalResponse()
  }

  return value
}

function optionalArrayField(value: unknown): unknown[] | undefined {
  if (value === undefined) {
    return undefined
  }

  return arrayField(value)
}

function numberField(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw invalidExternalResponse()
  }

  return value
}

function stringField(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw invalidExternalResponse()
  }

  return value
}

function optionalStringField(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined
  }

  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function invalidExternalResponse(): OpenMeteoError {
  return new OpenMeteoError("Open-Meteo retornou dados invalidos.", "external")
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Ceu limpo",
  1: "Predominantemente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Nevoeiro",
  48: "Nevoeiro com geada",
  51: "Garoa fraca",
  53: "Garoa moderada",
  55: "Garoa intensa",
  56: "Garoa congelante fraca",
  57: "Garoa congelante intensa",
  61: "Chuva leve",
  63: "Chuva moderada",
  65: "Chuva forte",
  66: "Chuva congelante leve",
  67: "Chuva congelante forte",
  71: "Neve fraca",
  73: "Neve moderada",
  75: "Neve forte",
  77: "Graos de neve",
  80: "Pancadas de chuva leves",
  81: "Pancadas de chuva moderadas",
  82: "Pancadas de chuva violentas",
  85: "Pancadas de neve leves",
  86: "Pancadas de neve fortes",
  95: "Trovoadas",
  96: "Trovoadas com granizo leve",
  99: "Trovoadas com granizo forte",
}
