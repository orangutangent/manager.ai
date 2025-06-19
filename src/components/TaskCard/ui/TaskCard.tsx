import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format, isBefore } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ru } from "date-fns/locale";
import { Task } from "@prisma/client";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ClockIcon,
  ListBulletIcon,
  PlayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

type TaskWithPending = Task & { isPending?: boolean };

export interface TaskCardProps {
  task: TaskWithPending;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, nextStatus: Task["status"]) => void;
}

const priorityColors = {
  LOW: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HIGH: "bg-red-100 text-red-700 border-red-200",
};

const statusColors = {
  TODO: "bg-gray-100 text-gray-700 border-gray-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE: "bg-green-100 text-green-700 border-green-200",
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onChangeStatus,
}: TaskCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  if (task.isPending) {
    return (
      <div className="bg-gray-100 rounded-2xl p-6 animate-pulse opacity-70 min-h-[120px]">
        <div className="h-5 w-1/2 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-1/4 bg-gray-200 rounded" />
      </div>
    );
  }
  const isOverdue =
    !!task.dueTime &&
    isBefore(new Date(task.dueTime), new Date()) &&
    task.status !== "DONE";

  let nextStatus: Task["status"];
  let statusBtn: {
    color: string;
    icon: React.ReactNode;
    text: string;
    title: string;
  } = { color: "", icon: null, text: "", title: "" };
  if (task.status === "TODO") {
    nextStatus = "IN_PROGRESS";
    statusBtn = {
      color:
        "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200",
      icon: <PlayIcon className="w-4 h-4" />,
      text: "Start",
      title: "Move to In Progress",
    };
  } else if (task.status === "IN_PROGRESS") {
    nextStatus = "DONE";
    statusBtn = {
      color:
        "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200",
      icon: <CheckCircleIcon className="w-4 h-4" />,
      text: "Complete",
      title: "Mark as Done",
    };
  } else {
    nextStatus = "TODO";
    statusBtn = {
      color:
        "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200",
      icon: <ArrowPathIcon className="w-4 h-4" />,
      text: "Reopen",
      title: "Reopen Task",
    };
  }

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
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50">
            {task.status === "DONE" ? (
              <CheckCircleIcon className="w-7 h-7 text-green-500" />
            ) : (
              <ListBulletIcon className="w-7 h-7 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
              {task.title}
            </h3>
            <p className="text-gray-600 mb-2 line-clamp-2">
              {task.description || ""}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-1">
              <span>
                {format(task.createdAt, "d MMMM yyyy", { locale: ru })}
              </span>
              {task.dueTime && (
                <>
                  <span>•</span>
                  <span
                    className={`flex items-center gap-1 ${
                      isOverdue ? "text-red-500" : ""
                    }`}
                  >
                    <ClockIcon className="h-4 w-4" />
                    {formatInTimeZone(task.dueTime, "UTC", "d MMMM HH:mm", {
                      locale: ru,
                    })}
                  </span>
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
                onEdit(task);
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
                onDelete(task);
              }}
              className="p-1 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
              priorityColors[task.priority]
            }`}
          >
            <span
              className="w-2 h-2 rounded-full inline-block mr-1"
              style={{
                background:
                  task.priority === "LOW"
                    ? "#22c55e"
                    : task.priority === "MEDIUM"
                    ? "#eab308"
                    : "#ef4444",
              }}
            />
            {task.priority === "LOW"
              ? "Low"
              : task.priority === "MEDIUM"
              ? "Medium"
              : "High"}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
              statusColors[task.status]
            }`}
          >
            {task.status === "TODO"
              ? "To Do"
              : task.status === "IN_PROGRESS"
              ? "In Progress"
              : "Done"}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            Difficulty: {task.difficulty}
          </span>
          {task.categories &&
            task.categories.length > 0 &&
            task.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200"
              >
                {cat}
              </span>
            ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-400">
            {format(task.createdAt, "d MMMM yyyy", { locale: ru })}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(task, nextStatus);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors duration-150 text-xs ${statusBtn.color}`}
            title={statusBtn.title}
            style={{ minWidth: 0 }}
          >
            {statusBtn.icon}
            <span>{statusBtn.text}</span>
          </Button>
        </div>
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
                        {format(new Date(task.dueTime), "d MMMM HH:mm", {
                          locale: ru,
                        })}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>
                        Created:{" "}
                        {format(task.createdAt, "d MMMM yyyy 'at' HH:mm", {
                          locale: ru,
                        })}
                      </span>
                      {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <span>
                          Updated:{" "}
                          {format(task.updatedAt, "d MMMM yyyy 'at' HH:mm", {
                            locale: ru,
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
