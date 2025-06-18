import { NextRequest, NextResponse } from "next/server";
import { deleteNote, getNoteById, updateNote } from "@/lib/tools/addNote";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const note = await getNoteById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await deleteNote(id);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
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
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const note = await getNoteById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Validate update data
    const updateData: {
      title?: string;
      content?: string;
      categories?: string[];
    } = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.content !== undefined) {
      updateData.content = body.content;
    }

    if (body.categories !== undefined) {
      updateData.categories = body.categories;
    }

    const updatedNote = await updateNote(id, updateData);

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}
