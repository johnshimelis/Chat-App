"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AISuggestion {
  text: string
  confidence: number
}

interface AICoPilotProps {
  input: string
  conversationHistory: string[]
  onSelectSuggestion: (suggestion: string) => void
  enabled?: boolean
}

export default function AICoPilot({ 
  input, 
  conversationHistory, 
  onSelectSuggestion,
  enabled = true 
}: AICoPilotProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || input.length < 3) {
      setSuggestions([])
      return
    }

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentInput: input,
            history: conversationHistory.slice(-5) // Last 5 messages for context
          })
        })

        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
          if (data.suggestions?.length > 0) {
            setIsExpanded(true)
          }
        }
      } catch (error) {
        console.error("AI suggestion error:", error)
      } finally {
        setIsLoading(false)
      }
    }, 500) // 500ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [input, conversationHistory, enabled])

  if (!enabled || suggestions.length === 0) return null

  return (
    <div className={cn(
      "absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1F2937] rounded-lg shadow-lg border border-[#E5E7EB] dark:border-[#374151] p-3",
      "animate-in slide-in-from-bottom-2 fade-in duration-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
          <Sparkles className="w-3 h-3 text-[#7C3AED]" />
          <span className="font-semibold">AI Suggestions</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#9CA3AF] hover:text-[#6B7280] dark:hover:text-[#D1D5DB]"
        >
          {isExpanded ? (
            <X className="w-3 h-3" />
          ) : (
            <Zap className="w-3 h-3" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-1.5">
          {isLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] py-2">
              <div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
              <span>Thinking...</span>
            </div>
          ) : (
            suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectSuggestion(suggestion.text)
                  setSuggestions([])
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm",
                  "bg-[#EDE9FE] dark:bg-[#5B21B6]/20",
                  "hover:bg-[#DDD6FE] dark:hover:bg-[#5B21B6]/30",
                  "border border-[#C4B5FD] dark:border-[#7C3AED]",
                  "transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]",
                  "group"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#111827] dark:text-[#F9FAFB]">
                    {suggestion.text}
                  </span>
                  <span className="text-[10px] text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
