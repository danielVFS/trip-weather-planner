import { useCallback, useState } from "react"

import type { CityResult } from "../services/api"

export const RECENT_CITIES_STORAGE_KEY = "trip-weather-planner:recent:v1"
export const FAVORITE_CITIES_STORAGE_KEY = "trip-weather-planner:favorites:v1"

const MAX_RECENT_CITIES = 8

export type RecentWeatherSnapshot = {
  forecastDate: string
  minTemperatureC: number
  maxTemperatureC: number
}

export type RecentCity = CityResult & {
  searchedAt: string
  weatherSnapshot?: RecentWeatherSnapshot
}

export type LocalCitiesStore = {
  recent: RecentCity[]
  favorites: CityResult[]
  addRecent: (city: CityResult) => void
  updateRecentWeather: (
    city: CityResult,
    snapshot: RecentWeatherSnapshot,
  ) => void
  clearRecent: () => void
  toggleFavorite: (city: CityResult) => void
  isFavorite: (city: CityResult) => boolean
}

export function useLocalCities(): LocalCitiesStore {
  const [recent, setRecent] = useState<RecentCity[]>(() =>
    readRecentCities(),
  )
  const [favorites, setFavorites] = useState<CityResult[]>(() =>
    readFavoriteCities(),
  )

  const addRecent = useCallback((city: CityResult) => {
    setRecent((current) => {
      const next = [toRecentCity(city), ...removeCity(current, city)].slice(
        0,
        MAX_RECENT_CITIES,
      )
      writeRecentCities(next)

      return next
    })
  }, [])

  const updateRecentWeather = useCallback(
    (city: CityResult, snapshot: RecentWeatherSnapshot) => {
      setRecent((current) => {
        const next = current.map((item) =>
          isSameCity(item, city) && !sameSnapshot(item.weatherSnapshot, snapshot)
            ? { ...item, weatherSnapshot: snapshot }
            : item,
        )

        if (next.every((item, index) => item === current[index])) {
          return current
        }

        writeRecentCities(next)

        return next
      })
    },
    [],
  )

  const clearRecent = useCallback(() => {
    setRecent([])
    writeRecentCities([])
  }, [])

  const toggleFavorite = useCallback((city: CityResult) => {
    setFavorites((current) => {
      const exists = current.some((item) => isSameCity(item, city))
      const next = exists ? removeCity(current, city) : [city, ...current]

      writeCities(FAVORITE_CITIES_STORAGE_KEY, next)

      return next
    })
  }, [])

  const isFavorite = useCallback(
    (city: CityResult) => favorites.some((item) => isSameCity(item, city)),
    [favorites],
  )

  return {
    recent,
    favorites,
    addRecent,
    updateRecentWeather,
    clearRecent,
    toggleFavorite,
    isFavorite,
  }
}

function readRecentCities(): RecentCity[] {
  return readStoredCities(RECENT_CITIES_STORAGE_KEY)
    .filter(isCityResult)
    .map(toRecentCity)
}

function readFavoriteCities(): CityResult[] {
  return readStoredCities(FAVORITE_CITIES_STORAGE_KEY)
    .filter(isCityResult)
    .map(toCityResult)
}

function readStoredCities(key: string): unknown[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const value = storage.getItem(key)

    if (!value) {
      return []
    }

    const parsed = JSON.parse(value)

    return Array.isArray(parsed) ? dedupeCities(parsed) : []
  } catch {
    return []
  }
}

function writeCities(key: string, cities: CityResult[]): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(key, JSON.stringify(cities))
}

function writeRecentCities(cities: RecentCity[]): void {
  writeCities(RECENT_CITIES_STORAGE_KEY, cities)
}

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined
  }

  return window.localStorage
}

function dedupeCities(cities: unknown[]): unknown[] {
  return cities.reduce<unknown[]>((accumulator, city) => {
    if (!accumulator.some((item) => isSameCity(item, city))) {
      accumulator.push(city)
    }

    return accumulator
  }, [])
}

function removeCity<T extends CityResult>(cities: T[], city: CityResult): T[] {
  return cities.filter((item) => !isSameCity(item, city))
}

function isSameCity(left: unknown, right: unknown): boolean {
  return (
    isObjectWithId(left) &&
    isObjectWithId(right) &&
    left.id === right.id
  )
}

function isCityResult(value: unknown): value is CityResult {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const city = value as Partial<RecentCity>

  return (
    typeof city.id === "number" &&
    typeof city.name === "string" &&
    typeof city.country === "string" &&
    typeof city.latitude === "number" &&
    typeof city.longitude === "number" &&
    (city.region === undefined || typeof city.region === "string") &&
    (city.timezone === undefined || typeof city.timezone === "string") &&
    (city.searchedAt === undefined || typeof city.searchedAt === "string") &&
    (city.weatherSnapshot === undefined ||
      isRecentWeatherSnapshot(city.weatherSnapshot))
  )
}

function isObjectWithId(value: unknown): value is { id: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number"
  )
}

function isRecentWeatherSnapshot(
  value: unknown,
): value is RecentWeatherSnapshot {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const snapshot = value as Partial<RecentWeatherSnapshot>

  return (
    typeof snapshot.forecastDate === "string" &&
    typeof snapshot.minTemperatureC === "number" &&
    typeof snapshot.maxTemperatureC === "number"
  )
}

function toRecentCity(city: CityResult): RecentCity {
  const recentCity = city as Partial<RecentCity>

  return {
    ...toCityResult(city),
    searchedAt: recentCity.searchedAt ?? new Date().toISOString(),
    weatherSnapshot: recentCity.weatherSnapshot,
  }
}

function toCityResult(city: CityResult): CityResult {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    region: city.region,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  }
}

function sameSnapshot(
  left: RecentWeatherSnapshot | undefined,
  right: RecentWeatherSnapshot,
): boolean {
  return (
    left?.forecastDate === right.forecastDate &&
    left.minTemperatureC === right.minTemperatureC &&
    left.maxTemperatureC === right.maxTemperatureC
  )
}
