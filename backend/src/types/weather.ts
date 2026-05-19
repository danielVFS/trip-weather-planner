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

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "EXTERNAL_API_ERROR"
  | "SERVICE_UNAVAILABLE"

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode
    message: string
  }
}

export type HealthResponse = {
  status: "ok"
  service: "trip-weather-planner-backend"
}

export type CitySearchResponse = {
  results: CityResult[]
}
