import type { RecentCity } from "../hooks/use-local-cities"

type RecentDetailsProps = {
  city: RecentCity
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const temperatureFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
})

export function RecentDetails({ city }: RecentDetailsProps) {
  return (
    <span className="recent-details">
      <span className="recent-date">
        <span className="recent-label">Última vez buscado</span>{" "}
        <span className="recent-value">{formatDate(city.searchedAt)}</span>
      </span>
      {city.weatherSnapshot ? (
        <span className="recent-temperature-row">
          <span className="recent-temperature-pill">
            <span className="recent-label">Min</span>{" "}
            <span className="recent-value">
              {formatTemperature(city.weatherSnapshot.minTemperatureC)}
            </span>
          </span>
          <span className="recent-temperature-pill">
            <span className="recent-label">Max</span>{" "}
            <span className="recent-value">
              {formatTemperature(city.weatherSnapshot.maxTemperatureC)}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  )
}

function formatDate(date: string): string {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data indisponivel"
  }

  return dateFormatter.format(parsedDate)
}

function formatTemperature(value: number): string {
  return `${temperatureFormatter.format(value)} °C`
}
