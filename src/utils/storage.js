const STORAGE_KEY = "neoWeather_recent"

export function getRecentSearches() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error("Failed to load recent searches:", error)
    return []
  }
}

export function saveRecentSearch(city) {
  try {
    const recent = getRecentSearches()
    const updated = [city, ...recent.filter(c => c !== city)]
    const limited = updated.slice(0, 5)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
    return limited
  } catch (error) {
    console.error("Failed to save recent search:", error)
    return []
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return []
  } catch (error) {
    console.error("Failed to clear recent searches:", error)
    return []
  }
}