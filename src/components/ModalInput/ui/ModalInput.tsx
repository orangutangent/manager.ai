import { Modal } from "@/components/ui/Modal";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { Task, Note } from "@prisma/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui";
import { CustomSelect } from "@/components/ui/MultiSelect";

type TaskWithPending = Task & { isPending?: boolean };

interface ModalInputProps {
  open: boolean;
  onClose: () => void;
  onTaskAdded: (task: TaskWithPending) => void;
  onNoteAdded: (note: Note) => void;
  placeholder?: string;
}

export function ModalInput({
  open,
  onClose,
  onTaskAdded,
  onNoteAdded,
  placeholder = "Enter a task or note...",
}: ModalInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [voiceLang, setVoiceLang] = useState<"en-US" | "ru-RU">("en-US");

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (
          window as Window & {
            SpeechRecognition?: new () => SpeechRecognition;
            webkitSpeechRecognition?: new () => SpeechRecognition;
          }
        ).SpeechRecognition ||
        (
          window as Window & {
            SpeechRecognition?: new () => SpeechRecognition;
            webkitSpeechRecognition?: new () => SpeechRecognition;
          }
        ).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = voiceLang;

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setText(transcript);
            setIsRecording(false);
            toast.success("Voice input finished");
          };

          recognitionRef.current.onerror = (
            event: SpeechRecognitionErrorEvent
          ) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
            toast.error("Voice input error");
          };

          recognitionRef.current.onend = () => {
            setIsRecording(false);
          };
        }
      }
    }
  }, [voiceLang]);

  const handleSubmit = async () => {
    if (!text.trim() || loading || isProcessing) return;

    setIsProcessing(true);
    setLoading(true);

    try {
      const response = await fetch("/api/handle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Text processing error");
      }

      if (data.success) {
        toast.success(data.message || "Successfully processed!");

        if (data.tasksCreated > 0) {
          onTaskAdded({
            id: "temp-" + Date.now(),
            title: text,
            description: "",
            status: "TODO",
            priority: "MEDIUM",
            steps: [],
            categories: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            dueTime: null,
            difficulty: 1,
            isPending: true,
          });
        }
        if (data.notesCreated > 0) {
          onNoteAdded({} as Note);
        }

        setText("");
        onClose();
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error processing text:", error);
      toast.error(
        error instanceof Error ? error.message : "Text processing error"
      );
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    recognitionRef.current.lang = voiceLang;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info(voiceLang === "ru-RU" ? "Говорите..." : "Speak...");
    }
  };

  const handleClose = () => {
    if (!loading && !isProcessing) {
      setText("");
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </span>
          <span>Add a task or note</span>
        </span>
      }
    >
      <div className="mt-2 p-2 sm:p-4 md:p-8">
        <div className="mt-2 ">
          <Input
            as="textarea"
            inputSize="md"
            label={undefined}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading || isProcessing}
            className="mb-2"
          />
        </div>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-blue-600"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            AI is processing your text...
          </motion.div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={toggleRecording}
              className={`p-2 transition-colors ${
                isRecording
                  ? "bg-red-50 text-red-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              disabled={loading || isProcessing}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <CustomSelect
              options={[
                { value: "en-US", label: "EN" },
                { value: "ru-RU", label: "RU" },
              ]}
              value={voiceLang}
              onChange={(val) => setVoiceLang(val as "en-US" | "ru-RU")}
              disabled={isRecording}
              className="w-20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading || isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || loading || isProcessing}
              loading={loading || isProcessing}
            >
              {isProcessing ? "Processing..." : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
