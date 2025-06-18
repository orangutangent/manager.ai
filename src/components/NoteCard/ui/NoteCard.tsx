import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Note } from "@prisma/client";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const wordCount = note.content?.split(/\s+/).length || 0;
  const charCount = note.content?.length || 0;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-100"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {note.title}
            </h3>
            {Array.isArray(note.categories) && note.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-2">
                {note.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailModalOpen(true)}
              className="p-1 hover:bg-blue-50"
              title="Details"
            >
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              className="p-1 hover:bg-gray-50"
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note)}
              className="p-1 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {note.content || "No content"}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              {format(note.createdAt, "d MMMM yyyy", { locale: enUS })}
            </span>
            {note.content && (
              <>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
              </>
            )}
          </div>
          {note.content && note.content.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailModalOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Read more
            </Button>
          )}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsDetailModalOpen(false)}
        >
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 mb-4 flex items-center gap-2"
                  >
                    <FileText className="h-6 w-6 text-blue-500" />
                    {note.title}
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {note.content || "No content"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>
                        Created:{" "}
                        {format(note.createdAt, "d MMMM yyyy 'at' HH:mm", {
                          locale: enUS,
                        })}
                      </span>
                      {note.updatedAt && note.updatedAt !== note.createdAt && (
                        <span>
                          Updated:{" "}
                          {format(note.updatedAt, "d MMMM yyyy 'at' HH:mm", {
                            locale: enUS,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>{charCount} chars</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailModalOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        onEdit(note);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
