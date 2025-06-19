import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Note } from "@prisma/client";
import { useUpdateNote } from "../data-access/useUpdateNote";
import { toast } from "sonner";
import { Input } from "@/components/ui";

interface EditNoteModalProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
}

export function EditNoteModal({ open, note, onClose }: EditNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const { updateNote, isUpdating } = useUpdateNote();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setCategories(Array.isArray(note.categories) ? note.categories : []);
    }
  }, [note]);

  const handleSave = async () => {
    if (!note) return;
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      await updateNote({
        id: note.id,
        data: { title, content, categories },
      });
      toast.success("Note updated");
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Error updating note");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Note">
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
          label="Content"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          inputSize="md"
          className="mb-2 min-h-[80px]"
        />
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
            placeholder="work ideas learning ..."
            inputSize="md"
            className="w-full"
            autoComplete="off"
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium cursor-pointer hover:bg-purple-200"
                onClick={() =>
                  setCategories(categories.filter((c) => c !== cat))
                }
                title="Удалить тег"
              >
                {cat}
                <span className="ml-1 text-purple-400 hover:text-purple-700">
                  ×
                </span>
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
          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          loading={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
