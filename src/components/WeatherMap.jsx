import { useEffect, useRef } from 'react'

export default function WeatherMap({ lat, lon, zoom = 8 }) {
  const mapRef = useRef(null)

  useEffect(() => {
    // Create leaflet map container
    const mapContainer = mapRef.current
    
    // Load Leaflet dynamically
    const loadLeafletMap = async () => {
      // Check if Leaflet is already loaded
      if (!window.L) {
        const leafletCSS = document.createElement('link')
        leafletCSS.rel = 'stylesheet'
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(leafletCSS)
        
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.head.appendChild(script)
        })
      }
      
      // Wait for L to be available
      const waitForL = setInterval(() => {
        if (window.L) {
          clearInterval(waitForL)
          
          // Initialize map
          const map = window.L.map(mapContainer).setView([lat, lon], zoom)
          
          // Add OpenStreetMap tiles
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)
          
          // Add weather radar overlay (using OpenWeatherMap or other service)
          const radarLayer = window.L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_WEATHER_API_KEY}`, {
            attribution: 'Weather data © OpenWeatherMap',
            opacity: 0.6
          }).addTo(map)
          
          // Add marker for location
          const marker = window.L.marker([lat, lon]).addTo(map)
          marker.bindPopup(`<b>Weather at this location</b><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`).openPopup()
          
          // Layer control
          const baseMaps = {
            "Standard": window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
          }
          
          const overlayMaps = {
            "Precipitation": radarLayer,
            "Temperature": window.L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_WEATHER_API_KEY}`, { opacity: 0.6 }),
            "Clouds": window.L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_WEATHER_API_KEY}`, { opacity: 0.6 }),
            "Wind Speed": window.L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_WEATHER_API_KEY}`, { opacity: 0.6 }),
          }
          
          window.L.control.layers(baseMaps, overlayMaps).addTo(map)
        }
      }, 100)
    }
    
    loadLeafletMap()
    
    return () => {
      if (mapRef.current && window.L) {
        // Cleanup if needed
      }
    }
  }, [lat, lon, zoom])
  
  return (
    <div className="weather-map-container">
      <div className="map-header">
        <h3>🗺️ Interactive Weather Map</h3>
        <small>Toggle layers to see precipitation, temperature, and wind</small>
      </div>
      <div ref={mapRef} className="weather-map"></div>
    </div>
  )
}