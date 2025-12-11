"use client"

import { useState } from "react"
import MapView from "@/components/map-view"
import PassportView from "@/components/passport-view"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [showPassport, setShowPassport] = useState(false)

  return (
    <main className="w-full h-screen overflow-hidden">
      <MapView />

      <div className="absolute bottom-6 right-6 z-30">
        <Button
          onClick={() => setShowPassport(true)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg bg-slate-900 hover:bg-slate-800 text-white"
          title="View Passport"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2zm2 2v12h12V5H6zm1 2h2v2H7V7zm4 0h2v2h-2V7zm0 4h2v2h-2v-2zm-4 0h2v2H7v-2zm4 4h2v2h-2v-2zm-4 0h2v2H7v-2z" />
          </svg>
        </Button>
      </div>

      {showPassport && <PassportView onClose={() => setShowPassport(false)} />}
    </main>
  )
}
