import { useMemo, useState, type FormEvent } from "react"

import { CityList } from "../components/city-list"
import { useLocalCities } from "../hooks/use-local-cities"
import {
  ApiClientError,
  searchCities,
  type CityResult,
} from "../services/api"

type SearchState = "idle" | "loading" | "success" | "empty" | "error"

export function HomePage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CityResult[]>([])
  const [searchState, setSearchState] = useState<SearchState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { recent, addRecent, clearRecent } = useLocalCities()

  const hasRecent = recent.length > 0
  const trimmedQuery = query.trim()
  const statusMessage = useMemo(() => {
    if (searchState === "loading") {
      return "Buscando cidades..."
    }

    if (searchState === "empty") {
      return "Nenhuma cidade encontrada. Revise o nome ou tente uma cidade próxima."
    }

    if (searchState === "error") {
      return errorMessage
    }

    return ""
  }, [errorMessage, searchState])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (trimmedQuery.length < 2) {
      setResults([])
      setErrorMessage("Digite pelo menos 2 caracteres para buscar uma cidade.")
      setSearchState("error")
      return
    }

    setSearchState("loading")
    setErrorMessage("")

    try {
      const cities = await searchCities(trimmedQuery)
      setResults(cities)
      setSearchState(cities.length > 0 ? "success" : "empty")
    } catch (error) {
      setResults([])
      setErrorMessage(getSearchErrorMessage(error))
      setSearchState("error")
    }
  }

  return (
    <main className="home-page" id="main-content">
      <section className="search-panel" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="eyebrow">Planejamento por clima</p>
          <h1 id="home-title">Trip Weather Planner</h1>
          <p>
            Encontre o destino correto, compare cidades parecidas e abra a
            previsao para decidir como preparar a viagem.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="city-search">Cidade</label>
          <div className="search-control">
            <input
              autoComplete="off"
              id="city-search"
              inputMode="search"
              name="city"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: Rio de Janeiro"
              type="search"
              value={query}
            />
            <button disabled={searchState === "loading"} type="submit">
              {searchState === "loading" ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </section>

      <section
        aria-labelledby="results-title"
        aria-live="polite"
        className="content-section"
      >
        <div className="section-heading">
          <h2 id="results-title">Resultados</h2>
          {searchState === "success" ? (
            <span>{results.length} cidades</span>
          ) : null}
        </div>

        {statusMessage ? (
          <p
            className={
              searchState === "error" ? "state-message error" : "state-message"
            }
            role={searchState === "error" ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        ) : null}

        {searchState === "success" ? (
          <CityList
            cities={results}
            onSelectCity={addRecent}
            testId="search-results"
          />
        ) : null}
      </section>

      <section className="content-section" aria-labelledby="recent-title">
        <div className="section-heading">
          <h2 id="recent-title">Recentes</h2>
          {hasRecent ? (
            <button className="link-button" onClick={clearRecent} type="button">
              Limpar recentes
            </button>
          ) : null}
        </div>

        {hasRecent ? (
          <CityList cities={recent} onSelectCity={addRecent} testId="recent" />
        ) : (
          <p className="state-message">
            As cidades selecionadas aparecem aqui para acesso rapido.
          </p>
        )}
      </section>
    </main>
  )
}

function getSearchErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message
  }

  return "Nao foi possivel buscar cidades agora. Tente novamente em instantes."
}
