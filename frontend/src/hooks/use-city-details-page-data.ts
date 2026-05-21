import { useEffect, useMemo, useState } from "react"

import {
  ApiClientError,
  getForecast,
  type CityResult,
  type ForecastDay,
  type WeatherForecast,
} from "../services/api"
import { useLocalCities } from "./use-local-cities"

type ForecastState = "loading" | "success" | "empty" | "error"

type ForecastResult =
  | {
      requestKey: string
      state: "success"
      forecast: WeatherForecast
    }
  | {
      requestKey: string
      state: "empty"
    }
  | {
      requestKey: string
      state: "error"
      message: string
    }

export type CityDetails = {
  city: CityResult
  latitude: number
  longitude: number
  timezone?: string
}

export type CityDetailsPageData = {
  details: CityDetails | null
  errorMessage: string
  favorite: boolean
  forecast: WeatherForecast | null
  forecastState: ForecastState
  toggleFavorite: () => void
}

export function useCityDetailsPageData(): CityDetailsPageData {
  const {
    recent,
    favorites,
    toggleFavorite,
    updateRecentWeather,
    isFavorite,
  } = useLocalCities()
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(
    null,
  )
  const details = useMemo(
    () => readCityDetails(new URLSearchParams(window.location.search), [
      ...recent,
      ...favorites,
    ]),
    [favorites, recent],
  )
  const requestKey = getRequestKey(details)
  const currentResult =
    forecastResult?.requestKey === requestKey ? forecastResult : null

  useForecastRequest(
    details,
    requestKey,
    setForecastResult,
    updateRecentWeather,
  )

  return {
    details,
    errorMessage: currentResult?.state === "error" ? currentResult.message : "",
    favorite: details ? isFavorite(details.city) : false,
    forecast: currentResult?.state === "success" ? currentResult.forecast : null,
    forecastState: getForecastState(details, currentResult),
    toggleFavorite: () => {
      if (details) {
        toggleFavorite(details.city)
      }
    },
  }
}

function useForecastRequest(
  details: CityDetails | null,
  requestKey: string,
  setForecastResult: (result: ForecastResult) => void,
  updateRecentWeather: (city: CityResult, snapshot: ForecastSnapshot) => void,
): void {
  const latitude = details?.latitude
  const longitude = details?.longitude
  const timezone = details?.timezone
  const cityCountry = details?.city.country
  const cityId = details?.city.id
  const cityLatitude = details?.city.latitude
  const cityLongitude = details?.city.longitude
  const cityName = details?.city.name
  const cityRegion = details?.city.region
  const cityTimezone = details?.city.timezone
  const city = useMemo(
    () => {
      if (
        cityCountry === undefined ||
        cityId === undefined ||
        cityLatitude === undefined ||
        cityLongitude === undefined ||
        cityName === undefined
      ) {
        return null
      }

      return {
        country: cityCountry,
        id: cityId,
        latitude: cityLatitude,
        longitude: cityLongitude,
        name: cityName,
        region: cityRegion,
        timezone: cityTimezone,
      }
    },
    [
      cityCountry,
      cityId,
      cityLatitude,
      cityLongitude,
      cityName,
      cityRegion,
      cityTimezone,
    ],
  )

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) {
      return
    }

    let ignore = false

    getForecast({ latitude, longitude, timezone })
      .then((nextForecast) => {
        if (ignore) {
          return
        }

        setForecastResult(
          hasUsableForecast(nextForecast)
            ? { forecast: nextForecast, requestKey, state: "success" }
            : { requestKey, state: "empty" },
        )
        if (hasUsableForecast(nextForecast) && city) {
          updateRecentWeather(city, forecastSnapshot(nextForecast.daily[0]))
        }
      })
      .catch((error: unknown) => {
        if (ignore) {
          return
        }

        setForecastResult({
          message: getForecastErrorMessage(error),
          requestKey,
          state: "error",
        })
      })

    return () => {
      ignore = true
    }
  }, [
    city,
    latitude,
    longitude,
    requestKey,
    setForecastResult,
    timezone,
    updateRecentWeather,
  ])
}

type ForecastSnapshot = {
  forecastDate: string
  minTemperatureC: number
  maxTemperatureC: number
}

function getForecastState(
  details: CityDetails | null,
  result: ForecastResult | null,
): ForecastState {
  if (!details) {
    return "empty"
  }

  return result?.state ?? "loading"
}

function getRequestKey(details: CityDetails | null): string {
  if (!details) {
    return ""
  }

  return `${details.latitude}:${details.longitude}:${details.timezone ?? ""}`
}

function readCityDetails(
  params: URLSearchParams,
  persistedCities: CityResult[],
): CityDetails | null {
  const latitudeParam = params.get("lat")
  const longitudeParam = params.get("lon")

  if (!latitudeParam || !longitudeParam) {
    return null
  }

  const latitude = Number(latitudeParam)
  const longitude = Number(longitudeParam)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  const persistedCity = persistedCities.find(
    (city) => city.latitude === latitude && city.longitude === longitude,
  )
  const city = persistedCity ?? cityFromParams(params, latitude, longitude)

  return {
    city,
    latitude,
    longitude,
    timezone: params.get("timezone") ?? city.timezone,
  }
}

function cityFromParams(
  params: URLSearchParams,
  latitude: number,
  longitude: number,
): CityResult {
  const name = params.get("name")?.trim() || "Cidade selecionada"
  const country = params.get("country")?.trim() || "Local desconhecido"
  const region = params.get("region")?.trim() || undefined
  const timezone = params.get("timezone")?.trim() || undefined
  const parsedId = Number(params.get("id"))

  return {
    id: Number.isFinite(parsedId) ? parsedId : coordinateId(latitude, longitude),
    name,
    country,
    region,
    latitude,
    longitude,
    timezone,
  }
}

function coordinateId(latitude: number, longitude: number): number {
  const normalizedLatitude = Math.round(latitude * 10000)
  const normalizedLongitude = Math.round(longitude * 10000)

  return Math.abs(normalizedLatitude * 100000 + normalizedLongitude)
}

function hasUsableForecast(forecast: WeatherForecast): boolean {
  return Boolean(forecast.current && forecast.daily.length > 0)
}

function forecastSnapshot(day: ForecastDay | undefined): ForecastSnapshot {
  if (!day) {
    throw new Error("Forecast day is required to create a recent snapshot.")
  }

  return {
    forecastDate: day.date,
    minTemperatureC: day.minTemperatureC,
    maxTemperatureC: day.maxTemperatureC,
  }
}

function getForecastErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message
  }

  return "Nao foi possivel carregar a previsao agora. Tente novamente em instantes."
}
