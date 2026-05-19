import { useCoordinateFormatter } from "../hooks/use-coordinate-formatter"
import type { CityResult } from "../services/api"

type CityListProps = {
  cities: CityResult[]
  onSelectCity: (city: CityResult) => void
  testId: string
}

export function CityList({ cities, onSelectCity, testId }: CityListProps) {
  const { formatCoordinateLabel } = useCoordinateFormatter()

  return (
    <ul className="city-list" data-testid={testId}>
      {cities.map((city) => (
        <li key={city.id}>
          <a
            className="city-card"
            href={cityDetailsHref(city)}
            onClick={() => onSelectCity(city)}
          >
            <span className="city-name">{city.name}</span>
            <span className="city-meta">{locationLabel(city)}</span>
            <span className="city-coordinates">
              {formatCoordinateLabel(city.latitude, city.longitude)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function cityDetailsHref(city: CityResult): string {
  const params = new URLSearchParams({
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
