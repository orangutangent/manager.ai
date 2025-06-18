import useSWRMutation from "swr/mutation";
import { useNotes } from "./noteApi";

export function useCreateNote() {
  const { mutate } = useNotes();
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/notes",
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    {
      onSuccess: () => mutate(),
    }
  );
  return { createNote: trigger, isCreating: isMutating, error };
}
