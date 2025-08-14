"use client";
import LoginNavbar from "@/components/loginNavbar";
import PromptBox from "@/components/promptBox";
import { useState } from "react";

type NoteChunk = { topic: string; notes: string };
type YTVideo = { title: string; video: { url: string; title: string; thumbnail: string } | null };

export default function StreamNotesClient() {
  const [prompt, setPrompt] = useState("");
  const [userKnowledge, setUserKnowledge] = useState("beginner");
  const [includeVideos, setIncludeVideos] = useState(true);
  const [notesChunks, setNotesChunks] = useState<NoteChunk[]>([]);
  const [ytVideos, setYtVideos] = useState<YTVideo[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setError("");
    setNotesChunks([]);
    setYtVideos([]);
    setLoading(true);

    try {
      const res = await fetch("/api/generation-routes/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userKnowledge, includeVideos }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Unexpected error");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let lastNewlineIndex = buffer.lastIndexOf("\n");
          if (lastNewlineIndex === -1) continue;

          const fullLines = buffer.slice(0, lastNewlineIndex).split("\n");
          buffer = buffer.slice(lastNewlineIndex + 1); // keep the remainder

          for (const line of fullLines) {
            try {
              const json = JSON.parse(line);

              // Metadata block: contains yt videos
              if (json.type === "metadata" && Array.isArray(json.ytVideos)) {
                setYtVideos(json.ytVideos);
              }

              // Notes chunk
              else if (json.topic && json.notes) {
                setNotesChunks((prev) => [...prev, json]);
              }
            } catch (err) {
              console.warn("⚠️ Skipped invalid JSON chunk:", line);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Network or unexpected error occurred.");
    }

    setLoading(false);
  }

  // Helper to convert normal YT URL to embeddable format
  function getEmbedUrl(url: string) {
    const videoIdMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
  }

  return (
    <div>
      <LoginNavbar /> 
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">📚 AI Notes Generator</h1>

      <div className="space-y-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your topic..."
          className="w-full border rounded p-2"
          />

        <select
          value={userKnowledge}
          onChange={(e) => setUserKnowledge(e.target.value)}
          className="w-full border rounded p-2"
          >
          <option value="beginner">Beginner</option>
          <option value="moderate">Moderate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeVideos}
            onChange={(e) => setIncludeVideos(e.target.checked)}
            />
          Include YouTube Videos
        </label>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          ❌ {error}
        </div>
      )}

      {ytVideos.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 mt-8">🎬 YouTube Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ytVideos.map((item, idx) => {
              const embedUrl = item.video?.url ? getEmbedUrl(item.video.url) : null;
              return (
                <div key={idx} className="bg-white p-2 rounded border shadow">
                  <h3 className="font-semibold text-blue-700 mb-2">{item.title}</h3>
                  {embedUrl ? (
                    <iframe
                    src={embedUrl}
                    width="100%"
                    height="200"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded"
                    />
                  ) : (
                    <p className="text-red-500">⚠️ Video not available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {notesChunks.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold mb-2">📘 Notes</h2>
          {notesChunks.map((chunk, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded shadow border">
              <h3 className="font-bold text-lg text-blue-700">{chunk.topic}</h3>
              <p className="whitespace-pre-wrap text-gray-800 mt-2">{chunk.notes}</p>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-gray-600 font-medium">⏳ Streaming content...</p>}
    </div>

     <PromptBox onSubmit={(prompt, level) => console.log(`Prompt: ${prompt}, Level: ${level}`)} />
      </div>
  );
}
