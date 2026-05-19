import { HomePage } from "./pages/home"
import { CityDetailsPage } from "./pages/city-details"

function App() {
  if (window.location.pathname === "/city") {
    return <CityDetailsPage />
  }

  return <HomePage />
}

export default App
