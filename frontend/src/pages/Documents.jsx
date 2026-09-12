import { useEffect, useState } from 'react'
import { FolderOpen, Search, UploadCloud } from 'lucide-react'
import { documentsApi } from '../api/documents.js'
import DocumentCard from '../components/DocumentCard.jsx'
import DocumentUpload from '../components/DocumentUpload.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDocuments = async () => {
    setLoading(true)
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
  }, [])

  const deleteDocument = async (id) => {
    if (!window.confirm('Delete this document?')) return

    try {
      await documentsApi.remove(id)
      setDocuments((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete document')
    }
  }

  return (
    <div className="documents-page">
      <section className="page-head">
        <div>
          <span className="section-label">Knowledge repository</span>
          <h1>Documents</h1>
        </div>
        <div className="page-tools">
          <button className="icon-button"><Search size={16} /></button>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}

      <section className="documents-grid">
        <div className="documents-main">
          <DocumentUpload onUploadComplete={loadDocuments} />
          {loading ? (
            <Loading label="Loading documents..." />
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={40} />
              <h3>No documents uploaded</h3>
              <p>Upload a PDF or document to start indexing.</p>
            </div>
          ) : (
            <div className="document-list">
              {documents.map((document) => (
                <DocumentCard key={document._id} document={document} onDelete={deleteDocument} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
