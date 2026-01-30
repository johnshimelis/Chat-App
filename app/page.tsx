"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react"
import io, { Socket } from "socket.io-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, Send, User as UserIcon, Bot, MoreVertical, Sparkles, Zap, BarChart3, Smile, Home, MessageCircle, Circle, Compass, Folder, Image as ImageIcon, Settings, Search, Phone, Video, Paperclip, Mic, Bell, ChevronDown, ArrowLeft, Pencil, Gift, Sun, Check, CheckCheck, Filter, Star } from "lucide-react"
import AICoPilot from "@/components/AICoPilot"
import PollMessage from "@/components/PollMessage"
import CreatePoll from "@/components/CreatePoll"
import MessageReactions from "@/components/MessageReactions"
import ConversationInsights from "@/components/ConversationInsights"

type User = {
  id: string
  name: string | null
  image: string | null
  email: string | null
  online?: boolean
  unreadCount?: number
  lastMessage?: string | null
  lastMessageTime?: string | null
}

type Message = {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  type?: string
  metadata?: string
}

// Component Props Interfaces
interface LeftNavBarProps {
  activeSection: string
  userImage?: string | null
  onLogoClick: () => void
}

interface ConversationItemProps {
  user: User
  isSelected: boolean
  onClick: () => void
  currentUserId?: string
}

interface MessageBubbleProps {
  message: Message
  isMe: boolean
  userImage?: string | null
}

// User Dropdown Menu Component
interface UserDropdownProps {
  userName: string | null
  userEmail: string | null
  userImage: string | null
  onClose: () => void
  onLogout: () => void
  onGoToDashboard: () => void
}

function UserDropdownComponent(props: UserDropdownProps) {
  const { userName, userEmail, userImage, onClose, onLogout, onGoToDashboard } = props

  return (
    <div className="absolute left-[74px] top-[57px] w-[280px] bg-white shadow-2xl border border-[#E1E5E9] z-50 rounded-xl overflow-hidden" style={{ maxHeight: '600px' }}>
      {/* User Info Section */}
      <div className="p-6 border-b border-[#E1E5E9]">
        <div className="flex items-center gap-3 mb-4">
          {userImage ? (
            <img src={userImage} alt={userName || "User"} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold">
              {userName?.[0] || "U"}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-[15px] text-[#111827]">{userName || "User"}</p>
            <p className="text-[13px] text-[#64748B]">{userEmail || "No email"}</p>
          </div>
        </div>

        {/* Credits Section */}
        <div className="bg-[#F8F9FA] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-[#111827]">Credits</span>
            <span className="text-[13px] font-semibold text-[#10B981]">20 left</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2 mb-2">
            <div className="bg-[#10B981] h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
            <span>5 of 25 used today</span>
            <span className="text-[#10B981]">+25 tomorrow</span>
          </div>
          <p className="text-[11px] text-[#64748B]">Renews in 6h 24m</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-2">
        <button
          onClick={onGoToDashboard}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 text-[#64748B]" />
          <span className="text-[14px] text-[#111827]">Go back to dashboard</span>
        </button>
        <button
          onClick={() => {
            // Handle rename file
            console.log("Rename file clicked")
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <Pencil className="w-4 h-4 text-[#64748B]" />
          <span className="text-[14px] text-[#111827]">Rename file</span>
        </button>
        <button
          onClick={() => {
            // Handle win free credits
            console.log("Win free credits clicked")
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <Gift className="w-4 h-4 text-[#64748B]" />
          <span className="text-[14px] text-[#111827]">Win free credits</span>
        </button>
        <button
          onClick={() => {
            // Handle theme style
            console.log("Theme style clicked")
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <Sun className="w-4 h-4 text-[#64748B]" />
          <span className="text-[14px] text-[#111827]">Theme Style</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4 text-[#64748B]" />
          <span className="text-[14px] text-[#111827]">Log out</span>
        </button>
      </div>
    </div>
  )
}

const UserDropdown = memo(UserDropdownComponent)
UserDropdown.displayName = "UserDropdown"

// Left Navigation Sidebar Component - Figma Design
interface LeftNavBarComponentProps extends LeftNavBarProps {
  onLogoClick: () => void
  onSectionChange: (section: string) => void
}

function LeftNavBarComponent(props: LeftNavBarComponentProps) {
  const { activeSection, userImage, onLogoClick, onSectionChange } = props

  return (
    <div className="w-[72px] bg-[#f3f3ee] border-r border-[#E1E5E9] flex flex-col items-center h-full relative">
      {/* Logo Component - Added as requested */}
      <div className="pt-6 pb-2">
        <button
          onClick={onLogoClick}
          className="w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Zap className="w-5 h-5 text-white shrink-0" fill="currentColor" />
        </button>
      </div>

      {/* Navigation Icons - Only the ones circled in red */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={() => onSectionChange("home")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "home" ? "bg-[#10B981] text-white" : "text-[#64748B] hover:bg-[#E2E8F0]"
          )}
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSectionChange("messages")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border-2",
            activeSection === "messages"
              ? "bg-[#10B981] text-white border-[#10B981]"
              : "text-[#64748B] border-transparent hover:bg-[#E2E8F0]"
          )}
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2} />
        </button>
        <button
          onClick={() => onSectionChange("explore")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "explore" ? "bg-[#10B981] text-white" : "text-[#64748B] hover:bg-[#E2E8F0]"
          )}
        >
          <Compass className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSectionChange("files")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "files" ? "bg-[#10B981] text-white" : "text-[#64748B] hover:bg-[#E2E8F0]"
          )}
        >
          <Folder className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSectionChange("gallery")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "gallery" ? "bg-[#10B981] text-white" : "text-[#64748B] hover:bg-[#E2E8F0]"
          )}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Star Icon and Profile Picture at Bottom - Left bottom corner */}
      <div className="flex flex-col gap-2 items-center mt-auto pb-4">
        {/* Star Icon */}
        <button
          onClick={() => onSectionChange("favorites")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0",
            activeSection === "favorites"
              ? "bg-[#10B981] text-white"
              : "text-[#64748B] hover:bg-[#E2E8F0]"
          )}
        >
          <Star className="w-5 h-5" />
        </button>
        {/* Profile Picture */}
        <button
          onClick={onLogoClick}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#10B981] cursor-pointer hover:border-[#059669] transition-colors flex-shrink-0"
        >
          {userImage ? (
            <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

const LeftNavBar = memo(LeftNavBarComponent)

LeftNavBar.displayName = "LeftNavBar"

// Conversation List Item - Figma Design
function ConversationItemComponent(props: ConversationItemProps) {
  const { user, isSelected, onClick, currentUserId } = props

  const lastMessage = user.id === 'ai-assistant'
    ? "Always here to help"
    : (user.lastMessage || "No messages yet")

  const timeAgo = useMemo(() => {
    if (user.id === 'ai-assistant' || !user.lastMessageTime) return ""
    const now = new Date()
    const msgTime = new Date(user.lastMessageTime)
    const diffMs = now.getTime() - msgTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return msgTime.toLocaleDateString()
  }, [user.lastMessageTime, user.id])

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all relative group rounded-lg mx-2 my-1",
        isSelected
          ? "bg-[#E8F5E9] border-l-4 border-[#10B981]"
          : "hover:bg-[#F5F5F5]"
      )}
    >
      {/* Profile Picture */}
      <div className="relative flex-shrink-0">
        {user.id === 'ai-assistant' ? (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
        ) : user.image ? (
          <img
            src={user.image}
            alt={user.name!}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E2E8F0]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#E2E8F0]">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        {/* Online Indicator */}
        {(user.online || user.id === 'ai-assistant') && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-white"></div>
        )}
        {/* Unread Badge */}
        {isSelected && user.unreadCount && user.unreadCount > 0 && (
          <div className="absolute -top-1 -left-1 bg-[#10B981] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            Unread
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="font-semibold text-[14px] text-[#111827] truncate">
            {user.name}
          </p>
          <span className="text-[11px] text-[#64748B] ml-2 whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#64748B] truncate flex-1">
            {lastMessage}
          </p>
          {timeAgo && user.lastMessageTime && (
            <div className="flex items-center gap-1.5 ml-2">
              <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ConversationItem = memo(ConversationItemComponent)
ConversationItem.displayName = "ConversationItem"

// Message Bubble - Figma Design
function MessageBubbleComponent(props: MessageBubbleProps) {
  const { message, isMe, userImage } = props
  const time = useMemo(() =>
    new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [message.createdAt]
  )

  return (
    <div className={cn("flex gap-2 mb-2", isMe ? "justify-end" : "justify-start")}>
      {!isMe && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ring-1 ring-[#E2E8F0]">
          {userImage ? (
            <img src={userImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#E2E8F0] flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[#64748B]" />
            </div>
          )}
        </div>
      )}
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2.5 transition-all",
        isMe
          ? "bg-[#10B981] text-white rounded-br-sm"
          : "bg-white text-[#111827] rounded-bl-sm"
      )}>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <div className={cn(
          "flex items-center gap-1.5 mt-1.5",
          isMe ? "justify-end" : "justify-start"
        )}>
          <span className={cn(
            "text-[11px]",
            isMe ? "text-white/80" : "text-[#64748B]"
          )}>
            {time}
          </span>
          {isMe && (
            <CheckCheck className="w-3.5 h-3.5 text-white/80 ml-0.5" />
          )}
        </div>
      </div>
    </div>
  )
}

const MessageBubble = memo(MessageBubbleComponent)
MessageBubble.displayName = "MessageBubble"

// Typing Indicator
function TypingIndicatorComponent() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white rounded-2xl px-4 py-3 rounded-bl-sm shadow-sm">
        <div className="flex space-x-1.5">
          {[0, 150, 300].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const TypingIndicator = memo(TypingIndicatorComponent)

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
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [aiCoPilotEnabled, setAiCoPilotEnabled] = useState(true)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [activeSection, setActiveSection] = useState("messages")
  const [searchQuery, setSearchQuery] = useState("")
  const [topSearchQuery, setTopSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedUserRef = useRef<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
          unreadCount: 0,
          lastMessage: "Always here to help",
          lastMessageTime: null
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages, isAiTyping])

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

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    inputRef.current?.focus()

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

    if (socket) socket.emit("send_message", newMessage)
  }, [input, selectedUser, session, socket])

  const sortedUsers = useMemo(() => {
    let filtered = [...users]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort users
    return filtered.sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1
      if ((a.unreadCount || 0) !== (b.unreadCount || 0)) {
        return (b.unreadCount || 0) - (a.unreadCount || 0)
      }
      return 0
    })
  }, [users, searchQuery])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B] text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f3ee]">
      {/* Left Navigation Bar - Figma Design */}
      <div className="relative h-full">
        <LeftNavBar
          activeSection={activeSection}
          userImage={session?.user?.image || null}
          onLogoClick={() => setShowUserDropdown(!showUserDropdown)}
          onSectionChange={(section) => {
            setActiveSection(section)
            if (section !== "messages") {
              // Handle navigation to other sections
              console.log(`Navigate to ${section}`)
            }
          }}
        />
        {showUserDropdown && (
          <UserDropdown
            userName={session?.user?.name || null}
            userEmail={session?.user?.email || null}
            userImage={session?.user?.image || null}
            onClose={() => setShowUserDropdown(false)}
            onLogout={() => {
              signOut()
              setShowUserDropdown(false)
            }}
            onGoToDashboard={() => {
              router.push('/dashboard')
              setShowUserDropdown(false)
            }}
          />
        )}
      </div>

      {/* Middle and Right Panels Container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header Bar - Only on middle and right panels */}
        <div className="h-[56px] bg-white border-b border-[#E1E5E9] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-medium text-[#111827]">All Messages</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search"
                value={topSearchQuery}
                onChange={(e) => setTopSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    // Handle Cmd+K shortcut
                    e.preventDefault()
                    document.querySelector('input[placeholder="Search"]')?.focus()
                  }
                }}
                className="pl-9 pr-20 py-1.5 bg-[#F8F9FA] border border-[#E1E5E9] rounded-lg text-sm text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent w-[240px]"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-[11px] text-[#94A3B8]">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#E1E5E9] rounded text-[10px] text-[#64748B]">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-[#E1E5E9] rounded text-[10px] text-[#64748B]">K</kbd>
              </div>
            </div>
            <button
              onClick={() => {
                // Handle notifications
                console.log("Notifications clicked")
              }}
              className="w-8 h-8 rounded-lg bg-[#F8F9FA] hover:bg-[#F0F0F0] flex items-center justify-center transition-colors active:scale-95"
            >
              <Bell className="w-4 h-4 text-[#64748B]" />
            </button>
            <button
              onClick={() => {
                // Handle settings
                console.log("Settings clicked")
              }}
              className="w-8 h-8 rounded-lg bg-[#F8F9FA] hover:bg-[#F0F0F0] flex items-center justify-center transition-colors active:scale-95"
            >
              <Settings className="w-4 h-4 text-[#64748B]" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 hover:bg-[#F5F5F5] rounded-lg px-2 py-1.5 transition-colors"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
                    {session?.user?.name?.[0] || "U"}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Conversation List - Figma Design */}
          <div className="w-[360px] bg-white border-r border-[#E1E5E9] flex flex-col relative">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E1E5E9] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">All Messages</h2>
              <button
                onClick={() => {
                  // Handle new message
                  console.log("New message clicked")
                  // You can add logic to open a new message dialog
                }}
                className="bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors active:scale-95"
              >
                <span className="text-lg">+</span>
                New Message
              </button>
            </div>

            {/* Search Bar with Filter */}
            <div className="px-5 py-3 border-b border-[#E1E5E9]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search in message"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-[#E1E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
                <button
                  onClick={() => {
                    // Handle filter
                    console.log("Filter clicked")
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-[#F0F0F0] rounded p-1 transition-colors active:scale-95"
                >
                  <Filter className="w-4 h-4 text-[#64748B]" />
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {sortedUsers.map((user) => (
                <ConversationItem
                  key={user.id}
                  user={user}
                  isSelected={selectedUser?.id === user.id}
                  onClick={() => setSelectedUser(user)}
                  currentUserId={session?.user?.id}
                />
              ))}
            </div>
          </div>

          {/* Main Chat Area - Figma Design */}
          <div className="flex-1 flex flex-col bg-[#f3f3ee] relative min-h-0">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 bg-white border-b border-[#E1E5E9] flex items-center justify-between rounded-t-lg">
                  <div className="flex items-center gap-3">
                    {selectedUser.id === 'ai-assistant' ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white">
                        <Bot className="w-5 h-5" />
                      </div>
                    ) : selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name!}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E2E8F0]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#E2E8F0]">
                        {selectedUser.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-[15px] text-[#111827]">
                        {selectedUser.name}
                      </h3>
                      <p className={cn(
                        "text-[12px] flex items-center gap-1.5",
                        selectedUser.online ? "text-[#10B981]" : "text-[#64748B]"
                      )}>
                        {selectedUser.online ? (
                          <>
                            <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
                            <span>Online</span>
                          </>
                        ) : (
                          <span>Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Handle search in chat
                        console.log("Search in chat clicked")
                      }}
                      className="w-9 h-9 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                    >
                      <Search className="w-4 h-4 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => {
                        // Handle phone call
                        console.log("Phone call clicked")
                      }}
                      className="w-9 h-9 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                    >
                      <Phone className="w-4 h-4 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => {
                        // Handle video call
                        console.log("Video call clicked")
                      }}
                      className="w-9 h-9 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                    >
                      <Video className="w-4 h-4 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95",
                        showContactInfo ? "bg-[#F5F5F5]" : "hover:bg-[#F5F5F5]"
                      )}
                    >
                      <MoreVertical className="w-4 h-4 text-[#64748B]" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 bg-[#f3f3ee] min-h-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-[#64748B] text-sm">Loading messages...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Today Separator */}
                      {messages.length > 0 && (
                        <div className="text-center my-6">
                          <span className="text-[12px] text-[#64748B] bg-white px-3 py-1 rounded-full">
                            Today
                          </span>
                        </div>
                      )}

                      {messages.map((msg) => {
                        const isMe = msg.senderId === session?.user?.id

                        if (msg.type === 'poll' && msg.metadata) {
                          try {
                            const pollData = JSON.parse(msg.metadata)
                            return (
                              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                <PollMessage
                                  messageId={msg.id}
                                  question={pollData.question}
                                  options={pollData.options}
                                  currentUserId={session?.user?.id || ''}
                                />
                              </div>
                            )
                          } catch (e) {
                            // Fallback
                          }
                        }

                        return (
                          <div key={msg.id}>
                            <MessageBubble
                              message={msg}
                              isMe={isMe}
                              userImage={selectedUser.image}
                            />
                            {!isMe && (
                              <div className="ml-10 mt-1">
                                <MessageReactions
                                  messageId={msg.id}
                                  currentUserId={session?.user?.id || ''}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {isAiTyping && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#E1E5E9]">
                  {showPollCreator && selectedUser && selectedUser.id !== 'ai-assistant' && (
                    <div className="mb-3">
                      <CreatePoll
                        onSend={async (question, options) => {
                          const pollMessage: Message = {
                            id: `poll-${Date.now()}`,
                            content: question,
                            senderId: session?.user?.id || '',
                            receiverId: selectedUser.id,
                            createdAt: new Date().toISOString(),
                            type: 'poll',
                            metadata: JSON.stringify({ question, options })
                          }
                          setMessages(prev => [...prev, pollMessage])
                          setShowPollCreator(false)
                          if (socket) socket.emit("send_message", pollMessage)
                        }}
                        onCancel={() => setShowPollCreator(false)}
                      />
                    </div>
                  )}

                  {aiCoPilotEnabled && selectedUser && (
                    <AICoPilot
                      input={input}
                      conversationHistory={messages.map(m => m.content)}
                      onSelectSuggestion={(suggestion) => {
                        setInput(suggestion)
                        inputRef.current?.focus()
                      }}
                      enabled={selectedUser.id !== 'ai-assistant'}
                    />
                  )}

                  <form
                    className="flex items-center w-full mt-auto mb-4"
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                  >
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        className="w-full bg-white border border-[#E1E5E9] rounded-[24px] pl-5 pr-24 py-3 text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder:text-[#94A3B8] shadow-sm"
                        placeholder="Type any message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            // Handle voice message
                            console.log("Voice message clicked")
                          }}
                          className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Mic className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Handle file attachment
                            console.log("File attachment clicked")
                            // You can add file input logic here
                          }}
                          className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Paperclip className="w-4 h-4 text-[#64748B]" />
                        </button>
                        {selectedUser && selectedUser.id !== 'ai-assistant' && (
                          <button
                            type="button"
                            onClick={() => setShowPollCreator(!showPollCreator)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                              showPollCreator
                                ? "bg-[#10B981] text-white"
                                : "hover:bg-[#F5F5F5] text-[#64748B]"
                            )}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            // Handle emoji picker
                            console.log("Emoji picker clicked")
                          }}
                          className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Smile className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="w-8 h-8 rounded-full bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </form>

                  {selectedUser && selectedUser.id !== 'ai-assistant' && (
                    <div className="flex items-center justify-center mt-2">
                      <button
                        onClick={() => setAiCoPilotEnabled(!aiCoPilotEnabled)}
                        className={cn(
                          "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-all font-medium",
                          aiCoPilotEnabled
                            ? "bg-[#EDE9FE] text-[#8B5CF6]"
                            : "bg-[#F5F5F5] text-[#64748B] hover:bg-[#E5E5E5]"
                        )}
                      >
                        <Sparkles className={cn("w-3 h-3", aiCoPilotEnabled && "animate-pulse")} />
                        <span>AI Co-pilot {aiCoPilotEnabled ? "ON" : "OFF"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
                <div className="w-24 h-24 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center mb-5">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#111827] mb-2">
                  Welcome to Chat App
                </h3>
                <p className="max-w-sm text-center text-sm text-[#64748B]">
                  Select a user from the sidebar to start a conversation or chat with our AI assistant!
                </p>
              </div>
            )}

            {/* Contact Info Panel - Figma Design */}
            {showContactInfo && selectedUser && (
              <div className="absolute right-0 top-0 bottom-0 w-[360px] bg-white border-l border-[#E1E5E9] shadow-2xl z-10">
                <div className="p-6 border-b border-[#E1E5E9] flex items-center justify-between">
                  <h3 className="font-semibold text-[15px] text-[#111827]">Contact Info</h3>
                  <button
                    onClick={() => setShowContactInfo(false)}
                    className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors"
                  >
                    <span className="text-[#64748B] text-xl">×</span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    {selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name!}
                        className="w-20 h-20 rounded-full object-cover mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#94A3B8] to-[#64748B] flex items-center justify-center text-white text-2xl font-bold mb-3">
                        {selectedUser.name?.[0] || "U"}
                      </div>
                    )}
                    <h4 className="font-semibold text-[16px] text-[#111827] mb-1">
                      {selectedUser.name}
                    </h4>
                    <p className="text-[13px] text-[#64748B]">
                      {selectedUser.email || "No email"}
                    </p>
                  </div>
                  <div className="flex gap-3 mb-6">
                    <button className="flex-1 bg-[#F8F9FA] hover:bg-[#E5E5E5] py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Phone className="w-4 h-4 text-[#64748B]" />
                      <span className="text-sm font-medium text-[#111827]">Audio</span>
                    </button>
                    <button className="flex-1 bg-[#F8F9FA] hover:bg-[#E5E5E5] py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Video className="w-4 h-4 text-[#64748B]" />
                      <span className="text-sm font-medium text-[#111827]">Video</span>
                    </button>
                  </div>
                  <div className="flex gap-1 border-b border-[#E1E5E9] mb-4">
                    <button className="px-4 py-2 text-sm font-medium text-[#111827] border-b-2 border-[#10B981]">
                      Media
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#111827]">
                      Link
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#111827]">
                      Docs
                    </button>
                  </div>
                  <div className="text-center text-sm text-[#64748B] py-8">
                    No media shared yet
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
