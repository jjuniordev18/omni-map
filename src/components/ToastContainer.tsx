import { useError } from '../contexts/ErrorContext'

const toastStyles: Record<string, React.CSSProperties> = {
  error: { background: '#dc2626', color: '#fff' },
  success: { background: '#16a34a', color: '#fff' },
  info: { background: '#2563eb', color: '#fff' }
}

export default function ToastContainer() {
  const { toasts, removeToast } = useError()

  if (toasts.length === 0) return null

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 9999, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8,
        maxWidth: '90vw'
      }}
      role="alert"
      aria-live="polite"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            ...toastStyles[t.type],
            padding: '12px 16px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            animation: 'slideIn 0.3s ease'
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
