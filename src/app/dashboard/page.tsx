'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/loginNavbar';
import { Download, Trash2, ChevronDown, ChevronUp, Loader2, Eye } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import VideoGrid from '@/components/streamingUi/VideoGrid';
import { generatePdf } from '@/utils/pdfUtils';

export default function DashboardPage() {
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
        console.log(`response`, JSON.stringify(response.success));
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
          <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-6 flex-wrap w-full">
            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[150px] max-w-full">
              <span className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Name:</span>
              <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg sm:text-xl truncate">{data.user.name}</p>
            </div>
            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[200px] max-w-full">
              <span className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Email:</span>
              <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg sm:text-xl truncate">{data.user.email}</p>
            </div>
            {/* Plan */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-[100px] max-w-full">
              <span className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">Plan:</span>
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
        className="border rounded-lg mb-3 w-full max-w-full bg-white dark:bg-neutral-900 shadow"
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
                <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 mt-1">
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
                    console.error("Delete failed:", err);
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
            <p className="text-gray-500 dark:text-gray-400 text-center italic">No saved quizzes yet.</p>
          ) : (
            data.quizzes.map((quiz: any,i:number) => (
              <div key={quiz._id} className="border rounded-lg mb-3 w-full max-w-full">
                <button
                  onClick={() => setOpenQuiz(openQuiz === quiz._id ? null : quiz._id)}
                  className="w-full text-left p-3 font-semibold flex justify-between items-center"
                >
                   <span className="truncate">quiz {i + 1}</span>
                    {openQuiz === quiz._id ? <ChevronUp /> : <ChevronDown />}
                </button>
                {openQuiz === quiz._id && (
                  <div className="p-3 border-t">
                    <p className="whitespace-pre-line break-words">{quiz.content}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button className="btn btn-sm btn-outline flex items-center gap-1">
                        <Download size={16} /> PDF
                      </button>
                      <button className="btn btn-sm btn-error flex items-center gap-1">
                        <Trash2 size={16} /> Delete
                      </button>
                      <button className="btn btn-sm btn-primary flex items-center gap-1">
                        <Eye size={16} /> Open
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
// so problem is my video grid function to show vidoes of notes is accepting the whole array that has thumbnail , title and url but in my data from db which you can see from data have only url so i might need to send whole data to save and then update the save and model to accept the whole data to show the yt videos on dashboard notes like notes page .  you will get the whole message object in console of notes and can see them on json formatter . the data im getting here for yt videos is in data you can print it and watch the data through json formater too . after all this work on quizzes and then improve the ui for notes and quizzes in dashboard with mobile first approach .