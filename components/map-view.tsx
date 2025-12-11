"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Venue } from "@/lib/types"
import { useUserId } from "@/lib/use-user-id"
import { Button } from "@/components/ui/button"
import QRScanner from "./qr-scanner"
import VenueModal from "./venue-modal"
import CloudOverlay from "./cloud-overlay"

export default function MapView() {
  const userId = useUserId()
  const [venues, setVenues] = useState<Venue[]>([])
  const [userVisits, setUserVisits] = useState<Set<string>>(new Set())
  const [showScanner, setShowScanner] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: venuesData, error: venuesError } = await supabase.from("venues").select("*")

        if (venuesError) throw venuesError
        setVenues(venuesData || [])

        if (userId) {
          const { data: visitsData, error: visitsError } = await supabase
            .from("user_visits")
            .select("venue_id")
            .eq("user_id", userId)

          if (!visitsError && visitsData) {
            setUserVisits(new Set(visitsData.map((v) => v.venue_id)))
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load venues")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return
    setPanX(e.clientX - dragStart.x)
    setPanY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY })
  }

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    setPanX(touch.clientX - dragStart.x)
    setPanY(touch.clientY - dragStart.y)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleQRScanned = async (url: string) => {
    const venue = venues.find((v) => v.landing_url === url)
    if (venue) {
      setSelectedVenue(venue)
      setShowScanner(false)
    } else {
      setError("Venue not found")
    }
  }

  const handleClaimStamp = async (venue: Venue) => {
    if (!userId) return

    try {
      const { error } = await supabase.from("user_visits").insert({
        user_id: userId,
        venue_id: venue.id,
      })

      if (error) {
        if (error.code === "23505") {
          setError("You've already visited this venue!")
        } else {
          throw error
        }
      } else {
        setUserVisits((prev) => new Set([...prev, venue.id]))
        setSelectedVenue(null)
        window.open(venue.landing_url, "_blank")
      }
    } catch (err) {
      console.error("Error claiming stamp:", err)
      setError("Failed to claim stamp")
    }
  }

  const isVenueLocked = (venueId: string) => !userVisits.has(venueId)

  const getVenueIcon = (venue: Venue) => {
    // Extract emoji or icon type from venue name or use a default based on type
    if (venue.name.includes("Coffee")) return "☕"
    if (venue.name.includes("Record")) return "🎵"
    if (venue.name.includes("Garden")) return "🌿"
    if (venue.name.includes("Book")) return "📚"
    if (venue.name.includes("Art") || venue.name.includes("Gallery")) return "🎨"
    if (venue.name.includes("Bridge")) return "🌉"
    return "📍"
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50">
        <p className="text-foreground">Loading venues...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="mapBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        <path
          d="M 0 200 Q 250 150 500 200 T 1000 200"
          stroke="#cbd5e1"
          strokeWidth="1"
          fill="none"
          filter="url(#mapBlur)"
          opacity="0.4"
        />
        <path
          d="M 0 400 Q 250 350 500 400 T 1000 400"
          stroke="#cbd5e1"
          strokeWidth="1"
          fill="none"
          filter="url(#mapBlur)"
          opacity="0.3"
        />
        <path
          d="M 0 600 Q 250 550 500 600 T 1000 600"
          stroke="#cbd5e1"
          strokeWidth="1"
          fill="none"
          filter="url(#mapBlur)"
          opacity="0.2"
        />
      </svg>

      <div className="absolute inset-0 overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          viewBox="0 0 500 600"
          preserveAspectRatio="xMidYMid slice"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <filter id="softGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          <g transform={`translate(${panX}, ${panY})`}>
            {venues.map((venue) => {
              const x = ((venue.longitude + 122.5) / 0.3) * 500
              const y = ((37.85 - venue.latitude) / 0.15) * 600

              const locked = isVenueLocked(venue.id)
              const icon = getVenueIcon(venue)

              return (
                <g key={venue.id}>
                  {/* Pin glow effect */}
                  <circle cx={x} cy={y} r="18" fill="#0f172a" opacity={0.08} filter="url(#softGlow)" />

                  {/* Pin background circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill={locked ? "#94a3b8" : "#1e293b"}
                    opacity={locked ? 0.5 : 1}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setSelectedVenue(venue)
                    }}
                  />

                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="18"
                    fill="white"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {icon}
                  </text>

                  {locked && <CloudOverlay x={x} y={y} />}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm z-50">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          onClick={() => setShowScanner(true)}
          size="lg"
          className="rounded-full px-6 h-14 shadow-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Scan QR
        </Button>
      </div>

      {showScanner && <QRScanner onClose={() => setShowScanner(false)} onScan={handleQRScanned} />}

      {selectedVenue && (
        <VenueModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onClaim={() => handleClaimStamp(selectedVenue)}
          isAlreadyClaimed={!isVenueLocked(selectedVenue.id)}
        />
      )}
    </div>
  )
}
