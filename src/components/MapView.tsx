import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { db } from '../services/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'

export default function MapView({ center }: { center?: [number, number] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({})

  useEffect(() => {
    if (!ref.current || mapRef.current) return

    // Utilizando satélite da Esri World Imagery gratuito
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

    // Sincronização em tempo real com Firebase para mostrar pontos de todos
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

          // Criar popup com informações e botão de rota
          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="color: #333; font-family: sans-serif; min-width: 150px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px;">${data.title || data.type || 'Ponto'}</h3>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">
                <b>Localização:</b> ${data.minaLoc || 'Não informada'}<br/>
                <b>Tipo:</b> ${data.type || '-'}
              </p>
              <button 
                onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}', '_blank')"
                style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; font-size: 12px;">
                📍 Gerar Rota
              </button>
            </div>
          `)

          if (change.type === 'added' || !markersRef.current[id]) {
            const marker = new maplibregl.Marker({ color: "#ef4444" })
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
    if (mapRef.current && center) {
      mapRef.current.setCenter(center)
      // Dá um pequeno zoom in quando acha a pessoa
      mapRef.current.setZoom(16)
    }
  }, [center])

  return <div id="map" ref={ref} style={{ width: '100%', height: '100%', minHeight: '70vh', borderRadius: 12 }} />
}
