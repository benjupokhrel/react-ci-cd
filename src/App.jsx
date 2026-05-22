import { useState, useEffect, useCallback } from "react"
import "./index.css"
import WeatherIcon from "./components/WeatherIcon"
import Loader from "./components/Loader"
import ErrorBoundary from "./components/ErrorBoundary"
import WeatherMap from "./components/WeatherMap"
import WeatherAlert from "./components/WeatherAlert"
import { getWeather, getWeatherByCoords, getWeatherAlerts } from "./services/weatherApi"
import { getRecentSearches, saveRecentSearch } from "./utils/storage"

function App() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recent, setRecent] = useState([])
  const [unit, setUnit] = useState("metric")
  const [useLocation, setUseLocation] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [showMap, setShowMap] = useState(false)
  const [weatherCondition, setWeatherCondition] = useState("clear")

  useEffect(() => {
    setRecent(getRecentSearches())
  }, [])

  const getWeatherBackground = (condition) => {
    const cond = condition?.toLowerCase() || ""
    
    if (cond.includes("rain") || cond.includes("drizzle")) {
      return "bg-rainy"
    }
    if (cond.includes("cloud")) {
      return "bg-cloudy"
    }
    if (cond.includes("snow")) {
      return "bg-snowy"
    }
    if (cond.includes("thunder") || cond.includes("storm")) {
      return "bg-stormy"
    }
    if (cond.includes("fog") || cond.includes("mist") || cond.includes("haze")) {
      return "bg-foggy"
    }
    if (cond.includes("clear") || cond.includes("sun")) {
      return "bg-sunny"
    }
    return "bg-default"
  }

  const searchWeather = useCallback(async (searchCity, useUnit = unit) => {
    if (!searchCity.trim()) return

    try {
      setLoading(true)
      setError("")
      setAlerts([])
      
      const data = await getWeather(searchCity, useUnit)

      if (data.cod !== 200) {
        setError(data.message || "City not found")
        setWeather(null)
        return
      }

      setWeather(data)
      setWeatherCondition(data.weather[0]?.main || "clear")
      
      // Fetch weather alerts
      try {
        const alertData = await getWeatherAlerts(data.coord.lat, data.coord.lon)
        if (alertData && alertData.alerts) {
          setAlerts(alertData.alerts)
        }
      } catch (alertErr) {
        console.log("No alerts for this area")
      }
      
      saveRecentSearch(searchCity)
      setRecent(getRecentSearches())
      
    } catch (err) {
      setError(err.message || "Network error. Please check your connection.")
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }, [unit])

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setUseLocation(true)
    setLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const data = await getWeatherByCoords(latitude, longitude, unit)
          
          if (data.cod !== 200) {
            setError(data.message || "Location not found")
            setWeather(null)
          } else {
            setWeather(data)
            setWeatherCondition(data.weather[0]?.main || "clear")
            setCity(data.name)
            
            // Fetch alerts for location
            try {
              const alertData = await getWeatherAlerts(latitude, longitude)
              if (alertData && alertData.alerts) {
                setAlerts(alertData.alerts)
              }
            } catch (alertErr) {
              console.log("No alerts for this area")
            }
            
            saveRecentSearch(data.name)
            setRecent(getRecentSearches())
            setError("")
          }
        } catch (err) {
          setError("Failed to get weather for your location")
        } finally {
          setLoading(false)
          setUseLocation(false)
        }
      },
      (error) => {
        setError("Unable to access your location. Please enable location services.")
        setLoading(false)
        setUseLocation(false)
      }
    )
  }, [unit])

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchWeather(city)
    }
  }

  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric"
    setUnit(newUnit)
    
    if (weather && weather.name) {
      searchWeather(weather.name, newUnit)
    }
  }

  const formatTemp = (temp) => {
    if (unit === "metric") return `${Math.round(temp)}°C`
    return `${Math.round(temp)}°F`
  }

  const formatSpeed = (speed) => {
    if (unit === "metric") return `${Math.round(speed)} km/h`
    return `${Math.round(speed)} mph`
  }

  const backgroundClass = weather ? getWeatherBackground(weather.weather[0]?.main) : "bg-default"

  return (
    <ErrorBoundary>
      <div className={`app ${backgroundClass}`}>
        <div className="weather-card">
          <div className="card-header">
            <h1 className="logo">🌤️ NeoWeather PRO</h1>
            <div className="header-buttons">
              {weather && (
                <button 
                  onClick={() => setShowMap(!showMap)} 
                  className="map-toggle"
                  aria-label="Toggle weather map"
                >
                  {showMap ? "📊 Close Map" : "🗺️ Show Map"}
                </button>
              )}
              <button 
                onClick={toggleUnit} 
                className="unit-toggle"
                aria-label="Toggle temperature unit"
              >
                {unit === "metric" ? "°C" : "°F"}
              </button>
            </div>
          </div>

          <div className="search-box">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search city... (e.g., London, Tokyo, NY)"
              aria-label="City name"
              disabled={loading || useLocation}
            />
            <button 
              onClick={() => searchWeather(city)} 
              disabled={loading || useLocation || !city.trim()}
              aria-label="Search"
            >
              🔍
            </button>
            <button 
              onClick={getUserLocation} 
              className="location-btn"
              disabled={loading || useLocation}
              aria-label="Use my location"
            >
              📍
            </button>
          </div>

          {recent.length > 0 && (
            <div className="recent">
              <span className="recent-label">Recent:</span>
              {recent.map((r, i) => (
                <button 
                  key={`${r}-${i}`} 
                  onClick={() => {
                    setCity(r)
                    searchWeather(r)
                  }}
                  className="recent-btn"
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {loading && <Loader text={useLocation ? "Getting your location..." : "Fetching weather data..."} />}
          
          {error && (
            <div className="error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {alerts.length > 0 && (
            <div className="alerts-container">
              {alerts.map((alert, index) => (
                <WeatherAlert key={index} alert={alert} />
              ))}
            </div>
          )}

          {showMap && weather && (
            <WeatherMap 
              lat={weather.coord.lat} 
              lon={weather.coord.lon} 
              zoom={8}
            />
          )}

          {weather && weather.main && (
            <div className="weather-info">
              <div className="location-info">
                <h2>{weather.name}, {weather.sys?.country}</h2>
                <p className="coords">
                  {weather.coord?.lat?.toFixed(2)}°N, {weather.coord?.lon?.toFixed(2)}°E
                </p>
                <p className="last-updated">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <WeatherIcon type={weather.weather[0].main} />

              <div className="temp">
                {formatTemp(weather.main.temp)}
                <span className="feels-like">
                  Feels like {formatTemp(weather.main.feels_like)}
                </span>
              </div>

              <p className="desc">
                {weather.weather[0].description}
              </p>

              <div className="details-grid">
                <div className="detail-card">
                  <span>💧 Humidity</span>
                  <h3>{weather.main.humidity}%</h3>
                </div>
                <div className="detail-card">
                  <span>💨 Wind</span>
                  <h3>{formatSpeed(weather.wind.speed)}</h3>
                </div>
                <div className="detail-card">
                  <span>🎯 Pressure</span>
                  <h3>{weather.main.pressure} hPa</h3>
                </div>
                <div className="detail-card">
                  <span>👁️ Visibility</span>
                  <h3>{(weather.visibility / 1000).toFixed(1)} km</h3>
                </div>
              </div>

              {weather.rain && (
                <div className="extra-info rain-effect">
                  🌧️ Rain last 3h: {weather.rain["3h"]} mm
                </div>
              )}
              
              {weather.snow && (
                <div className="extra-info">
                  ❄️ Snow last 3h: {weather.snow["3h"]} mm
                </div>
              )}

              {weather.main.temp_max && (
                <div className="temp-range">
                  <span>📈 High: {formatTemp(weather.main.temp_max)}</span>
                  <span>📉 Low: {formatTemp(weather.main.temp_min)}</span>
                </div>
              )}
            </div>
          )}

          {!weather && !loading && !error && (
            <div className="welcome">
              <p>✨ Search for a city or use your location</p>
              <small>Get real-time weather updates with interactive maps</small>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App