"use client";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

function SigninContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case "OAuthAccountNotLinked":
        return "This email is already registered with a different login method.";
      case "AccessDenied":
        return "Access denied. Please try again.";
      case "Configuration":
        return "Auth configuration error.";
      case "Verification":
        return "Verification failed.";
      default:
        return code; // Show the actual error message
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      {errorMessage && (
        <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <div>
            <strong className="font-bold">Login Error: </strong>
            <span className="block">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignInPage(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninContent />
    </Suspense>
  )
}