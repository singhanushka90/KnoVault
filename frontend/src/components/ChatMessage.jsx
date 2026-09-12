import { FileText } from 'lucide-react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user' || message.role === 'User'

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-card ${isUser ? 'user-message' : 'bot-message'}`}>
        <div className="message-content">{message.answer || message.question}</div>
        <div className="message-meta">
          <span>{isUser ? 'You' : 'KnowledgeOS'}</span>
          <span>{message.timestamp || ''}</span>
        </div>
        {message.filename && (
          <div className="message-source">
            <FileText size={13} />
            <span>{message.filename}</span>
          </div>
        )}
      </div>
    </div>
  )
}
