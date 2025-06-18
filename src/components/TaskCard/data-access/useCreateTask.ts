import useSWRMutation from "swr/mutation";
import { useTasks } from "./taskApi";

export function useCreateTask() {
  const { mutate } = useTasks();
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/tasks",
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    {
      onSuccess: () => mutate(),
    }
  );
  return { createTask: trigger, isCreating: isMutating, error };
}
