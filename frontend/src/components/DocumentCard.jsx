import { FileText, Trash2, CheckCircle, Clock3, Users, RefreshCcw } from 'lucide-react'

export default function DocumentCard({ document, canManage = false, onDelete, onReplace }) {
  const allowed = Array.isArray(document.allowed_roles) ? document.allowed_roles.join(', ') : 'Owner, HR, Employee'
  const fileType = document.content_type || document.filename?.split('.').pop() || 'pdf'

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

        {canManage && (
          <div className="document-actions">
            <label className="ghost-button small-button" title="Replace file">
              <RefreshCcw size={14} />
              <input
                type="file"
                onChange={(event) => {
                  const selected = event.target.files?.[0]
                  if (selected) onReplace(document._id, selected)
                  event.target.value = ''
                }}
              />
            </label>
            <button className="delete-button" onClick={() => onDelete(document._id)} aria-label="Delete document">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="document-detail-grid">
        <div>
          <span className="mini-label">File type</span>
          <div className="mini-text"><FileText size={14} /> {fileType.toUpperCase()}</div>
        </div>
        <div>
          <span className="mini-label">Uploaded</span>
          <div className="mini-text"><Clock3 size={14} /> {document.uploaded_at || 'Recently'}</div>
        </div>
      </div>

      <div className="document-access-row">
        <span className="mini-label">Visible to</span>
        <div className="mini-text"><Users size={14} /> {allowed}</div>
      </div>
    </article>
  )
}
