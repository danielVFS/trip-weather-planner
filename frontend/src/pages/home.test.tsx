import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { RECENT_CITIES_STORAGE_KEY } from "../hooks/use-local-cities"
import {
  ApiClientError,
  searchCities,
  type CityResult,
} from "../services/api"
import { HomePage } from "./home"

vi.mock("../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/api")>()

  return {
    ...actual,
    searchCities: vi.fn(),
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

const rioGrande: CityResult = {
  id: 3451138,
  name: "Rio Grande",
  country: "Brasil",
  region: "Rio Grande do Sul",
  latitude: -32.035,
  longitude: -52.0986,
  timezone: "America/Sao_Paulo",
}

describe("HomePage", () => {
  beforeEach(() => {
    localStorage.clear()
    document.addEventListener("click", preventLinkNavigation)
  })

  afterEach(() => {
    document.removeEventListener("click", preventLinkNavigation)
    vi.clearAllMocks()
  })

  it("busca cidades, exibe resultados comparaveis e salva a selecao em recentes", async () => {
    const user = userEvent.setup()
    vi.mocked(searchCities).mockResolvedValue([rio, rioGrande])

    render(<HomePage />)

    await user.type(screen.getByLabelText("Cidade"), "rio")
    await user.click(screen.getByRole("button", { name: "Buscar" }))

    expect(searchCities).toHaveBeenCalledWith("rio")
    const results = await screen.findByTestId("search-results")

    expect(within(results).getByRole("link", { name: /Rio de Janeiro/ }))
      .toHaveAttribute(
        "href",
        "/city?id=3451190&lat=-22.9068&lon=-43.1729&name=Rio+de+Janeiro&country=Brasil&region=Rio+de+Janeiro&timezone=America%2FSao_Paulo",
      )
    expect(within(results).getByText("Rio de Janeiro, Brasil")).toBeVisible()
    expect(within(results).getByText("-22,91 lat, -43,17 lon")).toBeVisible()
    expect(within(results).getByText("Rio Grande do Sul, Brasil")).toBeVisible()

    await user.click(within(results).getByRole("link", { name: /Rio Grande/ }))

    await waitFor(() => {
      expect(readRecent()).toEqual([rioGrande])
    })
    expect(screen.getByTestId("recent")).toHaveTextContent("Rio Grande")
  })

  it("mostra estado de carregamento durante a busca", async () => {
    const user = userEvent.setup()
    const deferred = createDeferred<CityResult[]>()
    vi.mocked(searchCities).mockReturnValue(deferred.promise)

    render(<HomePage />)

    await user.type(screen.getByLabelText("Cidade"), "rio")
    await user.click(screen.getByRole("button", { name: "Buscar" }))

    expect(screen.getByRole("button", { name: "Buscando..." })).toBeDisabled()
    expect(screen.getByRole("status")).toHaveTextContent("Buscando cidades")

    deferred.resolve([rio])

    expect(await screen.findByText("Rio de Janeiro")).toBeVisible()
  })

  it("mostra estado vazio quando a busca nao retorna cidades", async () => {
    const user = userEvent.setup()
    vi.mocked(searchCities).mockResolvedValue([])

    render(<HomePage />)

    await user.type(screen.getByLabelText("Cidade"), "zzzz")
    await user.click(screen.getByRole("button", { name: "Buscar" }))

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Nenhuma cidade encontrada",
    )
    expect(screen.queryByTestId("search-results")).not.toBeInTheDocument()
  })

  it("mostra erro amigavel quando a busca falha", async () => {
    const user = userEvent.setup()
    vi.mocked(searchCities).mockRejectedValue(
      new ApiClientError({
        code: "SERVICE_UNAVAILABLE",
        message: "Servico de cidades temporariamente indisponivel.",
        status: 503,
      }),
    )

    render(<HomePage />)

    await user.type(screen.getByLabelText("Cidade"), "rio")
    await user.click(screen.getByRole("button", { name: "Buscar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Servico de cidades temporariamente indisponivel.",
    )
    expect(screen.queryByTestId("search-results")).not.toBeInTheDocument()
  })

  it("valida termo curto antes de chamar a API", async () => {
    const user = userEvent.setup()

    render(<HomePage />)

    await user.type(screen.getByLabelText("Cidade"), "r")
    await user.click(screen.getByRole("button", { name: "Buscar" }))

    expect(searchCities).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Digite pelo menos 2 caracteres",
    )
  })

  it("exibe recentes persistidos e permite limpar a lista", async () => {
    const user = userEvent.setup()
    localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify([rio]))

    render(<HomePage />)

    expect(screen.getByTestId("recent")).toHaveTextContent("Rio de Janeiro")

    await user.click(screen.getByRole("button", { name: "Limpar recentes" }))

    expect(screen.queryByTestId("recent")).not.toBeInTheDocument()
    expect(readRecent()).toEqual([])
    expect(screen.getByText(/As cidades selecionadas/)).toBeVisible()
  })
})

function readRecent(): CityResult[] {
  const value = localStorage.getItem(RECENT_CITIES_STORAGE_KEY)

  return value ? (JSON.parse(value) as CityResult[]) : []
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

function preventLinkNavigation(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest("a")) {
    event.preventDefault()
  }
}
