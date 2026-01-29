import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = params;
  const { optionIndex } = await request.json();

  try {
    // Get the poll
    const poll = await prisma.poll.findUnique({
      where: { messageId },
      include: { votes: true }
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user already voted (can update vote)
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        pollId: poll.id,
        userId: session.user.id
      }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { optionIndex }
      });
    } else {
      // Create new vote
      await prisma.pollVote.create({
        data: {
          pollId: poll.id,
          messageId,
          userId: session.user.id,
          optionIndex
        }
      });
    }

    // Get updated vote counts
    const votes = await prisma.pollVote.findMany({
      where: { pollId: poll.id }
    });

    const voteCounts: Record<string, number> = {};
    votes.forEach(vote => {
      voteCounts[vote.optionIndex] = (voteCounts[vote.optionIndex] || 0) + 1;
    });

    return NextResponse.json({ 
      success: true,
      voteCounts,
      userVote: optionIndex
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
