import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, CheckCircle2, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format, isBefore } from "date-fns";
import { enUS } from "date-fns/locale";
import { Task } from "@prisma/client";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task) => void;
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onChangeStatus,
}: TaskCardProps) {
  const isOverdue =
    !!task.dueTime &&
    isBefore(new Date(task.dueTime), new Date()) &&
    task.status !== "DONE";
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailModalOpen(true)}
              className="p-1"
              title="Details"
            >
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="p-1"
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task)}
              className="p-1"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {task.description || ""}
        </p>
        {task.categories && task.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {task.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority === "LOW"
              ? "Low"
              : task.priority === "MEDIUM"
              ? "Medium"
              : "High"}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[task.status]
            }`}
          >
            {task.status === "TODO"
              ? "To Do"
              : task.status === "IN_PROGRESS"
              ? "In Progress"
              : "Done"}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Difficulty: {task.difficulty}
          </span>
          {task.dueTime && (
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isOverdue
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-gray-100 text-gray-700"
              }`}
              title={isOverdue ? "Overdue" : "Due Time"}
            >
              <Clock className="h-4 w-4" />
              {format(new Date(task.dueTime), "d MMM HH:mm")}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {format(task.createdAt, "d MMMM yyyy", { locale: enUS })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChangeStatus(task)}
            className="p-1"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </Button>
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
                    <Eye className="h-6 w-6 text-blue-500" />
                    {task.title}
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {task.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    {task.categories && task.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[task.priority]
                      }`}
                    >
                      Priority:{" "}
                      {task.priority === "LOW"
                        ? "Low"
                        : task.priority === "MEDIUM"
                        ? "Medium"
                        : "High"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[task.status]
                      }`}
                    >
                      Status:{" "}
                      {task.status === "TODO"
                        ? "To Do"
                        : task.status === "IN_PROGRESS"
                        ? "In Progress"
                        : "Done"}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Difficulty: {task.difficulty}
                    </span>
                    {task.dueTime && (
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isOverdue
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        title={isOverdue ? "Overdue" : "Due Time"}
                      >
                        <Clock className="h-4 w-4" />
                        {format(new Date(task.dueTime), "d MMM HH:mm")}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>
                        Created:{" "}
                        {format(task.createdAt, "d MMMM yyyy 'at' HH:mm", {
                          locale: enUS,
                        })}
                      </span>
                      {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <span>
                          Updated:{" "}
                          {format(task.updatedAt, "d MMMM yyyy 'at' HH:mm", {
                            locale: enUS,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailModalOpen(false)}
                      className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        onEdit(task);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
