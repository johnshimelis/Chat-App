import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        const usersWithStats = users.map(user => ({
            ...user,
            unreadCount: countMap.get(user.id) || 0
        }));

        return NextResponse.json(usersWithStats);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
