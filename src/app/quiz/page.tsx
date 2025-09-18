"use client";

import { useState } from "react";
import LoginNavbar from "@/components/loginNavbar";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { generateQuizPdf } from "@/utils/quizPdf";
import Bubble from "@/components/streamingUi/Bubble";
import Toast from "@/components/streamingUi/Toast";
import { Bookmark } from "lucide-react";
import clsx from "clsx";
import PromptBox from "@/components/promptBox";
import { useRouter } from "next/navigation";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function QuizPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [userKnowledge, setUserKnowledge] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [mainTopic, setMainTopic] = useState("");
  const [toast, setToast] = useState<{
    open: boolean;
    kind: "success" | "error";
    message: string;
  }>({ open: false, kind: "success", message: "" });

  async function handleSubmit(newPrompt: string, newUserKnowledge: string) {
    if (!newPrompt.trim()) return;

    if (loading){
      setToast({
          open: true,
          kind: "error",
          message: `Please wait for the current request to finish.`,
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
        return;
    };

    setLoading(true);
    setPrompt(newPrompt);
    setUserKnowledge(newUserKnowledge);

    setQuestions([]);
    setRevealed([]);
    setAllRevealed(false);
    setToast({ open: false, kind: "success", message: "" });

    try {
      const { success, error, statusCode } = await fetchWithAuth({
        path: "/api/generation-routes/generate-quiz",
        method: "POST",
        data: { prompt: newPrompt, userKnowledge: newUserKnowledge },
      });
      console.log(`success ${JSON.stringify(success)}`)
      if (error || !success) {
        setToast({
          open: true,
          kind: "error",
          message: error?.message || `Failed with status ${statusCode}`,
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
        return;
      }

      if (success.quiz?.prompt?.inappropriate === "true") {
        setToast({
          open: true,
          kind: "error",
          message: `prompt is against our guidline it contain ${success.quiz.prompt.cause}❌`,
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 4200);
        return;
      }

      if (success.quiz && success.quiz.questions?.length > 0) {
        const qs: QuizQuestion[] = success.quiz.questions;
        setQuestions(qs);
        setRevealed(Array(qs.length).fill(false));
        setMainTopic(success.quiz.prompt.mainTopic);
      } else {
        setToast({
          open: true,
          kind: "error",
          message: "Prompt was rejected or no questions generated ❌",
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 4200);
      }
    } catch {
      setToast({ open: true, kind: "error", message: "Unexpected error occurred." });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 4200);
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (questions.length === 0) return;
    generateQuizPdf(questions,mainTopic);
  }

  function handleGiveTest() {
  if (questions.length === 0) return;

  sessionStorage.setItem("quizQuestions", JSON.stringify(questions));
  router.push("/quiz/start");
}

  async function handleSave() {
    if (questions.length === 0) return;

    try {
      const { success, error, statusCode } = await fetchWithAuth({
        path: "/api/saving-routes/save-quiz",
        method: "POST",
        data: { questions },
      });

      if (error || !success) {
        setToast({
          open: true,
          kind: "error",
          message: error?.message || `Failed with status ${statusCode}`,
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
        return;
      }

      setToast({ open: true, kind: "success", message: "Quiz saved successfully ✅" });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 1800);
    } catch (err) {
      console.error(err);
      setToast({ open: true, kind: "error", message: "Failed to save questions." });
    }
  }

  function toggleReveal(idx: number) {
    setRevealed((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  }

  function toggleAll() {
    setAllRevealed((prev) => {
      const newValue = !prev;
      setRevealed(Array(questions.length).fill(newValue));
      return newValue;
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <LoginNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-[160px]">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">AI Quiz Generator</h1>

        <div className="space-y-6">
          {/* Right-aligned bubble: show the last submitted prompt & level (like Notes) */}
          {(loading || questions.length > 0) && prompt && (
            <Bubble align="right">
              <div className="text-sm text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">
                {prompt}
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Level: <span className="font-medium">{userKnowledge}</span>
              </div>
            </Bubble>
          )}

          {/* Left/middle bubble: AI Quiz */}
          {questions.length > 0 && (
            <Bubble align="left">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">📝 Quiz</h3>

                {/* Global toggle button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={toggleAll}
                    className="text-sm px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {allRevealed ? "Hide all answers" : "Show all answers"}
                  </button>
                </div>

                {questions.map((q, i) => {
                  const answerText =
                    q.options?.[q.correctAnswer] !== undefined
                      ? q.options[q.correctAnswer]
                      : `Option ${q.correctAnswer}`;
                  const isOpen = revealed[i] === true;

                  return (
                    <div
                      key={i}
                      className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                    >
                      <p className="font-semibold mb-2">
                        {i + 1}. {q.question}
                      </p>

                      <ul className="list-disc pl-6 space-y-1 text-neutral-800 dark:text-neutral-200">
                        {q.options.map((opt, j) => (
                          <li key={j}>{opt}</li>
                        ))}
                      </ul>

                      <div className="mt-3">
                        <button
                          onClick={() => toggleReveal(i)}
                          className="text-sm px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          {isOpen ? "Hide answer" : "Show answer"}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-3">
                          <p className="text-green-700 dark:text-green-400">
                            ✅ Correct Answer: {q.correctAnswer+1}{" "}
                            {answerText ? `• ${answerText}` : ""}
                          </p>
                          {q.explanation && (
                            <p className="text-sm italic text-neutral-600 dark:text-neutral-400 mt-1">
                              💡 Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      )}  
                    </div>
                  );
                })}

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className={clsx(
                      "inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <Bookmark className="h-4 w-4" /> Save Quiz
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    📥 Download PDF
                </button>

                  <button
                    onClick={handleGiveTest}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    📝 Give Test
                  </button>
                  
                </div>
              </div>
            </Bubble>
          )}
        </div>
      </div>

      <PromptBox onSubmit={(p, level) => handleSubmit(p, level)} />

      <Toast open={toast.open} kind={toast.kind} message={toast.message} />
    </div>
  );
}
