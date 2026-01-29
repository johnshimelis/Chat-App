"use client"

import { useState, useEffect } from "react"
import { TrendingUp, MessageSquare, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  type: 'sentiment' | 'topic' | 'summary' | 'stats'
  title: string
  content: string
  icon: React.ReactNode
}

interface ConversationInsightsProps {
  messages: Array<{ content: string; createdAt: string; senderId: string }>
  userId: string
}

export default function ConversationInsights({ messages, userId }: ConversationInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (messages.length < 5) return // Only show insights for longer conversations

    const fetchInsights = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.slice(-20) // Last 20 messages
          })
        })

        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights || [])
        }
      } catch (error) {
        console.error("Insights error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [messages])

  // Calculate basic stats
  const stats = {
    totalMessages: messages.length,
    yourMessages: messages.filter(m => m.senderId === userId).length,
    theirMessages: messages.filter(m => m.senderId !== userId).length,
    avgResponseTime: calculateAvgResponseTime(messages, userId)
  }

  if (messages.length < 5) return null

  return (
    <div className={cn(
      "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20",
      "rounded-xl p-4 border border-purple-200 dark:border-purple-800 mb-4",
      "transition-all duration-300"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Conversation Insights
          </h3>
        </div>
        <span className="text-xs text-gray-500">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 text-center">
              <MessageSquare className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{stats.totalMessages}</p>
              <p className="text-[10px] text-gray-500">Messages</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 text-center">
              <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {stats.avgResponseTime > 0 ? `${stats.avgResponseTime}m` : "N/A"}
              </p>
              <p className="text-[10px] text-gray-500">Avg Response</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 text-center">
              <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {Math.round((stats.yourMessages / stats.totalMessages) * 100)}%
              </p>
              <p className="text-[10px] text-gray-500">Your Share</p>
            </div>
          </div>

          {/* AI Insights */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-purple-100 dark:border-purple-800"
                >
                  <div className="flex items-start gap-2">
                    {insight.icon}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {insight.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function calculateAvgResponseTime(messages: any[], userId: string): number {
  let totalTime = 0
  let count = 0
  let lastTheirMessage: Date | null = null

  messages.forEach(msg => {
    const msgDate = new Date(msg.createdAt)
    if (msg.senderId !== userId) {
      lastTheirMessage = msgDate
    } else if (lastTheirMessage) {
      const diff = (msgDate.getTime() - lastTheirMessage.getTime()) / (1000 * 60) // minutes
      if (diff > 0 && diff < 60) { // Only count reasonable response times
        totalTime += diff
        count++
      }
    }
  })

  return count > 0 ? Math.round(totalTime / count) : 0
}
