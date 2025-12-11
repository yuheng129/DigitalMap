"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  onClose: () => void
  onScan: (url: string) => void
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsReady(true)
        }
      } catch (err) {
        setError("Failed to access camera")
        console.error("Camera error:", err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const handleManualInput = () => {
    const url = prompt("Enter the venue URL from the QR code:")
    if (url) {
      onScan(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="relative w-full aspect-square bg-black">
          {isReady && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white">Loading camera...</p>
            </div>
          )}

          {/* QR Frame Overlay */}
          <div className="absolute inset-8 border-2 border-cyan-400 rounded-lg pointer-events-none">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>}

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 text-center">Point your camera at a venue QR code</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleManualInput}>
              Manual Entry
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
