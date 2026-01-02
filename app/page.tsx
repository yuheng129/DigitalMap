"use client"

import { useState, useEffect } from "react"
import MapView from "@/components/map-view"
import PassportView from "@/components/passport-view"
import LoginPage from "@/components/login-page"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function Home() {
  const [showPassport, setShowPassport] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Show loading state
  if (loading) {
    return (
      <div
        className="w-full h-dvh flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a0f08 50%, #3a2515 100%)" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4a57b]" />
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onAuthSuccess={() => window.location.reload()} />
  }

  // Show main app when authenticated
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <main className="w-full h-dvh overflow-hidden">
      <MapView />

      {/* Logout button */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          onClick={handleLogout}
          size="sm"
          variant="outline"
          className="gap-2 bg-white/90 hover:bg-white shadow-md border-slate-200"
          title="Log out"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </Button>
      </div>

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
