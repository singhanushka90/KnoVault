export default function ErrorMessage({ message }) {
  return <div className="error-card">{message || 'Something went wrong. Please try again.'}</div>
}
