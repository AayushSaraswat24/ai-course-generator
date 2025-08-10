"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RedirectAfterAuth() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const setTokens = async () => {
    try {
      const res = await fetch("/api/auth/set-token", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Token storage failed");
      }

      router.replace("/notes");
    } catch (err) {
      console.error("Error storing tokens:", err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    setTokens();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Redirecting...</p>;
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">⚠️ Failed to save session. Please try again.</p>
        <button
          onClick={setTokens}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
        <button
          onClick={() => router.replace("/sign-in")}
          className="ml-4 text-sm text-gray-600 underline"
        >
          Go back to login
        </button>
      </div>
    );
  }

  return null;
}
