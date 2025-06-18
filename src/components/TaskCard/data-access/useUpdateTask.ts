import useSWRMutation from "swr/mutation";
import { useTasks } from "./taskApi";
import { Task } from "../model/task";

type UpdateTaskArg = { id: string; data: Partial<Task> };

export function useUpdateTask() {
  const { mutate } = useTasks();
  const { trigger, isMutating, error } = useSWRMutation<
    Task,
    Error,
    string,
    UpdateTaskArg
  >(
    "/api/tasks/update",
    async (_key, { arg }) => {
      const res = await fetch(`/api/tasks/${arg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    {
      onSuccess: () => mutate(),
    }
  );
  return { updateTask: trigger, isUpdating: isMutating, error };
}
