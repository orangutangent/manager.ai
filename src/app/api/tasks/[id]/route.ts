import { NextRequest, NextResponse } from "next/server";
import { deleteTask, getTaskById, updateTask } from "@/lib/tools/addTask";
import { Status, Priority } from "@prisma/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await deleteTask(id);

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Validate update data
    const updateData: {
      title?: string;
      description?: string;
      status?: Status;
      priority?: Priority;
      difficulty?: number;
      dueTime?: Date | string | null;
      categories?: string[];
    } = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (
      body.status !== undefined &&
      Object.values(Status).includes(body.status)
    ) {
      updateData.status = body.status;
    }

    if (
      body.priority !== undefined &&
      Object.values(Priority).includes(body.priority)
    ) {
      updateData.priority = body.priority;
    }

    if (
      body.difficulty !== undefined &&
      typeof body.difficulty === "number" &&
      body.difficulty >= 1 &&
      body.difficulty <= 5
    ) {
      updateData.difficulty = body.difficulty;
    }

    if (body.dueTime !== undefined) {
      updateData.dueTime = body.dueTime ? new Date(body.dueTime) : null;
    }

    if (body.categories !== undefined) {
      updateData.categories = body.categories;
    }

    const updatedTask = await updateTask(id, {
      ...updateData,
      dueTime: updateData.dueTime as Date | null | undefined,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
