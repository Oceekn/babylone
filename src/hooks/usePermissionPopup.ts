import { useState, useEffect } from 'react'
import { isPermissionPopupDone } from '../components/common/PermissionPromptsModal'

/**
 * Affiche une fois le flux d’autorisations (popup) si pas encore fait.
 * Migre les utilisateurs qui avaient terminé l’ancienne page plein écran.
 */
export function usePermissionPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('babylon_onboarding_complete_v1') === '1') {
        localStorage.setItem('babylon_permissions_popup_v1', '1')
      }
    } catch {
      /* ignore */
    }
    if (!isPermissionPopupDone()) {
      setOpen(true)
    }
  }, [])

  return [open, setOpen] as const
}
