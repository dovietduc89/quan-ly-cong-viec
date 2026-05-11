import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { and, isNull, eq, lte, gte } from "drizzle-orm";
import { addDays } from "date-fns";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneDayLater = addDays(now, 1);

  const upcomingTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        isNull(tasks.deletedAt),
        eq(tasks.reminderSent, false),
        lte(tasks.deadline, oneDayLater),
        gte(tasks.deadline, now)
      )
    );

  // TODO: Send emails via Resend when configured
  // For now, mark as reminder sent
  for (const task of upcomingTasks) {
    await db
      .update(tasks)
      .set({ reminderSent: true })
      .where(eq(tasks.id, task.id));
  }

  return NextResponse.json({
    processed: upcomingTasks.length,
    timestamp: now.toISOString(),
  });
}
