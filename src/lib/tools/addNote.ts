import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Note } from "@prisma/client";

const AddNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export type AddNoteInput = z.infer<typeof AddNoteSchema>;

export async function addNote(input: AddNoteInput) {
  const validatedInput = AddNoteSchema.parse(input);

  return prisma.note.create({
    data: {
      title: validatedInput.title,
      content: validatedInput.content || "",
      categories: validatedInput.categories || [],
    },
  });
}

export async function getNotes(): Promise<Note[]> {
  const notes = await prisma.note.findMany({ orderBy: { createdAt: "desc" } });
  return notes;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const note = await prisma.note.findUnique({ where: { id } });
  return note;
}

export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
}

export async function updateNote(
  id: string,
  data: Partial<AddNoteInput>
): Promise<Note> {
  return prisma.note.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      categories: data.categories,
    },
  });
}
