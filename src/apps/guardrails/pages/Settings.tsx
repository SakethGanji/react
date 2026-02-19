import { useState } from 'react'
import { Settings2, PenLine } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_EMAIL_NOTIFICATIONS,
  THRESHOLD_LABELS,
  type AlertThresholds,
  type EmailNotificationSettings,
  type PromptConfig,
} from '../types'

type SettingsTab = 'monitoring' | 'prompt'

const NAV_ITEMS: { key: SettingsTab; label: string; icon: typeof Settings2 }[] = [
  { key: 'monitoring', label: 'Monitoring Settings', icon: Settings2 },
  { key: 'prompt', label: 'Prompt Configuration', icon: PenLine },
]

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('monitoring')

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex gap-6">
            {/* Left sidebar nav */}
            <Card className="w-72 shrink-0 self-start">
              <CardContent className="p-2">
                <nav className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                        activeTab === item.key
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Right content area */}
            <div className="flex-1 min-w-0">
              {activeTab === 'monitoring' && <MonitoringSettingsPanel />}
              {activeTab === 'prompt' && <PromptConfigPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Monitoring Settings Panel
// ============================================

function MonitoringSettingsPanel() {
  const [emailSettings, setEmailSettings] = useState<EmailNotificationSettings>(
    DEFAULT_EMAIL_NOTIFICATIONS
  )
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_ALERT_THRESHOLDS)

  const handleThresholdChange = (key: keyof AlertThresholds, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0 && num <= 1) {
      setThresholds((prev) => ({ ...prev, [key]: num }))
    } else if (value === '' || value === '0.' || value === '0.0') {
      // Allow intermediate typing states
      setThresholds((prev) => ({ ...prev, [key]: value as unknown as number }))
    }
  }

  const handleReset = () => {
    setEmailSettings(DEFAULT_EMAIL_NOTIFICATIONS)
    setThresholds(DEFAULT_ALERT_THRESHOLDS)
  }

  const handleSave = () => {
    // TODO: wire up to API via useSaveMonitoringSettings
    console.log('Save monitoring settings:', { emailSettings, thresholds })
  }

  // Split threshold keys into two columns for the grid layout
  const thresholdKeys = Object.keys(THRESHOLD_LABELS) as (keyof AlertThresholds)[]
  const leftKeys = thresholdKeys.filter((_, i) => i % 2 === 0)
  const rightKeys = thresholdKeys.filter((_, i) => i % 2 === 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">
            How often to send alert emails.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min={0}
                max={24}
                className="w-24"
                value={emailSettings.hours}
                onChange={(e) =>
                  setEmailSettings((prev) => ({
                    ...prev,
                    hours: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={0}
                max={59}
                className="w-24"
                value={emailSettings.minutes}
                onChange={(e) =>
                  setEmailSettings((prev) => ({
                    ...prev,
                    minutes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the sensitivity for each check (0.0 to 1.0). A lower value is more sensitive.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Left column */}
            <div className="space-y-4">
              {leftKeys.map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{THRESHOLD_LABELS[key]}</Label>
                  <Input
                    id={key}
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={thresholds[key]}
                    onChange={(e) => handleThresholdChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            {/* Right column */}
            <div className="space-y-4">
              {rightKeys.map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{THRESHOLD_LABELS[key]}</Label>
                  <Input
                    id={key}
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={thresholds[key]}
                    onChange={(e) => handleThresholdChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Prompt Configuration Panel
// ============================================

const EMPTY_PROMPT: PromptConfig = {
  workflowName: '',
  promptName: '',
  systemInstructions: '',
  changeNotes: '',
  createdBy: '',
}

function PromptConfigPanel() {
  const [form, setForm] = useState<PromptConfig>(EMPTY_PROMPT)

  // TODO: wire up to useWorkflowNames() and usePromptNames() for dynamic options
  const promptOptions = [
    'big_brain_3_prompt_budget_0',
    'big_brain_3_prompt_budget_1',
    'small_brain_prompt_default',
  ]

  const handleReset = () => setForm(EMPTY_PROMPT)

  const handleSubmit = () => {
    // TODO: wire up to API via useSavePromptConfig
    console.log('Update prompt:', form)
  }

  const setField = <K extends keyof PromptConfig>(key: K, value: PromptConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update system prompts by selecting a prompt name and providing new instructions.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Workflow Name */}
        <div className="space-y-2">
          <Label htmlFor="workflowName">Workflow Name</Label>
          <Input
            id="workflowName"
            placeholder="Enter workflow name"
            value={form.workflowName}
            onChange={(e) => setField('workflowName', e.target.value)}
          />
        </div>

        {/* Prompt Name */}
        <div className="space-y-2">
          <Label>Prompt Name</Label>
          <Select
            value={form.promptName}
            onValueChange={(v) => setField('promptName', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a prompt" />
            </SelectTrigger>
            <SelectContent>
              {promptOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* System Instructions */}
        <div className="space-y-2">
          <Label htmlFor="systemInstructions">System Instructions</Label>
          <Textarea
            id="systemInstructions"
            rows={8}
            placeholder="Enter system instructions..."
            value={form.systemInstructions}
            onChange={(e) => setField('systemInstructions', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This field accepts any string content, including JSON.
          </p>
        </div>

        {/* Change Notes */}
        <div className="space-y-2">
          <Label htmlFor="changeNotes">Change Notes</Label>
          <Input
            id="changeNotes"
            placeholder="Enter change notes (e.g., reason for update)"
            value={form.changeNotes}
            onChange={(e) => setField('changeNotes', e.target.value)}
          />
        </div>

        {/* Created By */}
        <div className="space-y-2">
          <Label htmlFor="createdBy">Created By</Label>
          <Input
            id="createdBy"
            placeholder="Enter your name or ID"
            value={form.createdBy}
            onChange={(e) => setField('createdBy', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSubmit}>Update Prompt</Button>
        </div>
      </CardContent>
    </Card>
  )
}
