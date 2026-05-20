import { expect, test } from "@playwright/test"

import { forecast, rio, saoPaulo } from "./fixtures"
import {
  cityDetailsPath,
  mockCitySearch,
  mockCitySearchError,
  mockForecast,
  mockForecastError,
  searchForCity,
} from "./support"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
})

test("busca cidade, seleciona resultado e exibe a previsao", async ({
  page,
}) => {
  await mockCitySearch(page, [rio, saoPaulo])
  await mockForecast(page, forecast)

  await searchForCity(page, "rio")
  await expect(page.getByRole("link", { name: /Rio de Janeiro/ })).toBeVisible()
  await expect(page.getByText("-22,91 lat, -43,17 lon")).toBeVisible()

  await page.getByRole("link", { name: /Rio de Janeiro/ }).click()

  await expect(page).toHaveURL(/\/city\?/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Rio de Janeiro" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Parcialmente nublado" }),
  ).toBeVisible()
  await expect(page.getByText("35% / 2,4 mm")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Proximos dias" })).toBeVisible()
  await expect(page.getByText("Chuva leve")).toBeVisible()
})

test("exibe estado vazio quando a busca nao retorna cidades", async ({
  page,
}) => {
  await mockCitySearch(page, [])

  await searchForCity(page, "zzzzzz")

  await expect(
    page.getByRole("status").filter({
      hasText:
        "Nenhuma cidade encontrada. Revise o nome ou tente uma cidade próxima.",
    }),
  ).toBeVisible()
  await expect(page.getByTestId("search-results")).toHaveCount(0)
})

test("exibe erro amigavel quando a busca falha", async ({ page }) => {
  await mockCitySearchError(page)

  await searchForCity(page, "rio")

  await expect(
    page.getByRole("alert", {
      name: "",
    }),
  ).toContainText("Servico de cidades temporariamente indisponivel.")
})

test("exibe erro amigavel quando a previsao falha", async ({ page }) => {
  await mockCitySearch(page, [rio])
  await mockForecastError(page)

  await searchForCity(page, "rio")
  await page.getByRole("link", { name: /Rio de Janeiro/ }).click()

  await expect(page.getByRole("alert")).toContainText(
    "Servico de previsao temporariamente indisponivel.",
  )
  await expect(
    page.getByRole("heading", { level: 1, name: "Rio de Janeiro" }),
  ).toBeVisible()
})

test("salva recentes e permite limpar a lista", async ({ page }) => {
  await mockCitySearch(page, [rio])
  await mockForecast(page, forecast)

  await searchForCity(page, "rio")
  await page.getByRole("link", { name: /Rio de Janeiro/ }).click()
  await page.getByRole("link", { name: "Voltar para busca" }).click()

  await expect(page.getByTestId("recent")).toContainText("Rio de Janeiro")
  await expect(page.getByTestId("recent")).toContainText(/Busca: \d{2}\/\d{2}\/\d{4}/)
  await expect(page.getByTestId("recent")).toContainText("Min 21 °C")
  await expect(page.getByTestId("recent")).toContainText("Max 28 °C")

  await page.getByRole("button", { name: "Limpar recentes" }).click()

  await expect(page.getByTestId("recent")).toHaveCount(0)
  await expect(
    page.getByText("As cidades selecionadas aparecem aqui para acesso rapido."),
  ).toBeVisible()
})

test("permite favoritar e remover favorito", async ({ page }) => {
  await mockCitySearch(page, [rio])
  await mockForecast(page, forecast)

  await searchForCity(page, "rio")
  await page.getByRole("link", { name: /Rio de Janeiro/ }).click()

  await page.getByRole("button", { name: "Favoritar cidade" }).click()
  await expect(
    page.getByRole("button", { name: "Remover favorito" }),
  ).toBeVisible()
  await expect(page.getByTestId("favorite-action-star")).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole("button", { name: "Remover favorito" }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Remover favorito" }).click()
  await expect(
    page.getByRole("button", { name: "Favoritar cidade" }),
  ).toBeVisible()
})

test("abre detalhes por deep link direto", async ({ page }) => {
  await mockForecast(page, forecast)

  await page.goto(cityDetailsPath(rio))

  await expect(
    page.getByRole("heading", { level: 1, name: "Rio de Janeiro" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Parcialmente nublado" }),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Voltar para busca" })).toBeVisible()
})

test("mantem o layout principal usavel em viewport mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockCitySearch(page, [rio])

  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Trip Weather Planner" }),
  ).toBeVisible()
  await expect(page.getByLabel("Cidade")).toBeVisible()
  await expect(page.getByRole("button", { name: "Buscar" })).toBeVisible()

  await searchForCity(page, "rio")
  await expect(page.getByRole("link", { name: /Rio de Janeiro/ })).toBeVisible()

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(horizontalOverflow).toBe(false)
})

test("realiza fluxo real contra backend local e Open-Meteo", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "cenario real obrigatorio roda uma vez",
  )

  await searchForCity(page, "Rio de Janeiro")

  const result = page.getByRole("link", { name: /Rio de Janeiro/ }).first()
  await expect(result).toBeVisible({ timeout: 20_000 })
  await result.click()

  await expect(page).toHaveURL(/\/city\?/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Rio de Janeiro|Cidade selecionada/,
    { timeout: 20_000 },
  )
  await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible()
  await expect(page.getByText(/°C/).first()).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole("heading", { name: "Proximos dias" })).toBeVisible()
})
