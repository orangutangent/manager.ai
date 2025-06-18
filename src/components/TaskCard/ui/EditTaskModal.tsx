import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Task, Status, Priority } from "@prisma/client";
import { useUpdateTask } from "../data-access/useUpdateTask";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";

interface EditTaskModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

export function EditTaskModal({ open, task, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [status, setStatus] = useState<Status>(Status.TODO);
  const [difficulty, setDifficulty] = useState(1);
  const [dueTime, setDueTime] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const { updateTask, isUpdating } = useUpdateTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setDifficulty(task.difficulty || 1);
      setDueTime(
        task.dueTime ? new Date(task.dueTime).toISOString().slice(0, 16) : ""
      );
      setCategories(task.categories || []);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      await updateTask({
        id: task.id,
        data: {
          title,
          description,
          priority,
          status,
          difficulty,
          dueTime: dueTime ? new Date(dueTime) : null,
          categories,
        },
      });
      toast.success("Task updated");
      onClose();
    } catch {
      toast.error("Error updating task");
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Edit Task
                </Dialog.Title>
                <div className="space-y-4">
                  <Input
                    className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full border rounded px-3 py-2 min-h-[80px] bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Priority</label>
                      <select
                        className="w-full border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring focus:border-blue-400"
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as Priority)
                        }
                      >
                        <option value={Priority.LOW}>Low</option>
                        <option value={Priority.MEDIUM}>Medium</option>
                        <option value={Priority.HIGH}>High</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Status</label>
                      <select
                        className="w-full border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring focus:border-blue-400"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Status)}
                      >
                        <option value={Status.TODO}>To Do</option>
                        <option value={Status.IN_PROGRESS}>In Progress</option>
                        <option value={Status.DONE}>Done</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Difficulty</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Due Time</label>
                      <input
                        type="datetime-local"
                        className="w-full border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring focus:border-blue-400"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">
                      Categories (comma separated)
                    </label>
                    <input
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      placeholder="work, meeting, finance"
                      value={categories.join(", ")}
                      onChange={(e) =>
                        setCategories(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                    <div className="mt-1 flex flex-wrap gap-1">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} loading={isUpdating}>
                    Save
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
