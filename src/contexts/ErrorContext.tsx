import { createContext, useContext, useState, ReactNode } from 'react'

type ToastType = 'error' | 'success' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ErrorContextType {
  toasts: Toast[]
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showInfo: (message: string) => void
  removeToast: (id: number) => void
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const showError = (message: string) => addToast(message, 'error')
  const showSuccess = (message: string) => addToast(message, 'success')
  const showInfo = (message: string) => addToast(message, 'info')
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ErrorContext.Provider value={{ toasts, showError, showSuccess, showInfo, removeToast }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useError must be used within ErrorProvider')
  return ctx
}
