'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

export default function PublicNavbar() {
  const { theme, setTheme } = useTheme();
  const [hasCookie, setHasCookie] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(()=>{
    async function fetchCookie(){
      try{
        const res=await fetch('/api/auth/user');
        const data=await res.json();
        console.log(`data`, data);
        if(data.success){
          setHasCookie(true);
        }
      }catch(err:any){
        console.log(`err`, err);
      }
      
    }
    fetchCookie();

   }, []);

  if (!mounted) return null;

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <nav className="flex items-center justify-between px-3 sm:px-6 py-4 bg-white dark:bg-neutral-900 shadow-sm relative">
      <div className="absolute left-6 right-6 top-full h-px bg-gray-300 dark:bg-gray-700" aria-hidden="true" />

      <Link href="/" className="sm:text-2xl mr-1 text-lg font-bold text-violet-500 cursor-pointer">
        CourGen
      </Link>

      <div className="flex items-center space-x-2 sm:space-x-4">

        <div
          ref={dropdownRef}
          className="relative inline-block"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => {
            setOpen(false);
            setHighlightedIndex(null);
          }}
        >
          <button
            className="px-3 sm:w-22 py-2 text-sm font-medium cursor-pointer text-gray-700 bg-white rounded-md shadow-sm dark:bg-gray-800 dark:text-white focus:outline-none flex items-center justify-between"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {themes.find((t) => t.value === theme)?.label || 'Select Theme'}
            <span className={`ml-2 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 dark:invert" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>


          <div className="absolute left-0 top-full h-2 w-full" aria-hidden="true" />

          {open && (
            <ul
              role="listbox"
              className="absolute left-0 top-full w-32 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50
                         transition ease-out duration-150 origin-top"
            >
              {themes.map((t, index) => (
                <li
                  key={t.value}
                  role="option"
                  aria-selected={theme === t.value}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    setTheme(t.value);
                    setOpen(false); 
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                    ${theme === t.value ? 'font-semibold text-violet-500' : ''} 
                    ${highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  {t.label}
                </li>
              ))}
            </ul>
          )}
        </div>
          {hasCookie ?
          (
              <Link
              href="/notes"
              className="sm:px-4 px-2 py-2 text-sm font-medium text-white bg-violet-500 rounded-md shadow hover:bg-violet-600 transition-colors flex items-center justify-center"
              >
                Notes
              </Link>
          ):
          (
            <Link
              href="/signup"
              className="sm:px-4 px-2 py-2 text-sm font-medium text-white bg-violet-500 rounded-md shadow hover:bg-violet-600 transition-colors flex items-center justify-center"
            >
              SignUp
            </Link>
          )
        }
       
      </div>
    </nav>
  );
}      