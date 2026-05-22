const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"
const GEO_URL = "https://api.openweathermap.org/geo/1.0"

export async function getWeather(city, unit = "metric") {
  if (!city || city.trim() === "") {
    throw new Error("City name is required")
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=${unit}`
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Weather API Error:", error)
    throw error
  }
}

export async function getWeatherByCoords(lat, lon, unit = "metric") {
  if (!lat || !lon) {
    throw new Error("Invalid coordinates")
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Weather API Error:", error)
    throw error
  }
}

export async function getWeatherAlerts(lat, lon) {
  try {
    // Note: Weather alerts require One Call API 3.0
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Alerts API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Alerts API Error:", error)
    // Return empty alerts instead of throwing
    return { alerts: [] }
  }
}

export async function searchCities(query) {
  if (!query || query.length < 2) return []
  
  try {
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Geo API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("City search error:", error)
    return []
  }
}