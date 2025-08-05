import { ThemeSwitcher } from '@/components/themeSwitcher';
import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex justify-between items-center py-4 border-b dark:border-gray-700">
          <h1 className="text-3xl font-bold">Theme Showcase</h1>
          <ThemeSwitcher />
        </header>

        {/* This card uses theme-dependent colors */}
        <section className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg transition-colors duration-300">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Hello, World!</h2>
          <p className="text-gray-700 dark:text-gray-300">
            This is a paragraph that changes its color based on the selected theme. The background of this card also changes automatically.
          </p>
        </section>
        

        <button className="px-6 py-3 rounded-full font-bold
          bg-gray-200 text-gray-800
          hover:bg-gray-300
          dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600
          transition-colors duration-300">
          A themed button
        </button>
      </div>
    </main>
  );
}34