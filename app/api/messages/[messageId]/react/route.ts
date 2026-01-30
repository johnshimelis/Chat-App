import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;
  const { emoji } = await request.json();

  try {
    // Check if user already reacted with this emoji
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji
        }
      }
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id
        }
      });
    } else {
      // Add reaction
      await prisma.reaction.create({
        data: {
          emoji,
          messageId,
          userId: session.user.id
        }
      });
    }

    // Get all reactions for this message
    const reactions = await prisma.reaction.findMany({
      where: { messageId },
      select: {
        emoji: true,
        userId: true
      }
    });

    // Group by emoji and count
    const reactionMap = new Map<string, { count: number; userReacted: boolean }>();
    reactions.forEach(reaction => {
      const key = reaction.emoji;
      if (!reactionMap.has(key)) {
        reactionMap.set(key, { count: 0, userReacted: false });
      }
      const data = reactionMap.get(key)!;
      data.count++;
      if (reaction.userId === session.user.id) {
        data.userReacted = true;
      }
    });

    const formattedReactions = Array.from(reactionMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userReacted: data.userReacted
    }));

    return NextResponse.json({ reactions: formattedReactions });
  } catch (error) {
    console.error("Reaction error:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}
