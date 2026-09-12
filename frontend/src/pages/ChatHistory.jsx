import { useEffect, useState } from 'react'
import { History, MessageCircle } from 'lucide-react'
import { chatApi } from '../api/chat.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function ChatHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await chatApi.listChats()
      setItems(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load chat history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  return (
    <div className="history-page">
      <section className="page-head">
        <div>
          <span className="section-label">Conversation archive</span>
          <h1>Chat History</h1>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading label="Loading chat history..." />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <History size={40} />
          <h3>No conversation history</h3>
          <p>Ask a document question to begin your first KnowledgeOS thread.</p>
        </div>
      ) : (
        <div className="history-list">
          {items.map((chat, idx) => (
            <article className="history-card" key={idx}>
              <div className="history-icon"><MessageCircle size={18} /></div>
              <div className="history-detail">
                <span className="history-question">{chat.question}</span>
                <span className="history-answer">{chat.answer}</span>
                <span className="history-meta">Conversation: {chat.conversation_id}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
