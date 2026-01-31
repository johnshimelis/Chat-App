import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const currentUserId = session.user.id;

    try {
        // Fetch messages between these two users
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            select: {
                id: true,
                content: true,
                isRead: true,
                createdAt: true,
                type: true,
                metadata: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        // Mark messages from otherUser as read
        // We do this asynchronously or blocking, depending on preference. Blocking ensures UI is consistent.
        // Update many
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: currentUserId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
