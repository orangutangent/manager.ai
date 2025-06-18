import { motion } from "framer-motion";
import { FileText, CheckSquare, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  type: "tasks" | "notes";
  onAdd: () => void;
}

export function EmptyState({ type, onAdd }: EmptyStateProps) {
  const isTasks = type === "tasks";

  const config = {
    tasks: {
      icon: CheckSquare,
      title: "No tasks",
      description: "Create your first task to get started",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    notes: {
      icon: FileText,
      title: "No notes",
      description: "Create your first note to store important information",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  };

  const { icon: Icon, title, description, color, bgColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${bgColor} mb-4`}
      >
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      <Button onClick={onAdd} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" />
        {isTasks ? "Add Task" : "Add Note"}
      </Button>
    </motion.div>
  );
}
