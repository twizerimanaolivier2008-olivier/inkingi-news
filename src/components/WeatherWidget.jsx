import { useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Cloud, CloudRain, Sun, CloudFog, Thermometer, Droplets } from 'lucide-react'

const iconMap = {
  cloud: Cloud,
  rain: CloudRain,
  sun: Sun,
  fog: CloudFog,
}

export default function WeatherWidget() {
  const { token } = useAdminAuth()
  const [weather, setWeather] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchWeather = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/weather', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setWeather(data)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchWeather()
  }, [token])

  if (loading || weather.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Cloud className="w-4 h-4 text-[#D72638]" /> Weather
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {weather.map((w) => {
          const Icon = iconMap[w.icon] || Cloud
          return (
            <div key={w.city} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-[#D72638]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{w.city}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5"><Thermometer className="w-3 h-3" /> {w.temp}°C</span>
                  <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" /> {w.humidity}%</span>
                </div>
                <p className="text-[10px] text-gray-400">{w.condition}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
