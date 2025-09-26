"use client";

import PublicNavbar from "@/components/PublicNavbar";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const illustrations = [
    {
      src: "/ai-hero.png",
      alt: "AI Hero Illustration",
    },
    {
      src: "/ai-pdf.png",
      alt: "PDF Summaries Illustration",
    },
    {
      src: "/ai-notes.png",
      alt: "Smart Notes Illustration",
    },
    {
      src: "/ai-quiz.png",
      alt: "Quiz Generator Illustration",
    },
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="w-full py-32 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Revolutionize Your Learning with AI
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300">
              Summarize PDFs, organize notes, generate quizzes, and study smarter — all in one intelligent app designed for students and professionals.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/signin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition"
              >
                Get Started
              </Link>
              <Link
                href="/signup"
                className="border border-purple-600 hover:border-purple-700 text-purple-600 hover:text-purple-700 px-8 py-4 rounded-lg font-semibold transition"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
            <Image
              src={illustrations[0].src}
              alt={illustrations[0].alt}
              fill
              className="object-contain p-6"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Image
            src={illustrations[1].src}
            alt={illustrations[1].alt}
            fill
            className="object-contain p-6"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold">Save Time with AI Summaries</h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-lg md:text-xl">
            Our AI automatically reads your PDFs and generates concise summaries, helping you focus on what matters most.
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Summarize long documents in seconds</li>
            <li>Highlight important sections automatically</li>
            <li>Keep your notes organized and searchable</li>
          </ul>
        </div>
      </section>

      {/* Smart Notes Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 space-y-6">
          <h2 className="text-4xl font-bold">Organize Notes Like a Pro</h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-lg md:text-xl">
            Capture, categorize, and manage your study notes efficiently. AI helps structure your content and makes reviewing easy.
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Automatic tagging and categorization</li>
            <li>Quick search for any topic</li>
            <li>Integrates with your summaries and quizzes</li>
          </ul>
        </div>
        <div className="order-1 md:order-2 relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Image
            src={illustrations[2].src}
            alt={illustrations[2].alt}
            fill
            className="object-contain p-6"
          />
        </div>
      </section>

      {/* Quiz Generator Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Image
            src={illustrations[3].src}
            alt={illustrations[3].alt}
            fill
            className="object-contain p-6"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold">Test Your Knowledge</h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-lg md:text-xl">
            Generate quizzes automatically from your notes and summaries. Reinforce learning and track progress effortlessly.
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Customizable question types</li>
            <li>Instant answers and explanations</li>
            <li>Track performance over time</li>
          </ul>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 text-center bg-neutral-100 dark:bg-neutral-900">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to revolutionize your learning?
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-lg md:text-xl mb-10">
          Join thousands of learners who are boosting their productivity with AI-assisted study tools.
        </p>
        <Link
          href="/signin"
          className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-lg font-semibold shadow-lg transition text-lg md:text-xl"
        >
          Get Started for Free
        </Link>
      </section>
    </div>
  );
}


// using google credit learn to upload this project and then add the payments and host on vercel , document it on github readme .