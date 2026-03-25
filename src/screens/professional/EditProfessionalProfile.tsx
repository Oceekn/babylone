import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Loader, MapPin } from 'lucide-react'
import { professionalsService, type UpdateProfessionalPayload } from '../../services/professionals.service'
import { usersService } from '../../services/users.service'
import { CUSTOM_SECTOR_VALUE, PROFESSION_SECTOR_PRESETS } from '../../constants/professionSectors'
import { readGeoFromCache, retryGeolocationPermission } from '../../utils/geolocationSession'
import './EditProfessionalProfile.css'

const PAYS_OPTIONS = [
  { value: 'CM', label: 'Cameroun' },
  { value: 'GA', label: 'Gabon' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'FR', label: 'France' },
]

const MAX_PROFESSION = 50

const EditProfessionalProfile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [proId, setProId] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [sectorSelect, setSectorSelect] = useState<string>(PROFESSION_SECTOR_PRESETS[0].value)
  const [professionCustom, setProfessionCustom] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [paysCode, setPaysCode] = useState('CM')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [me, prof] = await Promise.all([
          usersService.getMe(),
          professionalsService.getMyProfile(),
        ])
        if (cancelled) return
        setFirstName(me.first_name || '')
        setLastName(me.last_name || '')
        if (!prof) {
          setError('Aucune fiche professionnelle. Créez-la depuis le tableau de bord pro.')
          setLoading(false)
          return
        }
        setProId(prof.id)
        setBusinessName(prof.business_name || '')
        setDescription(prof.description || '')
        setAddress(prof.address || '')
        setCity(prof.city || '')
        setPaysCode(prof.pays_code || 'CM')
        const p = prof.profession?.trim() || ''
        const preset = PROFESSION_SECTOR_PRESETS.find((s) => s.value === p)
        if (preset && preset.value !== CUSTOM_SECTOR_VALUE) {
          setSectorSelect(p)
        } else if (p) {
          setSectorSelect(CUSTOM_SECTOR_VALUE)
          setProfessionCustom(p.slice(0, MAX_PROFESSION))
        } else {
          setSectorSelect(PROFESSION_SECTOR_PRESETS[0].value)
        }
        const coords = prof.position_gps?.coordinates
        if (coords && coords.length >= 2) {
          setLng(String(coords[0]))
          setLat(String(coords[1]))
        }
      } catch (e) {
        if (!cancelled) setError('Impossible de charger votre fiche.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const resolvedProfession = (): string => {
    if (sectorSelect === CUSTOM_SECTOR_VALUE) {
      return professionCustom.trim().slice(0, MAX_PROFESSION)
    }
    return sectorSelect.slice(0, MAX_PROFESSION)
  }

  const applyGeoFromCache = () => {
    const { coords, status } = readGeoFromCache()
    if (status === 'granted') {
      setLat(String(coords.lat))
      setLng(String(coords.lng))
      return true
    }
    return false
  }

  const handleUseLocation = async () => {
    setGeoLoading(true)
    setError(null)
    try {
      if (applyGeoFromCache()) {
        setGeoLoading(false)
        return
      }
      const r = await retryGeolocationPermission()
      if (r.ok && r.coords) {
        setLat(String(r.coords.lat))
        setLng(String(r.coords.lng))
      } else {
        setError('Position refusée ou indisponible. Saisissez latitude et longitude manuellement.')
      }
    } finally {
      setGeoLoading(false)
    }
  }

  const handleSave = async () => {
    const prof = resolvedProfession()
    if (!prof) {
      setError('Indiquez votre domaine d’activité (ou choisissez « Autre » et précisez).')
      return
    }
    if (!proId) return
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const updatedUser = await usersService.updateMe({
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      })
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } catch {
        /* ignore */
      }

      const la = parseFloat(lat.replace(',', '.'))
      const lo = parseFloat(lng.replace(',', '.'))
      const payload: UpdateProfessionalPayload = {
        business_name: businessName.trim() || undefined,
        profession: prof,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        pays_code: paysCode || 'CM',
      }
      if (!Number.isNaN(la) && !Number.isNaN(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180) {
        payload.position = { latitude: la, longitude: lo }
      }

      await professionalsService.update(proId, payload)
      setSuccess(true)
      setTimeout(() => navigate('/professional/profile'), 1200)
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      const msg = Array.isArray(raw) ? raw[0] : raw
      setError(typeof msg === 'string' ? msg : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ScreenLayout title="Modifier la fiche" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
        <div className="edit-pro-loading">
          <Loader size={32} className="spin" />
          <p>Chargement…</p>
        </div>
      </ScreenLayout>
    )
  }

  if (!proId) {
    return (
      <ScreenLayout title="Modifier la fiche" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
        <div className="edit-pro-loading">
          <p style={{ textAlign: 'center', marginBottom: 16 }}>
            {error ?? 'Aucune fiche professionnelle. Créez-la depuis votre profil pro.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/professional/profile')}>
            Retour au profil
          </Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Modifier la fiche" showBack showBottomNav rightAction={<ProfessionalInboxBell />} contentClassName="edit-pro-page">
      <div className="edit-professional-profile">
        <p className="edit-pro-intro">
          Mettez à jour vos informations principales pour garder votre fiche professionnelle claire et visible.
        </p>

        <section className="edit-pro-section">
          <h2 className="edit-pro-h2">Identité</h2>
          <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
          <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
        </section>

        <section className="edit-pro-section">
          <h2 className="edit-pro-h2">Activité</h2>
          <Input
            label="Nom commercial"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ex. Studio Tech Douala"
          />
          <div className="edit-pro-field">
            <label className="edit-pro-label">Domaine d’activité</label>
            <select
              className="edit-pro-select"
              value={sectorSelect}
              onChange={(e) => setSectorSelect(e.target.value)}
            >
              {PROFESSION_SECTOR_PRESETS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {sectorSelect === CUSTOM_SECTOR_VALUE && (
            <Input
              label="Précisez votre domaine"
              value={professionCustom}
              onChange={(e) => setProfessionCustom(e.target.value.slice(0, MAX_PROFESSION))}
              placeholder="Ex. Audit, Cybersécurité…"
            />
          )}
          <div className="edit-pro-field">
            <label className="edit-pro-label">Description</label>
            <textarea
              className="edit-pro-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre activité…"
            />
          </div>
        </section>

        <section className="edit-pro-section">
          <h2 className="edit-pro-h2">Localisation</h2>
          <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, rue…" />
          <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" />
          <div className="edit-pro-field">
            <label className="edit-pro-label">Pays</label>
            <select className="edit-pro-select" value={paysCode} onChange={(e) => setPaysCode(e.target.value)}>
              {PAYS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <p className="edit-pro-gps-hint">
            <MapPin size={16} /> Position GPS (pour apparaître dans les recherches « près de moi »)
          </p>
          <div className="edit-pro-gps-row">
            <Input
              label="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="ex. 4.0511"
            />
            <Input
              label="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="ex. 9.7679"
            />
          </div>
          <Button type="button" variant="outline" fullWidth disabled={geoLoading} onClick={() => void handleUseLocation()}>
            {geoLoading ? 'Localisation…' : 'Utiliser ma position actuelle'}
          </Button>
        </section>

        {error && <div className="edit-pro-error">{error}</div>}
        {success && <div className="edit-pro-success">Fiche enregistrée.</div>}

        <Button variant="primary" fullWidth disabled={saving} onClick={() => void handleSave()}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default EditProfessionalProfile
