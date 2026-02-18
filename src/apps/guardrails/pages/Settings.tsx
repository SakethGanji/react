import { useGeneralSettings, useNotificationSettings } from '../hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function Settings() {
  const general = useGeneralSettings()
  const notifications = useNotificationSettings()

  const isLoading = general.isLoading || notifications.isLoading
  const error = general.error || notifications.error

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-center py-12 text-destructive px-4 lg:px-6">
            Error: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingsItem label="Site Name" value={general.data?.siteName} />
              <Separator />
              <SettingsItem label="Language" value={general.data?.language} />
              <Separator />
              <SettingsItem label="Timezone" value={general.data?.timezone} />
            </CardContent>
          </Card>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingsItem label="Email Notifications" value={notifications.data?.email ? 'Enabled' : 'Disabled'} />
              <Separator />
              <SettingsItem label="Push Notifications" value={notifications.data?.push ? 'Enabled' : 'Disabled'} />
              <Separator />
              <SettingsItem label="Frequency" value={notifications.data?.frequency} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingsItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
