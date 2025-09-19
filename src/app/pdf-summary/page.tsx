"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import LoginNavbar from "@/components/loginNavbar";
import Bubble from "@/components/streamingUi/Bubble";
import Toast from "@/components/streamingUi/Toast";
import { Loader2, Upload } from "lucide-react";
import clsx from "clsx";
import { fetchStreamPdf } from "@/lib/fetchWithStreampdf";

type Message = {
  id: string;
  role: "user" | "assistant";
  fileName?: string;
  isStreaming?: boolean;
  content?: string;
  error?: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function PDFSummarizerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; kind: "success" | "error"; message: string }>({
    open: false,
    kind: "success",
    message: "",
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleUpload(file: File) {
    if (loading) return;
    setLoading(true);

    const userMsg: Message = { id: uid(), role: "user", fileName: file.name };
    const assistantMsgId = uid();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      isStreaming: true,
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const { stream, error } = await fetchStreamPdf({
      path: "/api/summarize",
      method: "POST",
      data: file,
    });

    if (!stream) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isStreaming: false, error: error?.message || "Unexpected error" }
            : m
        )
      );
      setLoading(false);
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: (m.content || "") + chunk } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, error: "Stream interrupted. Please try again." } : m
        )
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
      setLoading(false);
    }
  }

  const conversation = useMemo(() => messages, [messages]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <LoginNavbar />

    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-[100px]"> 
  {/* pt-6 padding top, pb-[100px] to leave space for fixed button */}
  
  <div className="space-y-6">
    {conversation.map((m) =>
      m.role === "user" ? (
        <Bubble key={m.id} align="right">
          <div className="text-sm text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">
            Uploaded: <span className="font-semibold">{m.fileName}</span>
          </div>
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
              <Loader2 className="h-4 w-4 animate-spin" /> Summarizing…
            </div>
          )}
          {!m.error && m.content && (
            <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
              {m.content}
            </div>
          )}
        </Bubble>
      )
    )}
    <div ref={bottomRef} />
  </div>
</div>

{/* Fixed upload button at the bottom */}
<div className="fixed bottom-4 left-0 w-full bg-neutral-50 dark:bg-neutral-950  p-4 flex justify-center z-50">
  <label
    className={clsx(
      "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer",
      "bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
    )}
  >
    <Upload className="h-5 w-5" />
    {loading ? "Uploading..." : "Upload PDF"}
    <input
      type="file"
      accept="application/pdf"
      className="hidden"
      disabled={loading}
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          handleUpload(e.target.files[0]);
          e.target.value = ""; // reset file input
        }
      }}
    />
  </label>
</div>


      <Toast open={toast.open} kind={toast.kind} message={toast.message} />
    </div>
  );
}
// next thing to make dashboard to show all the save quizes and notes and option to delete them .
// we can add something like change gmail and other too on dashboard and will search what should be there too . or we should don't give dashboard option and give saves option . then we need to make the payment gateway for diff plans . also make the notes and quiz prompt box send prompt with enter . other things to add Change registered email (and maybe password) and Profile settings panel (show username, subscription plan) .