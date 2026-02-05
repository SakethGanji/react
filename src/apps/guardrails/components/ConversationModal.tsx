import { X } from 'lucide-react'
import { useConversation } from '../hooks'

interface ConversationModalProps {
  conversationId: string
  onClose: () => void
}

export function ConversationModal({ conversationId, onClose }: ConversationModalProps) {
  const { data, isLoading, error } = useConversation(conversationId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Conversation Details</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="modal-loading">Loading conversation...</div>
          ) : error ? (
            <div className="modal-error">Failed to load conversation</div>
          ) : data ? (
            <div className="conversation-detail">
              <div className="conversation-meta">
                <p><strong>ID:</strong> {data.conversation_id}</p>
                <p><strong>Job:</strong> {data.job}</p>
                <p><strong>Intent:</strong> {data.intent || 'N/A'}</p>
                {data.topic?.length > 0 && (
                  <p><strong>Topics:</strong> {data.topic.join(', ')}</p>
                )}
              </div>

              {data.summary && (
                <div className="conversation-summary">
                  <h3>Summary</h3>
                  <div className="summary-stats">
                    <span>Messages: {data.summary.total_messages}</span>
                    <span>Blocked: {data.summary.blocked_count}</span>
                    <span>Delivered: {data.summary.delivered_count}</span>
                  </div>
                </div>
              )}

              <div className="conversation-messages">
                <h3>Messages</h3>
                {data.messages?.map((msg, index) => (
                  <div key={index} className={`message message-${msg.role}`}>
                    <div className="message-role">{msg.role}</div>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
