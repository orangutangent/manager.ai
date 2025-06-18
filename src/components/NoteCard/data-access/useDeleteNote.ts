import useSWRMutation from "swr/mutation";
import { useNotes } from "./noteApi";

export function useDeleteNote() {
  const { mutate } = useNotes();
  const { trigger, isMutating, error } = useSWRMutation<
    boolean,
    Error,
    string,
    string
  >(
    "/api/notes/delete",
    async (_key, { arg: id }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete note");
      return true;
    },
    {
      onSuccess: () => mutate(),
    }
  );
  return { deleteNote: trigger, isDeleting: isMutating, error };
}
