import { useCallback, useState } from "react"

import type { CityResult } from "../services/api"

export const RECENT_CITIES_STORAGE_KEY = "trip-weather-planner:recent:v1"
export const FAVORITE_CITIES_STORAGE_KEY = "trip-weather-planner:favorites:v1"

const MAX_RECENT_CITIES = 8

export type LocalCitiesStore = {
  recent: CityResult[]
  favorites: CityResult[]
  addRecent: (city: CityResult) => void
  clearRecent: () => void
  toggleFavorite: (city: CityResult) => void
  isFavorite: (city: CityResult) => boolean
}

export function useLocalCities(): LocalCitiesStore {
  const [recent, setRecent] = useState<CityResult[]>(() =>
    readCities(RECENT_CITIES_STORAGE_KEY),
  )
  const [favorites, setFavorites] = useState<CityResult[]>(() =>
    readCities(FAVORITE_CITIES_STORAGE_KEY),
  )

  const addRecent = useCallback((city: CityResult) => {
    setRecent((current) => {
      const next = [city, ...removeCity(current, city)].slice(
        0,
        MAX_RECENT_CITIES,
      )
      writeCities(RECENT_CITIES_STORAGE_KEY, next)

      return next
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecent([])
    writeCities(RECENT_CITIES_STORAGE_KEY, [])
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
    clearRecent,
    toggleFavorite,
    isFavorite,
  }
}

function readCities(key: string): CityResult[] {
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

    if (!Array.isArray(parsed)) {
      return []
    }

    return dedupeCities(parsed.filter(isCityResult))
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

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined
  }

  return window.localStorage
}

function dedupeCities(cities: CityResult[]): CityResult[] {
  return cities.reduce<CityResult[]>((accumulator, city) => {
    if (!accumulator.some((item) => isSameCity(item, city))) {
      accumulator.push(city)
    }

    return accumulator
  }, [])
}

function removeCity(cities: CityResult[], city: CityResult): CityResult[] {
  return cities.filter((item) => !isSameCity(item, city))
}

function isSameCity(left: CityResult, right: CityResult): boolean {
  return left.id === right.id
}

function isCityResult(value: unknown): value is CityResult {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const city = value as Partial<CityResult>

  return (
    typeof city.id === "number" &&
    typeof city.name === "string" &&
    typeof city.country === "string" &&
    typeof city.latitude === "number" &&
    typeof city.longitude === "number" &&
    (city.region === undefined || typeof city.region === "string") &&
    (city.timezone === undefined || typeof city.timezone === "string")
  )
}
