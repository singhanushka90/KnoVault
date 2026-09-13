import { FileText, ExternalLink } from 'lucide-react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user' || message.role === 'User'
  const text = isUser ? (message.question || '') : (message.answer || '')

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-card ${isUser ? 'user-message' : 'bot-message'}`}>
        <div className="message-content">{text}</div>

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

        {Array.isArray(message.sources) && message.sources.length > 0 && (
          <div className="source-list">
            {message.sources.map((source, index) => (
              <div className="source-chip" key={`${source.source || 'source'}-${index}`}>
                <ExternalLink size={12} />
                <span>{source.filename || source.source || 'Document source'}</span>
                {source.pages && <span className="source-page">p.{source.pages}</span>}
                {source.rerank_score && <span className="source-score">score {Number(source.rerank_score).toFixed(2)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
