"use client"

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Venue } from "@/lib/types"
import L from "leaflet"
import { useEffect } from "react"

// Fix for default marker icon in Leaflet + Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

interface MapComponentProps {
  venues: Venue[]
  userVisits: Set<string>
  onVenueClick: (venue: Venue) => void
  onMapClick?: () => void
}

// Componnet to handle map events
function MapEvents({ onMapClick }: { onMapClick?: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick?.()
    },
  })
  return null
}

export default function MapComponent({ venues, userVisits, onVenueClick, onMapClick }: MapComponentProps) {
  useEffect(() => {
    // Ensuring Leaflet icons work correctly
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
    })
  }, [])

  // Center on Kuala Lumpur roughly
  const centerPosition: [number, number] = [3.15, 101.695]
  
  // Malaysia Bounds (approximate)
  // South-West: 0.8, 98.0 (Includes Sumatra edge for that one venue)
  // North-East: 7.5, 120.0
  const maxBounds: L.LatLngBoundsExpression = [
    [0.0, 95.0],
    [8.0, 120.0],
  ]

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={13} 
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      minZoom={10}
      maxBounds={maxBounds}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapEvents onMapClick={onMapClick} />

      {venues.map((venue) => {
        const isVisited = userVisits.has(venue.id)

        return (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={defaultIcon}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e) // Prevent map click from firing
                onVenueClick(venue)
              },
            }}
          >
            <Popup>
              <div className="text-sm font-semibold">{venue.name}</div>
              <div className="text-xs text-muted-foreground">
                {isVisited ? "Visited ✅" : "Not visited yet"}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
