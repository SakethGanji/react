import { backends } from '../../config/backends'
import type { GeneralSettings, NotificationSettings } from './types'

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  const response = await fetch(`${backends.settings}/api/settings/general`)
  if (!response.ok) throw new Error('Failed to fetch general settings')
  return response.json()
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const response = await fetch(`${backends.settings}/api/settings/notifications`)
  if (!response.ok) throw new Error('Failed to fetch notification settings')
  return response.json()
}
