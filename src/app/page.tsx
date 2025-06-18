"use client";
import React, { useState } from "react";

import { ModalInput } from "@/components/ModalInput/ui/ModalInput";
import { Tab } from "@headlessui/react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Task } from "@prisma/client";
import { Note } from "@prisma/client";
import { TaskList } from "@/components/TaskList";
import { NoteList } from "@/components/NoteList";
import { toast } from "sonner";
import { useTasks, useDeleteTask } from "@/components/TaskCard";
import { useNotes, useDeleteNote } from "@/components/NoteCard";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { tasks, isLoading: isTasksLoading } = useTasks();
  const { notes, isLoading: isNotesLoading } = useNotes();
  const { deleteTask, isDeleting: isTaskDeleting } = useDeleteTask();
  const { deleteNote, isDeleting: isNoteDeleting } = useDeleteNote();

  const loading =
    isTasksLoading || isNotesLoading || isTaskDeleting || isNoteDeleting;

  const handleTaskAdded = async () => {};

  const handleNoteAdded = async () => {};

  const handleDeleteTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Task deletion error"
      );
    }
  };

  const handleChangeTaskStatus = async (task: Task) => {
    try {
      const newStatus =
        task.status === "TODO"
          ? "IN_PROGRESS"
          : task.status === "IN_PROGRESS"
          ? "DONE"
          : "TODO";

      // You can implement useUpdateTask and call it here
      // For now, using fetch, but better to move to data-access
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task status");
      }

      toast.success("Task status updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Task status update error"
      );
    }
  };

  const handleDeleteNote = async (note: Note) => {
    try {
      await deleteNote(note.id);
      toast.success("Note deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Note deletion error"
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-gray-600">
                AI-powered assistant for managing tasks
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add
          </Button>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm border border-gray-200">
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
                  "ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              Tasks ({tasks?.length || 0})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
                  "ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              Notes ({notes?.length || 0})
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <TaskList
                tasks={tasks || []}
                onAddTask={() => setIsModalOpen(true)}
                onDeleteTask={handleDeleteTask}
                onChangeStatus={handleChangeTaskStatus}
                isLoading={loading}
              />
            </Tab.Panel>
            <Tab.Panel>
              <NoteList
                notes={notes || []}
                onAddNote={() => setIsModalOpen(true)}
                onDeleteNote={handleDeleteNote}
                isLoading={loading}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <ModalInput
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={handleTaskAdded}
        onNoteAdded={handleNoteAdded}
        placeholder="Enter a task or note..."
      />
    </main>
  );
}
