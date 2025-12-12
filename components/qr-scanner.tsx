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
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[2000] p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#f5f1e8] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#3a2515]">
        
        {/* Header decoration */}
        <div className="bg-[#3a2515] p-3 text-center border-b-2 border-[#c4a57b]">
           <h2 className="text-[#f5ead6] font-bold text-lg tracking-widest" style={{ fontFamily: "Georgia, serif" }}>
             SCANNER
           </h2>
        </div>

        <div className="relative w-full aspect-square bg-black overflow-hidden relative">
           {/* Decorative corner accents for camera view */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 border-[10px] border-[#f5f1e8]/10"></div>
           
          {isReady && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[#f5ead6]">Initializing lens...</p>
            </div>
          )}

          {/* QR Frame Overlay - Vintage Style */}
          <div className="absolute inset-12 border-2 border-[#c4a57b] rounded-lg pointer-events-none opacity-80">
            {/* Corners */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#c4a57b]" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#c4a57b]" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#c4a57b]" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#c4a57b]" />
            
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 w-4 h-[2px] bg-[#c4a57b]/50 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[2px] h-4 bg-[#c4a57b]/50 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          {/* Scanline animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
             <div className="w-full h-[2px] bg-[#c4a57b] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-900 px-4 py-2 text-sm text-center font-serif border-b border-red-200">{error}</div>}

        <div className="p-6 space-y-4 bg-[#f5f1e8]">
          <p className="text-sm text-[#3a2515]/70 text-center font-serif italic">
            Align the marker within the frame to capture.
          </p>
          <div className="flex gap-3">
            <Button 
                variant="outline" 
                className="flex-1 bg-transparent border-[#c4a57b] text-[#3a2515] hover:bg-[#c4a57b]/10 hover:text-[#3a2515] font-serif" 
                onClick={handleManualInput}
            >
              Manual Entry
            </Button>
            <Button 
                className="flex-1 bg-[#3a2515] text-[#f5ead6] hover:bg-[#2c1810] font-serif tracking-wide border border-[#c4a57b]" 
                onClick={onClose}
            >
              Abort
            </Button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
