import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { z } from "zod";

const reorderSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["todo", "in_progress", "done"]),
  orderedIds: z.array(z.string().uuid()),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, status, orderedIds } = parsed.data;

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)));

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(tasks)
      .set({ position: i })
      .where(and(eq(tasks.id, orderedIds[i]), isNull(tasks.deletedAt)));
  }

  return NextResponse.json({ success: true });
}
