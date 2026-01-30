"use client"

import { useState } from "react"
import { Smile } from "lucide-react"
import { cn } from "@/lib/utils"

const REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😊", label: "Happy" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🎉", label: "Celebrate" }
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
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]",
                "bg-[#F3F4F6] dark:bg-[#2A3441] hover:bg-[#E5E7EB] dark:hover:bg-[#374151]",
                "transition-all duration-150 hover:scale-105 active:scale-95",
                reaction.userReacted && "bg-[#DBEAFE] dark:bg-[#1E3A8A]/30 border border-[#3B82F6] dark:border-[#60A5FA]"
              )}
            >
              <span>{reaction.emoji}</span>
              <span className="text-[#111827] dark:text-[#F9FAFB] font-medium">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          "bg-[#F3F4F6] dark:bg-[#2A3441] hover:bg-[#E5E7EB] dark:hover:bg-[#374151]",
          "transition-all duration-150 hover:scale-105",
          showPicker && "bg-[#EDE9FE] dark:bg-[#5B21B6]/30"
        )}
      >
        <Smile className="w-3 h-3 text-[#6B7280] dark:text-[#9CA3AF]" />
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#1F2937] rounded-lg shadow-lg border border-[#E5E7EB] dark:border-[#374151] p-2 flex gap-1 animate-in fade-in slide-in-from-bottom-2">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => {
                handleReaction(reaction.emoji)
                setShowPicker(false)
              }}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                "hover:bg-[#F3F4F6] dark:hover:bg-[#374151]",
                "transition-all duration-150 hover:scale-110 active:scale-95",
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
