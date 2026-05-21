import { afterEach, describe, expect, it, vi } from "vitest"

import app from "./index"
import {
  normalizeCities,
  normalizeForecast,
  weatherDescriptionFromCode,
} from "./services/open-meteo"
import type {
  ApiErrorResponse,
  CityResult,
  ForecastDay,
  HealthResponse,
  WeatherForecast,
} from "./types/weather"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("GET /health", () => {
  it("returns backend health status", async () => {
    const response = await app.request("/health")

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "trip-weather-planner-backend",
    } satisfies HealthResponse)
  })

  it("applies CORS headers for the frontend origin", async () => {
    const response = await app.request("/health", {
      headers: {
        Origin: "http://localhost:5173",
      },
    })

    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173",
    )
  })

  it("logs structured request metadata", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})

    const response = await app.request("/health")

    expect(response.status).toBe(200)
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining('"route":"/health"'),
    )
    expect(JSON.parse(info.mock.calls.at(-1)?.[0] ?? "{}")).toEqual(
      expect.objectContaining({
        errorType: "none",
        method: "GET",
        origin: "internal",
        route: "/health",
        status: 200,
      }),
    )
  })
})

describe("weather contracts and normalization", () => {
  it("accepts the base city and forecast shapes", () => {
    const city = {
      id: 3451190,
      name: "Rio de Janeiro",
      country: "Brasil",
      region: "Rio de Janeiro",
      latitude: -22.91,
      longitude: -43.17,
      timezone: "America/Sao_Paulo",
    } satisfies CityResult

    const day = {
      date: "2026-05-19",
      minTemperatureC: 19,
      maxTemperatureC: 27,
      precipitationMm: 2.5,
      precipitationProbabilityPct: 45,
      maxWindKmh: 18,
      weatherCode: 61,
      weatherDescription: "Chuva leve",
    } satisfies ForecastDay

    const forecast = {
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      current: day,
      daily: [day],
    } satisfies WeatherForecast

    expect(forecast.daily).toHaveLength(1)
    expect(forecast.current.weatherDescription).toBe("Chuva leve")
  })

  it("defines the stable API error response shape", () => {
    const error = {
      error: {
        code: "INVALID_REQUEST",
        message: "Informe uma cidade com pelo menos 2 caracteres.",
      },
    } satisfies ApiErrorResponse

    expect(error.error.code).toBe("INVALID_REQUEST")
  })

  it("normalizes city search results", () => {
    expect(
      normalizeCities({
        results: [
          {
            id: 3451190,
            name: "Rio de Janeiro",
            country: "Brasil",
            admin1: "Rio de Janeiro",
            latitude: -22.91,
            longitude: -43.17,
            timezone: "America/Sao_Paulo",
          },
        ],
      }),
    ).toEqual([
      {
        id: 3451190,
        name: "Rio de Janeiro",
        country: "Brasil",
        region: "Rio de Janeiro",
        latitude: -22.91,
        longitude: -43.17,
        timezone: "America/Sao_Paulo",
      },
    ])
  })

  it("normalizes an empty city search response", () => {
    expect(normalizeCities({})).toEqual([])
  })

  it("normalizes forecast data and maps WMO descriptions", () => {
    expect(normalizeForecast(openMeteoForecastPayload())).toEqual({
      latitude: -22.875,
      longitude: -43.125,
      timezone: "America/Sao_Paulo",
      current: {
        date: "2026-05-19",
        minTemperatureC: 19,
        maxTemperatureC: 27,
        precipitationMm: 0.2,
        precipitationProbabilityPct: 45,
        maxWindKmh: 14,
        weatherCode: 61,
        weatherDescription: "Chuva leve",
      },
      daily: [
        {
          date: "2026-05-19",
          minTemperatureC: 19,
          maxTemperatureC: 27,
          precipitationMm: 2.5,
          precipitationProbabilityPct: 45,
          maxWindKmh: 18,
          weatherCode: 61,
          weatherDescription: "Chuva leve",
        },
        {
          date: "2026-05-20",
          minTemperatureC: 18,
          maxTemperatureC: 26,
          precipitationMm: 0,
          precipitationProbabilityPct: 15,
          maxWindKmh: 12,
          weatherCode: 2,
          weatherDescription: "Parcialmente nublado",
        },
      ],
    })
  })

  it("returns a fallback description for unknown WMO codes", () => {
    expect(weatherDescriptionFromCode(1234)).toBe(
      "Condicao meteorologica indisponivel",
    )
  })

  it("rejects invalid forecast payloads", () => {
    expect(() => normalizeForecast({ daily: {} })).toThrow(
      "Open-Meteo retornou dados invalidos.",
    )
  })
})

describe("GET /api/cities/search", () => {
  it("returns normalized city results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          results: [
            {
              id: 3451190,
              name: "Rio de Janeiro",
              country: "Brasil",
              admin1: "Rio de Janeiro",
              latitude: -22.91,
              longitude: -43.17,
              timezone: "America/Sao_Paulo",
            },
          ],
        }),
      ),
    )

    const response = await app.request("/api/cities/search?q=rio")

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      results: [
        {
          id: 3451190,
          name: "Rio de Janeiro",
          country: "Brasil",
          region: "Rio de Janeiro",
          latitude: -22.91,
          longitude: -43.17,
          timezone: "America/Sao_Paulo",
        },
      ],
    })
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining(
          "https://geocoding-api.open-meteo.com/v1/search",
        ),
      }),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it("returns an empty results array when Open-Meteo has no matches", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({})))

    const response = await app.request("/api/cities/search?q=zzzzzz")

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ results: [] })
  })

  it("returns 400 for invalid search input", async () => {
    const response = await app.request("/api/cities/search?q=a")

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "Informe uma cidade com pelo menos 2 caracteres.",
      },
    } satisfies ApiErrorResponse)
  })

  it("returns 502 when Open-Meteo returns an invalid city response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ results: [{ name: "Rio" }] })),
    )

    const response = await app.request("/api/cities/search?q=rio")

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "EXTERNAL_API_ERROR",
        message: "Nao foi possivel buscar cidades no momento.",
      },
    } satisfies ApiErrorResponse)
  })
})

describe("GET /api/weather/forecast", () => {
  it("returns normalized forecast data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(openMeteoForecastPayload())),
    )

    const response = await app.request(
      "/api/weather/forecast?latitude=-22.91&longitude=-43.17&timezone=America/Sao_Paulo",
    )

    expect(response.status).toBe(200)
    const payload = (await response.json()) as WeatherForecast

    expect(payload.current.weatherDescription).toBe("Chuva leve")
    expect(payload.daily).toHaveLength(2)
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining("timezone=America%2FSao_Paulo"),
      }),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it("defaults forecast timezone to auto", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(openMeteoForecastPayload())),
    )

    const response = await app.request(
      "/api/weather/forecast?latitude=-22.91&longitude=-43.17",
    )

    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining("timezone=auto"),
      }),
      expect.any(Object),
    )
  })

  it("returns 400 for invalid coordinates", async () => {
    const response = await app.request(
      "/api/weather/forecast?latitude=-122.91&longitude=-43.17",
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "Informe uma latitude valida entre -90 e 90.",
      },
    } satisfies ApiErrorResponse)
  })

  it("returns 400 for invalid timezone", async () => {
    const response = await app.request(
      "/api/weather/forecast?latitude=-22.91&longitude=-43.17&timezone=Not_A_Zone",
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "Informe um timezone valido.",
      },
    } satisfies ApiErrorResponse)
  })

  it("returns 502 when Open-Meteo returns a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: true }, { status: 500 })),
    )

    const response = await app.request(
      "/api/weather/forecast?latitude=-22.91&longitude=-43.17",
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "EXTERNAL_API_ERROR",
        message: "Nao foi possivel buscar a previsao no momento.",
      },
    } satisfies ApiErrorResponse)
  })
})

function openMeteoForecastPayload() {
  return {
    latitude: -22.875,
    longitude: -43.125,
    timezone: "America/Sao_Paulo",
    current: {
      time: "2026-05-19T10:15",
      temperature_2m: 25.2,
      weather_code: 61,
      wind_speed_10m: 14,
      precipitation: 0.2,
    },
    daily: {
      time: ["2026-05-19", "2026-05-20"],
      weather_code: [61, 2],
      temperature_2m_max: [27, 26],
      temperature_2m_min: [19, 18],
      precipitation_sum: [2.5, 0],
      precipitation_probability_max: [45, 15],
      wind_speed_10m_max: [18, 12],
    },
  }
}
