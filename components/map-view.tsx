"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import type { Venue } from "@/lib/types"
import { useUserId } from "@/lib/use-user-id"
import { Button } from "@/components/ui/button"
import QRScanner from "./qr-scanner"
import VenueModal from "./venue-modal"
import { VENUES } from "@/lib/venues"

// Dynamically import the map component with no SSR to avoid window not defined errors
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-dvh flex items-center justify-center bg-slate-100">
      <p className="text-slate-500">Loading Map...</p>
    </div>
  ),
})

export default function MapView() {
  const userId = useUserId()
  const [venues, setVenues] = useState<Venue[]>([])
  const [userVisits, setUserVisits] = useState<Set<string>>(new Set())
  const [showScanner, setShowScanner] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch venues
        const { data: venuesData } = await supabase.from("venues").select("*")
        if (venuesData) {
          setVenues(venuesData)
        }

        // Fetch user visits
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
      }
    }

    loadData()
  }, [userId])

  const handleQRScanned = async (url: string) => {
    const venue = venues.find((v) => v.landing_url === url)
    if (venue) {
      // Direct claim and redirect logic
      await handleClaimStamp(venue)
      setShowScanner(false)
    } else {
      setError("Venue not found in our database")
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

  return (
    // Changed h-screen to h-dvh for better mobile browser support
    <div className="relative w-full h-dvh overflow-hidden">
      <MapComponent
        venues={venues.length > 0 ? venues : VENUES} // Fallback to types if needed or just venues
        userVisits={userVisits}
        onVenueClick={setSelectedVenue}
        // Allow closing the modal by clicking on the map
        onMapClick={() => setSelectedVenue(null)}
      />

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm z-[1000] shadow-md">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* QR Scanner Button */}
      {!selectedVenue && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
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
      )}

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
