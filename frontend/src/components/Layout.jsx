import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import {
  LayoutDashboard,
  FileText,
  MessagesSquare,
  History,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navMap = {
  Owner: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload Documents', path: '/documents', icon: FileText },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Chat', path: '/chat', icon: MessagesSquare },
    { label: 'History', path: '/history', icon: History },
    { label: 'Team Members', path: '/team', icon: Users },
    { label: 'Profile', path: '/profile', icon: UserCircle }
  ],
  HR: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Chat', path: '/chat', icon: MessagesSquare },
    { label: 'History', path: '/history', icon: History },
    { label: 'Profile', path: '/profile', icon: UserCircle }
  ],
  Employee: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Chat', path: '/chat', icon: MessagesSquare },
    { label: 'History', path: '/history', icon: History },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Profile', path: '/profile', icon: UserCircle }
  ]
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const role = user?.role || 'Owner'
  const links = navMap[role] || navMap.Owner

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}> 
        <div className="brand-row">
          <div className="brand-icon">K</div>
          <div>
            <div className="brand-name">KnowledgeOS</div>
            <div className="brand-subtitle">Enterprise AI</div>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>

        <div className="role-badge-wrap">
          <span className="role-badge">{role}</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink key={link.path} to={link.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setSidebarOpen(false)}>
                <Icon size={17} />
                <span>{link.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="topbar-title">
            <span className="topbar-kicker">KnowledgeOS</span>
            <span className="topbar-meta">{role} Workspace</span>
          </div>
          <div className="topbar-user">
            <UserCircle size={30} />
            <span>{user?.name || user?.email || 'KnowledgeOS User'}</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
