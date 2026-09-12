import { MessageCircle, Plus } from 'lucide-react'

export default function ConversationList({ conversations = [], selectedConversation, onSelect, onCreate }) {
  return (
    <div className="conversation-list">
      <div className="conversation-heading">
        <span>History</span>
        <button className="icon-button" onClick={onCreate}><Plus size={16} /></button>
      </div>
      {conversations.length === 0 ? (
        <div className="empty-small">No conversations yet</div>
      ) : (
        conversations.map((chat) => {
          const conversationId = chat.conversation_id || chat.id || chat._id
          return (
            <button key={conversationId} className={`conversation-row ${selectedConversation === conversationId ? 'selected' : ''}`} onClick={() => onSelect(conversationId)}>
              <MessageCircle size={16} />
              <span>{conversationId.slice(0, 18)}</span>
            </button>
          )
        })
      )}
    </div>
  )
}
