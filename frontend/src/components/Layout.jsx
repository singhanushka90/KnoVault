import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
    { label: 'Upload Documents', path: '/upload-documents', icon: FileText },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Chat', path: '/chat', icon: MessagesSquare },
    { label: 'History', path: '/history', icon: History },
    { label: 'Team Members', path: '/team', icon: Users }
  ],
  HR: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Chat', path: '/chat', icon: MessagesSquare },
    { label: 'History', path: '/history', icon: History }
  ],
  Employee: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Chat', path: '/chat', icon: MessagesSquare },
    { label: 'History', path: '/history', icon: History }
  ]
}

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/upload-documents': 'Upload Documents',
  '/chat': 'Chat',
  '/history': 'History',
  '/team': 'Team Members',
  '/profile': 'Profile'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const role = user?.role || 'Owner'
  const links = navMap[role] || navMap.Owner
  const pageTitle = pageTitles[location.pathname] || 'Overview'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-icon">K</div>
          <div>
            <div className="brand-name">KnowledgeOS</div>
            <div className="brand-subtitle">Enterprise AI</div>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
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

          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setSidebarOpen(false)}>
            <UserCircle size={17} />
            <span>Profile</span>
          </NavLink>
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
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={22} />
          </button>

          <div className="topbar-title">
            <span className="topbar-kicker">KnowledgeOS AI</span>
            <span className="topbar-meta">{pageTitle}</span>
          </div>

          <div className="topbar-user">
            <div className="avatar small-avatar">{(user?.name || user?.email || 'K').slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="topbar-user-name">{user?.name || user?.email || 'KnowledgeOS User'}</div>
              <div className="topbar-user-role">{role}</div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
