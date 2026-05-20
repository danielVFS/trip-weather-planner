import { RecentDetails } from "./recent-details"
import { useCityList } from "../hooks/use-city-list"
import { useCoordinateFormatter } from "../hooks/use-coordinate-formatter"
import type { RecentCity } from "../hooks/use-local-cities"
import type { CityResult } from "../services/api"

type CityListProps = {
  cities: CityResult[] | RecentCity[]
  favorites?: CityResult[]
  onSelectCity: (city: CityResult) => void
  testId: string
}

export function CityList({
  cities,
  favorites = [],
  onSelectCity,
  testId,
}: CityListProps) {
  const { formatCoordinateLabel } = useCoordinateFormatter()
  const { cityDetailsHref, isRecentCity, locationLabel } = useCityList()

  return (
    <ul className="city-list" data-testid={testId}>
      {cities.map((city) => {
        const favorite = favorites.some((item) => item.id === city.id)
        const recent = isRecentCity(city)

        return (
          <li key={city.id}>
            <a
              className={recent ? "city-card recent-city-card" : "city-card"}
              href={cityDetailsHref(city)}
              onClick={() => onSelectCity(city)}
            >
              <span className="city-main">
                <span className="city-card-header">
                  <span className="city-name">{city.name}</span>
                  {favorite ? (
                    <span
                      aria-hidden="true"
                      className="favorite-badge"
                      data-testid={`favorite-star-${city.id}`}
                    >
                      ★
                    </span>
                  ) : null}
                </span>
                <span className="city-meta">{locationLabel(city)}</span>
                <span className="city-coordinates">
                  {formatCoordinateLabel(city.latitude, city.longitude)}
                </span>
              </span>
              {recent ? <RecentDetails city={city} /> : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
