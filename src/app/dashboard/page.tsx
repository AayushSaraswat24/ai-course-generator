'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/loginNavbar';
import { Download, Trash2, ChevronDown, ChevronUp, Loader2, Eye } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import VideoGrid from '@/components/streamingUi/VideoGrid';
import { generatePdf } from '@/utils/pdfUtils';
import { generateQuizPdf } from '@/utils/quizPdf';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [openQuiz, setOpenQuiz] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithAuth({ path: "/api/dashboard", method: "GET", data: null });
          if (!response.success) {
          setError(response.error.message);
          return;
        }
        setData(response.success);
        
      } catch (error:any) {
        setError('Failed to fetch dashboard data .');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-x-hidden'>
      <Navbar />
      <div className="flex-1 overflow-auto px-4 py-6 max-w-full lg:max-w-4xl mx-auto">

        {/* User Info Card */}
       <div className="mb-10 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
          {/* Avatar */}
          <div className="flex-shrink-0 w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center text-white text-4xl font-bold">
            {data.user.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col sm:flex-row sm:justify-start gap-6 flex-wrap w-full">
            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[150px] max-w-full">
              <span className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Name:</span>
              <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg sm:text-xl truncate">
                {data.user.name}
              </p>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[200px] max-w-full">
              <span className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Email:</span>
              <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg sm:text-xl truncate">
                {data.user.email}
              </p>
            </div>

            {/* Plan */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[100px] max-w-full">
              <span onClick={()=> router.push('/plans')} className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Plan:</span>
              <span
                className={`px-3 py-1 rounded-full font-medium text-white truncate ${
                  data.user.plan === "Premium"
                    ? "bg-green-500"
                    : data.user.plan === "Pro"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              >
                {data.user.plan}
              </span>
            </div>

            {/* Plan Expiry */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[150px] max-w-full">
              <span className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Expiry:</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg sm:text-xl">
                {data.user.plan.toLowerCase() === "free"
                  ? "∞"
                  : data.user.expiry
                  ? (() => {
                      const now = new Date();
                      const expiryDate = new Date(data.user.expiry);
                      const diffTime = expiryDate.getTime() - now.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays > 0 ? `${diffDays} day${diffDays > 1 ? "s" : ""}` : "Expired";
                    })()
                  : "error"}
              </span>
            </div>
          </div>
        </div>


        {/* Notes Section */}
<section className="mb-10">
  <h3 className="text-lg font-bold mb-3">Saved Notes</h3>
  {data.notes.length === 0 ? (
    <p className="text-gray-500 text-center dark:text-gray-400 italic">
      No saved notes yet.
    </p>
  ) : (
    data.notes.map((note: any) => (
      <div
        key={note._id}
        className="border rounded-lg mb-3  max-w-full bg-white dark:bg-neutral-900 shadow"
      >
        <button
          onClick={() =>
            setOpenNote(openNote === note._id ? null : note._id)
          }
          className="w-full text-left p-3 font-semibold flex justify-between items-center"
        >
          <span className="truncate">{note.title[0]}</span>
          {openNote === note._id ? <ChevronUp /> : <ChevronDown />}
        </button>

        {openNote === note._id && (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-semibold">📘 Notes</h3>

            {note.title.map((title: string, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg"
              >
                <div className="font-bold text-blue-700 dark:text-blue-400">
                  {title}
                </div>
                <div className="whitespace-pre-wrap  text-neutral-800 dark:text-neutral-200 mt-1">
                  {note.notes[idx]}
                </div>
              </div>
            ))}

            {note.videoLinks.length > 0 && (
              <VideoGrid videos={note.videoLinks} />
            )}

            {/* Action Buttons */}
            <div className="flex gap-7 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() =>
                  generatePdf(
                    note.title[0],
                    note.title.map((t: string, i: number) => ({
                      topic: t,
                      notes: note.notes[i],
                    })),
                    note.videoLinks
                  )
                }
                className="btn btn-sm btn-outline flex items-center gap-1"
              >
                <Download size={18} /> PDF
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetchWithAuth({
                      path: `/api/delete-data/delete-notes?id=${note._id}`,
                      method: "DELETE",
                    });
                    if (res.success) {
                      // remove deleted note from state
                      setData((prev: any) => ({
                        ...prev,
                        notes: prev.notes.filter((n: any) => n._id !== note._id),
                      }));
                    }
                  } catch (err) {
                    console.log("Delete failed:", err);
                  }
                }}
                className="btn btn-sm btn-error flex items-center gap-1"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    ))
  )}
</section>


{/* Quizzes Section */}
<section>
  <h3 className="text-lg font-bold mb-3">Saved Quizzes</h3>
  {data.quizzes.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400 text-center italic">
      No saved quizzes yet.
    </p>
  ) : (
    data.quizzes.map((quiz: any, i: number) => (
      <div
        key={quiz._id}
        className="border rounded-lg mb-3 w-full max-w-full bg-white dark:bg-neutral-900 shadow"
      >
        <button
          onClick={() => setOpenQuiz(openQuiz === quiz._id ? null : quiz._id)}
          className="w-full text-left p-3 font-semibold flex justify-between items-center"
        >
          <span className="truncate">Quiz {i + 1} </span>
          {openQuiz === quiz._id ? <ChevronUp /> : <ChevronDown />}
        </button>

        {openQuiz === quiz._id && (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">📝 Quiz</h3>

            {quiz.questions.map((q: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg"
              >
                <p className="font-semibold mb-2">
                  {idx + 1}. {q.question}
                </p>
                <ul className="list-disc pl-6 space-y-1 text-neutral-800 dark:text-neutral-200">
                  {q.options.map((opt: string, j: number) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <p className="text-green-700 dark:text-green-400">
                    ✅ Correct Answer: {q.correctAnswer + 1} • {q.options[q.correctAnswer]}
                  </p>
                  {q.explanation && (
                    <p className="text-sm italic text-neutral-600 dark:text-neutral-400 mt-1">
                      💡 Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => {
                  sessionStorage.setItem("quizQuestions", JSON.stringify(quiz.questions));
                  router.push("/quiz/start");
                }}
                className="btn btn-sm btn-primary flex items-center gap-1"
              >
                📝 Give Test
              </button>

              <button
                onClick={() => generateQuizPdf(quiz.questions)}
                className="btn btn-sm btn-outline flex items-center gap-1"
              >
                <Download size={18} /> PDF
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetchWithAuth({
                      path: `/api/delete-data/delete-quiz?id=${quiz._id}`,
                      method: "DELETE",
                    });
                    if (res.success) {
                      setData((prev: any) => ({
                        ...prev,
                        quizzes: prev.quizzes.filter((q: any) => q._id !== quiz._id),
                      }));
                    }
                  } catch (err) {
                    console.log("Delete failed:", err);
                  }
                }}
                className="btn btn-sm btn-error flex items-center gap-1"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    ))
  )}
</section>
      {/* Logout Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/auth/logout", { method: "POST" });
              const data = await res.json();

              if (data.success) {
                router.push("/signin"); 
              }
             
            } catch (err) {
              console.log("Logout error:", err);
              setTimeout(()=>{
                setError(null);
              },2000);
              setError("Logout failed. Please try again.");
            }
          }}
          className="text-lg font-semibold p-3 rounded-xl bg-purple-600 hover:bg-purple-700"
        >
          Logout
        </button>
      </div>

      </div>
    </div>
  );
}
