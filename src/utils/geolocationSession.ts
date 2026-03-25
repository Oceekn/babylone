/**
 * Évite de rappeler getCurrentPosition à chaque navigation (ex. Accueil → Services).
 * Une fois la position obtenue (ou refus / fallback), on la garde pour l'onglet (sessionStorage).
 */

/** Persistance (première demande + réutilisation sans redemander à chaque écran) */
const SESSION_KEY = 'babylon_geo_session_v1'

export type GeoSession = {
  lat: number
  lng: number
  /** granted = GPS ok ; denied = refus ou indisponible (fallback Douala) */
  status: 'granted' | 'denied'
}

let memoryCache: GeoSession | null = null

export function getGeoSession(): GeoSession | null {
  if (memoryCache) return memoryCache
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as GeoSession
    if (
      typeof p.lat === 'number' &&
      typeof p.lng === 'number' &&
      (p.status === 'granted' || p.status === 'denied')
    ) {
      memoryCache = p
      return p
    }
  } catch {
    /* ignore */
  }
  return null
}

export function setGeoSession(session: GeoSession): void {
  memoryCache = session
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    if (session.status === 'granted') {
      localStorage.setItem('user_lat', String(session.lat))
      localStorage.setItem('user_lng', String(session.lng))
    }
  } catch {
    /* private mode : memoryCache suffit pour la session JS */
  }
}

/** Pour tests ou "actualiser ma position" futur */
export function clearGeoSession(): void {
  memoryCache = null
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

const FALLBACK = { lat: 4.05, lng: 9.7 }

/**
 * Lit uniquement le cache (rempli au premier lancement dans l’écran d’autorisations).
 * Ne déclenche **jamais** le dialogue système GPS ici — évite de redemander à chaque visite Services.
 */
export function readGeoFromCache(): {
  coords: { lat: number; lng: number }
  status: GeoSession['status']
} {
  const cached = getGeoSession()
  if (cached) {
    return { coords: { lat: cached.lat, lng: cached.lng }, status: cached.status }
  }
  return { coords: { ...FALLBACK }, status: 'denied' }
}

/**
 * @deprecated Utiliser readGeoFromCache — la position est demandée une seule fois à l’onboarding.
 */
export function requestGeoOnce(
  onResult: (coords: { lat: number; lng: number }, status: GeoSession['status']) => void
): void {
  const { coords, status } = readGeoFromCache()
  onResult(coords, status)
}

/**
 * Réessai explicite (bouton « Autoriser » sur l’écran de blocage) : une seule requête GPS.
 */
export function retryGeolocationPermission(): Promise<{ ok: boolean; coords?: { lat: number; lng: number } }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ok: false })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setGeoSession({ ...coords, status: 'granted' })
        resolve({ ok: true, coords })
      },
      () => resolve({ ok: false }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  })
}
