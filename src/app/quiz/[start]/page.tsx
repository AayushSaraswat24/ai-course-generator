"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginNavbar from "@/components/loginNavbar";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function QuizTestPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem("quizQuestions");
    if (!saved) {
      router.push("/"); 
      return;
    }
    const parsed: QuizQuestion[] = JSON.parse(saved);
    setQuestions(parsed);
    setAnswers(Array(parsed.length).fill(-1)); 
  }, [router]);

  if (questions.length === 0) {
    return <div className="p-6 text-center">Loading test...</div>;
  }

  function handleSelect(optionIdx: number) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = optionIdx;
      return copy;
    });
  }

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => {
      let sc = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) sc++;
      });
      setScore(sc);
      setSubmitting(false);
    }, 1000); // fake loading effect
  }

  const q = questions[current];
  const selected = answers[current];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 ">
        <LoginNavbar />
    <div className="flex flex-1 items-center justify-center">

      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-6">
        {!score && score !== 0 ? (
            <>
            
            <h2 className="text-xl font-bold mb-4">
              Question {current + 1} of {questions.length}
            </h2>

            <p className="mb-4">{q.question}</p>

            
            <ul className="space-y-2">
              {q.options.map((opt, idx) => (
                  <li key={idx}>
                  <button
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left px-4 py-2 rounded-lg border font-medium transition-colors
                        ${
                            selected === idx
                            ? "bg-violet-500 text-white border-violet-600"
                            : "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                        >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>

            
            <div className="flex justify-between mt-6">
              <button
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                className="px-4 py-2 rounded-lg border bg-neutral-200 dark:bg-neutral-700 disabled:opacity-50"
                >
                Prev
              </button>

              {current < questions.length - 1 ? (
                  <button
                  onClick={() => setCurrent((c) => c + 1)}
                  className="px-6 py-3 mt-2 text-base rounded-lg cursor-pointer font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors"
                  >
                  Next
                </button>
              ) : (
                  <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-6 py-3 mt-2 text-base rounded-lg font-bold text-white transition-colors 
                    ${
                        submitting
                        ? "bg-violet-300 cursor-not-allowed"
                        : "bg-violet-500 hover:bg-violet-600 cursor-pointer"
                    }`}
                    >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </>
        ) : (
            <>
            
            <h2 className="text-2xl font-bold mb-6 text-center">
              🎯 Your Score: {score} / {questions.length}
            </h2>

            <div className="space-y-4">
              {questions.map((q, i) => {
                  const userAns = answers[i];
                  const isCorrect = userAns === q.correctAnswer;
                  return (
                      <div
                      key={i}
                      className="p-4 rounded-lg border bg-neutral-50 dark:bg-neutral-800"
                      >
                    <p className="font-semibold mb-2">
                      {i + 1}. {q.question}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                          isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                        }`}
                        >
                      {isCorrect ? "✅ Correct" : "❌ Wrong"}
                    </p>
                    {!isCorrect && (
                        <p className="text-sm mt-1">
                        Correct Answer:{" "}
                        <span className="font-semibold">
                          {q.options[q.correctAnswer]}
                        </span>
                      </p>
                    )}
                  </div>
                );
            })}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => router.push("/quiz")}
                className="px-6 py-3 mt-2 text-base rounded-lg cursor-pointer font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors"
                >
                Back to Quiz
              </button>
            </div>
          </>
        )}
      </div>
        </div>
    </div>
  );
}
