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

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your company documents..." />
      <button type="submit" disabled={loading || !question.trim()}>
        <Send size={16} />
        <span>{loading ? 'Thinking...' : 'Ask'}</span>
      </button>
    </form>
  )
}
