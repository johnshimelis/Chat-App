"use client"

import { useState } from "react"
import { Smile, Heart, ThumbsUp, Fire, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

const REACTIONS = [
  { emoji: "👍", icon: ThumbsUp, label: "Like" },
  { emoji: "❤️", icon: Heart, label: "Love" },
  { emoji: "😊", icon: Smile, label: "Happy" },
  { emoji: "🔥", icon: Fire, label: "Fire" },
  { emoji: "🎉", icon: PartyPopper, label: "Celebrate" }
]

interface Reaction {
  emoji: string
  userId: string
  count: number
  userReacted: boolean
}

interface MessageReactionsProps {
  messageId: string
  initialReactions?: Reaction[]
  currentUserId: string
}

export default function MessageReactions({
  messageId,
  initialReactions = [],
  currentUserId
}: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions)
  const [showPicker, setShowPicker] = useState(false)

  const handleReaction = async (emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      })

      if (response.ok) {
        const data = await response.json()
        setReactions(data.reactions || [])
      }
    } catch (error) {
      console.error("Reaction error:", error)
    }
  }

  return (
    <div className="relative flex items-center gap-1 mt-1">
      {reactions.length > 0 && (
        <div className="flex items-center gap-1">
          {reactions.map((reaction, index) => (
            <button
              key={index}
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                "transition-all duration-200 hover:scale-110 active:scale-95",
                reaction.userReacted && "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
              )}
            >
              <span>{reaction.emoji}</span>
              <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
          "transition-all duration-200 hover:scale-110",
          showPicker && "bg-purple-100 dark:bg-purple-900/30"
        )}
      >
        <Smile className="w-3 h-3 text-gray-500" />
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 flex gap-1 animate-in fade-in slide-in-from-bottom-2">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => {
                handleReaction(reaction.emoji)
                setShowPicker(false)
              }}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "transition-all duration-200 hover:scale-125 active:scale-95",
                "text-xl"
              )}
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
