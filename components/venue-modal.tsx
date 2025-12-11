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
    <div className="fixed inset-0 bg-black/50 flex items-end z-40">
      <div className="w-full bg-white rounded-t-2xl p-6 shadow-xl animate-in slide-in-from-bottom-5">
        <div className="space-y-4">
          {/* Venue Icon */}
          {venue.icon_url && (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <img src={venue.icon_url || "/placeholder.svg"} alt={venue.name} className="w-8 h-8" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-foreground">{venue.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAlreadyClaimed ? "You've already collected this stamp!" : "Claim your stamp and unlock this venue"}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary"
              onClick={isAlreadyClaimed ? handleVisitLandingPage : handleClaimStamp}
            >
              {isAlreadyClaimed ? "Visit Landing Page" : "Claim Stamp"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
