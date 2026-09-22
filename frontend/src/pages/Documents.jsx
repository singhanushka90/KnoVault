import { useEffect, useState } from 'react'
import { FolderOpen, ShieldCheck } from 'lucide-react'
import { documentsApi } from '../api/documents.js'
import DocumentCard from '../components/DocumentCard.jsx'
import DocumentUpload from '../components/DocumentUpload.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Documents({ uploadMode = false }) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isOwner = user?.role === 'Owner'
  const canManage = isOwner

  const loadDocuments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await documentsApi.list()
      setDocuments(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [user?.role])

  const deleteDocument = async (id) => {
    if (!window.confirm('Delete this document?')) return

    try {
      await documentsApi.remove(id)
      setDocuments((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete document')
    }
  }

  const replaceDocument = async (id, file) => {
    if (!file) return
    try {
      await documentsApi.replace(id, file)
      await loadDocuments()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to replace document')
    }
  }

  return (
    <div className="documents-page">
      <section className="page-head">
        <div>
          <span className="section-label">Knowledge repository</span>
          <h1>{isOwner ? 'Documents' : 'Accessible Documents'}</h1>
        </div>
        {isOwner && (
          <div className="page-tools">
            <span className="inline-status"><ShieldCheck size={14} /> {user?.role}</span>
          </div>
        )}
      </section>

      {error && <ErrorMessage message={error} />}

      <section className="documents-grid">
        <div className="documents-main">
          {canManage && <DocumentUpload onUploadComplete={loadDocuments} forceOpen={uploadMode} />}
          {loading ? (
            <Loading label="Loading documents..." />
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={40} />
              <h3>{isOwner ? 'No documents uploaded yet' : 'No accessible documents yet'}</h3>
              <p>{isOwner ? 'Upload a PDF or document to start indexing.' : 'You do not have access to any company documents yet.'}</p>
            </div>
          ) : (
            <div className="document-list">
              {documents.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  canManage={canManage}
                  onDelete={deleteDocument}
                  onReplace={replaceDocument}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
