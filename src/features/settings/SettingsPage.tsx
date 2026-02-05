import { useGeneralSettings, useNotificationSettings } from './hooks'

export function SettingsPage() {
  const general = useGeneralSettings()
  const notifications = useNotificationSettings()

  const isLoading = general.isLoading || notifications.isLoading
  const error = general.error || notifications.error

  if (isLoading) {
    return (
      <main className="dashboard-content">
        <div className="loading">Loading settings...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-content">
        <div className="error">Error: {error.message}</div>
      </main>
    )
  }

  return (
    <main className="dashboard-content">
      <section className="settings-section">
        <h2>General Settings</h2>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-label">Site Name</span>
            <span className="settings-value">{general.data?.siteName}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">Language</span>
            <span className="settings-value">{general.data?.language}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">Timezone</span>
            <span className="settings-value">{general.data?.timezone}</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Notification Settings</h2>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-label">Email Notifications</span>
            <span className="settings-value">{notifications.data?.email ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">Push Notifications</span>
            <span className="settings-value">{notifications.data?.push ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">Frequency</span>
            <span className="settings-value">{notifications.data?.frequency}</span>
          </div>
        </div>
      </section>
    </main>
  )
}
