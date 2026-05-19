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
  | "NETWORK_ERROR"
  | "UNEXPECTED_RESPONSE"

type ApiErrorResponse = {
  error: {
    code: ApiErrorCode
    message: string
  }
}

type CitySearchResponse = {
  results: CityResult[]
}

type ForecastInput = {
  latitude: number
  longitude: number
  timezone?: string
}

export class ApiClientError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor(input: { code: ApiErrorCode; message: string; status?: number }) {
    super(input.message)
    this.name = "ApiClientError"
    this.code = input.code
    this.status = input.status
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:3000"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

export async function searchCities(query: string): Promise<CityResult[]> {
  const params = new URLSearchParams({ q: query })
  const response = await request<CitySearchResponse>(
    `/api/cities/search?${params.toString()}`,
  )

  return response.results
}

export async function getForecast(
  input: ForecastInput,
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
  })

  if (input.timezone) {
    params.set("timezone", input.timezone)
  }

  return request<WeatherForecast>(`/api/weather/forecast?${params.toString()}`)
}

async function request<T>(path: string): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  let response: Response

  try {
    response = await fetch(url)
  } catch {
    throw new ApiClientError({
      code: "NETWORK_ERROR",
      message: "Nao foi possivel conectar ao servidor local.",
    })
  }

  const payload = await readJson(response)

  if (!response.ok) {
    const error = parseApiError(payload)

    throw new ApiClientError({
      code: error.code,
      message: error.message,
      status: response.status,
    })
  }

  return payload as T
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new ApiClientError({
      code: "UNEXPECTED_RESPONSE",
      message: "O servidor retornou uma resposta invalida.",
      status: response.status,
    })
  }
}

function parseApiError(payload: unknown): ApiErrorResponse["error"] {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "code" in payload.error &&
    "message" in payload.error &&
    typeof payload.error.code === "string" &&
    typeof payload.error.message === "string"
  ) {
    return {
      code: toApiErrorCode(payload.error.code),
      message: payload.error.message,
    }
  }

  return {
    code: "UNEXPECTED_RESPONSE",
    message: "O servidor retornou um erro inesperado.",
  }
}

function toApiErrorCode(code: string): ApiErrorCode {
  if (
    code === "INVALID_REQUEST" ||
    code === "EXTERNAL_API_ERROR" ||
    code === "SERVICE_UNAVAILABLE"
  ) {
    return code
  }

  return "UNEXPECTED_RESPONSE"
}
