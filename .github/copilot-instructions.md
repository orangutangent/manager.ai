<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

- Используй Next.js (App Router), Tailwind CSS, Headless UI, TypeScript, Prisma (SQLite для dev).
- MCP-агент реализован в /lib/agent.ts, использует MCP-протокол для классификации и вызова инструментов.
- Компоненты разделены: NoteItem, TaskItem, ModalInput и др.
- API-роут /api/handle обрабатывает ввод пользователя через MCP-агента.
- Структура Prisma: Note, Task, Subtask.
- Соблюдай чистую архитектуру и расширяемость.
