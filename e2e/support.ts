import type { Page } from "@playwright/test"

import type { CityResult, WeatherForecast } from "./fixtures"

export async function searchForCity(
  page: Page,
  query: string,
): Promise<void> {
  await page.getByLabel("Cidade").fill(query)
  await page.getByRole("button", { name: "Buscar" }).click()
}

export async function mockCitySearch(
  page: Page,
  results: CityResult[],
): Promise<void> {
  await page.route("**/api/cities/search**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { results },
      status: 200,
    })
  })
}

export async function mockCitySearchError(page: Page): Promise<void> {
  await page.route("**/api/cities/search**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Servico de cidades temporariamente indisponivel.",
        },
      },
      status: 503,
    })
  })
}

export async function mockForecast(
  page: Page,
  nextForecast: WeatherForecast,
): Promise<void> {
  await page.route("**/api/weather/forecast**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: nextForecast,
      status: 200,
    })
  })
}

export async function mockForecastError(page: Page): Promise<void> {
  await page.route("**/api/weather/forecast**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Servico de previsao temporariamente indisponivel.",
        },
      },
      status: 503,
    })
  })
}

export function cityDetailsPath(city: CityResult): string {
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
