import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    try {
        // 1. Get all users except current user
        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUserId }
            },
            select: {
                id: true,
                name: true,
                image: true,
                email: true
            }
        });

        // 2. Get unread message counts for the current user (where receiver = current, isRead = false)
        // Group by senderId
        const unreadCounts = await prisma.message.groupBy({
            by: ['senderId'],
            where: {
                receiverId: currentUserId,
                isRead: false
            },
            _count: {
                id: true
            }
        });

        // Map counts to users
        // unreadCounts = [{ senderId: 'abc', _count: { id: 5 } }]
        const countMap = new Map<string, number>();
        unreadCounts.forEach(item => {
            countMap.set(item.senderId, item._count.id);
        });

        // Get last message for each conversation
        const lastMessages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: { in: users.map(u => u.id) } },
                    { senderId: { in: users.map(u => u.id) }, receiverId: currentUserId }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                content: true,
                senderId: true,
                receiverId: true,
                createdAt: true
            }
        });

        // Create a map of last messages by conversation partner
        const lastMessageMap = new Map<string, { content: string, createdAt: Date, senderId: string }>();
        lastMessages.forEach(msg => {
            const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
            if (!lastMessageMap.has(partnerId)) {
                lastMessageMap.set(partnerId, {
                    content: msg.content,
                    createdAt: msg.createdAt,
                    senderId: msg.senderId
                });
            }
        });

        const usersWithStats = users.map(user => ({
            ...user,
            unreadCount: countMap.get(user.id) || 0,
            lastMessage: lastMessageMap.get(user.id)?.content || (user.id === 'ai-assistant' ? "Always here to help" : null),
            lastMessageTime: lastMessageMap.get(user.id)?.createdAt || null
        }));

        return NextResponse.json(usersWithStats);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
