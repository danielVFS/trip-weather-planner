import { useMemo } from "react"

const coordinateFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export type CoordinateFormatter = {
  formatCoordinate: (value: number) => string
  formatCoordinateLabel: (latitude: number, longitude: number) => string
}

export function useCoordinateFormatter(): CoordinateFormatter {
  return useMemo(
    () => ({
      formatCoordinate: (value) => coordinateFormatter.format(value),
      formatCoordinateLabel: (latitude, longitude) =>
        `${coordinateFormatter.format(latitude)} lat, ${coordinateFormatter.format(
          longitude,
        )} lon`,
    }),
    [],
  )
}
