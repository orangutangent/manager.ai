import { Dialog, Transition } from "@headlessui/react";
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
    <Transition appear show={open} as="div">
      <Dialog as="div" className="relative z-50 " onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed  inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full  items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full  transform overflow-hidden rounded-3xl bg-white p-10 text-left align-middle shadow-2xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Edit Note
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
                    label="Content"
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    inputSize="md"
                    className="mb-2 min-h-[80px]"
                  />
                  <div>
                    <label className="block text-xs mb-1 text-gray-700">
                      Categories (comma separated)
                    </label>
                    <Input
                      label="Categories (comma separated)"
                      placeholder="work, ideas, learning"
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
                          className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
