import { useQuery } from '@tanstack/react-query'
import { fetchGeneralSettings, fetchNotificationSettings } from './services'

export function useGeneralSettings() {
  return useQuery({
    queryKey: ['settings', 'general'],
    queryFn: fetchGeneralSettings,
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: fetchNotificationSettings,
  })
}
