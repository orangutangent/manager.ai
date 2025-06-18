import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Note } from "@prisma/client";
import { EditNoteModal } from "@/components/NoteCard/ui/EditNoteModal";
import { useState, useMemo } from "react";

export interface NoteListProps {
  notes: Note[];
  onAddNote: () => void;
  onDeleteNote: (note: Note) => void;
  isLoading?: boolean;
}

export function NoteList({
  notes,
  onAddNote,
  onDeleteNote,
  isLoading = false,
}: NoteListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = notes.flatMap((n) => n.categories || []);
    return ["All", ...Array.from(new Set(cats)).filter(Boolean)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (categoryFilter === "All") return notes;
    return notes.filter(
      (n) => n.categories && n.categories.includes(categoryFilter)
    );
  }, [notes, categoryFilter]);

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsEditModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedNote(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          <select
            className="ml-4 border rounded px-2 py-1 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={onAddNote} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState type="notes" onAdd={onAddNote} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <NoteCard
                  note={note}
                  onEdit={handleEdit}
                  onDelete={onDeleteNote}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <EditNoteModal
        open={isEditModalOpen}
        note={selectedNote}
        onClose={handleCloseModal}
      />
    </div>
  );
}
