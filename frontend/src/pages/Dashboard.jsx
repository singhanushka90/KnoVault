import { useEffect, useState } from 'react'
import { LayoutDashboard, UploadCloud, FileText, MessagesSquare, Users, UserCircle } from 'lucide-react'
import { documentsApi } from '../api/documents.js'
import { chatApi } from '../api/chat.js'
import { authApi } from '../api/auth.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [chats, setChats] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [docsRes, chatsRes, membersRes] = await Promise.all([
        documentsApi.list(),
        chatApi.listChats(),
        authApi.getTeamMembers()
      ])

      setDocuments(docsRes.data || [])
      setChats(chatsRes.data || [])
      setTeamMembers(membersRes.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <div className="dashboard-page">
      <section className="page-head">
        <div>
          <span className="section-label">Workspace overview</span>
          <h1>Dashboard</h1>
        </div>
        <button className="primary-button small-button">+ New workspace</button>
      </section>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <section className="stats-grid">
            <StatCard icon={<FileText size={22} />} title="Documents" value={documents.length} subtitle="uploaded" />
            <StatCard icon={<MessagesSquare size={22} />} title="Chats" value={chats.length} subtitle="sessions" />
            <StatCard icon={<Users size={22} />} title="Team" value={teamMembers.length} subtitle="members" />
            <StatCard icon={<LayoutDashboard size={22} />} title="Status" value="Live" subtitle="KnowledgeOS" />
          </section>

          <section className="dashboard-grid">
            <div className="panel-card span-2">
              <div className="panel-title">
                <span>Documents</span>
                <button className="icon-button"><UploadCloud size={15} /></button>
              </div>
              <div className="calendar-list">
                {(documents || []).slice(0, 4).map((doc) => (
                  <div className="list-row" key={doc._id}>
                    <FileText size={16} /> <span>{doc.filename}</span>
                    <span className="status-chip">{doc.status || 'indexed'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-card span-1">
              <div className="panel-title">
                <span>Latest Conversations</span>
                <MessagesSquare size={15} />
              </div>
              <div className="calendar-list">
                {(chats || []).slice(0, 4).map((chat, idx) => (
                  <div className="list-row" key={idx}>
                    <MessagesSquare size={16} /> <span>{chat.conversation_id?.slice(0, 18)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-card span-2">
              <div className="panel-title">
                <span>Team Members</span>
                <UserCircle size={15} />
              </div>
              <div className="calendar-list">
                {teamMembers.map((member) => (
                  <div className="list-row" key={member._id}>
                    <Users size={16} /> <span>{member.name}</span>
                    <span className="status-chip">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
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
