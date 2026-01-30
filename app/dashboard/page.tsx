"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MessageSquare } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          </div>
          <p className="text-[#64748B]">Welcome back, {session?.user?.name || "User"}!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-2">Messages</h2>
            <p className="text-3xl font-bold text-[#10B981]">0</p>
            <p className="text-sm text-[#64748B] mt-2">Total conversations</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-2">Credits</h2>
            <p className="text-3xl font-bold text-[#10B981]">20</p>
            <p className="text-sm text-[#64748B] mt-2">Available credits</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-2">Activity</h2>
            <p className="text-3xl font-bold text-[#10B981]">0</p>
            <p className="text-sm text-[#64748B] mt-2">Today's messages</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/")}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
