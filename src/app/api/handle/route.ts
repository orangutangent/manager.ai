import { NextRequest, NextResponse } from "next/server";
import { Agent } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Invalid input - text is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const agent = new Agent({
      groqApiKey: process.env.GROQ_API_KEY,
    });

    const result = await agent.processText(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to process text" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tasksCreated: result.tasksCreated || 0,
      notesCreated: result.notesCreated || 0,
      message: `Successfully processed: ${result.tasksCreated || 0} tasks, ${
        result.notesCreated || 0
      } notes created`,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
