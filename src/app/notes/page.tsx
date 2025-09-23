"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LoginNavbar from "@/components/loginNavbar";
import PromptBoxWithIncludeVideo from "@/components/PromptBoxWithIncludeVideo";
import { fetchStream } from "@/lib/fetchWithstream";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Bookmark, Loader2 } from "lucide-react";
import clsx from "clsx";
import Toast from "@/components/streamingUi/Toast";
import Bubble from "@/components/streamingUi/Bubble";
import VideoGrid from "@/components/streamingUi/VideoGrid";
import { generatePdf } from "@/utils/pdfUtils";

const GENERATE_NOTES_ENDPOINT = "/api/generation-routes/generate-notes";
const SAVE_COURSE_ENDPOINT = "/api/saving-routes/save-Course";

type NoteChunk = { topic: string; notes: string };
type YTVideo = { title: string; video: { url: string; title: string; thumbnail: string } | null };

type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  isStreaming?: boolean;
  error?: string;
  notesChunks?: NoteChunk[];
  ytVideos?: YTVideo[];
  mainTopic?: string;  
  meta?: { userKnowledge: string; includeVideos: boolean; prompt: string };
  saved?: boolean;
  saving?: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function StreamNotesClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; kind: "success" | "error"; message: string }>(
    { open: false, kind: "success", message: "" }
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

 
  async function handleSubmit(prompt: string, level: string, includeVideos: boolean) {
    if (loading) return;
    setLoading(true);
    const userMsg: Message = { id: uid(), role: "user", content: prompt };
    const assistantMsgId = uid();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      isStreaming: true,
      notesChunks: [],
      ytVideos: [],
      mainTopic: "",
      meta: { userKnowledge: level, includeVideos, prompt },
    };

    {/* prev refers to the whole message . its not like a loop where prev refers to every single element of array instead its the whole array . we can say that this is the old value before updating using setMessages function .*/}
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const { stream, error } = await fetchStream({
      path: GENERATE_NOTES_ENDPOINT,
      method: "POST",
      data: { prompt, userKnowledge: level, includeVideos },
    });

    if (!stream) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false, error: error?.message || "Unexpected error" } : m
        )
      );
      setLoading(false);
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

       
        let idx = buffer.lastIndexOf("\n");
        if (idx === -1) continue;

        const lines = buffer.slice(0, idx).split("\n");
        buffer = buffer.slice(idx + 1);

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line);

            
            if (json.type === "metadata") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        ytVideos: json.ytVideos || [],
                        mainTopic: json.mainTopic || "",
                      }
                    : m
                )
              );
              continue;
            }

          
            if (json.topic && !json.notes) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        notesChunks: [...(m.notesChunks || []), { topic: json.topic as string, notes: "" }],
                      }
                    : m
                )
              );
              continue;
            }

         
            if (typeof json.notes === "string") {
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== assistantMsgId) return m;
                  const chunks = m.notesChunks || [];
                  if (chunks.length === 0) return m; // guard if notes comes before topic
                  const last = chunks[chunks.length - 1];
                  const updatedLast = { ...last, notes: (last.notes || "") + json.notes };
                  return { ...m, notesChunks: [...chunks.slice(0, -1), updatedLast] };
                })
              );
              continue;
            }

           
            if (json.topic && json.notes) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, notesChunks: [...(m.notesChunks || []), { topic: json.topic, notes: json.notes }] }
                    : m
                )
              );
            }
          } catch {
            // ignore bad lines
          }
        }  
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, error: "Stream interrupted. Please try again." } : m))
      );
    } finally {
      setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m)));
      setLoading(false);
    }
    console.log("messages at end of streaming", JSON.stringify(messages));
  }


  async function handleSave(msg: Message) {
    if (!msg.notesChunks || msg.notesChunks.length === 0) return;

    const titles = msg.notesChunks.map((c) => c.topic);
    const notes = msg.notesChunks.map((c) => c.notes);
    const videoLinks = msg.ytVideos;
    console.log(`videoLinks`, videoLinks);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, saving: true } : m)));

    const { success, error } = await fetchWithAuth({
      path: SAVE_COURSE_ENDPOINT,
      method: "POST",
      data: { title: titles, notes, videoLinks },
    });

    if (success?.success) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, saving: false, saved: true } : m)));
      setToast({ open: true, kind: "success", message: "Course saved successfully." });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 1800);
    } else {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, saving: false } : m)));
      setToast({ open: true, kind: "error", message: error?.message || "Failed to save course." });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
    }
  }
  const conversation = useMemo(() => messages, [messages]);


  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <LoginNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-[160px]">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Notes Generator</h1>

        <div className="space-y-6">
          {conversation.map((m) => {
            console.log(`current message: ${JSON.stringify(m)}`);
           return m.role === "user" ? (
              <Bubble key={m.id} align="right">
                <div className="text-sm text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">{m.content}</div>
                {m.meta && (
                  <div className="mt-2 text-xs text-neutral-500">
                    Level: <span className="font-medium">{m.meta.userKnowledge}</span> • Videos:{" "}
                    <span className="font-medium">{String(m.meta.includeVideos)}</span>
                  </div>
                )}
              </Bubble>
            ) : (
              <Bubble key={m.id} align="left">
                {m.error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    ❌ {m.error}
                  </div>
                )}

                {m.isStreaming && !m.error && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Streaming…
                  </div>
                )}
                
                {m.notesChunks && m.notesChunks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">📘 Notes</h3>
                    {m.notesChunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                      >
                        <div className="font-bold text-blue-700 dark:text-blue-400">{chunk.topic}</div>
                        <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 mt-1">
                          {chunk.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {m.ytVideos && m.ytVideos.length > 0 && <VideoGrid videos={m.ytVideos} />}

                {!m.error && (m.notesChunks?.length || 0) > 0 && (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-neutral-500">
                      {m.mainTopic && (
                        <>
                          Main Topic: <span className="font-medium">{m.mainTopic}</span> •{" "}
                        </>
                      )}
                      {m.meta?.userKnowledge && (
                        <>
                          Level: <span className="font-medium">{m.meta.userKnowledge}</span>
                        </>
                      )}
                      {typeof m.meta?.includeVideos === "boolean" && (
                        <>
                          {" "}
                          • Videos: <span className="font-medium">{String(m.meta.includeVideos)}</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                    
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
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                          </>
                        ) : m.saved ? (
                          <>
                            <Bookmark className="h-4 w-4" /> Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" /> Save
                          </>
                        )}
                      </button>

                      
                      <button
                        onClick={() =>
                          m.notesChunks && generatePdf(m.mainTopic || "AI Notes", m.notesChunks, m.ytVideos)
                        }
                        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        📥 Download PDF
                      </button>
                    </div>
                  </div>
                )}
              </Bubble>
            ) }
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <PromptBoxWithIncludeVideo onSubmit={(prompt, level, includeVideo) => handleSubmit(prompt, level, includeVideo)} />
      <Toast open={toast.open} kind={toast.kind} message={toast.message} />
    </div>
  );
}

// why we need buffer -- Example:
// Server sends this line:

// {"topic":"Intro"}\n


// But you might receive it in 2 chunks:

// Chunk 1: {"top
// Chunk 2: ic":"Intro"}\n


// So a single reader.read() call doesn’t guarantee one JSON line. That’s why we need buffer.