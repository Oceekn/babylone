/** Domaines d’activité pro (liste + « Autre »). Max 50 car. côté base sur `profession`. */
export const PROFESSION_SECTOR_PRESETS = [
  { value: 'Finance & comptabilité', label: 'Finance & comptabilité' },
  { value: 'Informatique & digital', label: 'Informatique & digital' },
  { value: 'Coiffure & esthétique', label: 'Coiffure & esthétique' },
  { value: 'Plomberie & bâtiment', label: 'Plomberie & bâtiment' },
  { value: 'Santé & bien-être', label: 'Santé & bien-être' },
  { value: 'Transport & logistique', label: 'Transport & logistique' },
  { value: 'Éducation & formation', label: 'Éducation & formation' },
  { value: 'Événements & animation', label: 'Événements & animation' },
  { value: 'Maison & jardin', label: 'Maison & jardin' },
  { value: 'Droit & conseil', label: 'Droit & conseil' },
  { value: '__custom__', label: 'Autre (saisir ci-dessous)' },
] as const

export const CUSTOM_SECTOR_VALUE = '__custom__' as const
