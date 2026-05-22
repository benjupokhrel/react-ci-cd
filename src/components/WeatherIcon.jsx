import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog
} from "react-icons/wi"

export default function WeatherIcon({ type }) {

  const t = type?.toLowerCase()

  const style = {
    color: "#38bdf8",
    filter: "drop-shadow(0 0 10px rgba(56,189,248,0.6))"
  }

  if (t?.includes("cloud")) return <WiCloud size={80} style={style} />
  if (t?.includes("rain")) return <WiRain size={80} style={style} />
  if (t?.includes("thunder")) return <WiThunderstorm size={80} style={style} />
  if (t?.includes("snow")) return <WiSnow size={80} style={style} />
  if (t?.includes("fog") || t?.includes("mist")) return <WiFog size={80} style={style} />

  return <WiDaySunny size={80} style={style} />
}