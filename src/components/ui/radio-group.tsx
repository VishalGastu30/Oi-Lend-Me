"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// import { Check } from "lucide-react"

const RadioGroupContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export const RadioGroup = ({ value, onValueChange, children, className }: { 
  value: string; 
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("grid gap-2", className)} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  { value: string; className?: string; id?: string }
>(({ className, value, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  if (!context) throw new Error("RadioGroupItem must be used within RadioGroup")
  
  const isSelected = context.value === value

  return (
    <button
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && "bg-primary text-primary-foreground",
        className
      )}
      role="radio"
      aria-checked={isSelected}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      <span className="flex items-center justify-center">
        {/* Render indicator if needed, or use CSS */}
        {isSelected && <span className="h-2.5 w-2.5 fill-current text-current bg-current rounded-full" />}
      </span>
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"
