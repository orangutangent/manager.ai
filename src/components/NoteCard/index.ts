// NoteCard barrel export
export * from "./ui/NoteCard";
export * from "./data-access/noteApi";
export * from "./data-access/useCreateNote";
export * from "./data-access/useUpdateNote";
export * from "./data-access/useDeleteNote";
export * from "./model/note";

export { NoteCard } from "./ui/NoteCard";
// The useNote export has been removed, now use useCreateNote/useUpdateNote/useDeleteNote/useNotes
