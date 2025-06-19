import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Task, Status, Priority } from "@prisma/client";
import { useUpdateTask } from "../data-access/useUpdateTask";
import { toast } from "sonner";
import { Input, CustomSelect } from "@/components/ui";

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
  const [categoryInput, setCategoryInput] = useState("");
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
    <Modal open={open} onClose={onClose} title="Edit Task">
      <div className="space-y-4 p-2 sm:p-4 md:p-8">
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
            <CustomSelect
              options={[
                { value: Priority.LOW, label: "Low" },
                { value: Priority.MEDIUM, label: "Medium" },
                { value: Priority.HIGH, label: "High" },
              ]}
              label="Priority"
              value={priority}
              onChange={(v) => setPriority(v as Priority)}
              placeholder="Priority"
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <CustomSelect
              options={[
                { value: Status.TODO, label: "To Do" },
                { value: Status.IN_PROGRESS, label: "In Progress" },
                { value: Status.DONE, label: "Done" },
              ]}
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as Status)}
              placeholder="Status"
              className="w-full"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
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
          <Input
            label="Categories"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                (e.key === " " || e.key === "Enter") &&
                categoryInput.trim()
              ) {
                e.preventDefault();
                const newTag = categoryInput.trim();
                if (newTag && !categories.includes(newTag)) {
                  setCategories([...categories, newTag]);
                }
                setCategoryInput("");
              } else if (
                e.key === "Backspace" &&
                !categoryInput &&
                categories.length > 0
              ) {
                setCategories(categories.slice(0, -1));
              }
            }}
            placeholder="work meeting finance ..."
            inputSize="md"
            className="w-full"
            autoComplete="off"
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium cursor-pointer hover:bg-blue-200"
                onClick={() =>
                  setCategories(categories.filter((c) => c !== cat))
                }
                title="Удалить тег"
              >
                {cat}
                <span className="ml-1 text-blue-400 hover:text-blue-700">
                  ×
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isUpdating}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
