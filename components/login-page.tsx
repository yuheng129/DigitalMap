"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

type AuthMode = "login" | "register"

interface LoginPageProps {
  onAuthSuccess?: () => void
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem("remembered_email")
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
  }, [])

  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Save or clear remembered email
        if (rememberMe) {
          localStorage.setItem("remembered_email", email)
        } else {
          localStorage.removeItem("remembered_email")
        }
        onAuthSuccess?.()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage("Check your email for a confirmation link!")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #2c1810 0%, #1a0f08 50%, #3a2515 100%)",
      }}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="compass" patternUnits="userSpaceOnUse" width="100" height="100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.3" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#compass)" className="text-[#c4a57b]" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-500">
        {/* Card with passport-style border */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #f5f1e8 0%, #ebe5d8 100%)",
            border: "3px solid #c4a57b",
            boxShadow: "0 0 0 6px #2c1810, 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: "linear-gradient(135deg, #2c1810 0%, #3a2515 100%)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              <svg className="w-8 h-8 text-[#c4a57b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold tracking-wide"
              style={{ color: "#2c1810" }}
            >
              Venue Discovery
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b5344" }}>
              Explore hidden venues with your digital passport
            </p>
          </div>

          {/* Mode Toggle */}
          <div
            className="flex rounded-lg p-1 mb-6"
            style={{ background: "#e0d6c8" }}
          >
            <button
              onClick={() => { setMode("login"); setError(null); setMessage(null); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "login"
                ? "shadow-sm"
                : "hover:opacity-80"
                }`}
              style={{
                background: mode === "login" ? "#2c1810" : "transparent",
                color: mode === "login" ? "#f5ead6" : "#6b5344",
              }}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); setMessage(null); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "register"
                ? "shadow-sm"
                : "hover:opacity-80"
                }`}
              style={{
                background: mode === "register" ? "#2c1810" : "transparent",
                color: mode === "register" ? "#f5ead6" : "#6b5344",
              }}
            >
              Register
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "#fce8e8", color: "#991b1b", border: "1px solid #f5c6c6" }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "#e8f5e8", color: "#166534", border: "1px solid #bbf7d0" }}
            >
              {message}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#2c1810" }}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#c4a57b] focus-visible:ring-[#c4a57b]"
                style={{ background: "#fff9f0" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#2c1810" }}>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#c4a57b] focus-visible:ring-[#c4a57b]"
                style={{ background: "#fff9f0" }}
              />
            </div>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" style={{ color: "#2c1810" }}>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-[#c4a57b] focus-visible:ring-[#c4a57b]"
                  style={{ background: "#fff9f0" }}
                />
              </div>
            )}
            {mode === "login" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#c4a57b] accent-[#2c1810] cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm cursor-pointer select-none"
                  style={{ color: "#6b5344" }}
                >
                  Remember me
                </label>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-medium"
              style={{
                background: "linear-gradient(135deg, #2c1810 0%, #3a2515 100%)",
                color: "#f5ead6",
              }}
            >
              {loading ? (
                <Spinner className="mr-2" />
              ) : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Footer text */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: "#c4a57b" }}
        >
          Discover hidden gems across the city
        </p>
      </div>
    </div>
  )
}
