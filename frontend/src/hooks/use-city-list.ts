import { useMemo } from "react"

import type { RecentCity } from "./use-local-cities"
import type { CityResult } from "../services/api"

export type CityListHelpers = {
  cityDetailsHref: (city: CityResult) => string
  isRecentCity: (city: CityResult | RecentCity) => city is RecentCity
  locationLabel: (city: CityResult) => string
}

export function useCityList(): CityListHelpers {
  return useMemo(
    () => ({
      cityDetailsHref,
      isRecentCity,
      locationLabel,
    }),
    [],
  )
}

function cityDetailsHref(city: CityResult): string {
  const params = new URLSearchParams({
    id: String(city.id),
    lat: String(city.latitude),
    lon: String(city.longitude),
    name: city.name,
    country: city.country,
  })

  if (city.region) {
    params.set("region", city.region)
  }

  if (city.timezone) {
    params.set("timezone", city.timezone)
  }

  return `/city?${params.toString()}`
}

function locationLabel(city: CityResult): string {
  return [city.region, city.country].filter(Boolean).join(", ")
}

function isRecentCity(city: CityResult | RecentCity): city is RecentCity {
  return "searchedAt" in city && typeof city.searchedAt === "string"
}
