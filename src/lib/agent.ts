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
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a text classifier that determines if the input text is a task, a note, or both.

Classification rules:
- TASK: Contains actionable items, deadlines, to-dos, assignments, goals
- NOTE: Contains information, ideas, observations, references, documentation
- BOTH: Contains both actionable items AND informational content that should be preserved

Respond with a JSON object (just the object, no other text) containing:
- "type": "task", "note", or "both"
- "confidence": number between 0-1 indicating classification confidence

Input: ${text}
`,
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
    const prompts = {
      note: `Transform the input into a well-structured note. Extract a clear title and organize the content logically.\n\nRules:\n- Title should be concise and descriptive\n- Content should preserve all important information\n- Organize content in a logical structure\n- Keep the original meaning and context\n\nRespond with JSON: { "title": "...", "content": "..." }`,

      task: `Transform the input into a clear and actionable task. Extract a title and determine priority/difficulty.\n\nRules:\n- Title should be action-oriented and specific\n- Content should include context and details\n- Priority: LOW (routine), MEDIUM (normal), HIGH (urgent/important)\n- Difficulty: 1-5 scale (1=easy, 5=very complex)\n\nRespond with JSON: { "title": "...", "content": "...", "priority": "LOW|MEDIUM|HIGH", "difficulty": 1-5 }`,
    };

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: prompts[type] },
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
        const categories = await this.getTaskCategories(
          taskResult.title + "\n" + (taskResult.content || "")
        );
        await addTask({
          title: taskResult.title,
          description: taskResult.content || "",
          priority:
            (taskResult.priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
          categories,
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
    const prompt = `You are an assistant that extracts relevant categories (keywords) for a given task description. 
Return 2-5 short, general categories in English (e.g. "work", "meeting", "finance", "health", "project", "learning", "personal", "shopping", "deadline", "call", "email").
Respond with a JSON array of strings, no other text.

Task description: ${text}`;

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
    const prompt = `You are an assistant that extracts relevant categories (keywords) for a given note content. 
Return 2-5 short, general categories in English (e.g. "work", "ideas", "learning", "personal", "project", "reference", "health", "finance", "travel", "shopping").
Respond with a JSON array of strings, no other text.

Note content: ${text}`;

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
}
