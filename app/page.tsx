"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react"
import io, { Socket } from "socket.io-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, Send, User as UserIcon, Bot, MoreVertical, Sparkles, Zap } from "lucide-react"

type User = {
  id: string
  name: string | null
  image: string | null
  email: string | null
  online?: boolean
  unreadCount?: number
}

type Message = {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
}

// Memoized User Item Component for Performance
const UserItem = memo(({ 
  user, 
  isSelected, 
  onClick 
}: { 
  user: User
  isSelected: boolean
  onClick: () => void 
}) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 relative group",
      "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
      isSelected 
        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm border border-blue-200 dark:border-blue-700" 
        : "hover:bg-gray-100 dark:hover:bg-gray-800"
    )}
  >
    <div className="relative">
      {user.id === 'ai-assistant' ? (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg ring-2 ring-purple-200 dark:ring-purple-800 animate-pulse">
          <Bot className="w-6 h-6" />
        </div>
      ) : user.image ? (
        <img 
          src={user.image} 
          alt={user.name!} 
          className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 transition-all duration-200" 
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
      {/* Animated Online Indicator */}
      <div className={cn(
        "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 transition-all duration-300",
        user.online || user.id === 'ai-assistant' 
          ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" 
          : "bg-gray-400"
      )}></div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
          {user.name}
        </p>
        {user.unreadCount && user.unreadCount > 0 ? (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold shadow-md animate-bounce">
            {user.unreadCount > 99 ? '99+' : user.unreadCount}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
        {user.id === 'ai-assistant' ? (
          <>
            <Sparkles className="w-3 h-3 text-purple-500" />
            Always here to help
          </>
        ) : (
          user.online ? (
            <>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </>
          ) : "Offline"
        )}
      </p>
    </div>
  </div>
))

UserItem.displayName = "UserItem"

// Memoized Message Component
const MessageBubble = memo(({ 
  message, 
  isMe, 
  userImage 
}: { 
  message: Message
  isMe: boolean
  userImage?: string | null
}) => {
  const time = useMemo(() => 
    new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [message.createdAt]
  )

  return (
    <div className={cn("flex gap-3 group", isMe ? "justify-end" : "justify-start")}>
      {!isMe && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0 mt-1">
          {userImage ? (
            <img src={userImage} alt="" className="w-full h-full rounded-full" />
          ) : (
            <UserIcon className="w-5 h-5 m-1.5 text-gray-600" />
          )}
        </div>
      )}
      <div className={cn(
        "max-w-[75%] rounded-2xl p-4 shadow-lg transition-all duration-200 group-hover:shadow-xl",
        "animate-in fade-in slide-in-from-bottom-2",
        isMe 
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm" 
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-2 text-right opacity-70 flex items-center justify-end gap-1",
          isMe ? "text-blue-100" : "text-gray-400"
        )}>
          {time}
          {isMe && <span className="w-1 h-1 bg-blue-200 rounded-full"></span>}
        </p>
      </div>
      {isMe && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex-shrink-0 mt-1 ring-2 ring-blue-200 dark:ring-blue-800"></div>
      )}
    </div>
  )
})

MessageBubble.displayName = "MessageBubble"

// Typing Indicator Component
const TypingIndicator = memo(() => (
  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="flex space-x-1.5">
        {[0, 150, 300].map((delay, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
))

TypingIndicator.displayName = "TypingIndicator"

export default function ChatApp() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedUserRef = useRef<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep ref in sync for socket callback
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Optimized Socket Connection with useMemo
  useEffect(() => {
    if (session?.user?.id) {
      const socketInstance = io()
      setSocket(socketInstance)

      socketInstance.emit("join_user", session.user.id)

      socketInstance.on("user_status", ({ userId, status }: { userId: string, status: string }) => {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, online: status === "online" } : u
        ))
      })

      socketInstance.on("new_message", (msg: Message) => {
        setMessages((prev) => {
          if (selectedUserRef.current?.id === msg.senderId) {
            return [...prev, msg]
          }
          return prev
        })

        if (selectedUserRef.current?.id !== msg.senderId) {
          setUsers(prev => prev.map(u => 
            u.id === msg.senderId 
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u
          ))
        }
      })

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [session])

  // Optimized User Loading
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        const aiUser: User = {
          id: "ai-assistant",
          name: "AI Assistant",
          image: null,
          email: "ai@bot",
          online: true,
          unreadCount: 0
        }
        setUsers([aiUser, ...data])
      }
    } catch (err) {
      console.error("Failed to load users", err)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchUsers()
  }, [session, fetchUsers])

  // Optimized Message Loading
  useEffect(() => {
    if (!selectedUser || !session?.user?.id) return

    if (selectedUser.id === "ai-assistant") {
      setMessages([])
      return
    }

    setIsLoading(true)
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u
    ))

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (err) {
        console.error("Failed to load messages", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMessages()
  }, [selectedUser, session])

  // Smooth Scroll to Bottom with Intersection Observer
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages, isAiTyping])

  // Optimized Send Message with useCallback
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedUser || !session?.user?.id) return

    const tempId = `temp-${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      content: input.trim(),
      senderId: session.user.id,
      receiverId: selectedUser.id,
      createdAt: new Date().toISOString()
    }

    // Optimistic update with animation
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    inputRef.current?.focus()

    // Handle AI Chat
    if (selectedUser.id === "ai-assistant") {
      setIsAiTyping(true)
      try {
        const res = await fetch("/api/chat/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMessage.content })
        })
        
        let data
        try {
          data = await res.json()
        } catch (parseError) {
          throw new Error("Invalid response from server")
        }

        let responseContent = data.response || "Sorry, I couldn't understand that."
        
        if (data.apiKey) {
          responseContent += `\n\n🔑 API Key: ${data.apiKey} (${data.provider || 'gemini'})`
        }
        
        // Remove optimistic message and add real ones
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== tempId)
          return [...filtered, {
            id: Date.now().toString(),
            content: responseContent,
            senderId: "ai-assistant",
            receiverId: session.user.id,
            createdAt: new Date().toISOString()
          }]
        })
      } catch (e) {
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== tempId)
          return [...filtered, {
            id: Date.now().toString(),
            content: `❌ Failed to connect to AI service. Please try again later.`,
            senderId: "ai-assistant",
            receiverId: session.user.id,
            createdAt: new Date().toISOString()
          }]
        })
      } finally {
        setIsAiTyping(false)
      }
      return
    }

    // Emit to socket
    if (socket) socket.emit("send_message", newMessage)
  }, [input, selectedUser, session, socket])

  // Memoized sorted users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1
      if ((a.unreadCount || 0) !== (b.unreadCount || 0)) {
        return (b.unreadCount || 0) - (a.unreadCount || 0)
      }
      return 0
    })
  }, [users])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Enhanced Sidebar */}
      <div className="w-80 border-r bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center space-x-3">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Me" 
                className="w-12 h-12 rounded-full ring-2 ring-blue-400 shadow-md" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{session?.user?.name}</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => signOut()}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Messages</p>
          </div>
          {sortedUsers.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isSelected={selectedUser?.id === user.id}
              onClick={() => setSelectedUser(user)}
            />
          ))}
          {users.length === 0 && (
            <div className="text-center text-sm text-gray-500 mt-10">No other users found.</div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        {selectedUser ? (
          <>
            {/* Enhanced Header */}
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                {selectedUser.id === 'ai-assistant' ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg ring-2 ring-purple-200 dark:ring-purple-800 animate-pulse">
                    <Bot className="w-6 h-6" />
                  </div>
                ) : selectedUser.image ? (
                  <img 
                    src={selectedUser.image} 
                    alt={selectedUser.name!} 
                    className="w-12 h-12 rounded-full ring-2 ring-blue-400 shadow-md" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.id === 'ai-assistant' && (
                      <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                    )}
                  </h3>
                  <p className={cn(
                    "text-xs flex items-center gap-1",
                    selectedUser.online ? "text-green-500" : "text-gray-400"
                  )}>
                    {selectedUser.online ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                      </>
                    ) : "Offline"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Enhanced Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-950 dark:to-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMe={msg.senderId === session?.user?.id}
                      userImage={selectedUser.image}
                    />
                  ))}
                  {isAiTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Enhanced Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg">
              <form
                className="flex items-center space-x-3 max-w-4xl mx-auto"
                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
              >
                <input
                  ref={inputRef}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-6 py-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button
                  type="submit"
                  className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse">
              <Bot className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Welcome to Chat App
              <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            </h3>
            <p className="max-w-md text-center text-gray-600 dark:text-gray-400">
              Select a user from the sidebar to start a conversation or chat with our AI assistant!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
