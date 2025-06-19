import { motion } from "framer-motion";
import { Edit2, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Note } from "@prisma/client";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DocumentTextIcon } from "@heroicons/react/24/solid";

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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)" }}
        className="bg-white/90 rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer group"
        onClick={() => setIsDetailModalOpen(true)}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl">
            <DocumentTextIcon className="h-7 w-7 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
              {note.title}
            </h3>
            <p className="text-gray-600 mb-2 line-clamp-3 leading-relaxed">
              {note.content || "No content"}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-1">
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
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1 hover:bg-gray-50"
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note);
              }}
              className="p-1 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        {Array.isArray(note.categories) && note.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
            {note.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <Transition appear show={isDetailModalOpen} as="div">
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsDetailModalOpen(false)}
        >
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
