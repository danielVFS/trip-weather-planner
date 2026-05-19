import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiClientError, getForecast, searchCities } from "./api"
import type { CityResult, WeatherForecast } from "./api"

const rio: CityResult = {
  id: 3451190,
  name: "Rio de Janeiro",
  country: "Brasil",
  region: "Rio de Janeiro",
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: "America/Sao_Paulo",
}

const forecast: WeatherForecast = {
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: "America/Sao_Paulo",
  current: {
    date: "2026-05-19",
    minTemperatureC: 20,
    maxTemperatureC: 28,
    precipitationMm: 1.2,
    precipitationProbabilityPct: 40,
    maxWindKmh: 18,
    weatherCode: 3,
    weatherDescription: "Nublado",
  },
  daily: [],
}

describe("api client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("busca cidades no backend local", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ results: [rio] }))

    await expect(searchCities("rio")).resolves.toEqual([rio])
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:3000/api/cities/search?q=rio"),
    )
  })

  it("busca previsao no backend local com timezone opcional", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse(forecast))

    await expect(
      getForecast({
        latitude: rio.latitude,
        longitude: rio.longitude,
        timezone: rio.timezone,
      }),
    ).resolves.toEqual(forecast)

    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        "http://localhost:3000/api/weather/forecast?latitude=-22.9068&longitude=-43.1729&timezone=America%2FSao_Paulo",
      ),
    )
  })

  it("preserva erro estruturado do backend", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Informe uma cidade com pelo menos 2 caracteres.",
          },
        },
        { status: 400 },
      ),
    )

    await expect(searchCities("r")).rejects.toMatchObject({
      code: "INVALID_REQUEST",
      message: "Informe uma cidade com pelo menos 2 caracteres.",
      status: 400,
    } satisfies Partial<ApiClientError>)
  })

  it("normaliza falha de rede", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockRejectedValue(new TypeError("failed to fetch"))

    await expect(searchCities("rio")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      message: "Nao foi possivel conectar ao servidor local.",
    } satisfies Partial<ApiClientError>)
  })

  it("normaliza resposta de erro inesperada", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ message: "oops" }, { status: 500 }))

    await expect(searchCities("rio")).rejects.toMatchObject({
      code: "UNEXPECTED_RESPONSE",
      message: "O servidor retornou um erro inesperado.",
      status: 500,
    } satisfies Partial<ApiClientError>)
  })
})

function jsonResponse(
  payload: unknown,
  init: ResponseInit = { status: 200 },
): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
    },
    ...init,
  })
}
