import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import Button from '../../components/common/Button'
import { Loader } from 'lucide-react'
import { professionalsService } from '../../services/professionals.service'
import './ProfessionalAvailability.css'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const ProfessionalAvailability = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proId, setProId] = useState<string | null>(null)
  const [start, setStart] = useState(8)
  const [end, setEnd] = useState(19)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const prof = await professionalsService.getMyProfile()
        if (cancelled) return
        if (!prof) {
          setError('Créez d’abord votre fiche professionnelle.')
          return
        }
        setProId(prof.id)
        setStart(typeof prof.work_start_hour === 'number' ? prof.work_start_hour : 8)
        setEnd(typeof prof.work_end_hour === 'number' ? prof.work_end_hour : 19)
      } catch {
        if (!cancelled) setError('Impossible de charger vos horaires.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    if (!proId) return
    if (end <= start) {
      setError('L’heure de fin doit être après l’heure de début.')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await professionalsService.update(proId, {
        work_start_hour: start,
        work_end_hour: end,
      })
      navigate(-1)
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
      <ScreenLayout title="Disponibilité" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
        <div className="pro-avail-loading">
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Disponibilité" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
      <div className="pro-availability">
        <p className="pro-avail-intro">
          Définissez la plage horaire pendant laquelle les clients peuvent réserver des créneaux (pas de 30 minutes). Les heures déjà
          réservées sont automatiquement bloquées.
        </p>

        {error && <div className="pro-avail-error">{error}</div>}

        <div className="pro-avail-row">
          <label className="pro-avail-label">Premier créneau</label>
          <select className="pro-avail-select" value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, '0')}h00
              </option>
            ))}
          </select>
        </div>

        <div className="pro-avail-row">
          <label className="pro-avail-label">Fin de journée (dernier créneau commence avant cette heure)</label>
          <select className="pro-avail-select" value={end} onChange={(e) => setEnd(Number(e.target.value))}>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, '0')}h00
              </option>
            ))}
          </select>
        </div>

        <p className="pro-avail-example">
          Exemple : 8h → 19h = créneaux de 8h00 à 18h30 (pas 19h00, la fin est exclusive).
        </p>

        <Button variant="primary" fullWidth disabled={saving || !proId} onClick={() => void handleSave()}>
          {saving ? 'Enregistrement…' : 'Enregistrer les horaires'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalAvailability
