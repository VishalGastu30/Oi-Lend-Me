"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Check, AlertTriangle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle className="flex items-center gap-2">
                {variant === 'success' && <Check className="w-4 h-4 text-green-400" />}
                {variant === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                {variant === 'destructive' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {variant === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                {title}
              </ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
