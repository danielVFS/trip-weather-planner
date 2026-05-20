import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { CityResult } from "../services/api"
import {
  FAVORITE_CITIES_STORAGE_KEY,
  RECENT_CITIES_STORAGE_KEY,
  useLocalCities,
} from "./use-local-cities"

const rio: CityResult = {
  id: 3451190,
  name: "Rio de Janeiro",
  country: "Brasil",
  region: "Rio de Janeiro",
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: "America/Sao_Paulo",
}

const saoPaulo: CityResult = {
  id: 3448439,
  name: "Sao Paulo",
  country: "Brasil",
  region: "Sao Paulo",
  latitude: -23.5505,
  longitude: -46.6333,
  timezone: "America/Sao_Paulo",
}

describe("useLocalCities", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"))
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("inicia vazio quando localStorage nao possui dados", () => {
    const { result } = renderHook(() => useLocalCities())

    expect(result.current.recent).toEqual([])
    expect(result.current.favorites).toEqual([])
  })

  it("ignora JSON invalido sem quebrar", () => {
    localStorage.setItem(RECENT_CITIES_STORAGE_KEY, "{")
    localStorage.setItem(FAVORITE_CITIES_STORAGE_KEY, JSON.stringify({}))

    const { result } = renderHook(() => useLocalCities())

    expect(result.current.recent).toEqual([])
    expect(result.current.favorites).toEqual([])
  })

  it("adiciona recentes deduplicando e colocando a cidade mais recente no topo", () => {
    const { result } = renderHook(() => useLocalCities())

    act(() => {
      result.current.addRecent(rio)
      result.current.addRecent(saoPaulo)
      result.current.addRecent(rio)
    })

    expect(result.current.recent).toEqual([
      { ...rio, searchedAt: "2026-05-20T12:00:00.000Z" },
      { ...saoPaulo, searchedAt: "2026-05-20T12:00:00.000Z" },
    ])
    expect(readStored(RECENT_CITIES_STORAGE_KEY)).toEqual([
      { ...rio, searchedAt: "2026-05-20T12:00:00.000Z" },
      { ...saoPaulo, searchedAt: "2026-05-20T12:00:00.000Z" },
    ])
  })

  it("limita recentes a oito cidades", () => {
    const { result } = renderHook(() => useLocalCities())

    act(() => {
      for (let index = 0; index < 10; index += 1) {
        result.current.addRecent({
          ...rio,
          id: index,
          name: `Cidade ${index}`,
        })
      }
    })

    expect(result.current.recent).toHaveLength(8)
    expect(result.current.recent[0]?.name).toBe("Cidade 9")
    expect(result.current.recent.at(-1)?.name).toBe("Cidade 2")
  })

  it("limpa cidades recentes", () => {
    const { result } = renderHook(() => useLocalCities())

    act(() => {
      result.current.addRecent(rio)
      result.current.clearRecent()
    })

    expect(result.current.recent).toEqual([])
    expect(readStored(RECENT_CITIES_STORAGE_KEY)).toEqual([])
  })

  it("atualiza recentes com snapshot de temperatura sem criar item novo", () => {
    const { result } = renderHook(() => useLocalCities())

    act(() => {
      result.current.addRecent(rio)
      result.current.updateRecentWeather(rio, {
        forecastDate: "2026-05-20",
        minTemperatureC: 20,
        maxTemperatureC: 28,
      })
    })

    expect(result.current.recent).toEqual([
      {
        ...rio,
        searchedAt: "2026-05-20T12:00:00.000Z",
        weatherSnapshot: {
          forecastDate: "2026-05-20",
          minTemperatureC: 20,
          maxTemperatureC: 28,
        },
      },
    ])
  })

  it("alterna favoritos e informa se uma cidade esta favoritada", () => {
    const { result } = renderHook(() => useLocalCities())

    act(() => {
      result.current.toggleFavorite(rio)
    })

    expect(result.current.favorites).toEqual([rio])
    expect(result.current.isFavorite(rio)).toBe(true)
    expect(readStored(FAVORITE_CITIES_STORAGE_KEY)).toEqual([rio])

    act(() => {
      result.current.toggleFavorite(rio)
    })

    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite(rio)).toBe(false)
  })

  it("carrega apenas cidades validas persistidas", () => {
    localStorage.setItem(
      RECENT_CITIES_STORAGE_KEY,
      JSON.stringify([rio, { id: "invalid" }, rio]),
    )

    const { result } = renderHook(() => useLocalCities())

    expect(result.current.recent).toEqual([
      { ...rio, searchedAt: "2026-05-20T12:00:00.000Z" },
    ])
  })
})

function readStored(key: string): CityResult[] {
  const value = localStorage.getItem(key)

  return value ? (JSON.parse(value) as CityResult[]) : []
}
