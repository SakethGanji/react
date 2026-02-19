import { useState } from 'react'
import { Power, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface EmergencyStopButtonProps {
  isActive: boolean
  onActivate: (reason: string) => void
  onDeactivate: (reason: string) => void
}

export function EmergencyStopButton({ isActive, onActivate, onDeactivate }: EmergencyStopButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const handleOpen = () => {
    setReason('')
    setConfirmation('')
    setOpen(true)
  }

  const handleSubmit = () => {
    if (isActive) {
      onDeactivate(reason)
      toast.success('Emergency stop deactivated')
    } else {
      onActivate(reason)
      toast.success('Emergency stop activated')
    }
    setOpen(false)
  }

  const canSubmit = reason.trim().length > 0 && confirmation === 'CONFIRM'

  return (
    <>
      {isActive ? (
        <Button variant="outline" onClick={handleOpen} className="border-amber-500 text-amber-600 hover:bg-amber-500/10">
          <ShieldAlert className="mr-2 size-4" />
          Emergency Stop Active
        </Button>
      ) : (
        <Button variant="destructive" onClick={handleOpen}>
          <Power className="mr-2 size-4" />
          Emergency Stop
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isActive ? 'Deactivate Emergency Stop' : 'Activate Emergency Stop'}
            </DialogTitle>
            <DialogDescription>
              {isActive
                ? 'This will re-enable all guardrail checks. Provide a reason for the change.'
                : 'This will immediately disable all guardrail checks. This is an emergency action.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ks-reason">Reason</Label>
              <Textarea
                id="ks-reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ks-confirm">
                Type <span className="font-mono font-bold">CONFIRM</span> to proceed
              </Label>
              <Input
                id="ks-confirm"
                placeholder="CONFIRM"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {isActive ? (
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                Deactivate
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleSubmit} disabled={!canSubmit}>
                Activate Emergency Stop
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
