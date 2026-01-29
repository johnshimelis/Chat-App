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
  const debounceRef = useRef<NodeJS.Timeout>()

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
      "absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3",
      "animate-in slide-in-from-bottom-2 fade-in duration-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span className="font-semibold">AI Suggestions</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
                  "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20",
                  "hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30",
                  "border border-purple-200 dark:border-purple-800",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                  "group"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {suggestion.text}
                  </span>
                  <span className="text-[10px] text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
