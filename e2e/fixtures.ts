export type CityResult = {
  id: number
  name: string
  country: string
  region?: string
  latitude: number
  longitude: number
  timezone?: string
}

export type ForecastDay = {
  date: string
  minTemperatureC: number
  maxTemperatureC: number
  precipitationMm: number
  precipitationProbabilityPct?: number
  maxWindKmh: number
  weatherCode: number
  weatherDescription: string
}

export type WeatherForecast = {
  latitude: number
  longitude: number
  timezone: string
  current: ForecastDay
  daily: ForecastDay[]
}

export const rio: CityResult = {
  id: 3451190,
  name: "Rio de Janeiro",
  country: "Brasil",
  region: "Rio de Janeiro",
  latitude: -22.9068,
  longitude: -43.1729,
  timezone: "America/Sao_Paulo",
}

export const saoPaulo: CityResult = {
  id: 3448439,
  name: "Sao Paulo",
  country: "Brasil",
  region: "Sao Paulo",
  latitude: -23.5505,
  longitude: -46.6333,
  timezone: "America/Sao_Paulo",
}

export const forecast: WeatherForecast = {
  latitude: rio.latitude,
  longitude: rio.longitude,
  timezone: "America/Sao_Paulo",
  current: {
    date: "2026-05-19",
    minTemperatureC: 21,
    maxTemperatureC: 28,
    precipitationMm: 2.4,
    precipitationProbabilityPct: 35,
    maxWindKmh: 18,
    weatherCode: 3,
    weatherDescription: "Parcialmente nublado",
  },
  daily: [
    {
      date: "2026-05-20",
      minTemperatureC: 20,
      maxTemperatureC: 27,
      precipitationMm: 1.2,
      precipitationProbabilityPct: 20,
      maxWindKmh: 16,
      weatherCode: 2,
      weatherDescription: "Poucas nuvens",
    },
    {
      date: "2026-05-21",
      minTemperatureC: 19,
      maxTemperatureC: 25,
      precipitationMm: 8.8,
      precipitationProbabilityPct: 70,
      maxWindKmh: 24,
      weatherCode: 61,
      weatherDescription: "Chuva leve",
    },
  ],
}
