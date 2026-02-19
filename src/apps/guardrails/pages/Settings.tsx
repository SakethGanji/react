import { useState } from 'react'
import { Settings2, PenLine, Power } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
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
  type AuditLogEntry,
  type EmailNotificationSettings,
  type PromptConfig,
} from '../types'
import { EmergencyStopButton } from '../components/KillSwitchButton'

type SettingsTab = 'monitoring' | 'prompt' | 'killswitch'

const NAV_ITEMS: { key: SettingsTab; label: string; icon: typeof Settings2 }[] = [
  { key: 'monitoring', label: 'Monitoring Settings', icon: Settings2 },
  { key: 'prompt', label: 'Prompt Configuration', icon: PenLine },
  { key: 'killswitch', label: 'Emergency Stop', icon: Power },
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
              {activeTab === 'killswitch' && <KillSwitchPanel />}
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

      <RecentChanges categories={['threshold', 'notification']} />
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
    <div className="flex flex-col gap-6">
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

      <RecentChanges categories={['prompt']} />
    </div>
  )
}

// ============================================
// Emergency Stop Panel
// ============================================

// TODO: Replace with API data when backend is ready
const MOCK_HISTORY = [
  {
    id: '1',
    timestamp: '2026-02-19T10:15:00Z',
    user: 'bg54677',
    action: 'deactivated',
    reason: 'Metrics stabilized after scaling fix',
    duration: '42m',
  },
  {
    id: '2',
    timestamp: '2026-02-19T09:33:00Z',
    user: 'bg54677',
    action: 'activated',
    reason: 'Hallucination rate spike above 15%',
  },
  {
    id: '3',
    timestamp: '2026-02-17T16:05:00Z',
    user: 'km91203',
    action: 'deactivated',
    reason: 'False alarm — dashboard lag caused incorrect readings',
    duration: '12m',
  },
  {
    id: '4',
    timestamp: '2026-02-17T15:53:00Z',
    user: 'km91203',
    action: 'activated',
    reason: 'Output moderation bypass detected in prod',
  },
]

function KillSwitchPanel() {
  const [isActive, setIsActive] = useState(false)
  const [activatedAt, setActivatedAt] = useState<string | null>(null)
  const [activatedBy, setActivatedBy] = useState<string | null>(null)
  const [activeReason, setActiveReason] = useState<string | null>(null)

  const handleActivate = (reason: string) => {
    setIsActive(true)
    setActivatedAt(new Date().toISOString())
    setActivatedBy('current_user')
    setActiveReason(reason)
  }

  const handleDeactivate = () => {
    setIsActive(false)
    setActivatedAt(null)
    setActivatedBy(null)
    setActiveReason(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle>Emergency Stop Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current state and controls for the emergency stop.
            </p>
          </div>
          <EmergencyStopButton
            isActive={isActive}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
          />
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="space-y-3">
              <Badge className="bg-red-500/15 text-red-600 border-red-500/20" variant="outline">
                Active
              </Badge>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Activated At</p>
                  <p className="font-medium">
                    {activatedAt ? formatTimestamp(activatedAt) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Activated By</p>
                  <p className="font-medium">{activatedBy ?? '—'}</p>
                </div>
                {activeReason && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Reason</p>
                    <p className="font-medium">{activeReason}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20" variant="outline">
              Inactive
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-accent/50 border-accent-foreground/15">
        <CardHeader>
          <CardTitle className="text-base">Activation History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Record of all emergency stop activations and deactivations.
          </p>
        </CardHeader>
        <CardContent>
          {MOCK_HISTORY.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No activation history recorded yet.
            </p>
          ) : (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-44">Timestamp</TableHead>
                    <TableHead className="w-32">User</TableHead>
                    <TableHead className="w-28">Action</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-28">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_HISTORY.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(entry.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {entry.user}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${
                            entry.action === 'activated'
                              ? 'bg-red-500/15 text-red-600 border-red-500/20'
                              : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                          }`}
                        >
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-48 truncate">
                        {entry.reason}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.duration ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Recent Changes (shared across panels)
// ============================================

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: '2026-02-19T14:32:00Z',
    user: 'bg54677',
    action: 'updated',
    category: 'threshold',
    setting: 'Hallucination Threshold',
    oldValue: '0.85',
    newValue: '0.90',
    notes: 'Increased sensitivity after false positive spike',
  },
  {
    id: '2',
    timestamp: '2026-02-18T11:15:00Z',
    user: 'km91203',
    action: 'updated',
    category: 'prompt',
    setting: 'big_brain_3_prompt_budget_0',
    oldValue: null,
    newValue: 'Updated system instructions for compliance',
    notes: 'Quarterly prompt review',
  },
  {
    id: '3',
    timestamp: '2026-02-17T09:45:00Z',
    user: 'rp38412',
    action: 'updated',
    category: 'notification',
    setting: 'Email Notification Frequency',
    oldValue: '2h 0m',
    newValue: '1h 0m',
  },
  {
    id: '4',
    timestamp: '2026-02-16T16:20:00Z',
    user: 'tx72019',
    action: 'updated',
    category: 'threshold',
    setting: 'Input Guardrails Threshold',
    oldValue: '0.80',
    newValue: '0.85',
  },
  {
    id: '5',
    timestamp: '2026-02-15T13:00:00Z',
    user: 'dv60845',
    action: 'created',
    category: 'prompt',
    setting: 'small_brain_prompt_default',
    oldValue: null,
    newValue: 'Initial prompt configuration',
    notes: 'New workflow onboarding',
  },
  {
    id: '6',
    timestamp: '2026-02-14T10:30:00Z',
    user: 'bg54677',
    action: 'updated',
    category: 'threshold',
    setting: 'Bias and Fairness Threshold',
    oldValue: '0.85',
    newValue: '0.75',
    notes: 'Lowered after model update',
  },
  {
    id: '7',
    timestamp: '2026-02-13T08:10:00Z',
    user: 'tx72019',
    action: 'deleted',
    category: 'prompt',
    setting: 'legacy_prompt_v1',
    oldValue: 'Deprecated prompt config',
    newValue: 'Removed',
    notes: 'Cleanup of deprecated prompts',
  },
  {
    id: '8',
    timestamp: '2026-02-12T15:45:00Z',
    user: 'km91203',
    action: 'restored',
    category: 'threshold',
    setting: 'Output Moderation Threshold',
    oldValue: '0.70',
    newValue: '0.85',
    notes: 'Restored to default after testing',
  },
]

const ACTION_BADGE_STYLES: Record<AuditLogEntry['action'], string> = {
  created: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  updated: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  deleted: 'bg-red-500/15 text-red-600 border-red-500/20',
  restored: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RecentChanges({ categories }: { categories: AuditLogEntry['category'][] }) {
  // TODO: Replace with API call — e.g., useAuditLog(categories)
  const entries = MOCK_AUDIT_LOG.filter((e) => categories.includes(e.category))

  return (
    <Card className="bg-accent/50 border-accent-foreground/15">
      <CardHeader>
        <CardTitle className="text-base">Recent Changes</CardTitle>
        <p className="text-sm text-muted-foreground">
          History of recent configuration changes.
        </p>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No changes recorded yet.
          </p>
        ) : (
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-44">Timestamp</TableHead>
                  <TableHead className="w-32">User</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                  <TableHead>Setting</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {entry.user}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${ACTION_BADGE_STYLES[entry.action]}`}
                      >
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium max-w-40 truncate">
                      {entry.setting}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                      {entry.oldValue ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm max-w-32 truncate">
                      {entry.newValue}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                      {entry.notes ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
