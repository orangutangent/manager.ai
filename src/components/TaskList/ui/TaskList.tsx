import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Task, Status } from "@prisma/client";
import { EditTaskModal } from "@/components/TaskCard/ui/EditTaskModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ConfirmDeleteModal } from "@/components/TaskCard/ui/ConfirmDeleteModal";

export interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onDeleteTask: (task: Task) => void;
  onChangeStatus: (task: Task, newStatus: Status) => void;
  isLoading?: boolean;
}

const STATUS_COLUMNS: { key: Status; title: string; color: string }[] = [
  { key: "TODO", title: "To Do", color: "border-gray-300" },
  { key: "IN_PROGRESS", title: "In Progress", color: "border-blue-300" },
  { key: "DONE", title: "Done", color: "border-green-300" },
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
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = tasks.flatMap((t) => t.categories || []);
    return ["All", ...Array.from(new Set(cats)).filter(Boolean)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (categoryFilter === "All") return tasks;
    return tasks.filter(
      (t) => t.categories && t.categories.includes(categoryFilter)
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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
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
        <Button onClick={onAddTask} className="flex items-center gap-2">
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
                className={`rounded-lg border-2 ${col.color} bg-gray-50 p-2 flex flex-col min-h-[200px]`}
              >
                <button
                  className="flex items-center gap-2 mb-2 w-full text-left"
                  onClick={() =>
                    setOpenColumns((prev) => ({
                      ...prev,
                      [col.key]: !prev[col.key],
                    }))
                  }
                >
                  {openColumns[col.key] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-semibold text-gray-700">
                    {col.title}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {grouped[col.key].length}
                  </span>
                </button>
                <Droppable droppableId={col.key}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 transition-all duration-200 ${
                        openColumns[col.key]
                          ? "max-h-[1000px]"
                          : "max-h-0 overflow-hidden"
                      }`}
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
