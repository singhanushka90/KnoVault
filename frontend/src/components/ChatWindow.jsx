import { useEffect, useState } from 'react'
import { MessageCircle, UploadCloud, FileText, RotateCcw, Copy, Bookmark } from 'lucide-react'
import ChatMessage from './ChatMessage.jsx'
import ChatInput from './ChatInput.jsx'
import ConversationList from './ConversationList.jsx'
import Loading from './Loading.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import { chatApi } from '../api/chat.js'
import { useAuth } from '../hooks/useAuth.js'

export default function ChatWindow() {
  const { user } = useAuth()
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')

  const newConversation = async () => {
    const newConvId = crypto.randomUUID()
    setConversationId(newConvId)
    setMessages([])
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await chatApi.listChats()
      const flatten = Array.isArray(response.data) ? response.data : []
      const unique = []
      flatten.forEach((chat) => {
        if (chat.conversation_id && !unique.some((item) => item.conversation_id === chat.conversation_id)) {
          unique.push(chat)
        }
      })
      setConversations(unique)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load chat history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadConversation = async (id) => {
    if (!id) return
    setLoading(true)
    try {
      const response = await chatApi.getConversation(id)
      const conversation = response.data
      setConversationId(conversation.conversation_id)
      setMessages(conversation.messages || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Conversation not found')
    } finally {
      setLoading(false)
    }
  }

  const sendQuestion = async (question) => {
    if (!question.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await chatApi.ask({ question, conversation_id: conversationId || undefined })
      const newMessage = {
        question,
        answer: response.data.answer,
        sources: response.data.sources || [],
        role: 'user',
        filename: response.data.filename || '',
        timestamp: new Date().toLocaleTimeString(),
        conversation_id: conversationId || ''
      }

      setMessages((prev) => [...prev, newMessage])

      if (!conversationId) {
        const generated = response.request?._headers?.['x-conversation-id'] || crypto.randomUUID()
        setConversationId(generated)
      }

      await loadHistory()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to send question')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  return (
    <div className="chat-page">
      <section className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span>Conversations</span>
          <button className="icon-button" onClick={newConversation}><RotateCcw size={16} /></button>
        </div>
        <ConversationList conversations={conversations} selectedConversation={conversationId} onSelect={loadConversation} onCreate={newConversation} />
      </section>

      <section className="chat-main">
        <div className="chat-top">
          <div>
            <span className="chat-label">Workspace Chat</span>
            <div className="chat-thread-title">{conversationId || 'New conversation'}</div>
          </div>
          <div className="chat-toolbar">
            <button className="icon-button"><UploadCloud size={16} /></button>
            <button className="icon-button"><Copy size={16} /></button>
            <button className="icon-button"><Bookmark size={16} /></button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <MessageCircle size={40} />
              <h3>Start a new KnowledgeOS conversation</h3>
              <p>Ask a question about your documents and source-backed answers will appear here.</p>
            </div>
          ) : (
            messages.map((message, index) => <ChatMessage key={index} message={message} />)
          )}
          {loading && <Loading label="Thinking..." />}
        </div>

        <ChatInput onSend={sendQuestion} loading={loading} />
      </section>
    </div>
  )
}
