"use client"

import { useEffect, useState } from "react"

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem("venue_user_id")
    if (storedId) {
      setUserId(storedId)
    } else {
      // Generate a new UUID for this user
      const newId = crypto.randomUUID()
      localStorage.setItem("venue_user_id", newId)
      setUserId(newId)
    }
  }, [])

  return userId
}
