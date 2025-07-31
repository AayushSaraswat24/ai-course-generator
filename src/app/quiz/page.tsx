// src/app/quiz/page.tsx
"use client";

import { useState } from "react";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });

      const data = await res.json();

      if (res.ok) {
        setQuiz(data.quiz.questions);
        console.log(`response on front-end: ${data.quiz.questions}`)
      } else {
        console.error("API Error:", data.error);
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Quiz</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Enter a topic (e.g., JavaScript)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-4"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <button
        onClick={generateQuiz}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {quiz && (

        <div className="mt-6 space-y-6">
          {quiz.map((q, i) => { 
            return(
            <div key={i} className="border p-4 rounded">
              <p className="font-semibold">{i + 1}. {q.question}</p>
              <ul className="list-disc ml-6">
                {q.options.map((opt: string, idx: number) => (
                  <li key={idx}>{opt}{idx}</li>
                ))}
              </ul>
              <p className="mt-2 text-green-600">✅ Answer: {q.options[q.correctAnswer]}</p>
              <p className="text-gray-600">💡 {q.explanation}</p>
            </div>
            )
          }
          )}
        </div>

      )}
    </div>
  );
}
