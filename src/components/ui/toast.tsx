'use client'

import React, { createContext, useContext, useState, useCallback, useId } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newItem: ToastItem = { id, title, description, variant, duration }

      setToasts((prev) => [...prev, newItem])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Viewport (Fixed bottom right) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4"
      >
        {toasts.map((item) => {
          const isError = item.variant === 'destructive'
          const isSuccess = item.variant === 'success'

          return (
            <div
              key={item.id}
              role="alert"
              className={`pointer-events-auto p-4 border bg-background text-foreground shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-start justify-between gap-3 ${
                isError
                  ? 'border-destructive/60 bg-destructive/5 text-destructive dark:text-red-400'
                  : isSuccess
                  ? 'border-emerald-600/60 bg-emerald-500/5 text-foreground'
                  : 'border-border bg-card text-card-foreground'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {isError && (
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-destructive" />
                )}
                {isSuccess && (
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                )}
                {!isError && !isSuccess && (
                  <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  {item.title && (
                    <div className="font-serif font-bold text-sm tracking-tight leading-snug">
                      {item.title}
                    </div>
                  )}
                  {item.description && (
                    <div className="text-xs font-mono text-muted-foreground leading-relaxed break-words">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="text-muted-foreground hover:text-foreground p-0.5 transition-colors shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { toast, dismiss } = context

  return {
    toast,
    dismiss,
    success: (title: string, description?: string) =>
      toast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) =>
      toast({ title, description, variant: 'destructive' }),
    info: (title: string, description?: string) =>
      toast({ title, description, variant: 'default' }),
  }
}

