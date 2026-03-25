const ONBOARDING_KEY = 'babylon_onboarding_complete_v1'

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return true
  }
}

export function setOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    /* ignore */
  }
}
