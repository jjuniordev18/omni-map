import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { db } from '../services/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'

export default function MapView({ center }: { center?: [number, number] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({})
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return

    const styleObj: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community'
        }
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }

    mapRef.current = new maplibregl.Map({
      container: ref.current,
      style: styleObj,
      center: center || [-50.15, -6.05],
      zoom: 14
    })

    mapRef.current.addControl(new maplibregl.NavigationControl())
    mapRef.current.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }))

    const q = query(collection(db, 'emergencyPoints'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!mapRef.current) return

      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data()
        const id = change.doc.id

        if (change.type === 'removed') {
          if (markersRef.current[id]) {
            markersRef.current[id].remove()
            delete markersRef.current[id]
          }
          return
        }

        if (data.coordinates) {
          const { lat, lng } = data.coordinates
          const nomeLocal = data.nomeLocal || data.title || 'Ponto sem nome'
          const tipo = data.type || 'Ponto de Emergência'
          const minaLoc = data.minaLoc || 'Não informada'

          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="color: #333; font-family: sans-serif; min-width: 180px; padding: 4px;">
              <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #0f766e; border-bottom: 1px solid #eee; padding-bottom: 6px;">
                📍 ${nomeLocal}
              </h3>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #444;">
                <b>Tipo:</b> ${tipo}<br/>
                <b>Mina:</b> ${minaLoc}
              </p>
              ${data.pontoEmergencia ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #444;"><b>Emergência:</b> ${data.pontoEmergencia}</p>` : ''}
              ${data.pontoReferencia ? `<p style="margin: 0 0 8px 0; font-size: 11px; color: #666;"><b>Referência:</b> ${data.pontoReferencia}</p>` : ''}
              <button 
                onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}', '_blank')"
                style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; font-size: 12px; margin-top: 4px;">
                🧭 Gerar Rota
              </button>
            </div>
          `)

          const markerColor = tipo === 'Nova Torre' ? '#0f766e' : 
                             tipo === 'Nova COW' ? '#7c3aed' : 
                             tipo === 'Novo Poste' ? '#ca8a04' : 
                             tipo === 'Nova Repetidora' ? '#059669' : '#ef4444'
          
          if (!mapRef.current) return
          
          if (change.type === 'added' || !markersRef.current[id]) {
            const marker = new maplibregl.Marker({ color: markerColor })
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(mapRef.current)
            markersRef.current[id] = marker
          } else if (change.type === 'modified') {
            markersRef.current[id].setLngLat([lng, lat]).setPopup(popup)
          }
        }
      })
    })

    return () => {
      unsubscribe()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !center) return

    if (!userLocationMarkerRef.current) {
      const el = document.createElement('div')
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.backgroundColor = '#3b82f6'
      el.style.border = '3px solid white'
      el.style.borderRadius = '50%'
      el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.8)'
      el.style.cursor = 'pointer'
      
      userLocationMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(center)
        .addTo(mapRef.current)
    } else {
      userLocationMarkerRef.current.setLngLat(center)
    }
    
    mapRef.current.setCenter(center)
    mapRef.current.setZoom(16)
  }, [center])

  return <div id="map" ref={ref} style={{ width: '100%', height: '100%', minHeight: '70vh', borderRadius: 12 }} />
}
