"use client"
import { toast as sonnerToast } from "sonner"

export const useToast = () => {
  return {
    toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      if (props.variant === "destructive") {
        sonnerToast.error(props.title || "Error", {
          description: props.description,
        })
      } else {
        sonnerToast.success(props.title || "Éxito", {
          description: props.description,
        })
      }
    },
  }
}

// También exportamos toast directamente para compatibilidad
export const toast = (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
  if (props.variant === "destructive") {
    sonnerToast.error(props.title || "Error", {
      description: props.description,
    })
  } else {
    sonnerToast.success(props.title || "Éxito", {
      description: props.description,
    })
  }
}
