"use client"

import { useState } from "react"
import type { Venue } from "@/lib/types"
import { Button } from "@/components/ui/button"
import PinSuctionAnimation from "./pin-suction-animation"

interface VenueModalProps {
  venue: Venue
  onClose: () => void
  onClaim: () => void
  isAlreadyClaimed: boolean
}

export default function VenueModal({ venue, onClose, onClaim, isAlreadyClaimed }: VenueModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [pinPosition, setPinPosition] = useState({ x: 0, y: 0 })

  const handleClaimStamp = () => {
    setPinPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    setIsAnimating(true)
  }

  const handleAnimationComplete = () => {
    if (venue.landing_url) {
      window.open(venue.landing_url, "_blank", "noopener,noreferrer")
    }
    // Call original onClaim to save to database
    onClaim()
    setIsAnimating(false)
  }

  const handleVisitLandingPage = () => {
    if (venue.landing_url) {
      window.open(venue.landing_url, "_blank", "noopener,noreferrer")
    }
    onClose()
  }

  if (isAnimating) {
    return <PinSuctionAnimation pinX={pinPosition.x} pinY={pinPosition.y} onComplete={handleAnimationComplete} />
  }

  return (
    // Changed: Removed full screen backdrop (bg-black/50) and added pointer-events-none to container
    // This allows clicking "through" the empty space to the map
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-center pointer-events-none p-4 pb-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-5 pointer-events-auto border border-slate-100">
        <div className="space-y-4">
          {/* Venue Icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {venue.icon_url ? (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <img src={venue.icon_url || "/placeholder.svg"} alt={venue.name} className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">{venue.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAlreadyClaimed ? "You've already collected this stamp!" : "Claim your stamp and unlock this venue"}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-slate-400" onClick={onClose}>
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={isAlreadyClaimed ? handleVisitLandingPage : undefined}
              disabled={!isAlreadyClaimed}
              className={`flex-1 ${!isAlreadyClaimed ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {isAlreadyClaimed ? "Visit Landing Page" : "Scan QR to Unlock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
