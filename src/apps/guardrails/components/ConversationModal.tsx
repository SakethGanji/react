import { useConversation } from '../hooks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface ConversationModalProps {
  conversationId: string
  onClose: () => void
}

export function ConversationModal({ conversationId, onClose }: ConversationModalProps) {
  const { data, isLoading, error } = useConversation(conversationId)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conversation Details</DialogTitle>
          <DialogDescription className="sr-only">
            Details for conversation {conversationId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-destructive">
            Failed to load conversation
          </div>
        ) : data ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-medium">{data.conversation_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Job</span>
                <span className="font-medium">{data.job}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Intent</span>
                <span className="font-medium">{data.intent || 'N/A'}</span>
              </div>
              {data.topic?.length > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Topics</span>
                  <div className="flex flex-wrap gap-1">
                    {data.topic.map((t) => (
                      <Badge key={t} variant="outline" className="text-muted-foreground px-1.5">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.summary && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold">Summary</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Messages: <span className="font-medium text-foreground">{data.summary.total_messages}</span></span>
                    <span>Blocked: <span className="font-medium text-foreground">{data.summary.blocked_count}</span></span>
                    <span>Delivered: <span className="font-medium text-foreground">{data.summary.delivered_count}</span></span>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Messages</h3>
              {data.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-muted'
                      : 'bg-card'
                  }`}
                >
                  <div className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                    {msg.role}
                  </div>
                  <div>{msg.content}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
