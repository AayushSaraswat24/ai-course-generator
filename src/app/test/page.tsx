"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LoginNavbar from "@/components/loginNavbar";
import PromptBoxWithIncludeVideo from "@/components/PromptBoxWithIncludeVideo";
import { fetchStream } from "@/lib/fetchWithstream"; // <-- your helper from message
import { fetchWithAuth } from "@/lib/fetchWithAuth"; // <-- your axios helper (non-stream)
import { Bookmark, Loader2 } from "lucide-react";
import clsx from "clsx";

/** =========================
 *  🔧 ENDPOINTS (adjust if needed)
 *  ========================= */
const GENERATE_NOTES_ENDPOINT = "/api/generation-routes/generate-notes";
const SAVE_COURSE_ENDPOINT = "/api/saving-routes/save-Course";

/** =========================
 *  Types from your messages
 *  ========================= */
type NoteChunk = { topic: string; notes: string };
type YTVideo = { title: string; video: { url: string; title: string; thumbnail: string } | null };

type Message = {
  id: string;
  role: "user" | "assistant";
  /** User prompt text when role=user; ignored for assistant */
  content?: string;

  /** Assistant specific */
  isStreaming?: boolean;
  error?: string;
  notesChunks?: NoteChunk[];
  ytVideos?: YTVideo[];
  meta?: { userKnowledge: string; includeVideos: boolean; prompt: string };
  saved?: boolean;
  saving?: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Simple toast */
function Toast({
  open,
  kind,
  message,
}: {
  open: boolean;
  kind: "success" | "error";
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60]">
      <div
        className={clsx(
          "rounded-lg px-4 py-2 shadow-md text-white text-sm",
          kind === "success" ? "bg-green-600" : "bg-red-600"
        )}
      >
        {message}
      </div>
    </div>
  );
}

/** Message bubble */
function Bubble({
  align,
  children,
}: {
  align: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("w-full flex", align === "right" ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-3xl w-full rounded-2xl border shadow-sm p-4",
          align === "right"
            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Video grid for assistant */
function VideoGrid({ videos }: { videos: YTVideo[] }) {
  const getEmbedUrl = (url: string) => {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">🎬 Suggested Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v, i) => {
          const url = v.video?.url;
          const embed = url ? getEmbedUrl(url) : null;
          return (
            <div key={i} className="rounded-lg border shadow-sm p-2 bg-white dark:bg-neutral-900">
              <div className="text-sm font-medium mb-2 line-clamp-2">{v.title}</div>
              {embed ? (
                <iframe
                  src={embed}
                  width="100%"
                  height="200"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded"
                />
              ) : (
                <div className="text-red-500 text-sm">⚠️ Video not available</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StreamNotesClient() {
  /** Chat history (in-memory only) */
  const [messages, setMessages] = useState<Message[]>([]);
  /** Toast state */
  const [toast, setToast] = useState<{ open: boolean; kind: "success" | "error"; message: string }>(
    { open: false, kind: "success", message: "" }
  );
  /** Auto-scroll to bottom on new message */
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /** Main submit handler coming from the fixed PromptBox */
  async function handleSubmit(prompt: string, level: string, includeVideos: boolean) {
    const userMsg: Message = { id: uid(), role: "user", content: prompt };
    const assistantMsgId = uid();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      isStreaming: true,
      notesChunks: [],
      ytVideos: [],
      meta: { userKnowledge: level, includeVideos, prompt },
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    // Call your streaming endpoint via helper
    const { stream, error, statusCode } = await fetchStream({
      path: GENERATE_NOTES_ENDPOINT,
      method: "POST",
      data: { prompt, userKnowledge: level, includeVideos },
    });

    // Non-stream error -> put inline in the assistant bubble
    if (!stream) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isStreaming: false,
                error: error?.message || "Unexpected error",
              }
            : m
        )
      );
      return;
    }

    // Read the stream line-by-line
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Process full lines only (server separates with \n)
        let idx = buffer.lastIndexOf("\n");
        if (idx === -1) continue;
        const lines = buffer.slice(0, idx).split("\n");
        buffer = buffer.slice(idx + 1);

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);

            if (json.type === "metadata" && Array.isArray(json.ytVideos)) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, ytVideos: json.ytVideos } : m))
              );
            } else if (json.topic && json.notes) {
              // Append chunk
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        notesChunks: [...(m.notesChunks || []), { topic: json.topic, notes: json.notes }],
                      }
                    : m
                )
              );
            }
          } catch {
            // ignore bad lines
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                error: "Stream interrupted. Please try again.",
              }
            : m
        )
      );
    } finally {
      setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m)));
    }
  }

  /** Save a single assistant message as a course */
  async function handleSave(msg: Message) {
    if (!msg.notesChunks || msg.notesChunks.length === 0) return;

    const titles = msg.notesChunks.map((c) => c.topic);
    const notes = msg.notesChunks.map((c) => c.notes);
    const videoLinks =
      msg.ytVideos?.map((v) => (v.video?.url ? v.video.url : null)).filter(Boolean) as string[];

    // optimistic UI
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, saving: true } : m)));

    const { success, error, statusCode } = await fetchWithAuth({
      path: SAVE_COURSE_ENDPOINT,
      method: "POST",
      data: { title: titles, notes, videoLinks },
    });

    if (success?.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, saving: false, saved: true } : m))
      );
      setToast({ open: true, kind: "success", message: "Course saved successfully." });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 1800);
    } else {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, saving: false } : m)));
      setToast({
        open: true,
        kind: "error",
        message: error?.message || "Failed to save course.",
      });
      console.log(`Error from saved route on main page ${error}`)
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
    }
  }

  /** Render helpers */
  const conversation = useMemo(() => messages, [messages]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Top navbar */}
      <LoginNavbar />

      {/* main container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-[160px]">
        {/* Title (optional) */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">📚 AI Notes Generator</h1>

        {/* Conversation */}
        <div className="space-y-6">
          {conversation.map((m) =>
            m.role === "user" ? (
              <Bubble key={m.id} align="right">
                <div className="text-sm text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">
                  {m.content}
                </div>
                {m.meta && (
                  <div className="mt-2 text-xs text-neutral-500">
                    Level: <span className="font-medium">{m.meta.userKnowledge}</span>{" "}
                    • Videos: <span className="font-medium">{String(m.meta.includeVideos)}</span>
                  </div>
                )}
              </Bubble>
            ) : (
              <Bubble key={m.id} align="left">
                {/* Error */}
                {m.error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    ❌ {m.error}
                  </div>
                )}

                {/* Streaming state */}
                {m.isStreaming && !m.error && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Streaming…
                  </div>
                )}

                {/* Notes */}
                {m.notesChunks && m.notesChunks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">📘 Notes</h3>
                    {m.notesChunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                      >
                        <div className="font-bold text-blue-700 dark:text-blue-400">
                          {chunk.topic}
                        </div>
                        <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 mt-1">
                          {chunk.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Videos */}
                {m.ytVideos && m.ytVideos.length > 0 && <VideoGrid videos={m.ytVideos} />}

                {/* Save bar */}
                {!m.error && (m.notesChunks?.length || 0) > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-neutral-500">
                      {m.meta?.userKnowledge && (
                        <>Level: <span className="font-medium">{m.meta.userKnowledge}</span></>
                      )}
                      {typeof m.meta?.includeVideos === "boolean" && (
                        <>
                          {" "}
                          • Videos: <span className="font-medium">{String(m.meta.includeVideos)}</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleSave(m)}
                      disabled={m.saving || m.saved}
                      className={clsx(
                        "inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border",
                        m.saved
                          ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      )}
                    >
                      {m.saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : m.saved ? (
                        <>
                          <Bookmark className="h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                )}
              </Bubble>
            )
          )}

          {/* bottom anchor for scroll */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed Prompt (add spacer above via pb-[160px]) */}
      <PromptBoxWithIncludeVideo
        onSubmit={(prompt, level, includeVideo) => handleSubmit(prompt, level, includeVideo)}
      />

      {/* Toast */}
      <Toast open={toast.open} kind={toast.kind} message={toast.message} />
    </div>
  );
}
