"use client"

import { useState } from "react"
import { Plus, X, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CreatePollProps {
  onSend: (question: string, options: string[]) => void
  onCancel: () => void
}

export default function CreatePoll({ onSend, onCancel }: CreatePollProps) {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSend = () => {
    const validOptions = options.filter(opt => opt.trim().length > 0)
    if (question.trim() && validOptions.length >= 2) {
      onSend(question.trim(), validOptions)
      setQuestion("")
      setOptions(["", ""])
    }
  }

  return (
    <div className="bg-[#EDE9FE] dark:bg-[#5B21B6]/20 rounded-lg p-4 border border-[#C4B5FD] dark:border-[#7C3AED] mb-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
        <h3 className="font-semibold text-sm text-[#111827] dark:text-[#F9FAFB]">Create Poll</h3>
        <button
          onClick={onCancel}
          className="ml-auto text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full mb-3 px-3 py-2 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none dark:text-white"
      />

      <div className="space-y-2 mb-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none dark:text-white"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D]/30 text-[#EF4444] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addOption}
          disabled={options.length >= 6}
          className={cn(
            "flex items-center gap-1 text-[11px] text-[#7C3AED] dark:text-[#A78BFA] font-medium",
            "hover:text-[#6D28D9] dark:hover:text-[#C4B5FD]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Plus className="w-3 h-3" />
          Add Option
        </button>

        <Button
          onClick={handleSend}
          disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] px-4 py-1.5 font-medium"
        >
          Create Poll
        </Button>
      </div>
    </div>
  )
}
