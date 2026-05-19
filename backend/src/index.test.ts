import { describe, expect, it } from "vitest"

import app from "./index"
import type {
  ApiErrorResponse,
  CityResult,
  ForecastDay,
  HealthResponse,
  WeatherForecast,
} from "./types/weather"

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
})

describe("weather contracts", () => {
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
})
