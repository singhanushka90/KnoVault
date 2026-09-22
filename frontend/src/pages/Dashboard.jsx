import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, FileText, LayoutDashboard, MessagesSquare, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { documentsApi } from '../api/documents.js'
import { chatApi } from '../api/chat.js'
import { authApi } from '../api/auth.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { useAuth } from '../hooks/useAuth.js'

const buildRecentConversations = (items = []) => {
  const map = new Map()
  items.forEach((chat) => {
    if (!chat?.conversation_id) return
    const existing = map.get(chat.conversation_id) || []
    existing.push(chat)
    map.set(chat.conversation_id, existing)
  })

  return [...map.entries()]
    .map(([conversationId, entries]) => ({
      conversation_id: conversationId,
      title: entries.find((entry) => entry?.question)?.question || 'Untitled conversation',
      messages: entries.length,
      role: entries[0]?.role || 'Employee',
      firstEntry: entries[0]
    }))
    .sort((a, b) => (b.firstEntry?._id ? 1 : 0) - (a.firstEntry?._id ? 1 : 0))
    .slice(0, 5)
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [chats, setChats] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const role = user?.role || 'Owner'
  const isOwner = role === 'Owner'
  const isHR = role === 'HR'
  const recentConversations = buildRecentConversations(chats)

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const requests = [chatApi.listChats()]
      if (isOwner || isHR) {
        requests.unshift(documentsApi.list())
      }
      if (isOwner) {
        requests.push(authApi.getTeamMembers())
      }

      const results = await Promise.all(requests)
      const docs = isOwner || isHR ? (Array.isArray(results[0]?.data) ? results[0].data : []) : []
      const chatData = Array.isArray(results[isOwner || isHR ? 1 : 0]?.data) ? results[isOwner || isHR ? 1 : 0].data : []
      const members = isOwner && Array.isArray(results[results.length - 1]?.data) ? results[results.length - 1].data : []

      setDocuments(docs)
      setChats(chatData)
      setTeamMembers(members)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [role])

  const summaryCards = isOwner
    ? [
        { label: 'Total Documents', value: documents.length, icon: <FileText size={20} />, accent: 'documents' },
        { label: 'Conversations', value: recentConversations.length, icon: <MessagesSquare size={20} />, accent: 'chat' },
        { label: 'Team Members', value: teamMembers.length, icon: <Users size={20} />, accent: 'team' },
        { label: 'System Status', value: 'Live', icon: <ShieldCheck size={20} />, accent: 'status' }
      ]
    : isHR
      ? [
          { label: 'Accessible Docs', value: documents.length, icon: <FileText size={20} />, accent: 'documents' },
          { label: 'My Chat Sessions', value: recentConversations.length, icon: <MessagesSquare size={20} />, accent: 'chat' },
          { label: 'Role', value: 'HR', icon: <BriefcaseBusiness size={20} />, accent: 'team' },
          { label: 'System Status', value: 'Live', icon: <ShieldCheck size={20} />, accent: 'status' }
        ]
      : [
          { label: 'My Chat Sessions', value: recentConversations.length, icon: <MessagesSquare size={20} />, accent: 'chat' },
          { label: 'Account Role', value: 'Employee', icon: <BriefcaseBusiness size={20} />, accent: 'team' },
          { label: 'System', value: 'Ready', icon: <Sparkles size={20} />, accent: 'status' },
          { label: 'Workspace', value: 'Personal', icon: <LayoutDashboard size={20} />, accent: 'documents' }
        ]

  return (
    <div className="dashboard-page">
      <section className="page-head">
        <div>
          <span className="section-label">Workspace overview</span>
          <h1>{role === 'Owner' ? 'Owner Dashboard' : role === 'HR' ? 'HR Dashboard' : 'Employee Dashboard'}</h1>
        </div>
        {role === 'Employee' && (
          <button className="primary-button small-button" onClick={() => navigate('/chat')}>
            <MessagesSquare size={16} />
            Start a conversation
          </button>
        )}
      </section>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <section className="welcome-panel">
            <div>
              <span className="section-label">Welcome back</span>
              <h2>{user?.name || 'User'}</h2>
            </div>
            <div className="welcome-meta">
              <span className="role-badge">{role}</span>
              <span className="subtle-text">{role === 'Employee' ? 'Your own workspace' : 'Shared company workspace'}</span>
            </div>
          </section>

          <section className="stats-grid">
            {summaryCards.map((card) => (
              <StatCard key={card.label} icon={card.icon} title={card.label} value={card.value} subtitle={card.accent} />
            ))}
          </section>

          <section className="dashboard-grid">
            {isOwner && (
              <div className="panel-card span-2">
                <div className="panel-title">
                  <span>Recently uploaded documents</span>
                  <button className="icon-button" onClick={() => navigate('/documents')}>
                    <FileText size={15} />
                  </button>
                </div>
                <div className="calendar-list">
                  {documents.length === 0 ? (
                    <div className="empty-inline">
                      <span>No documents uploaded yet</span>
                      <button className="primary-button small-button" onClick={() => navigate('/upload-documents')}>Upload Document</button>
                    </div>
                  ) : (
                    documents.slice(0, 4).map((doc) => (
                      <div className="list-row" key={doc._id}>
                        <div className="list-icon"><FileText size={15} /></div>
                        <div className="list-copy">
                          <strong>{doc.filename || 'Untitled document'}</strong>
                          <small>{doc.status || 'indexed'}</small>
                        </div>
                        <span className="status-chip">{doc.status || 'indexed'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {(isOwner || isHR) && (
              <div className="panel-card span-1">
                <div className="panel-title">
                  <span>Accessible documents</span>
                  <FileText size={15} />
                </div>
                <div className="calendar-list">
                  {documents.length === 0 ? (
                    <div className="empty-inline compact">
                      <span>No accessible documents</span>
                    </div>
                  ) : (
                    documents.slice(0, 4).map((doc) => (
                      <div className="list-row" key={doc._id}>
                        <div className="list-icon"><FileText size={15} /></div>
                        <div className="list-copy">
                          <strong>{doc.filename || 'Untitled document'}</strong>
                          <small>{doc.allowed_roles?.join(', ') || 'Owner, HR, Employee'}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className={isOwner ? 'panel-card span-2' : 'panel-card span-3'}>
              <div className="panel-title">
                <span>Recent conversations</span>
                <MessagesSquare size={15} />
              </div>
              <div className="calendar-list">
                {recentConversations.length === 0 ? (
                  <div className="empty-inline compact">
                    <span>No conversations yet. Ask KnowledgeOS anything about your company knowledge.</span>
                  </div>
                ) : (
                  recentConversations.map((conversation) => (
                    <button key={conversation.conversation_id} className="conversation-summary" onClick={() => navigate('/chat')}>
                      <div className="list-icon"><MessagesSquare size={15} /></div>
                      <div className="list-copy">
                        <strong>{conversation.title}</strong>
                        <small>{conversation.messages} messages · {conversation.role}</small>
                      </div>
                      <ArrowRight size={15} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {isOwner && (
              <div className="panel-card span-1">
                <div className="panel-title">
                  <span>Team members</span>
                  <Users size={15} />
                </div>
                <div className="calendar-list">
                  {teamMembers.length === 0 ? (
                    <div className="empty-inline compact">
                      <span>No team members yet</span>
                      <button className="primary-button small-button" onClick={() => navigate('/team')}>Add Team Member</button>
                    </div>
                  ) : (
                    teamMembers.slice(0, 4).map((member) => (
                      <div className="list-row" key={member._id}>
                        <div className="list-icon avatar-mini">{(member.name || 'K').slice(0, 1).toUpperCase()}</div>
                        <div className="list-copy">
                          <strong>{member.name}</strong>
                          <small>{member.email}</small>
                        </div>
                        <span className="status-chip">{member.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <article className="stat-card">
      <div className="stat-head">
        <span className="stat-icon">{icon}</span>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </article>
  )
}
