"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import io, { Socket } from "socket.io-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, Send, User as UserIcon, Bot, MoreVertical } from "lucide-react"

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

export default function ChatApp() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedUserRef = useRef<User | null>(null)

  // Keep ref in sync for socket callback
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Socket Connection
  useEffect(() => {
    if (session?.user?.id) {
      const socketInstance = io() // Defaults to current host
      setSocket(socketInstance)

      socketInstance.emit("join_user", session.user.id)

      socketInstance.on("user_status", ({ userId, status }: { userId: string, status: string }) => {
        setUsers(prev => prev.map(u => {
          if (u.id === userId) return { ...u, online: status === "online" }
          return u
        }))
      })

      socketInstance.on("new_message", (msg: Message) => {
        // If chat is open with sender, add message. Else increment unread
        setMessages((prev) => {
          if (selectedUserRef.current?.id === msg.senderId) {
            return [...prev, msg]
          }
          return prev
        })

        if (selectedUserRef.current?.id !== msg.senderId) {
          setUsers(prev => prev.map(u => {
            if (u.id === msg.senderId) {
              return { ...u, unreadCount: (u.unreadCount || 0) + 1 }
            }
            return u
          }))
        }
      })

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [session])

  // Load Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const data = await res.json()
          // Prepend AI User
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
    }
    if (session?.user) fetchUsers()
  }, [session])

  // Load Messages + Clear Unread
  useEffect(() => {
    if (!selectedUser || !session?.user?.id) return

    if (selectedUser.id === "ai-assistant") {
      // For AI, we might want to keep local history or fetch from DB if we persisted it
      // For now, reset or fetch if you implement AI persistence
      setMessages([])
      return
    }

    // Clear unread count locally
    setUsers(prev => prev.map(u => {
      if (u.id === selectedUser.id) return { ...u, unreadCount: 0 }
      return u
    }))

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (err) {
        console.error("Failed to load messages", err)
      }
    }
    fetchMessages()
  }, [selectedUser, session])

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAiTyping])

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser || !session?.user?.id) return

    const tempId = Date.now().toString()
    const newMessage: Message = {
      id: tempId,
      content: input,
      senderId: session.user.id,
      receiverId: selectedUser.id,
      createdAt: new Date().toISOString()
    }

    // Optimistic update
    setMessages((prev) => [...prev, newMessage])
    setInput("")

    // Handle AI Chat
    if (selectedUser.id === "ai-assistant") {
      setIsAiTyping(true)
      try {
        const res = await fetch("/api/chat/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMessage.content })
        })
        
        // Check if response is OK, but still parse JSON for error messages
        let data;
        try {
          data = await res.json()
        } catch (parseError) {
          console.error("Failed to parse response:", parseError)
          throw new Error("Invalid response from server")
        }

        // Always show the response, even if it's an error message
        // The API will format quota/error messages appropriately
        let responseContent = data.response || "Sorry, I couldn't understand that.";
        
        // Add API key info to response if available
        if (data.apiKey) {
          responseContent += `\n\n🔑 API Key: ${data.apiKey} (${data.provider || 'gemini'})`;
        }
        
        const aiReply: Message = {
          id: Date.now().toString(),
          content: responseContent,
          senderId: "ai-assistant",
          receiverId: session.user.id,
          createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiReply])
      } catch (e) {
        console.error("AI Chat Error:", e)
        // Show error message to user with more details
        const errorMessage = e instanceof Error ? e.message : "Unknown error"
        const errorReply: Message = {
          id: Date.now().toString(),
          content: `❌ Failed to connect to AI service: ${errorMessage}. Please check your server logs or try again later.`,
          senderId: "ai-assistant",
          receiverId: session.user.id,
          createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorReply])
      } finally {
        setIsAiTyping(false)
      }
      return
    }

    // Emit to socket
    if (socket) socket.emit("send_message", newMessage)
  }

  if (status === "loading") return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Me" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{session?.user?.name}</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Messages</p>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors relative",
                selectedUser?.id === user.id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="relative">
                {user.id === 'ai-assistant' ? (
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border-2 border-purple-200">
                    <Bot className="w-6 h-6" />
                  </div>
                ) : user.image ? (
                  <img src={user.image} alt={user.name!} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                {/* Online indicator */}
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900",
                  user.online || user.id === 'ai-assistant' ? "bg-green-500" : "bg-gray-400"
                )}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  {/* Unread Badge */}
                  {user.unreadCount && user.unreadCount > 0 ? (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {user.unreadCount}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {user.id === 'ai-assistant' ? "Always here to help" : "Click to chat"}
                </p>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center text-sm text-gray-500 mt-10">No other users found.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 shadow-sm z-10">
              <div className="flex items-center space-x-3">
                {selectedUser.id === 'ai-assistant' ? (
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Bot className="w-6 h-6" />
                  </div>
                ) : selectedUser.image ? (
                  <img src={selectedUser.image} alt={selectedUser.name!} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{selectedUser.name}</h3>
                  <p className={cn("text-xs", selectedUser.online ? "text-green-500" : "text-gray-400")}>
                    {selectedUser.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === session?.user?.id
                return (
                  <div key={i} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl p-4 shadow-sm",
                      isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700"
                    )}>
                      <p className="text-md">{msg.content}</p>
                      <p className={cn("text-[10px] mt-1 text-right opacity-70", isMe ? "text-blue-100" : "text-gray-400")}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 rounded-bl-none border border-gray-100 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
              <form
                className="flex items-center space-x-2 max-w-4xl mx-auto"
                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
              >
                <input
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-6 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  type="submit"
                  className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95"
                  disabled={!input.trim()}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-24 h-24 bg-blue-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Chat App</h3>
            <p className="max-w-xs text-center">Select a user from the sidebar to start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
