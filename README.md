# Task Manager - AI Assistant

An intelligent assistant for managing tasks and notes, using AI for automatic classification and text structuring.

## 🎯 Features

### 🤖 AI Integration

- **Automatic Classification**: AI determines whether the entered text is a task, a note, or both
- **Structuring**: Reformulates free-form text into clear, structured tasks and notes
- **Smart Processing**: Automatically detects priority, difficulty, and status for tasks

### 🎨 Modern UI/UX

- **Beautiful Interface**: Modern design with gradients and animations
- **Animations**: Smooth transitions and animations with Framer Motion
- **Responsive**: Fully responsive design for all devices
- **Notifications**: Toast notifications for feedback

### 🎤 Voice Input

- **Web Speech API**: Voice input support in the browser
- **English language**: Optimized for English (can be changed)
- **Visual Feedback**: Recording and status indicators

### 📝 Content Management

- **Tasks**: Create, edit, delete tasks with priorities and statuses
- **Notes**: Create, edit, delete notes with detailed view
- **Statistics**: Word and character count in notes
- **Filtering**: Switch between tasks and notes, filter by category

## 🚀 Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Lucide React
- **Animations**: Framer Motion
- **Database**: Prisma ORM + PostgreSQL (Supabase)
- **AI**: Groq API (Mixtral-8x7b-32768)
- **Notifications**: Sonner
- **Voice**: Web Speech API

## 📦 Installation & Launch

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase)
- Groq API key

### 1. Clone the repository

```bash
git clone <repository-url>
cd manager-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"

# AI
GROQ_API_KEY="your-groq-api-key"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma db push
```

### 5. Start in development mode

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── handle/        # AI text processing
│   │   ├── tasks/         # CRUD for tasks
│   │   └── notes/         # CRUD for notes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── TaskCard/         # Task card
│   ├── NoteCard/         # Note card
│   ├── TaskList/         # Task list
│   ├── NoteList/         # Note list
│   └── ModalInput/       # Modal input window
├── lib/                  # Utilities and tools
│   ├── agent.ts          # AI agent
│   ├── tools/            # MCP tools
│   └── prisma.ts         # Prisma client
├── types/                # TypeScript types
└── hooks/                # React hooks
```

## 🤖 AI Agent

### Text Classification

AI analyzes the entered text and determines its type:

- **Task**: Contains actions, deadlines, goals
- **Note**: Contains information, ideas, observations
- **Both**: Contains both actions and information

### Structuring

- **Tasks**: Extracts title, description, priority, difficulty
- **Notes**: Extracts title and structures content

## 📱 Usage

### Adding Content

1. Click the "Add" button or "+"
2. Enter text or use voice input
3. AI will automatically classify and structure the text
4. The content will appear in the appropriate section

### Managing Tasks

- **Change status**: Click the checkmark to change status
- **Edit**: Click the edit icon
- **Delete**: Click the trash icon

### Managing Notes

- **View**: Click the eye icon for detailed view
- **Edit**: Click the edit icon
- **Delete**: Click the trash icon

## 🔧 API Endpoints

### `/api/handle` (POST)

Process text via AI agent

```json
{
  "input": "Buy milk tomorrow"
}
```

### `/api/tasks` (GET, POST)

CRUD operations for tasks

### `/api/tasks/[id]` (PATCH, DELETE)

Update and delete a specific task

### `/api/notes` (GET, POST)

CRUD operations for notes

### `/api/notes/[id]` (PATCH, DELETE)

Update and delete a specific note

## 🎨 Customization

### Styles

The project uses Tailwind CSS. Main colors and styles can be changed in `tailwind.config.js`.

### AI Model

You can change the AI model in `src/lib/agent.ts`:

```typescript
this.model = config.model || "mixtral-8x7b-32768";
```

### Database

(see Prisma and Supabase documentation for details)
