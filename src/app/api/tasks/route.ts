import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, isNull, and, asc } from "drizzle-orm";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(500),
  description: z.string().max(5000).optional().nullable(),
  category: z.enum(["work", "personal"]),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  deadline: z.string().datetime().optional().nullable(),
});

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  category: z.enum(["work", "personal"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  deadline: z.string().datetime().optional().nullable(),
});

const deleteTaskSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(tasks)
    .where(isNull(tasks.deletedAt))
    .orderBy(asc(tasks.position), asc(tasks.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [task] = await db
    .insert(tasks)
    .values({
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
      priority: parsed.data.priority,
      status: parsed.data.status || "todo",
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    })
    .returning();

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id, ...updates } = parsed.data;

  const values: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.title !== undefined) values.title = updates.title;
  if (updates.description !== undefined) values.description = updates.description;
  if (updates.category !== undefined) values.category = updates.category;
  if (updates.priority !== undefined) values.priority = updates.priority;
  if (updates.deadline !== undefined)
    values.deadline = updates.deadline ? new Date(updates.deadline) : null;

  if (updates.status !== undefined) {
    values.status = updates.status;
    if (updates.status === "done") {
      values.completedAt = new Date();
    } else {
      values.completedAt = null;
    }
  }

  const [task] = await db
    .update(tasks)
    .set(values)
    .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
    .returning();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = deleteTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [task] = await db
    .update(tasks)
    .set({ deletedAt: new Date() })
    .where(and(eq(tasks.id, parsed.data.id), isNull(tasks.deletedAt)))
    .returning();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
