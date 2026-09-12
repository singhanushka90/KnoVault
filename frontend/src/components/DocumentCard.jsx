import { FileText, Trash2, CheckCircle, Clock3, Users } from 'lucide-react'

export default function DocumentCard({ document, onDelete }) {
  const allowed = Array.isArray(document.allowed_roles) ? document.allowed_roles.join(', ') : 'Owner, HR'

  return (
    <article className="document-card">
      <div className="document-card-head">
        <div className="document-icon"><FileText size={26} /></div>
        <div className="document-main">
          <div className="document-title">{document.filename || document.name || 'Untitled document'}</div>
          <div className="document-meta-row">
            <span className="document-status"><CheckCircle size={14} /> {document.status || 'indexed'}</span>
            <span className="document-vectors">{document.vectors_stored || 0} vectors</span>
          </div>
        </div>
        <button className="delete-button" onClick={() => onDelete(document._id)}><Trash2 size={16} /></button>
      </div>

      <div className="document-detail-grid">
        <div>
          <span className="mini-label">Allowed roles</span>
          <div className="mini-text"><Users size={14} /> {allowed}</div>
        </div>
        <div>
          <span className="mini-label">Uploaded</span>
          <div className="mini-text"><Clock3 size={14} /> {document.uploaded_at || 'Recently'}</div>
        </div>
      </div>
    </article>
  )
}
