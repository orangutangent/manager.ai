import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Agent } from "@/lib/agent";
import { addTask } from "@/lib/tools/addTask";
import { addNote } from "@/lib/tools/addNote";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const agent = new Agent({
      groqApiKey: process.env.GROQ_API_KEY || "",
    });

    const classification = await agent.classifyText(title);

    if (classification.confidence < 0.7) {
      return NextResponse.json(
        { error: "Low confidence in classification" },
        { status: 400 }
      );
    }

    // Create a task or note depending on classification
    if (classification.type === "task" || classification.type === "both") {
      const { title: structuredTitle } = await agent.transformTextToStructured(
        title,
        "task"
      );
      const task = await addTask({
        title: structuredTitle,
        description: "",
        priority: "MEDIUM",
        categories: [],
      });

      return NextResponse.json({ task, type: "task" });
    } else if (classification.type === "note") {
      const { title: structuredTitle, content } =
        await agent.transformTextToStructured(title, "note");
      const note = await addNote({
        title: structuredTitle,
        content: content || "",
        categories: [],
      });

      return NextResponse.json({ note, type: "note" });
    }

    return NextResponse.json(
      { error: "Invalid classification type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
