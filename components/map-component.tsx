"use client"

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Venue } from "@/lib/types"
import L from "leaflet"
import { useEffect } from "react"

// Custom Marker Icons
const createCustomIcon = (isVisited: boolean) => {
  // Passport colors: Accent (#c4a57b) for unvisited, Footer/Dark (#3a2515) for visited
  const color = isVisited ? "#3a2515" : "#c4a57b"

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="${isVisited ? '#f5ead6' : '#3a2515'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2c-4.418 0-8 3.582-8 8 0 5.25 8 12 8 12s8-6.75 8-12c0-4.418-3.582-8-8-8z" />
      <circle cx="12" cy="10" r="3" fill="${isVisited ? '#f5ead6' : '#fff9e6'}" stroke="none" />
    </svg>
  `

  return L.divIcon({
    className: "custom-map-marker",
    html: svg,
    iconSize: [48, 63],
    iconAnchor: [24, 63],
    popupAnchor: [0, -66],
  })
}

interface MapComponentProps {
  venues: Venue[]
  userVisits: Set<string>
  onVenueClick: (venue: Venue) => void
  onMapClick?: () => void
}

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
    // Ensuring Leaflet icons work correctly (though we are using custom ones mostly)
    // Keep this for any fallback
  }, [])

  // Center on Kuala Lumpur roughly
  const centerPosition: [number, number] = [3.15, 101.695]

  // Tight bounds around the center - limits dragging to ~5km radius
  const maxBounds: L.LatLngBoundsExpression = [
    [3.10, 101.645],  // Southwest corner
    [3.20, 101.745],  // Northeast corner
  ]

  return (
    <>
      <style jsx global>{`
        /* Vintage Paper Effect using Sepia filter on the map tiles */
        .leaflet-layer {
          filter: sepia(0.5) contrast(0.9) brightness(0.95);
        }
        
        /* Map background to match passport page */
        .leaflet-container {
          background-color: #f5f1e8 !important;
          font-family: Georgia, serif;
        }

        /* Styling Popup to match passport aesthetic */
        .leaflet-popup-content-wrapper {
          background-color: #f5f1e8;
          border: 1px solid #c4a57b;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(58, 37, 21, 0.2);
          padding: 0;
        }
        .leaflet-popup-tip {
          background-color: #f5f1e8;
          border: 1px solid #c4a57b;
          border-top: none; 
          border-left: none;
        }
        .leaflet-popup-content {
          margin: 10px 14px;
        }
      `}</style>

      <MapContainer
        center={centerPosition}
        zoom={14}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        minZoom={12}
        maxZoom={16}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        attributionControl={false}
      >
        <TileLayer
          // Use CartoDB Light but tweaked with CSS filter above
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapEvents onMapClick={onMapClick} />

        {venues.map((venue) => {
          const isVisited = userVisits.has(venue.id)

          return (
            <Marker
              key={venue.id}
              position={[venue.latitude, venue.longitude]}
              icon={createCustomIcon(isVisited)}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e)
                  onVenueClick(venue)
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <div className="text-base font-bold text-[#3a2515]" style={{ fontFamily: "Georgia, serif" }}>
                    {venue.name}
                  </div>
                  <div className="text-xs text-[#c4a57b] uppercase tracking-wider mt-1 font-semibold">
                    {isVisited ? "Stamp Collected" : "Visit to Collect"}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}
