import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Priority, Status, Task } from "@prisma/client";

const AddTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  categories: z.array(z.string()).optional(),
  dueTime: z.coerce.date().optional(),
});

export type AddTaskInput = z.infer<typeof AddTaskSchema>;

export async function addTask(input: AddTaskInput) {
  const validatedInput = AddTaskSchema.parse(input);

  return prisma.task.create({
    data: {
      title: validatedInput.title,
      description: validatedInput.description || "",
      priority: validatedInput.priority,
      status: Status.TODO,
      categories: validatedInput.categories || [],
      dueTime: validatedInput.dueTime,
    },
  });
}

export async function getTasks(): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return tasks;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  });
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await prisma.task.delete({ where: { id } });
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    description?: string;
    status?: Status;
    priority?: Priority;
    difficulty?: number;
    dueTime?: Date | null;
  }>
): Promise<Task> {
  return prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      difficulty: data.difficulty,
      dueTime: data.dueTime,
    },
  });
}
