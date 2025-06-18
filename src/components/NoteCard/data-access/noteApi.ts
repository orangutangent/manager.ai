import { Note } from "@/types";
import useSWR from "swr";

export const useNotes = () => {
  const { data, error, mutate, isLoading } = useSWR<Note[]>(
    "/api/notes",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    }
  );
  return { notes: data, error, mutate, isLoading };
};
