"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronUp, ArrowUp } from "lucide-react";

interface PromptBoxProps {
  onSubmit: (prompt: string, level: string) => void;
}

export default function PromptBox({ onSubmit }: PromptBoxProps) {
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const levels = ["beginner", "intermediate", "advanced"];

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
    }
  };

  const handleSend = () => {
    const textarea = textareaRef.current;
    const prompt = textareaRef.current?.value.trim() || "";
    if (!prompt) return;
    onSubmit(prompt, selectedLevel);
    if (textarea) {
      textarea.value = "";
      textarea.style.height = "auto";
    }
  };

  return (
    <div className="fixed bottom-6 p-2 left-0 w-full flex justify-center z-50">
      <div className="relative w-full max-w-3xl bg-gray-100 dark:bg-neutral-800 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700 p-4 pt-10">
        {/* Level Selector */}
        <div className="absolute -top-3 left-4 flex items-center gap-2">
          <div ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 cursor-pointer bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {selectedLevel}
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-10">
                {levels.map((level) => (
                  <div
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {level}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input & Send */}
        <div className="flex items-end">
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your prompt..."
            className="flex-1 bg-transparent outline-none px-3 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto max-h-32 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-400 scrollbar-track-transparent"
            rows={1}
          />
          <button
            onClick={handleSend}
            className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white ml-2"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
