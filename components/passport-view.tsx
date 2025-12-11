"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Venue } from "@/lib/types"
import { useUserId } from "@/lib/use-user-id"
import { Button } from "@/components/ui/button"

interface PassportViewProps {
  onClose: () => void
}

export default function PassportView({ onClose }: PassportViewProps) {
  const userId = useUserId()
  const [allVenues, setAllVenues] = useState<Venue[]>([])
  const [collectedVenueIds, setCollectedVenueIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const loadPassport = async () => {
      try {
        setLoading(true)

        const { data: venuesData } = await supabase.from("venues").select("*")
        setAllVenues(venuesData || [])

        if (userId) {
          const { data: visitsData } = await supabase.from("user_visits").select("venue_id").eq("user_id", userId)

          if (visitsData) {
            setCollectedVenueIds(new Set(visitsData.map((v) => v.venue_id)))
          }
        }
      } finally {
        setLoading(false)
        setTimeout(() => setIsOpen(true), 300)
      }
    }

    loadPassport()
  }, [userId])

  const collectedCount = collectedVenueIds.size
  const totalCount = allVenues.length

  const getVenueIcon = (venue: Venue) => {
    if (venue.name.includes("Coffee")) return "☕"
    if (venue.name.includes("Record")) return "🎵"
    if (venue.name.includes("Garden")) return "🌿"
    if (venue.name.includes("Book")) return "📚"
    if (venue.name.includes("Art") || venue.name.includes("Gallery")) return "🎨"
    if (venue.name.includes("Bridge")) return "🌉"
    return "📍"
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Passport Container with book-like perspective */}
      <div
        className={`w-full max-w-4xl transition-all duration-700 transform ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          perspective: "1000px",
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Passport Cover Page */}
          <div className="grid grid-cols-2 min-h-[600px]">
            {/* Left page - Cover */}
            <div className="bg-gradient-to-b from-passport-cover via-passport-cover to-passport-cover-dark p-8 text-center relative flex flex-col justify-between">
              {/* Top decorative elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-passport-accent rounded-full opacity-80" />
              <div className="absolute top-6 right-6 w-6 h-6 border border-passport-accent/60 rotate-45" />
              <div className="absolute bottom-8 left-8 w-5 h-5 border-2 border-passport-accent/50 rounded-full" />

              <div>
                <div className="mb-8">
                  <div className="inline-block px-4 py-1 border-2 border-passport-accent rounded-full mb-4">
                    <p className="text-passport-accent text-xs tracking-widest font-semibold">OFFICIAL DOCUMENT</p>
                  </div>
                </div>

                <h1
                  className="text-5xl font-bold text-passport-text mb-2 tracking-wider"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  PASSPORT
                </h1>
                <p className="text-passport-accent text-sm tracking-widest" style={{ fontFamily: "Georgia, serif" }}>
                  VENUE EXPLORER
                </p>

                <div className="mt-12 pt-8 border-t border-passport-text/20 border-b border-passport-text/20 py-8">
                  <p className="text-passport-text/70 text-xs mb-3 tracking-widest">DISCOVERY PROGRESS</p>
                  <div className="text-3xl font-bold text-passport-text mb-4">
                    {collectedCount}/{totalCount}
                  </div>
                  <div className="bg-passport-text/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-passport-accent via-passport-accent-light to-passport-accent h-full transition-all duration-700"
                      style={{ width: `${totalCount > 0 ? (collectedCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-passport-text/60 text-xs" style={{ fontFamily: "Georgia, serif" }}>
                  ISSUED {new Date().getFullYear()}
                </p>
                <p className="text-passport-accent/80 text-xs tracking-widest mt-2">VENUE COLLECTION SYSTEM</p>
              </div>
            </div>

            {/* Right page - Stamps Collection */}
            <div className="bg-gradient-to-b from-passport-page to-passport-page/95 p-8 flex flex-col relative overflow-hidden">
              {/* Page header decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-passport-accent/0 via-passport-accent/40 to-passport-accent/0" />

              <p className="text-center text-passport-footer/50 text-xs mb-6 tracking-widest font-semibold uppercase">
                Collected Stamps
              </p>

              {loading ? (
                <div className="flex items-center justify-center flex-1">
                  <p className="text-passport-footer/40">Loading...</p>
                </div>
              ) : allVenues.length === 0 ? (
                <div className="flex items-center justify-center flex-1">
                  <p className="text-passport-footer/40">No venues available</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
                    {allVenues.map((venue, index) => {
                      const isCollected = collectedVenueIds.has(venue.id)
                      const icon = getVenueIcon(venue)

                      return (
                        <div
                          key={venue.id}
                          className="flex flex-col items-center justify-center group"
                          style={{
                            animation: isOpen ? `fadeIn 0.5s ease-out ${index * 0.1}s both` : "none",
                          }}
                        >
                          {/* Stamp */}
                          <div
                            className={`relative mb-2 transition-all duration-500 ${isCollected ? "scale-100" : "scale-90 opacity-50"}`}
                          >
                            <div
                              className={`w-24 h-24 border-2 flex items-center justify-center rounded-lg relative ${
                                isCollected
                                  ? "bg-gradient-to-br from-passport-stamp to-yellow-50 border-passport-accent shadow-lg"
                                  : "bg-passport-page/50 border-passport-footer/20"
                              }`}
                              style={{
                                transform: isCollected ? `rotate(${-3 + Math.random() * 6}deg)` : "rotate(0deg)",
                              }}
                            >
                              {/* Decorative circle around stamp */}
                              {isCollected && (
                                <div className="absolute inset-0 rounded-lg border border-dashed border-passport-accent/40" />
                              )}

                              {/* Stamp icon */}
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-4xl">{icon}</span>
                                {isCollected && <span className="text-sm font-bold text-passport-accent mt-1">✓</span>}
                              </div>
                            </div>

                            {/* Collected date indicator */}
                            {isCollected && (
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-passport-footer/60 font-semibold whitespace-nowrap">
                                COLLECTED
                              </div>
                            )}
                          </div>

                          {/* Venue name */}
                          <p
                            className={`text-xs font-semibold text-center mt-8 transition-all ${
                              isCollected ? "text-passport-footer" : "text-passport-footer/40"
                            }`}
                          >
                            {venue.name}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Page footer decoration */}
                  <div className="mt-6 pt-4 border-t border-passport-footer/10">
                    <p className="text-xs text-center text-passport-footer/40" style={{ fontFamily: "Georgia, serif" }}>
                      Page 1 of 1
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom footer bar */}
          <div className="bg-passport-footer px-8 py-4 flex justify-between items-center border-t border-passport-accent/20">
            <p className="text-xs text-passport-text/60 tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <Button
              onClick={onClose}
              className="bg-passport-accent hover:bg-passport-accent-light text-passport-cover font-semibold px-6 py-2 rounded-lg transition-all"
            >
              Close Passport
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
