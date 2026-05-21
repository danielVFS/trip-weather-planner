import { Hono } from "hono"
import { cors } from "hono/cors"

import { citiesRoutes } from "./routes/cities"
import { weatherRoutes } from "./routes/weather"
import type { HealthResponse } from "./types/weather"

export const app = new Hono()

app.use("*", async (c, next) => {
  const startedAt = performance.now()
  const route = new URL(c.req.url).pathname

  await next()

  const durationMs = Math.round((performance.now() - startedAt) * 100) / 100
  const status = c.res.status
  const errorType =
    status >= 500
      ? status === 502
        ? "external"
        : "unavailable"
      : status >= 400
        ? "client"
        : "none"

  console.info(
    JSON.stringify({
      durationMs,
      errorType,
      method: c.req.method,
      origin: errorType === "external" ? "open-meteo" : "internal",
      route,
      status,
    }),
  )
})

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "OPTIONS"],
  }),
)

app.get("/health", (c) => {
  const response: HealthResponse = {
    status: "ok",
    service: "trip-weather-planner-backend",
  }

  return c.json(response)
})

app.route("/api/cities", citiesRoutes)
app.route("/api/weather", weatherRoutes)

if (import.meta.main) {
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  })
}

export default app
