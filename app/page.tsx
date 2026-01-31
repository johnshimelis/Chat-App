"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react"
import io, { Socket } from "socket.io-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, Send, User as UserIcon, Bot, MoreVertical, Sparkles, Zap, BarChart3, Smile, Home, MessageCircle, Circle, Compass, Folder, Image as ImageIcon, Settings, Search, Phone, Video, Paperclip, Mic, Bell, ChevronDown, ArrowLeft, Pencil, Gift, Sun, Check, CheckCheck, Filter, Star, Archive, VolumeX, Upload, X, Trash2, ChevronRight } from "lucide-react"
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
  isArchiving?: boolean
  onClick: () => void
  onArchive?: () => void
  onRightClick: (e: React.MouseEvent, user: User) => void
  currentUserId?: string
}

interface ContextMenuProps {
  user: User
  position: { x: number; y: number }
  onClose: () => void
  onMarkAsUnread: () => void
  onArchive: () => void
  onMute: () => void
  onContactInfo: () => void
  onExportChat: () => void
  onClearChat: () => void
  onDeleteChat: () => void
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
    <div className="absolute left-[20px] top-[56px] w-[240px] bg-white shadow-2xl border border-[#E1E5E9] z-[100] rounded-xl overflow-hidden" style={{ maxHeight: '420px' }}>
      {/* User Info Section */}
      <div className="p-4 border-b border-[#E1E5E9]">
        <div className="flex items-center gap-2 mb-3">
          {userImage ? (
            <img src={userImage} alt={userName || "User"} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
              {userName?.[0] || "U"}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-[13px] text-[#111827]">{userName || "User"}</p>
            <p className="text-[11px] text-[#64748B]">{userEmail || "No email"}</p>
          </div>
        </div>

        {/* Credits Section */}
        <div className="bg-[#F8F9FA] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#111827]">Credits</span>
            <span className="text-[11px] font-semibold text-[#10B981]">20 left</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 mb-1.5">
            <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-0.5">
            <span>5 of 25 used today</span>
            <span className="text-[#10B981]">+25 tomorrow</span>
          </div>
          <p className="text-[10px] text-[#64748B]">Renews in 6h 24m</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-1.5">
        <button
          onClick={onGoToDashboard}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[12px] text-[#111827]">Go back to dashboard</span>
        </button>
        <button
          onClick={() => {
            // Handle rename file
            console.log("Rename file clicked")
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <Pencil className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[12px] text-[#111827]">Rename file</span>
        </button>
        <button
          onClick={() => {
            // Handle win free credits
            console.log("Win free credits clicked")
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <Gift className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[12px] text-[#111827]">Win free credits</span>
        </button>
        <button
          onClick={() => {
            // Handle theme style
            console.log("Theme style clicked")
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <Sun className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[12px] text-[#111827]">Theme Style</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors text-left active:scale-[0.98]"
        >
          <LogOut className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[12px] text-[#111827]">Log out</span>
        </button>
      </div>
    </div>
  )
}

const UserDropdown = memo(UserDropdownComponent)
UserDropdown.displayName = "UserDropdown"

// Context Menu Component
function ContextMenuComponent(props: ContextMenuProps) {
  const { user, position, onClose, onMarkAsUnread, onArchive, onMute, onContactInfo, onExportChat, onClearChat, onDeleteChat } = props
  const menuRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Prevent immediate closure - use a flag
    let canClose = false
    const enableClose = setTimeout(() => {
      canClose = true
    }, 100)

    const handleClickOutside = (e: MouseEvent) => {
      if (!canClose) return
      // Don't close on right-click events
      if (e.button === 2) return

      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Use click instead of mousedown to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('keydown', handleEscape)
    }, 100)

    return () => {
      clearTimeout(enableClose)
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="context-menu fixed bg-white shadow-lg border border-[#E1E5E9] rounded-lg z-[9999] w-[160px] py-0.5"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <button
        onClick={() => {
          onMarkAsUnread()
          onClose()
        }}
        className="w-full flex items-center justify-between px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-3 h-3 text-[#64748B]" />
          <span className="text-[11px] text-[#111827]">Mark as unread</span>
        </div>
        <Check className="w-3 h-3 text-[#64748B]" />
      </button>

      <button
        onClick={() => {
          onArchive()
          onClose()
        }}
        className="w-full flex items-center gap-1.5 px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <Archive className="w-3 h-3 text-[#64748B]" />
        <span className="text-[11px] text-[#111827]">Archive</span>
      </button>

      <button
        onClick={() => {
          onMute()
          onClose()
        }}
        className="w-full flex items-center justify-between px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <div className="flex items-center gap-1.5">
          <VolumeX className="w-3 h-3 text-[#64748B]" />
          <span className="text-[11px] text-[#111827]">Mute</span>
        </div>
        <ChevronRight className="w-3 h-3 text-[#64748B]" />
      </button>

      <button
        onClick={() => {
          onContactInfo()
          onClose()
        }}
        className="w-full flex items-center gap-1.5 px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <UserIcon className="w-3 h-3 text-[#64748B]" />
        <span className="text-[11px] text-[#111827]">Contact info</span>
      </button>

      <button
        onClick={() => {
          onExportChat()
          onClose()
        }}
        className="w-full flex items-center gap-1.5 px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <Upload className="w-3 h-3 text-[#64748B]" />
        <span className="text-[11px] text-[#111827]">Export chat</span>
      </button>

      <button
        onClick={() => {
          onClearChat()
          onClose()
        }}
        className="w-full flex items-center gap-1.5 px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <X className="w-3 h-3 text-[#64748B]" />
        <span className="text-[11px] text-[#111827]">Clear chat</span>
      </button>

      <button
        onClick={() => {
          onDeleteChat()
          onClose()
        }}
        className="w-full flex items-center gap-1.5 px-2.5 py-0.5 hover:bg-[#F5F5F5] transition-colors text-left"
      >
        <Trash2 className="w-3 h-3 text-[#EF4444]" />
        <span className="text-[11px] text-[#EF4444]">Delete chat</span>
      </button>
    </div>
  )
}

const ContextMenu = memo(ContextMenuComponent)
ContextMenu.displayName = "ContextMenu"

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
            activeSection === "home"
              ? "bg-[#E7F7EF] border border-[#10B981] text-[#111827]"
              : "text-[#111827] hover:bg-[#E2E8F0]"
          )}
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSectionChange("messages")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "messages"
              ? "bg-[#E7F7EF] border border-[#10B981] text-[#111827]"
              : "text-[#111827] hover:bg-[#E2E8F0]"
          )}
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2} />
        </button>
        <button
          onClick={() => onSectionChange("explore")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "explore"
              ? "bg-[#E7F7EF] border border-[#10B981] text-[#111827]"
              : "text-[#111827] hover:bg-[#E2E8F0]"
          )}
        >
          <Compass className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSectionChange("files")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "files"
              ? "bg-[#E7F7EF] border border-[#10B981] text-[#111827]"
              : "text-[#111827] hover:bg-[#E2E8F0]"
          )}
        >
          <Folder className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSectionChange("gallery")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
            activeSection === "gallery"
              ? "bg-[#E7F7EF] border border-[#10B981] text-[#111827]"
              : "text-[#111827] hover:bg-[#E2E8F0]"
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
              ? "bg-[#E7F7EF] border border-[#10B981] text-[#111827]"
              : "text-[#111827] hover:bg-[#E2E8F0]"
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
  const { user, isSelected, isArchiving, onClick, onArchive, onRightClick, currentUserId } = props

  const lastMessage = user.id === 'ai-assistant'
    ? (user.lastMessage || "Always here to help")
    : (user.lastMessage || "No messages yet")

  const timeAgo = useMemo(() => {
    if (!user.lastMessageTime) return ""
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
  }, [user.lastMessageTime])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRightClick(e, user)
  }

  const showUnreadTag = (user.unreadCount ?? 0) > 0 && !isSelected

  return (
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "flex items-center gap-3 px-4 py-2 cursor-pointer transition-all relative group rounded-lg mx-2 my-0.5",
        isSelected
          ? "bg-[#F1F5F9] border-l-4 border-[#10B981]"
          : "hover:bg-[#F5F5F5]"
      )}
    >
      {/* Unread Tag Overlay - Left Side */}
      {showUnreadTag && (
        <div className="bg-[#10B981] text-white flex flex-col items-center justify-center gap-1 min-w-[56px] h-[56px] rounded-lg -ml-2 mr-1 animate-in slide-in-from-left-10 duration-200 shadow-sm">
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-[10px] font-semibold leading-none">Unread</span>
        </div>
      )}

      {/* Profile Picture */}
      <div className="relative flex-shrink-0">
        {user.id === 'ai-assistant' ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
        ) : user.image ? (
          <img
            src={user.image}
            alt={user.name!}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E2E8F0]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#E2E8F0]">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        {/* Online Indicator */}
        {(user.online || user.id === 'ai-assistant') && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0 transition-all", isArchiving && "pr-4")}>
        <div className="flex justify-between items-start mb-0.5">
          <p className="font-semibold text-[13.5px] text-[#111827] truncate">
            {user.name}
          </p>
          <span className="text-[10px] text-[#64748B] ml-2 whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[#64748B] truncate flex-1 leading-tight">
            {lastMessage}
          </p>
          {(user.unreadCount ?? 0) > 0 && !isSelected ? (
            <div className="bg-[#EF4444] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full ml-2 shadow-sm animate-in fade-in zoom-in duration-300">
              {user.unreadCount}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-2">
              <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
          )}
        </div>
      </div>

      {/* Archive Button Overlay */}
      {isArchiving && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onArchive?.()
          }}
          className="bg-[#10B981] hover:bg-[#059669] text-white flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg ml-2 animate-in slide-in-from-right-10 duration-200"
        >
          <Archive className="w-5 h-5 text-white" />
          <span className="text-[10px] font-semibold leading-none">Archive</span>
        </button>
      )}
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
    <div className={cn("flex flex-col mb-4", isMe ? "items-end" : "items-start")}>
      <div className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
        {!isMe && (
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ring-1 ring-[#E2E8F0] mt-1">
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
          "max-w-[420px] rounded-2xl px-4 py-2.5 shadow-sm transition-all",
          isMe
            ? "bg-[#E2F9E5] text-[#111827] rounded-tr-sm"
            : "bg-white text-[#111827] rounded-tl-sm"
        )}>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>

      <div className={cn(
        "flex items-center gap-1.5 mt-1",
        isMe ? "justify-end mr-1" : "justify-start ml-10"
      )}>
        <span className="text-[11px] text-[#64748B]">
          {time}
        </span>
        {isMe && (
          <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />
        )}
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
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newMessageSearch, setNewMessageSearch] = useState("")
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [aiCoPilotEnabled, setAiCoPilotEnabled] = useState(true)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [activeSection, setActiveSection] = useState("messages")
  const [searchQuery, setSearchQuery] = useState("")
  const [topSearchQuery, setTopSearchQuery] = useState("")
  const [contextMenu, setContextMenu] = useState<{ user: User; position: { x: number; y: number } } | null>(null)
  const [archivingUserId, setArchivingUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"media" | "link" | "docs">("media")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedUserRef = useRef<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const loadedUsersRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const prevUserId = selectedUserRef.current?.id
    selectedUserRef.current = selectedUser
    // Clear loaded cache when switching to a different user
    if (selectedUser && prevUserId && prevUserId !== selectedUser.id) {
      // Keep messages loaded, just switch the view
    }
  }, [selectedUser])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showUserDropdown) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Don't close if clicking the logo button
      const logoButton = document.querySelector('button[class*="w-8 h-8 rounded-xl bg-[#10B981]"]')
      if (logoButton && (logoButton.contains(target) || logoButton === target)) {
        return
      }
      // Close if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowUserDropdown(false)
      }
    }

    // Use setTimeout to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
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

      socketInstance.on("new_message", (msg: any) => {
        // Format message from socket (may have sender/receiver objects)
        const formattedMsg: Message = {
          id: msg.id,
          content: msg.content,
          senderId: msg.sender?.id || msg.senderId,
          receiverId: msg.receiver?.id || msg.receiverId,
          createdAt: msg.createdAt,
          type: msg.type,
          metadata: msg.metadata
        }

        setMessages((prev) => {
          if (selectedUserRef.current?.id === formattedMsg.senderId) {
            return [...prev, formattedMsg]
          }
          return prev
        })

        if (selectedUserRef.current?.id !== formattedMsg.senderId) {
          // Move user to top (below AI assistant) when receiving new message
          setUsers(prev => {
            const updated = prev.map(u =>
              u.id === formattedMsg.senderId
                ? {
                  ...u,
                  unreadCount: (u.unreadCount || 0) + 1,
                  lastMessage: formattedMsg.content,
                  lastMessageTime: formattedMsg.createdAt
                }
                : u
            )
            // Find the user and move them to top (after AI assistant)
            const userIndex = updated.findIndex(u => u.id === formattedMsg.senderId)
            if (userIndex > 0) { // Only move if not already at top (AI assistant is at index 0)
              const [user] = updated.splice(userIndex, 1)
              // Insert after AI assistant (at index 1)
              updated.splice(1, 0, user)
            }
            return updated
          })
        } else {
          // Update last message even if conversation is open
          setUsers(prev => prev.map(u =>
            u.id === formattedMsg.senderId
              ? {
                ...u,
                lastMessage: formattedMsg.content,
                lastMessageTime: formattedMsg.createdAt
              }
              : u
          ))
        }
      })

      socketInstance.on("message_sent", (msg: any) => {
        // Replace temp message with real one from server
        const formattedMsg: Message = {
          id: msg.id,
          content: msg.content,
          senderId: msg.sender?.id || msg.senderId,
          receiverId: msg.receiver?.id || msg.receiverId,
          createdAt: msg.createdAt,
          type: msg.type,
          metadata: msg.metadata
        }

        setMessages((prev) => {
          // Remove temp message and add real one
          const filtered = prev.filter(m => !m.id.startsWith('temp-'))
          return [...filtered, formattedMsg]
        })

        // Update users list with last message and move to top (below AI assistant)
        setUsers(prev => {
          const updated = prev.map(u =>
            u.id === formattedMsg.receiverId
              ? {
                ...u,
                lastMessage: formattedMsg.content,
                lastMessageTime: formattedMsg.createdAt
              }
              : u
          )
          // Find the user and move them to top (after AI assistant)
          const userIndex = updated.findIndex(u => u.id === formattedMsg.receiverId)
          if (userIndex > 0) { // Only move if not already at top (AI assistant is at index 0)
            const [user] = updated.splice(userIndex, 1)
            // Insert after AI assistant (at index 1)
            updated.splice(1, 0, user)
          }
          return updated
        })

        // Refresh users to get updated unread counts (async to avoid dependency issues)
        setTimeout(() => {
          fetch("/api/users")
            .then(res => res.json())
            .then(data => {
              // Filter out any existing AI assistant from API response to avoid duplicates
              const filteredData = data.filter((user: User) => user.id !== 'ai-assistant')
              // Add AI assistant at the top of the users list
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
              setUsers([aiUser, ...filteredData])
            })
            .catch(err => console.error("Failed to refresh users", err))
        }, 100)
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
        // Filter out any existing AI assistant from API response to avoid duplicates
        const filteredData = data.filter((user: User) => user.id !== 'ai-assistant')
        // Add AI assistant at the top of the users list
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
        setUsers([aiUser, ...filteredData])
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

    const userId = selectedUser.id
    const prevUserId = selectedUserRef.current?.id

    // Only fetch if this is a different user than before
    if (prevUserId === userId && loadedUsersRef.current.has(userId)) {
      // Same user, messages already loaded - just mark as read
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u
      ))
      return
    }

    setIsLoading(true)
    // Mark messages as read and reset unread count
    setUsers(prev => prev.map(u =>
      u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u
    ))

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUser.id}`)
        if (res.ok) {
          const data = await res.json()
          // Convert API response format to Message type (sender/receiver objects to senderId/receiverId)
          const formattedMessages: Message[] = data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender?.id || msg.senderId,
            receiverId: msg.receiver?.id || msg.receiverId,
            createdAt: msg.createdAt,
            type: msg.type,
            metadata: msg.metadata
          }))
          setMessages(formattedMessages)
          // Mark this user's messages as loaded
          loadedUsersRef.current.add(userId)
        }
      } catch (err) {
        console.error("Failed to load messages", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMessages()
  }, [selectedUser?.id, session?.user?.id]) // Only depend on IDs, not full objects

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
          body: JSON.stringify({
            message: newMessage.content,
            userId: session.user.id
          })
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
          const aiResponse: Message = {
            id: Date.now().toString(),
            content: responseContent,
            senderId: "ai-assistant",
            receiverId: session.user.id,
            createdAt: new Date().toISOString()
          }
          // Update users list with last message from AI
          setUsers(prev => prev.map(u =>
            u.id === "ai-assistant"
              ? {
                ...u,
                lastMessage: responseContent,
                lastMessageTime: new Date().toISOString()
              }
              : u
          ))
          return [...filtered, aiResponse]
        })

        // Refresh users to get updated data (async to avoid dependency issues)
        setTimeout(() => {
          fetch("/api/users")
            .then(res => res.json())
            .then(data => {
              // Filter out any existing AI assistant from API response to avoid duplicates
              const filteredData = data.filter((user: User) => user.id !== 'ai-assistant')
              // Add AI assistant at the top of the users list
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
              setUsers([aiUser, ...filteredData])
            })
            .catch(err => console.error("Failed to refresh users", err))
        }, 100)
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

    if (socket) {
      socket.emit("send_message", newMessage)
      // Update users list with last message immediately
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? {
            ...u,
            lastMessage: newMessage.content,
            lastMessageTime: newMessage.createdAt
          }
          : u
      ))
    }
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

    // Sort users - AI assistant always first, then by online status, then by unread count
    return filtered.sort((a, b) => {
      // AI assistant always at the top
      if (a.id === 'ai-assistant') return -1
      if (b.id === 'ai-assistant') return 1

      // Then sort by online status
      if (a.online !== b.online) return a.online ? -1 : 1

      // Then by unread count
      if ((a.unreadCount || 0) !== (b.unreadCount || 0)) {
        return (b.unreadCount || 0) - (a.unreadCount || 0)
      }
      return 0
    })
  }, [users, searchQuery])

  const filteredUsersForNewMessage = useMemo(() => {
    if (!users.length) return []

    // Filter out the current user and AI assistant
    const availableUsers = users.filter(user =>
      user.id !== session?.user?.id && user.id !== 'ai-assistant'
    )

    if (newMessageSearch.trim()) {
      return availableUsers.filter(user =>
        user.name?.toLowerCase().includes(newMessageSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(newMessageSearch.toLowerCase())
      )
    }

    return availableUsers
  }, [users, newMessageSearch, session?.user?.id])

  const handleRightClick = useCallback((e: React.MouseEvent, user: User) => {
    e.preventDefault()
    e.stopPropagation()

    const target = e.currentTarget as HTMLElement
    const itemRect = target.getBoundingClientRect()

    // Use viewport coordinates for fixed positioning
    // Position menu to the right of the item, moved more to the right and bottom
    const position = {
      x: itemRect.right - 120, // Position to the right, moved more to the right
      y: itemRect.top + 8 // Top of the item, moved a bit down
    }

    setContextMenu({
      user,
      position
    })
  }, [])

  const handleMarkAsUnread = useCallback(() => {
    if (contextMenu) {
      setUsers(prev => prev.map(u =>
        u.id === contextMenu.user.id ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } : u
      ))
    }
  }, [contextMenu])

  const handleArchive = useCallback(() => {
    if (contextMenu) {
      setArchivingUserId(contextMenu.user.id)
    }
    console.log("Archive chat:", contextMenu?.user.name)
  }, [contextMenu])

  const handleMute = useCallback(() => {
    console.log("Mute chat:", contextMenu?.user.name)
  }, [contextMenu])

  const handleContactInfo = useCallback(() => {
    console.log("Contact info:", contextMenu?.user.name)
  }, [contextMenu])

  const handleExportChat = useCallback(() => {
    console.log("Export chat:", contextMenu?.user.name)
  }, [contextMenu])

  const handleClearChat = useCallback(() => {
    if (contextMenu && selectedUser?.id === contextMenu.user.id) {
      setMessages([])
    }
    console.log("Clear chat:", contextMenu?.user.name)
  }, [contextMenu, selectedUser])

  const handleDeleteChat = useCallback(() => {
    if (contextMenu && selectedUser?.id === contextMenu.user.id) {
      setSelectedUser(null)
      setMessages([])
    }
    setUsers(prev => prev.filter(u => u.id !== contextMenu?.user.id))
    console.log("Delete chat:", contextMenu?.user.name)
  }, [contextMenu, selectedUser])

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
      <div className="relative h-full overflow-visible">
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
          <div ref={dropdownRef}>
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
          </div>
        )}
      </div>

      {/* Middle and Right Panels Container */}
      <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative">
        {/* Contact Info Panel - Overlay Everything on the right */}
        {showContactInfo && selectedUser && (
          <div className="absolute right-4 top-4 bottom-4 w-[340px] bg-white border border-[#E1E5E9] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 font-sans overflow-hidden rounded-2xl">
            <div className="p-4 flex items-center justify-between flex-shrink-0 border-b border-[#F1F5F9] h-[56px]">
              <h3 className="font-bold text-[16px] text-[#111827]">Contact Info</h3>
              <button
                onClick={() => setShowContactInfo(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors group"
              >
                <X className="w-4 h-4 text-[#64748B] group-hover:text-[#111827]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
              {/* Profile Section */}
              <div className="flex flex-col items-center mb-6 pt-4">
                <div className="relative mb-3">
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name!}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-[#F8FAFC]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-[#F8FAFC]">
                      {selectedUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  {selectedUser.online && (
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#10B981] rounded-full border-[3px] border-white"></div>
                  )}
                </div>
                <h4 className="font-bold text-[17px] text-[#111827] mb-0.5">
                  {selectedUser.name}
                </h4>
                <p className="text-[12px] text-[#64748B]">
                  {selectedUser.email || "No email provided"}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 bg-white border border-[#E2E8F0] hover:bg-[#F8F9FA] py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm text-[#111827] ring-1 ring-inset ring-[#E2E8F0]">
                  <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[13px] font-semibold">Audio</span>
                </button>
                <button className="flex-1 bg-white border border-[#E2E8F0] hover:bg-[#F8F9FA] py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm text-[#111827] ring-1 ring-inset ring-[#E2E8F0]">
                  <Video className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[13px] font-semibold">Video</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#F1F5F9] p-0.5 rounded-xl mb-5">
                {(["media", "link", "docs"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-1 text-[13px] font-semibold rounded-lg transition-all capitalize",
                      activeTab === tab
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#64748B] hover:text-[#111827]"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-5">
                {activeTab === "media" && (
                  <div className="space-y-5">
                    {["May", "April", "March"].map((month) => (
                      <div key={month}>
                        <h5 className="text-[12px] font-bold text-[#64748B] mb-2 px-1">{month}</h5>
                        <div className="grid grid-cols-4 gap-1.5">
                          {Array.from({ length: month === "May" ? 8 : month === "April" ? 4 : 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="aspect-square bg-[#F1F5F9] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition-all group relative"
                            >
                              <img
                                src={`https://picsum.photos/seed/${month}-${i}/150`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "link" && (
                  <div className="space-y-5">
                    {["May"].map((month) => (
                      <div key={month}>
                        <h5 className="text-[12px] font-bold text-[#64748B] mb-2 px-1">{month}</h5>
                        <div className="space-y-1.5">
                          {[
                            { url: "https://basecamp.net/", title: "Basecamp", desc: "Discover thousands of premium UI kits, templates, and design..." },
                            { url: "https://notion.com/", title: "Notion", desc: "A new tool that blends your everyday work apps into one. It's the..." },
                            { url: "https://asana.com/", title: "Asana", desc: "Work anytime, anywhere with Asana. Keep remote and distributed..." },
                            { url: "https://trello.com/", title: "Trello", desc: "Make the impossible, possible with Trello. The ultimate teamwork..." }
                          ].map((link, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-[#E2E8F0] hover:bg-[#F8F9FA] transition-all cursor-pointer group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0 group-hover:opacity-90 shadow-sm overflow-hidden text-white font-bold text-[15px]">
                                {i === 0 && "B"}
                                {i === 1 && "N"}
                                {i === 2 && "A"}
                                {i === 3 && "T"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-[#111827] group-hover:text-[#10B981] transition-colors line-clamp-1">{link.url}</p>
                                <p className="text-[10px] text-[#64748B] mt-0.5 leading-[1.3] line-clamp-1">{link.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "docs" && (
                  <div className="space-y-5">
                    {["May"].map((month) => (
                      <div key={month}>
                        <h5 className="text-[12px] font-bold text-[#64748B] mb-2 px-1">{month}</h5>
                        <div className="space-y-1.5">
                          {[
                            { name: "Document Requirement.pdf", info: "10 pages • 16 MB • pdf", type: "pdf" },
                            { name: "User Flow.pdf", info: "7 pages • 32 MB • pdf", type: "pdf" },
                            { name: "Existing App.fig", info: "213 MB • fig", type: "fig" },
                            { name: "Product Illustrations.ai", info: "72 MB • ai", type: "ai" },
                            { name: "Quotation.pdf", info: "2 pages • 329 KB • pdf", type: "pdf" }
                          ].map((doc, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-[#E2E8F0] hover:bg-[#F8F9FA] transition-all cursor-pointer group"
                            >
                              <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white border border-transparent group-hover:border-[#E2E8F0] shadow-sm",
                                doc.type === "pdf" ? "bg-[#FFF1F2]" : doc.type === "fig" ? "bg-[#F5F3FF]" : "bg-[#FFF7ED]"
                              )}>
                                {doc.type === "pdf" && <Folder className="w-5 h-5 text-[#EF4444]" />}
                                {doc.type === "fig" && <Folder className="w-5 h-5 text-[#8B5CF6]" />}
                                {doc.type === "ai" && <Folder className="w-5 h-5 text-[#F97316]" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-[#111827] truncate group-hover:text-[#10B981] transition-colors">{doc.name}</p>
                                <p className="text-[10px] text-[#94A3B8] mt-0.5 font-medium">{doc.info}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Top Header Bar - Only on middle and right panels */}
        <div className="h-[56px] bg-white border-b border-[#E1E5E9] flex items-center justify-between px-4 rounded-2xl mx-4 mt-4 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-1 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-medium text-[#111827]">Message</span>
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
                    const searchInput = document.querySelector('input[placeholder="Search"]') as HTMLInputElement
                    searchInput?.focus()
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

        <div className="flex flex-1 overflow-hidden bg-[#f3f3ee] p-4 gap-0.5 min-h-0" style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Left Panel - Conversation List - Figma Design */}
          <div className="w-[360px] bg-white rounded-2xl flex flex-col relative overflow-hidden shadow-sm flex-shrink-0" style={{ overflowX: 'visible', alignSelf: 'stretch' }}>
            {/* Header */}
            <div className="h-[56px] px-5 py-4 border-b border-[#E1E5E9] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">All Messages</h2>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-95"
              >
                <span className="text-sm leading-none">+</span>
                New Message
              </button>
            </div>

            {/* Search Bar with Filter */}
            <div className="px-5 py-3 border-b border-[#E1E5E9]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search in message"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-10 pr-5 bg-[#F8F9FA] border border-[#E1E5E9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    // Handle filter
                    console.log("Filter clicked")
                  }}
                  className="w-8 h-8 bg-[#F8F9FA] hover:bg-[#F0F0F0] rounded-lg flex items-center justify-center transition-colors active:scale-95 border border-[#E1E5E9]"
                >
                  <Filter className="w-4 h-4 text-[#64748B]" />
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="conversation-list-container flex-1 overflow-y-auto relative">
              {sortedUsers.map((user) => (
                <ConversationItem
                  key={user.id}
                  user={user}
                  isSelected={selectedUser?.id === user.id}
                  isArchiving={archivingUserId === user.id}
                  onClick={() => {
                    setSelectedUser(user)
                    setArchivingUserId(null)
                  }}
                  onArchive={() => {
                    setUsers(prev => prev.filter(u => u.id !== user.id))
                    setArchivingUserId(null)
                    if (selectedUser?.id === user.id) setSelectedUser(null)
                  }}
                  onRightClick={handleRightClick}
                  currentUserId={session?.user?.id}
                />
              ))}

              {/* Context Menu */}
              {contextMenu && (
                <ContextMenu
                  user={contextMenu.user}
                  position={contextMenu.position}
                  onClose={() => setContextMenu(null)}
                  onMarkAsUnread={handleMarkAsUnread}
                  onArchive={handleArchive}
                  onMute={handleMute}
                  onContactInfo={handleContactInfo}
                  onExportChat={handleExportChat}
                  onClearChat={handleClearChat}
                  onDeleteChat={handleDeleteChat}
                />
              )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
              <div className="absolute top-16 right-0 w-[280px] h-[360px] bg-white rounded-lg shadow-2xl border border-[#E1E5E9] z-50 flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="px-3 py-2 border-b border-[#E1E5E9] flex items-center justify-between flex-shrink-0">
                  <h2 className="text-xs font-semibold text-[#111827]">New Message</h2>
                  <button
                    onClick={() => {
                      setShowNewMessageModal(false)
                      setNewMessageSearch("")
                    }}
                    className="w-5 h-5 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors"
                  >
                    <span className="text-sm text-[#64748B] leading-none">×</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="px-3 py-1.5 border-b border-[#E1E5E9] flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search name or email"
                      value={newMessageSearch}
                      onChange={(e) => setNewMessageSearch(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 bg-[#F8F9FA] border border-[#E1E5E9] rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {filteredUsersForNewMessage.length > 0 ? (
                    filteredUsersForNewMessage.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user)
                          setShowNewMessageModal(false)
                          setNewMessageSearch("")
                        }}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                      >
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name!}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E2E8F0]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-[10px] font-semibold ring-1 ring-[#E2E8F0]">
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          {user.online && (
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#10B981] rounded-full border border-white"></div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[11px] text-[#111827] truncate">
                            {user.name}
                          </p>
                          {user.email && (
                            <p className="text-[9px] text-[#64748B] truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-6">
                      <p className="text-[#64748B] text-[10px]">
                        {newMessageSearch.trim() ? "No users found" : "No users available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Area - Figma Design */}
          <div className="flex-1 flex flex-col bg-[#f3f3ee] relative pl-4 min-w-0 min-h-0" style={{ alignSelf: 'stretch' }}>
            {selectedUser ? (
              <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden min-h-0 relative">

                {/* Chat Header */}
                <div className="h-[56px] px-6 py-4 flex items-center justify-between border-b border-[#F1F5F9] shrink-0">
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
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 bg-[#f3f3ee] min-h-0 rounded-2xl mx-4 my-1 mb-2">
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
                <div className="px-4 pb-4 pt-2">
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

                  <form
                    className="w-full"
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                  >
                    <div className="relative w-full rounded-2xl">
                      <input
                        ref={inputRef}
                        className="w-full bg-white border border-[#E1E5E9] rounded-2xl pl-5 pr-32 py-2 text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder:text-[#94A3B8] shadow-sm"
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
                          className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Mic className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Handle emoji picker
                            console.log("Emoji picker clicked")
                          }}
                          className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Smile className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Handle file attachment
                            console.log("File attachment clicked")
                            // You can add file input logic here
                          }}
                          className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Paperclip className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="w-7 h-7 rounded-full bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
