import { Hono } from "hono"
import { cors } from "hono/cors"

import { citiesRoutes } from "./routes/cities"
import { weatherRoutes } from "./routes/weather"
import type { HealthResponse } from "./types/weather"

export const app = new Hono()

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
