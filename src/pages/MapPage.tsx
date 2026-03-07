
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MapView from '../components/MapView'

export default function MapPage() {
  const [center, setCenter] = useState<[number, number] | undefined>(undefined)
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition((p) => setCenter([p.coords.longitude, p.coords.latitude]))
    return () => navigator.geolocation.clearWatch(id)
  }, [])
  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className="map-container" style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
        <MapView center={center} />

        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 1000 }}>
          <Link to="/new">
            <button className="primary" style={{ padding: '12px 24px', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
              📍 Adicionar Ponto
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
