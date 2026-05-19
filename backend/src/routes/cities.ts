import { Hono } from "hono"

import { OpenMeteoError, searchCities } from "../services/open-meteo"
import type { ApiErrorResponse, CitySearchResponse } from "../types/weather"

export const citiesRoutes = new Hono()

citiesRoutes.get("/search", async (c) => {
  const query = c.req.query("q")?.trim()

  if (!query || query.length < 2) {
    return c.json<ApiErrorResponse>(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Informe uma cidade com pelo menos 2 caracteres.",
        },
      },
      400,
    )
  }

  try {
    const results = await searchCities({ query, language: "pt" })

    return c.json<CitySearchResponse>({ results })
  } catch (error) {
    return openMeteoErrorResponse(error)
  }
})

function openMeteoErrorResponse(error: unknown): Response {
  if (error instanceof OpenMeteoError && error.kind === "external") {
    return new Response(
      JSON.stringify({
        error: {
          code: "EXTERNAL_API_ERROR",
          message: "Nao foi possivel buscar cidades no momento.",
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
        message: "Servico de cidades temporariamente indisponivel.",
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
