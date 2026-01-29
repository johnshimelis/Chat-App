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
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 mb-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Create Poll</h3>
        <button
          onClick={onCancel}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full mb-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
      />

      <div className="space-y-2 mb-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
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
            "flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400",
            "hover:text-purple-700 dark:hover:text-purple-300",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Plus className="w-3 h-3" />
          Add Option
        </button>

        <Button
          onClick={handleSend}
          disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-xs px-4 py-1.5"
        >
          Create Poll
        </Button>
      </div>
    </div>
  )
}
