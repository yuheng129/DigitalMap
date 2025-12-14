"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  onClose: () => void
  onScan: (url: string) => void
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const startCamera = async () => {
    try {
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsReady(true)
      }
    } catch (err: any) {
      setError(`${err.name}: ${err.message}`)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(track => track.stop())
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  const handleManualInput = () => {
    const url = prompt("Enter the venue URL from the QR code:")
    if (url) onScan(url)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4">
      <div className="w-full max-w-sm bg-[#f5f1e8] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#3a2515]">

        <div className="bg-[#3a2515] p-3 text-center border-b-2 border-[#c4a57b]">
          <h2 className="text-[#f5ead6] font-bold text-lg tracking-widest">
            SCANNER
          </h2>
        </div>

        <div className="relative w-full aspect-square bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

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
        </div>

        {error && (
          <div className="bg-red-50 text-red-900 border-b border-red-200 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider">Camera Access Blocked</h3>

                {error.includes("NotAllowedError") || error.includes("Permission denied") ? (
                  <div className="text-sm text-red-800 space-y-2">
                    <p><strong>To fix this on mobile:</strong></p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Tap the <strong>Aa</strong> or <strong>🔒 Lock</strong> icon in your address bar.</li>
                      <li>Select <strong>Website Settings</strong> or <strong>Permissions</strong>.</li>
                      <li>Set Camera to <strong>Allow</strong> (or "Ask").</li>
                      <li>Refresh the page.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-mono text-xs break-all">{error}</p>
                    <p className="text-xs">Ensure you are using the HTTPS link.</p>
                  </div>
                )}

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-white border-red-200 hover:bg-red-50 text-red-900"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleManualInput}
            >
              Manual Entry
            </Button>
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
