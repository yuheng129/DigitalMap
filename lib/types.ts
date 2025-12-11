export interface Venue {
  id: string
  name: string
  latitude: number
  longitude: number
  icon_url: string | null
  landing_url: string
  created_at: string
}

export interface UserVisit {
  id: string
  user_id: string
  venue_id: string
  created_at: string
}
