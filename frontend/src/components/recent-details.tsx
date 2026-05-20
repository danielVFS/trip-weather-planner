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
      <span>Busca: {formatDate(city.searchedAt)}</span>
      {city.weatherSnapshot ? (
        <span>
          Min {formatTemperature(city.weatherSnapshot.minTemperatureC)} · Max{" "}
          {formatTemperature(city.weatherSnapshot.maxTemperatureC)}
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
