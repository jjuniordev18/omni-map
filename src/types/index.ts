
export type Coordinates = { lat: number; lng: number; accuracyM?: number }
export type PhotoMeta = { downloadUrl: string }
export type EmergencyPoint = {
  id?: string
  type: string
  title?: string
  description?: string
  coordinates: Coordinates
  areaId?: string
  towerId?: string | null
  photos: PhotoMeta[]
  createdAt?: number
}
