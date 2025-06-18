import useSWRMutation from "swr/mutation";
import { useNotes } from "./noteApi";
import { Note } from "@prisma/client";

type UpdateNoteArg = { id: string; data: Partial<Note> };

export function useUpdateNote() {
  const { mutate } = useNotes();
  const { trigger, isMutating, error } = useSWRMutation<
    Note,
    Error,
    string,
    UpdateNoteArg
  >(
    "/api/notes/update",
    async (_key, { arg }) => {
      const res = await fetch(`/api/notes/${arg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    {
      onSuccess: () => mutate(),
    }
  );
  return { updateNote: trigger, isUpdating: isMutating, error };
}
