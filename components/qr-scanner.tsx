"use client"


import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Venue } from "@/lib/types"
import jsQR from "jsqr"

interface QRScannerProps {
  onClose: () => void
  onScan: (url: string) => void
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"))
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Manual Entry / Validation States
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualUrl, setManualUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [foundVenue, setFoundVenue] = useState<Venue | null>(null)

  const supabase = createClient()
  const requestRef = useRef<number>()

  const validateUrl = useCallback(async (url: string) => {
    if (!url.trim()) return false

    setIsValidating(true)
    setError(null)
    // setFoundVenue(null) // This should be handled by the caller (manual check or scanner)

    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("landing_url", url.trim())
        .single()

      if (error || !data) {
        // Only show error in manual mode, silent fail/ignore in scan mode to keep scanning?
        // Actually for scanner, if we find a QR code that isn't our venue, we should probably tell the user or ignore it.
        // Let's ignore it if it doesn't match, or maybe show a temporary "Invalid QR" toast?
        // For now, let's just not set foundVenue and maybe log it.
        // But if this is called from manual entry, we need to set error.
        // We can distinguish by passing a flag or checking showManualInput state?
        // Let's just return result.
        return false
      } else {
        setFoundVenue(data)
        // If we found a venue via scanner, we want to stop scanning and show the claim screen (similar to manual entry success)
        // So we switch to a "success" state. We can reuse the manual input view for the success state or overlay it.
        // Let's force showManualInput to true to show the result UI? 
        // Or better, have a dedicated "Success" view that overlays everything. 
        // For simplicity, let's reuse the logic: if foundVenue is set, we show the claim UI. 
        // We just need to make sure the claim UI shows up even if showManualInput is false.
        return true
      }
    } catch (err) {
      console.error("Validation error:", err)
      return false
    } finally {
      setIsValidating(false)
    }
  }, [supabase])


  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        })

        if (code && code.data) {
          console.log("Found QR code:", code.data)
          // Stop scanning temporarily
          cancelAnimationFrame(requestRef.current!)

          // Validate
          validateUrl(code.data).then((isValid) => {
            if (isValid) {
              // Success! UI will update via foundVenue state
              stopCamera() // Stop camera stream since we found it
              setIsReady(false)
            } else {
              // Resume scanning if invalid? Or show error?
              // Let's resume after a short delay to avoid rapid-fire failure on same frame
              setTimeout(() => {
                requestRef.current = requestAnimationFrame(tick)
              }, 1000)
            }
          })
          return
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick)
  }, [validateUrl])

  useEffect(() => {
    if (isReady && !showManualInput && !foundVenue) {
      requestRef.current = requestAnimationFrame(tick)
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isReady, showManualInput, foundVenue, tick])

  const startCamera = async () => {
    try {
      setError(null)
      setFoundVenue(null) // Reset found venue when starting camera

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for video to play before setting isReady
        await videoRef.current.play()
        setIsReady(true)
      }
    } catch (err: any) {
      setError(`${err.name}: ${err.message} `)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(track => track.stop())
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  const handleManualCheck = async () => {
    if (!manualUrl.trim()) return
    const isValid = await validateUrl(manualUrl)
    if (!isValid) {
      setError("Invalid Venue URL. Please try again.")
    }
  }

  const handleClaim = () => {
    if (foundVenue) {
      onScan(foundVenue.landing_url)
    }
  }

  const toggleMode = () => {
    if (showManualInput) {
      setShowManualInput(false)
      setFoundVenue(null)
      setError(null)
      setManualUrl("")
    } else {
      stopCamera()
      setIsReady(false)
      setShowManualInput(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4">
      <div className="w-full max-w-sm bg-[#f5f1e8] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#3a2515]">

        <div className="bg-[#3a2515] p-3 text-center border-b-2 border-[#c4a57b]">
          <h2 className="text-[#f5ead6] font-bold text-lg tracking-widest">
            {showManualInput ? "MANUAL ENTRY" : "SCANNER"}
          </h2>
        </div>

        <div className="relative w-full aspect-square bg-black overflow-hidden flex flex-col">
          {/* Show success UI if foundVenue is set, regardless of mode (valid scan OR valid manual entry) */}
          {foundVenue ? (
            <div className="w-full h-full bg-[#f5f1e8] p-6 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl border-4 border-green-500">
                {foundVenue.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foundVenue.icon_url} alt="icon" className="w-12 h-12 object-contain" />
                ) : (
                  "📍"
                )}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-[#3a2515]">{foundVenue.name}</h3>
                <p className="text-xs text-[#3a2515]/60">Venue Found!</p>
              </div>
              <Button
                onClick={handleClaim}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-12 shadow-lg animate-pulse"
              >
                CLAIM REWARD
              </Button>
            </div>
          ) : !showManualInput ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scan overlay guide */}
              <div className="absolute inset-0 border-2 border-[#f5ead6]/50 m-12 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#f5ead6]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#f5ead6]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#f5ead6]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#f5ead6]"></div>
              </div>

              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-4">
                  <p className="text-[#f5ead6]">Camera not started</p>
                  <Button
                    className="bg-[#3a2515] text-[#f5ead6]"
                    onClick={startCamera}
                  >
                    Scan QR
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-[#f5f1e8] p-6 flex flex-col items-center justify-center space-y-4">
              <div className="text-center space-y-2 w-full">
                <p className="text-[#3a2515] font-semibold">Enter Venue URL</p>
                <Input
                  placeholder="https://..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="bg-white border-[#3a2515]/20"
                />
              </div>
              <Button
                onClick={handleManualCheck}
                disabled={isValidating || !manualUrl}
                className="w-full bg-[#3a2515] text-[#f5ead6]"
              >
                {isValidating ? "Verifying..." : "Verify URL"}
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-900 border-b border-red-200 p-4 max-h-[100px] overflow-auto">
            <p className="text-xs font-mono">{error}</p>
            {/* Show refresh only if not in manual mode as manual mode has its own retry flow */}
            {!showManualInput && error.includes("NotAllowedError") && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="w-full mt-2 bg-white border-red-200 hover:bg-red-50 text-red-900"
              >
                Refresh Page
              </Button>
            )}
          </div>
        )}

        <div className="p-6 space-y-4 bg-[#f5f1e8]">
          <div className="flex gap-3">
            {/* Only show toggle button if we haven't found a venue yet, to avoid confusion */}
            {!foundVenue && (
              <Button
                variant="outline"
                className="flex-1 border-[#3a2515] text-[#3a2515] hover:bg-[#3a2515]/10"
                onClick={toggleMode}
              >
                {showManualInput ? "Use Camera" : "Manual Entry"}
              </Button>
            )}
            <Button
              className="flex-1 bg-[#3a2515] text-[#f5ead6]"
              onClick={handleClose}
            >
              Abort
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
