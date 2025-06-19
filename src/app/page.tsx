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
import { useUpdateTask } from "@/components/TaskCard/data-access/useUpdateTask";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { tasks, isLoading: isTasksLoading, mutate: mutateTasks } = useTasks();
  const { notes, isLoading: isNotesLoading } = useNotes();
  const { deleteTask, isDeleting: isTaskDeleting } = useDeleteTask();
  const { deleteNote, isDeleting: isNoteDeleting } = useDeleteNote();
  const { updateTask } = useUpdateTask();
  const [localTasks, setLocalTasks] = useState<Task[] | undefined>(undefined);

  // Синхронизируем локальные задачи с серверными
  React.useEffect(() => {
    if (tasks) setLocalTasks(tasks);
  }, [tasks]);

  const loading =
    isTasksLoading || isNotesLoading || isTaskDeleting || isNoteDeleting;

  const handleTaskAdded = (tempTask: Task) => {
    setLocalTasks((prev) => [tempTask, ...(prev || [])]);
    setIsModalOpen(false);
  };

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

  // Optimistic update для dnd
  const handleChangeTaskStatus = async (
    task: Task,
    newStatus: Task["status"]
  ) => {
    if (!localTasks) return;
    // Сохраняем старое состояние для отката
    const prevTasks = [...localTasks];
    // Мгновенно меняем статус локально
    setLocalTasks((prev) =>
      prev?.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTask({ id: task.id, data: { status: newStatus } });
      mutateTasks(); // обновить из сети, если надо
      toast.success("Task status updated");
    } catch (error) {
      setLocalTasks(prevTasks); // откат
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
          {/* FAB для добавления (только на md+) */}
          <Button
            variant="fab"
            aria-label="Add task or note"
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex"
          />
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
                tasks={localTasks || []}
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
