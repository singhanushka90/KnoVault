import { Send } from 'lucide-react'
import { useState } from 'react'

export default function ChatInput({ onSend, loading }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleanQuestion = question.trim()
    if (!cleanQuestion || loading) return

    onSend(cleanQuestion)
    setQuestion('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your company documents..."
        disabled={loading}
      />
      <button type="submit" disabled={loading || !question.trim()}>
        <Send size={16} />
        <span>{loading ? 'Thinking...' : 'Send'}</span>
      </button>
    </form>
  )
}
