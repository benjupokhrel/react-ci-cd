import { useState } from 'react'

export default function WeatherAlert({ alert }) {
  const [expanded, setExpanded] = useState(false)
  
  const getSeverityColor = (severity) => {
    const s = severity?.toLowerCase() || ''
    if (s.includes('extreme') || s.includes('severe')) return '#ef4444'
    if (s.includes('moderate')) return '#f59e0b'
    if (s.includes('minor')) return '#3b82f6'
    return '#10b981'
  }
  
  const getAlertIcon = (event) => {
    const e = event?.toLowerCase() || ''
    if (e.includes('storm')) return '⛈️'
    if (e.includes('rain') || e.includes('flood')) return '🌧️'
    if (e.includes('wind')) return '💨'
    if (e.includes('snow') || e.includes('ice')) return '❄️'
    if (e.includes('heat')) return '🔥'
    if (e.includes('cold') || e.includes('freeze')) return '🥶'
    if (e.includes('fog')) return '🌫️'
    return '⚠️'
  }
  
  return (
    <div 
      className="weather-alert" 
      style={{ borderLeftColor: getSeverityColor(alert.severity) }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="alert-header">
        <div className="alert-icon">
          {getAlertIcon(alert.event)}
        </div>
        <div className="alert-info">
          <h4>{alert.event}</h4>
          <p className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
            {alert.severity || 'Alert'} Level
          </p>
        </div>
        <button className="alert-toggle">
          {expanded ? '▲' : '▼'}
        </button>
      </div>
      
      {expanded && (
        <div className="alert-details">
          <p className="alert-description">{alert.description}</p>
          {alert.start && alert.end && (
            <div className="alert-time">
              <span>🕐 From: {new Date(alert.start * 1000).toLocaleString()}</span>
              <span>⏰ To: {new Date(alert.end * 1000).toLocaleString()}</span>
            </div>
          )}
          {alert.tags && alert.tags.length > 0 && (
            <div className="alert-tags">
              {alert.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="alert-action">
            <small>⚠️ Take necessary precautions</small>
          </div>
        </div>
      )}
    </div>
  )
}