import useSWR from "swr";
import { Task } from "../model/task";

export const useTasks = () => {
  const { data, error, mutate, isLoading } = useSWR<Task[]>(
    "/api/tasks",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    }
  );
  return { tasks: data, error, mutate, isLoading };
};
