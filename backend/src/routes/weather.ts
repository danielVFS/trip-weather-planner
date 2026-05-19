import { Hono } from "hono"

import { getForecast, OpenMeteoError } from "../services/open-meteo"
import type { ApiErrorResponse } from "../types/weather"

export const weatherRoutes = new Hono()

weatherRoutes.get("/forecast", async (c) => {
  const latitude = parseCoordinate(c.req.query("latitude"))
  const longitude = parseCoordinate(c.req.query("longitude"))
  const timezone = c.req.query("timezone")?.trim()

  if (latitude === undefined || latitude < -90 || latitude > 90) {
    return invalidRequest("Informe uma latitude valida entre -90 e 90.")
  }

  if (longitude === undefined || longitude < -180 || longitude > 180) {
    return invalidRequest("Informe uma longitude valida entre -180 e 180.")
  }

  if (timezone && !isValidTimezoneParam(timezone)) {
    return invalidRequest("Informe um timezone valido.")
  }

  try {
    return c.json(
      await getForecast({
        latitude,
        longitude,
        ...(timezone ? { timezone } : {}),
      }),
    )
  } catch (error) {
    return openMeteoErrorResponse(error)
  }
})

function parseCoordinate(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

function isValidTimezoneParam(value: string): boolean {
  if (value === "auto") {
    return true
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
}

function invalidRequest(message: string): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "INVALID_REQUEST",
        message,
      },
    } satisfies ApiErrorResponse),
    {
      status: 400,
      headers: {
        "content-type": "application/json",
      },
    },
  )
}

function openMeteoErrorResponse(error: unknown): Response {
  if (error instanceof OpenMeteoError && error.kind === "external") {
    return new Response(
      JSON.stringify({
        error: {
          code: "EXTERNAL_API_ERROR",
          message: "Nao foi possivel buscar a previsao no momento.",
        },
      } satisfies ApiErrorResponse),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
        },
      },
    )
  }

  return new Response(
    JSON.stringify({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Servico de previsao temporariamente indisponivel.",
      },
    } satisfies ApiErrorResponse),
    {
      status: 503,
      headers: {
        "content-type": "application/json",
      },
    },
  )
}
