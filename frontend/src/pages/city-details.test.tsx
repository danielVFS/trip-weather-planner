import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import App from "../App"
import {
  FAVORITE_CITIES_STORAGE_KEY,
  RECENT_CITIES_STORAGE_KEY,
} from "../hooks/use-local-cities"
import {
  ApiClientError,
  getForecast,
  type CityResult,
  type WeatherForecast,
} from "../services/api"
import { CityDetailsPage } from "./city-details"

vi.mock("../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/api")>()

  return {
    ...actual,
    getForecast: vi.fn(),
  }
})

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
    date: "2026-05-19T10:15",
    minTemperatureC: 20,
    maxTemperatureC: 28,
    precipitationMm: 1.2,
    precipitationProbabilityPct: 40,
    maxWindKmh: 18,
    weatherCode: 3,
    weatherDescription: "Nublado",
  },
  daily: [
    {
      date: "2026-05-20",
      minTemperatureC: 19,
      maxTemperatureC: 27,
      precipitationMm: 0.4,
      precipitationProbabilityPct: 20,
      maxWindKmh: 16,
      weatherCode: 2,
      weatherDescription: "Parcialmente nublado",
    },
    {
      date: "2026-05-21",
      minTemperatureC: 18,
      maxTemperatureC: 24,
      precipitationMm: 8.6,
      precipitationProbabilityPct: 75,
      maxWindKmh: 25,
      weatherCode: 61,
      weatherDescription: "Chuva leve",
    },
  ],
}

describe("CityDetailsPage", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(getForecast).mockResolvedValue(forecast)
  })

  afterEach(() => {
    vi.clearAllMocks()
    window.history.replaceState({}, "", "/")
  })

  it("abre a rota /city por deep link e busca a previsao por coordenadas", async () => {
    window.history.replaceState(
      {},
      "",
      "/city?id=3451190&lat=-22.9068&lon=-43.1729&name=Rio%20de%20Janeiro&country=Brasil&region=Rio%20de%20Janeiro&timezone=America%2FSao_Paulo",
    )

    render(<App />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Rio de Janeiro",
    )
    expect(screen.getByRole("status")).toHaveTextContent("Carregando previsao")

    expect(await screen.findByText("Nublado")).toBeVisible()
    expect(getForecast).toHaveBeenCalledWith({
      latitude: -22.9068,
      longitude: -43.1729,
      timezone: "America/Sao_Paulo",
    })

    const daily = screen.getByRole("list")
    expect(within(daily).getByText("Parcialmente nublado")).toBeVisible()
    expect(within(daily).getByText("Chuva leve")).toBeVisible()
    expect(screen.getAllByText("20% / 0,4 mm")[0]).toBeVisible()
    expect(screen.getByText("25 km/h")).toBeVisible()
  })

  it("usa cidade persistida quando o deep link possui apenas coordenadas", async () => {
    localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify([rio]))
    window.history.replaceState({}, "", "/city?lat=-22.9068&lon=-43.1729")

    render(<CityDetailsPage />)

    expect(await screen.findByText("Nublado")).toBeVisible()
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Rio de Janeiro",
    )
    expect(getForecast).toHaveBeenCalledWith({
      latitude: rio.latitude,
      longitude: rio.longitude,
      timezone: rio.timezone,
    })
  })

  it("mostra erro amigavel quando a previsao falha", async () => {
    vi.mocked(getForecast).mockRejectedValue(
      new ApiClientError({
        code: "SERVICE_UNAVAILABLE",
        message: "Servico de previsao temporariamente indisponivel.",
        status: 503,
      }),
    )
    window.history.replaceState({}, "", "/city?lat=-22.9068&lon=-43.1729")

    render(<CityDetailsPage />)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Servico de previsao temporariamente indisponivel.",
    )
  })

  it("mostra dados indisponiveis quando parametros ou previsao sao incompletos", async () => {
    window.history.replaceState({}, "", "/city")

    const { unmount } = render(<CityDetailsPage />)

    expect(screen.getByRole("status")).toHaveTextContent(
      "Nao ha dados suficientes",
    )
    expect(getForecast).not.toHaveBeenCalled()

    unmount()
    window.history.replaceState({}, "", "/city?lat=abc&lon=-43.1729")

    const invalidRender = render(<CityDetailsPage />)

    expect(screen.getByRole("status")).toHaveTextContent(
      "Nao ha dados suficientes",
    )
    expect(getForecast).not.toHaveBeenCalled()

    vi.mocked(getForecast).mockResolvedValue({ ...forecast, daily: [] })
    window.history.replaceState({}, "", "/city?lat=-22.9068&lon=-43.1729")

    invalidRender.unmount()
    render(<CityDetailsPage />)

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Nao ha dados suficientes",
      )
    })
  })

  it("permite favoritar e remover favorito", async () => {
    const user = userEvent.setup()
    window.history.replaceState(
      {},
      "",
      "/city?id=3451190&lat=-22.9068&lon=-43.1729&name=Rio%20de%20Janeiro&country=Brasil&region=Rio%20de%20Janeiro&timezone=America%2FSao_Paulo",
    )

    render(<CityDetailsPage />)

    await screen.findByText("Nublado")

    await user.click(screen.getByRole("button", { name: "Favoritar cidade" }))
    expect(readFavorites()).toEqual([rio])
    expect(
      screen.getByRole("button", { name: "Remover favorito" }),
    ).toBeVisible()
    expect(screen.getByTestId("favorite-action-star")).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Remover favorito" }))
    expect(readFavorites()).toEqual([])
    expect(
      screen.getByRole("button", { name: "Favoritar cidade" }),
    ).toBeVisible()
  })

  it("salva o snapshot da previsao na cidade recente", async () => {
    localStorage.setItem(
      RECENT_CITIES_STORAGE_KEY,
      JSON.stringify([
        { ...rio, searchedAt: "2026-05-20T12:00:00.000Z" },
      ]),
    )
    window.history.replaceState({}, "", "/city?lat=-22.9068&lon=-43.1729")

    render(<CityDetailsPage />)

    await screen.findByText("Nublado")

    await waitFor(() => {
      expect(readRecent()).toEqual([
        {
          ...rio,
          searchedAt: "2026-05-20T12:00:00.000Z",
          weatherSnapshot: {
            forecastDate: "2026-05-19T10:15",
            minTemperatureC: 20,
            maxTemperatureC: 28,
          },
        },
      ])
    })
  })

  it("oferece acao para voltar para busca", async () => {
    window.history.replaceState({}, "", "/city?lat=-22.9068&lon=-43.1729")

    render(<CityDetailsPage />)

    expect(screen.getByRole("link", { name: "Voltar para busca" }))
      .toHaveAttribute("href", "/")
    await waitFor(() => expect(getForecast).toHaveBeenCalled())
  })
})

function readFavorites(): CityResult[] {
  const value = localStorage.getItem(FAVORITE_CITIES_STORAGE_KEY)

  return value ? (JSON.parse(value) as CityResult[]) : []
}

function readRecent(): unknown[] {
  const value = localStorage.getItem(RECENT_CITIES_STORAGE_KEY)

  return value ? (JSON.parse(value) as unknown[]) : []
}
