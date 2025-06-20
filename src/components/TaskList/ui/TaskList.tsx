import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Task, Status, Priority } from "@prisma/client";
import { EditTaskModal } from "@/components/TaskCard/ui/EditTaskModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ConfirmDeleteModal } from "@/components/TaskCard/ui/ConfirmDeleteModal";
import { MultiSelect } from "@/components/ui";
import { useTasks } from "@/components/TaskCard/data-access/taskApi";

export interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onDeleteTask: (task: Task) => void;
  onChangeStatus: (task: Task, newStatus: Status) => void;
  isLoading?: boolean;
}

const STATUS_COLUMNS: {
  key: Status;
  title: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "TODO",
    title: "To Do",
    color: "border-gray-200",
    bg: "bg-gradient-to-b from-gray-50 to-blue-50",
    icon: <span className="text-gray-400">📋</span>,
  },
  {
    key: "IN_PROGRESS",
    title: "In Progress",
    color: "border-blue-200",
    bg: "bg-gradient-to-b from-blue-50 to-blue-100",
    icon: <span className="text-blue-400">▶️</span>,
  },
  {
    key: "DONE",
    title: "Done",
    color: "border-green-200",
    bg: "bg-gradient-to-b from-green-50 to-green-100",
    icon: <span className="text-green-400">✅</span>,
  },
];

export function TaskList({
  tasks,
  onAddTask,
  onDeleteTask,
  onChangeStatus,
  isLoading = false,
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openColumns, setOpenColumns] = useState<Record<Status, boolean>>({
    TODO: true,
    IN_PROGRESS: true,
    DONE: true,
  });
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const { mutate } = useTasks();

  const categories = useMemo(() => {
    const cats = tasks.flatMap((t) => t.categories || []);
    return Array.from(new Set(cats)).filter(Boolean);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!categoryFilter.length) return tasks;
    return tasks.filter(
      // (t) =>
      //   t.categories &&
      //   categoryFilter.every((cat) => t.categories.includes(cat))
      (t) => categoryFilter.some((cat) => t.categories?.includes(cat))
    );
  }, [tasks, categoryFilter]);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const grouped = STATUS_COLUMNS.reduce(
    (acc, col) => ({
      ...acc,
      [col.key]: filteredTasks.filter((t) => t.status === col.key),
    }),
    {} as Record<Status, Task[]>
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceCol = result.source.droppableId as Status;
    const destCol = result.destination.droppableId as Status;
    if (sourceCol !== destCol) {
      const task = grouped[sourceCol][result.source.index];
      onChangeStatus(task, destCol);
    }
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
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <MultiSelect
            options={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Filter by categories..."
            className="min-w-[220px]"
          />
        </div>
        <Button
          onClick={() => {
            const tempTask = {
              id: "temp-" + Date.now(),
              title: "Новая задача...",
              description: "",
              status: "TODO" as Status,
              priority: "MEDIUM" as Priority,
              steps: [],
              categories: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              dueTime: null,
              difficulty: 1,
              isPending: true,
            };
            mutate((tasks = []) => [tempTask, ...tasks], false);
            onAddTask();
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
      {filteredTasks.length === 0 ? (
        <EmptyState type="tasks" onAdd={onAddTask} />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((col) => (
              <div
                key={col.key}
                className={`rounded-2xl border ${col.color} ${col.bg} shadow-md p-3 flex flex-col min-h-[300px] max-h-[70vh] transition-all duration-200`}
                style={{ minWidth: 0 }}
              >
                <button
                  className="flex items-center gap-2 mb-3 w-full text-left px-1 py-1 rounded-xl hover:bg-white/40 transition"
                  onClick={() =>
                    setOpenColumns((prev) => ({
                      ...prev,
                      [col.key]: !prev[col.key],
                    }))
                  }
                >
                  {openColumns[col.key] ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-semibold text-base flex items-center gap-2 text-gray-900 px-2 py-1 rounded-lg bg-white/80 border border-gray-200 shadow-sm">
                    {col.icon}
                    {col.title}
                  </span>
                  <span
                    className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                      col.key === "DONE"
                        ? "bg-green-100 text-green-700"
                        : col.key === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {grouped[col.key].length}
                  </span>
                </button>
                <Droppable droppableId={col.key}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 flex-1 overflow-y-auto custom-scrollbar transition-all duration-200 ${
                        openColumns[col.key]
                          ? "max-h-[60vh] min-h-[100px]"
                          : "max-h-0 overflow-hidden"
                      }`}
                      style={{ minWidth: 0 }}
                    >
                      <AnimatePresence>
                        {openColumns[col.key] &&
                          grouped[col.key].map((task, idx) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={idx}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-2"
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={handleEdit}
                                    onDelete={() => {
                                      setDeleteTask(task);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    onChangeStatus={() => {}}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
      <EditTaskModal
        open={isEditModalOpen}
        task={selectedTask}
        onClose={handleCloseModal}
      />
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        taskTitle={deleteTask?.title}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (deleteTask) onDeleteTask(deleteTask);
          setIsDeleteModalOpen(false);
          setDeleteTask(null);
        }}
      />
    </div>
  );
}
