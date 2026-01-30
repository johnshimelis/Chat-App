"use client"

import { useState, useEffect } from "react"
import { BarChart3, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface PollOption {
  text: string
  votes: number
  percentage: number
  voted: boolean
}

interface PollMessageProps {
  messageId: string
  question: string
  options: string[]
  currentUserId: string
  initialVotes?: Record<string, number>
  userVote?: number
}

export default function PollMessage({
  messageId,
  question,
  options,
  currentUserId,
  initialVotes = {},
  userVote
}: PollMessageProps) {
  const [pollOptions, setPollOptions] = useState<PollOption[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(userVote ?? null)
  const [totalVotes, setTotalVotes] = useState(0)
  const [hasVoted, setHasVoted] = useState(userVote !== undefined)

  useEffect(() => {
    // Calculate votes from initial data
    const votes: Record<number, number> = {}
    Object.entries(initialVotes).forEach(([optionIndex, count]) => {
      votes[parseInt(optionIndex)] = count
    })

    const total = Object.values(votes).reduce((sum, count) => sum + count, 0)
    setTotalVotes(total)

    const formattedOptions = options.map((text, index) => {
      const voteCount = votes[index] || 0
      const percentage = total > 0 ? (voteCount / total) * 100 : 0
      return {
        text,
        votes: voteCount,
        percentage,
        voted: selectedOption === index
      }
    })

    setPollOptions(formattedOptions)
  }, [options, initialVotes, selectedOption])

  const handleVote = async (optionIndex: number) => {
    if (hasVoted) return

    try {
      const response = await fetch(`/api/messages/${messageId}/poll/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedOption(optionIndex)
        setHasVoted(true)
        
        // Update local state
        const updatedOptions = pollOptions.map((opt, idx) => {
          if (idx === optionIndex) {
            return {
              ...opt,
              votes: opt.votes + 1,
              voted: true
            }
          }
          return opt
        })

        const newTotal = totalVotes + 1
        setTotalVotes(newTotal)

        // Recalculate percentages
        const recalculated = updatedOptions.map(opt => ({
          ...opt,
          percentage: (opt.votes / newTotal) * 100
        }))

        setPollOptions(recalculated)
      }
    } catch (error) {
      console.error("Vote error:", error)
    }
  }

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl p-4 border border-[#E5E7EB] dark:border-[#374151] shadow-sm max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
        <h4 className="font-semibold text-sm text-[#111827] dark:text-[#F9FAFB]">{question}</h4>
      </div>

      <div className="space-y-2 mb-3">
        {pollOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => !hasVoted && handleVote(index)}
            disabled={hasVoted}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all duration-150",
              "hover:scale-[1.01] active:scale-[0.99]",
              selectedOption === index
                ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#5B21B6]/20"
                : "border-[#E5E7EB] dark:border-[#374151] hover:border-[#A78BFA] dark:hover:border-[#7C3AED]",
              hasVoted && "cursor-default"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-sm font-medium",
                selectedOption === index
                  ? "text-[#7C3AED] dark:text-[#C4B5FD]"
                  : "text-[#111827] dark:text-[#F9FAFB]"
              )}>
                {option.text}
              </span>
              {hasVoted && (
                <span className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                  {Math.round(option.percentage)}%
                </span>
              )}
            </div>
            
            {hasVoted && (
              <div className="relative h-2 bg-[#E5E7EB] dark:bg-[#374151] rounded-full overflow-hidden mt-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    selectedOption === index
                      ? "bg-[#7C3AED]"
                      : "bg-[#9CA3AF]"
                  )}
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9CA3AF] pt-2 border-t border-[#E5E7EB] dark:border-[#374151]">
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>
        {!hasVoted && (
          <span className="text-[#7C3AED] font-medium">Click to vote</span>
        )}
      </div>
    </div>
  )
}
