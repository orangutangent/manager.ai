import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { Task, Note } from "@prisma/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ModalInputProps {
  open: boolean;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
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
          recognitionRef.current.lang = "en-US";

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
  }, []);

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

        // Refresh data by calling parent handlers
        // The parent component will fetch fresh data
        if (data.tasksCreated > 0) {
          onTaskAdded({} as Task); // Trigger refresh
        }
        if (data.notesCreated > 0) {
          onNoteAdded({} as Note); // Trigger refresh
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

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Speak...");
    }
  };

  const handleClose = () => {
    if (!loading && !isProcessing) {
      setText("");
      onClose();
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Add a task or note
                </Dialog.Title>

                <div className="mt-2">
                  <textarea
                    ref={textareaRef}
                    className="w-full rounded-lg border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={loading || isProcessing}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
