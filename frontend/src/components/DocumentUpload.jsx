import { useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { documentsApi } from '../api/documents.js'

export default function DocumentUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')
    try {
      await documentsApi.upload(file)
      setFile(null)
      onUploadComplete()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <label className="drop-zone">
        <UploadCloud size={30} />
        <span>{file ? file.name : 'Drop a PDF or document here'}</span>
        <input type="file" onChange={(event) => setFile(event.target.files?.[0])} />
      </label>
      {file && (
        <div className="selected-file">
          <span>{file.name}</span>
          <button type="button" onClick={() => setFile(null)}><X size={14} /></button>
        </div>
      )}
      {error && <div className="error-card">{error}</div>}
      <button className="primary-button" disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload document'}
      </button>
    </form>
  )
}
