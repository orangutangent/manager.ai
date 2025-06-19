import { z } from "zod";
import { addNote } from "./tools/addNote";
import { addTask } from "./tools/addTask";
import { Groq } from "groq-sdk";

const ClassificationSchema = z.object({
  type: z.enum(["task", "note", "both"]),
  confidence: z.number().min(0).max(1),
});

type Classification = z.infer<typeof ClassificationSchema>;

const TaskStructureSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  difficulty: z.number().min(1).max(5).optional(),
});

const NoteStructureSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export interface AgentConfig {
  groqApiKey: string;
  model?: string;
}

export interface ProcessResult {
  success: boolean;
  tasksCreated?: number;
  notesCreated?: number;
  error?: string;
}

export class Agent {
  private groqApiKey: string;
  private model: string;
  private groq: Groq;

  constructor(config: AgentConfig) {
    this.groqApiKey = config.groqApiKey;
    this.model = config.model || "llama-3.1-8b-instant";
    this.groq = new Groq({ apiKey: this.groqApiKey });
  }

  async classifyText(text: string): Promise<Classification> {
    const prompt =
      'You are a text classifier that determines if the input text is a task, a note, or both.\n\nClassification rules:\n- TASK: Any action that needs to be done, including meetings, calls, appointments, reminders, to-dos, assignments, goals.\n- NOTE: Any information, idea, observation, or fact that does not require action.\n- BOTH: Contains both an actionable item and important information.\n\nExamples:\n- "Buy milk" → { "type": "task", "confidence": 0.95 }\n- "Notes from the meeting" → { "type": "note", "confidence": 0.9 }\n- "Prepare report by Friday and keep all requirements" → { "type": "both", "confidence": 0.85 }\n- "Call mom tomorrow" → { "type": "task", "confidence": 0.95 }\n- "Meeting with Nikita at 3pm tomorrow" → { "type": "task", "confidence": 0.95 }\n- "Appointment with doctor on June 20" → { "type": "task", "confidence": 0.95 }\n- "Project ideas" → { "type": "note", "confidence": 0.9 }\n- "Team call at 15:00" → { "type": "task", "confidence": 0.95 }\n- "Встреча с Никитосом завтра в 3" → { "type": "task", "confidence": 0.95 }\n\nRespond with ONLY the JSON object, do NOT use markdown, do NOT wrap your answer in ``` or ```json.\n\nInput: ' +
      text;
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: this.model,
      temperature: 0.9,
      max_completion_tokens: 512,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const content = chatCompletion.choices[0].message.content;
    console.log("Classification content:", content);
    const result = JSON.parse(content || "{}");
    // console.log("Classification result:", result);
    return ClassificationSchema.parse(result);
  }

  async transformTextToStructured(
    text: string,
    type: "note" | "task"
  ): Promise<{
    title: string;
    content?: string;
    priority?: string;
    difficulty?: number;
  }> {
    const notePrompt =
      'Transform the input into a well-structured note. Extract a clear title and organize the content logically.\n\nRules:\n- Title should be concise and descriptive\n- Content should preserve all important information\n- Organize content in a logical structure\n- Keep the original meaning and context\n\nExamples:\n- "Notes from the meeting" → { "title": "Meeting Notes", "content": "Discussed project timeline..." }\n- "Идеи для стартапа" → { "title": "Идеи для стартапа", "content": "1. AI сервис..." }\n\nRespond with ONLY the JSON object, do NOT use markdown, do NOT wrap your answer in ``` or ```json.';
    const taskPrompt =
      'Transform the input into a clear and actionable task. Extract a title and determine priority/difficulty.\n\nRules:\n- Title should be action-oriented and specific\n- Content should include context and details\n- Priority: LOW (routine), MEDIUM (normal), HIGH (urgent/important)\n- Difficulty: 1-5 scale (1=easy, 5=very complex)\n\nExamples:\n- "Buy milk" → { "title": "Buy milk", "content": "", "priority": "LOW", "difficulty": 1 }\n- "Сделать отчёт до пятницы" → { "title": "Сделать отчёт", "content": "Срок: до пятницы", "priority": "HIGH", "difficulty": 2 }\n\nRespond with ONLY the JSON object, do NOT use markdown, do NOT wrap your answer in ``` or ```json.';
    const prompt = type === "note" ? notePrompt : taskPrompt;
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
      model: this.model,
      temperature: 0.1,
      max_completion_tokens: 512,
      top_p: 1,
      stream: false,
      stop: null,
    });
    const content = chatCompletion.choices[0].message.content;

    console.log("Transform content:", content);

    // Clean the response from invalid control characters (except \n and \t)
    const cleaned = (content || "").replace(
      /[\u0000-\u0019\u007f-\u009f]/g,
      (c) => {
        if (c === "\n" || c === "\t") return c;
        return " ";
      }
    );

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse error after cleaning:", e, cleaned);
      throw new Error(
        "Model response parsing error. Try rephrasing your request."
      );
    }

    if (type === "task") {
      return TaskStructureSchema.parse(result);
    } else {
      return NoteStructureSchema.parse(result);
    }
  }

  async processText(text: string): Promise<ProcessResult> {
    try {
      console.log("Processing text:", text);

      const classification = await this.classifyText(text);
      console.log("Classification result:", classification);

      // if (classification.confidence < 0.6) {
      //   throw new Error(
      //     `Low confidence in classification: ${classification.confidence}`
      //   );
      // }

      let tasksCreated = 0;
      let notesCreated = 0;

      // Handle "both" case - create both task and note with adapted content
      if (classification.type === "both") {
        const [taskResult, noteResult] = await Promise.all([
          this.transformTextToStructured(text, "task"),
          this.transformTextToStructured(text, "note"),
        ]);
        const dueTime = await this.extractDueTimeFromText(text);
        // Create task
        const categories = await this.getTaskCategories(
          taskResult.title + "\n" + (taskResult.content || "")
        );
        await addTask({
          title: taskResult.title,
          description: taskResult.content || "",
          priority:
            (taskResult.priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
          categories,
          dueTime: dueTime ? new Date(dueTime) : undefined,
        });
        tasksCreated++;

        // Create note
        const noteCategories = await this.getNoteCategories(
          noteResult.title + "\n" + (noteResult.content || "")
        );
        await addNote({
          title: noteResult.title,
          content: noteResult.content || "",
          categories: noteCategories,
        });
        notesCreated++;
      } else if (classification.type === "task") {
        const taskResult = await this.transformTextToStructured(text, "task");
        const dueTime = await this.extractDueTimeFromText(text);
        const categories = await this.getTaskCategories(
          taskResult.title + "\n" + (taskResult.content || "")
        );
        await addTask({
          title: taskResult.title,
          description: taskResult.content || "",
          priority:
            (taskResult.priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
          categories,
          dueTime: dueTime ? new Date(dueTime) : undefined,
        });
        tasksCreated++;
      } else if (classification.type === "note") {
        const noteResult = await this.transformTextToStructured(text, "note");
        const noteCategories = await this.getNoteCategories(
          noteResult.title + "\n" + (noteResult.content || "")
        );
        await addNote({
          title: noteResult.title,
          content: noteResult.content || "",
          categories: noteCategories,
        });
        notesCreated++;
      }

      return {
        success: true,
        tasksCreated,
        notesCreated,
      };
    } catch (error) {
      console.error("Error processing text:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get categories for a task using LLM (in English, returns an array of strings)
   */
  async getTaskCategories(text: string): Promise<string[]> {
    const prompt =
      'You are an assistant that extracts relevant categories (keywords) for a given task description.\nReturn 2-5 short, general categories in English (e.g. "work", "meeting", "finance", "health", "project", "learning", "personal", "shopping", "deadline", "call", "email").\n\nExamples:\n- "Buy milk" → ["shopping", "personal"]\n- "Prepare report for work meeting" → ["work", "meeting"]\n- "Сделать отчёт по проекту" → ["work", "project"]\n\nRespond with ONLY the JSON array, do NOT use markdown, do NOT wrap your answer in ``` or ```json.\n\nTask description: ' +
      text;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.model,
      temperature: 0.2,
      max_completion_tokens: 128,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const content = chatCompletion.choices[0].message.content;
    try {
      const categories = JSON.parse(content || "[]");
      if (
        Array.isArray(categories) &&
        categories.every((c) => typeof c === "string")
      ) {
        return categories;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Get categories for a note using LLM (in English, returns an array of strings)
   */
  async getNoteCategories(text: string): Promise<string[]> {
    const prompt =
      'You are an assistant that extracts relevant categories (keywords) for a given note content.\nReturn 2-5 short, general categories in English (e.g. "work", "ideas", "learning", "personal", "project", "reference", "health", "finance", "travel", "shopping").\n\nExamples:\n- "Notes from the meeting" → ["work", "meeting"]\n- "Идеи для стартапа" → ["ideas", "project"]\n- "Путешествие в Италию" → ["travel", "personal"]\n\nRespond with ONLY the JSON array, do NOT use markdown, do NOT wrap your answer in ``` or ```json.\n\nNote content: ' +
      text;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.model,
      temperature: 0.2,
      max_completion_tokens: 128,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const content = chatCompletion.choices[0].message.content;
    try {
      const categories = JSON.parse(content || "[]");
      if (
        Array.isArray(categories) &&
        categories.every((c) => typeof c === "string")
      ) {
        return categories;
      }
      return [];
    } catch {
      return [];
    }
  }

  async extractDueTimeFromText(text: string): Promise<string | null> {
    const now = new Date();
    const nowIso = now.toISOString();
    const prompt =
      'You are an assistant that extracts a due date and time from a task description.\nThe task can be in English or Russian.\nIf there is a clear deadline (date, time, or relative expression: "tomorrow", "by Friday", "in 2 days", "завтра", "к пятнице", "через 2 дня", etc.),\nreturn it as an ISO 8601 string (e.g. "2024-06-20T18:00:00Z").\nIf there is no deadline, return null.\n\nCurrent date and time (for all calculations): ' +
      nowIso +
      '\n\nIf the time is not specified, use 18:00 local time by default.\nIf only a date is specified, use 18:00 by default.\nIf only a time is specified, use today as the date.\n\nExamples:\n- "Do the report by June 20, 6pm" → "2024-06-20T18:00:00Z"\n- "Call mom tomorrow" → (tomorrow\'s date, 12:00 by default)\n- "Complete the task by Friday" → (nearest Friday, 18:00 by default)\n- "Сделать отчёт до 20 июня 18:00" → "2024-06-20T18:00:00Z"\n- "Позвонить маме завтра" → (дата завтрашнего дня, 12:00 по умолчанию)\n- "Выполнить задачу к пятнице" → (ближайшая пятница, 18:00 по умолчанию)\n- "Just do the task" → null\n- "Просто сделать задачу" → null\n\nRespond strictly in JSON: { "dueTime": "..." | null }\n\nTask: ' +
      text;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.model,
      temperature: 0.1,
      max_completion_tokens: 64,
      top_p: 1,
      stream: false,
      stop: null,
    });
    const content = chatCompletion.choices[0].message.content;
    try {
      console.log("Due time content:", content);
      const result = JSON.parse(content || "{}");
      if (result.dueTime && typeof result.dueTime === "string") {
        return result.dueTime;
      }
      return null;
    } catch {
      return null;
    }
  }
}
