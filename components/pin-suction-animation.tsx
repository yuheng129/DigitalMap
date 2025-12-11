"use client"

import { useEffect, useRef } from "react"

interface PinSuctionAnimationProps {
  pinX: number
  pinY: number
  onComplete: () => void
}

export default function PinSuctionAnimation({ pinX, pinY, onComplete }: PinSuctionAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Animation variables
    let animationProgress = 0
    const duration = 1200 // 1.2 seconds
    const startTime = Date.now()

    // Create particles for the suction effect
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
    }> = []

    // Initialize particles around the center
    function initializeParticles() {
      const particleCount = 40
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const distance = 150
        particles.push({
          x: window.innerWidth / 2 + Math.cos(angle) * distance,
          y: window.innerHeight / 2 + Math.sin(angle) * distance,
          vx: 0,
          vy: 0,
          life: 1,
        })
      }
    }

    initializeParticles()

    function animate() {
      const elapsed = Date.now() - startTime
      animationProgress = Math.min(elapsed / duration, 1)

      // Clear canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw user shape (circle getting sucked in)
      const userRadius = 60 * (1 - animationProgress * 0.8)
      const userX = window.innerWidth / 2 + (pinX - window.innerWidth / 2) * animationProgress
      const userY = window.innerHeight / 2 + (pinY - window.innerHeight / 2) * animationProgress

      // Draw gradient user circle
      const gradient = ctx.createRadialGradient(userX, userY, 0, userX, userY, userRadius)
      gradient.addColorStop(0, `rgba(100, 150, 255, ${1 - animationProgress})`)
      gradient.addColorStop(1, `rgba(50, 100, 255, ${0.5 - animationProgress * 0.5})`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(userX, userY, userRadius, 0, Math.PI * 2)
      ctx.fill()

      // Update and draw particles
      particles.forEach((particle) => {
        // Calculate direction to pin
        const dx = pinX - particle.x
        const dy = pinY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)

        // Apply suction force (stronger as animation progresses)
        const force = 500 * animationProgress
        particle.vx = Math.cos(angle) * force * 0.01
        particle.vy = Math.sin(angle) * force * 0.01

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Update life
        particle.life = Math.max(0, 1 - animationProgress * 1.5)

        // Draw particle
        ctx.fillStyle = `rgba(100, 150, 255, ${particle.life * 0.6})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw pin at destination
      const pinSize = 20 + animationProgress * 10
      ctx.fillStyle = `rgba(59, 130, 246, ${0.8 + animationProgress * 0.2})`
      ctx.beginPath()
      ctx.arc(pinX, pinY, pinSize, 0, Math.PI * 2)
      ctx.fill()

      // Draw pin glow
      const glowSize = pinSize + 15
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 - animationProgress * 0.2})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(pinX, pinY, glowSize, 0, Math.PI * 2)
      ctx.stroke()

      if (animationProgress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    animate()
  }, [pinX, pinY, onComplete])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ backgroundColor: "transparent" }}
    />
  )
}
