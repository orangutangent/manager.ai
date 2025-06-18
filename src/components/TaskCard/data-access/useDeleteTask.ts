import useSWRMutation from "swr/mutation";
import { useTasks } from "./taskApi";

export function useDeleteTask() {
  const { mutate } = useTasks();
  const { trigger, isMutating, error } = useSWRMutation<
    boolean,
    Error,
    string,
    string
  >(
    "/api/tasks/delete",
    async (_key, { arg: id }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      return true;
    },
    {
      onSuccess: () => mutate(),
    }
  );
  return { deleteTask: trigger, isDeleting: isMutating, error };
}
