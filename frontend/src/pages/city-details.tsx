import { useCityDetailsPageData } from "../hooks/use-city-details-page-data"
import { useCoordinateFormatter } from "../hooks/use-coordinate-formatter"
import type { ForecastDay } from "../services/api"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  weekday: "short",
})

const temperatureFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

export function CityDetailsPage() {
  const { formatCoordinateLabel } = useCoordinateFormatter()
  const {
    details,
    errorMessage,
    favorite,
    forecast,
    forecastState,
    toggleFavorite,
  } = useCityDetailsPageData()

  const pageTitle = details?.city.name || "Cidade"

  return (
    <main className="home-page city-details-page" id="main-content">
      <section className="details-header" aria-labelledby="details-title">
        <div className="home-copy">
          <p className="eyebrow">Previsao por coordenadas</p>
          <h1 id="details-title">{pageTitle}</h1>
          {details ? (
            <p>
              {[details.city.region, details.city.country].filter(Boolean).join(", ")}
              <span className="coordinate-line">
                {formatCoordinateLabel(details.latitude, details.longitude)}
              </span>
            </p>
          ) : (
            <p>Abra a previsao a partir de um resultado de busca valido.</p>
          )}
        </div>

        <div className="details-actions">
          <a className="secondary-action" href="/">
            Voltar para busca
          </a>
          {details ? (
            <button
              className={
                favorite ? "primary-action favorite-action" : "primary-action"
              }
              onClick={toggleFavorite}
              type="button"
            >
              <span
                aria-hidden="true"
                className="favorite-action-star"
                data-testid="favorite-action-star"
              >
                ★
              </span>
              {favorite ? "Remover favorito" : "Favoritar cidade"}
            </button>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="forecast-title"
        aria-live="polite"
        className="content-section"
      >
        <div className="section-heading">
          <h2 id="forecast-title">Resumo</h2>
          {forecast?.timezone ? <span>{forecast.timezone}</span> : null}
        </div>

        {forecastState === "loading" ? (
          <p className="state-message" role="status">
            Carregando previsao...
          </p>
        ) : null}

        {forecastState === "error" ? (
          <p className="state-message error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {forecastState === "empty" ? (
          <p className="state-message" role="status">
            Nao ha dados suficientes para exibir a previsao desta cidade.
          </p>
        ) : null}

        {forecastState === "success" && forecast ? (
          <ForecastSummary day={forecast.current} />
        ) : null}
      </section>

      {forecastState === "success" && forecast ? (
        <section className="content-section" aria-labelledby="daily-title">
          <div className="section-heading">
            <h2 id="daily-title">Proximos dias</h2>
            <span>{forecast.daily.length} dias</span>
          </div>

          <ul className="forecast-list">
            {forecast.daily.map((day) => (
              <ForecastDayCard day={day} key={day.date} />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

function ForecastSummary({ day }: { day: ForecastDay }) {
  return (
    <article className="forecast-summary">
      <div>
        <p className="summary-date">{formatDate(day.date)}</p>
        <h2>{day.weatherDescription}</h2>
      </div>
      <dl className="metric-grid">
        <Metric label="Minima" value={formatTemperature(day.minTemperatureC)} />
        <Metric label="Maxima" value={formatTemperature(day.maxTemperatureC)} />
        <Metric label="Chuva" value={formatRain(day)} />
        <Metric label="Vento" value={formatWind(day.maxWindKmh)} />
      </dl>
    </article>
  )
}

function ForecastDayCard({ day }: { day: ForecastDay }) {
  return (
    <li className="forecast-card">
      <div>
        <p className="summary-date">{formatDate(day.date)}</p>
        <h3>{day.weatherDescription}</h3>
        <p>Codigo {day.weatherCode}</p>
      </div>
      <dl className="forecast-metrics">
        <Metric label="Min" value={formatTemperature(day.minTemperatureC)} />
        <Metric label="Max" value={formatTemperature(day.maxTemperatureC)} />
        <Metric label="Chuva" value={formatRain(day)} />
        <Metric label="Vento" value={formatWind(day.maxWindKmh)} />
      </dl>
    </li>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function formatDate(date: string): string {
  const dateOnly = date.split("T")[0]
  const parsedDate = new Date(`${dateOnly}T12:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data indisponivel"
  }

  return dateFormatter.format(parsedDate)
}

function formatTemperature(value: number): string {
  return `${temperatureFormatter.format(value)} °C`
}

function formatRain(day: ForecastDay): string {
  if (typeof day.precipitationProbabilityPct === "number") {
    return `${temperatureFormatter.format(day.precipitationProbabilityPct)}% / ${decimalFormatter.format(
      day.precipitationMm,
    )} mm`
  }

  return `${decimalFormatter.format(day.precipitationMm)} mm`
}

function formatWind(value: number): string {
  return `${temperatureFormatter.format(value)} km/h`
}
