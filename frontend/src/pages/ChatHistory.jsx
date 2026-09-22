import { useEffect, useState } from 'react'
import { History, MessageCircle } from 'lucide-react'
import { chatApi } from '../api/chat.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

const groupConversations = (items = []) => {
  const grouped = new Map()

  items.forEach((chat) => {
    if (!chat?.conversation_id) return
    const conversation = grouped.get(chat.conversation_id) || []
    conversation.push(chat)
    grouped.set(chat.conversation_id, conversation)
  })

  return [...grouped.entries()]
    .map(([conversationId, entries]) => ({
      conversation_id: conversationId,
      title: entries.find((entry) => entry?.question)?.question || 'Untitled conversation',
      messageCount: entries.length,
      role: entries[0]?.role || 'Employee',
      entries
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
}

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

  const grouped = groupConversations(items)

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
      ) : grouped.length === 0 ? (
        <div className="empty-state">
          <History size={40} />
          <h3>No conversation history</h3>
          <p>Ask a document question to begin your first KnowledgeOS thread.</p>
        </div>
      ) : (
        <div className="history-list">
          {grouped.map((conversation) => (
            <article className="history-card" key={conversation.conversation_id}>
              <div className="history-icon"><MessageCircle size={18} /></div>
              <div className="history-detail">
                <span className="history-question">{conversation.title}</span>
                <span className="history-meta">{conversation.messageCount} messages · {conversation.role}</span>
                <span className="history-meta">Conversation: {conversation.conversation_id.slice(0, 12)}...</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
