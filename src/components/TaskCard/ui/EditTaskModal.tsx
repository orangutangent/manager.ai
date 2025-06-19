import { Dialog, Transition } from "@headlessui/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Task, Status, Priority } from "@prisma/client";
import { useUpdateTask } from "../data-access/useUpdateTask";
import { toast } from "sonner";
import { Input } from "@/components/ui";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

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
    <Transition appear show={open} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
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
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-10 text-left align-middle shadow-2xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Edit Task
                </Dialog.Title>
                <div className="space-y-4 w-[30rem]">
                  <Input
                    label="Title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    inputSize="md"
                    className="mb-2"
                  />
                  <Input
                    as="textarea"
                    label="Description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    inputSize="md"
                    className="mb-2 min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Priority</label>
                      <Listbox value={priority} onChange={setPriority}>
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900">
                            <span className="block truncate text-gray-900">
                              {priority}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                            </span>
                          </Listbox.Button>
                          <Listbox.Options
                            as="div"
                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200"
                          >
                            {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(
                              (p) => (
                                <Listbox.Option
                                  key={p}
                                  value={p}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-blue-50 text-blue-900"
                                        : "text-gray-900"
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected ? "font-semibold" : ""
                                        }`}
                                      >
                                        {p}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                          <CheckIcon className="h-5 w-5" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              )
                            )}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Status</label>
                      <Listbox value={status} onChange={setStatus}>
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900">
                            <span className="block truncate text-gray-900">
                              {status}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                            </span>
                          </Listbox.Button>
                          <Listbox.Options
                            as="div"
                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200"
                          >
                            {[Status.TODO, Status.IN_PROGRESS, Status.DONE].map(
                              (s) => (
                                <Listbox.Option
                                  key={s}
                                  value={s}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-blue-50 text-blue-900"
                                        : "text-gray-900"
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected ? "font-semibold" : ""
                                        }`}
                                      >
                                        {s}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                          <CheckIcon className="h-5 w-5" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              )
                            )}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Difficulty</label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        label="Difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                        inputSize="md"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1">Due Time</label>
                      <Input
                        type="datetime-local"
                        label="Due Time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        inputSize="md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">
                      Categories (comma separated)
                    </label>
                    <Input
                      label="Categories (comma separated)"
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
                      inputSize="md"
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
