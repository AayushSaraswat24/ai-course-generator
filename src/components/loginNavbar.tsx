'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function SignedInNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];


  useEffect(() => setMounted(true), []);


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenTheme(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { href: '/quiz', label: 'Quiz' },
    { href: '/test', label: 'Test' },
    { href: '/pdf-summary', label: 'PDF Summary' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="flex items-center justify-between px-4 py-4 bg-white dark:bg-neutral-900 shadow-sm relative">

      <Link href="/" className="text-xl sm:text-2xl font-bold text-violet-500">
        CourGen
      </Link>


      <div className="hidden md:flex space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`hover:text-violet-500 relative pb-1 ${
              pathname === link.href ? 'text-violet-500 font-semibold' : ''
            }`}
          >
            {link.label}
            {pathname === link.href && (
              <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-violet-500 rounded"></span>
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-3">

        <div
          className="relative"
          ref={dropdownRef}
          onMouseEnter={() => setOpenTheme(true)}
          onMouseLeave={() => {
            setOpenTheme(false);
            setHighlightedIndex(null);
          }}
        >
          <button
            className="px-3 py-2 text-sm font-medium cursor-pointer text-gray-700 bg-white rounded-md shadow-sm dark:bg-gray-800 dark:text-white focus:outline-none flex items-center justify-between"
            aria-haspopup="listbox"
            aria-expanded={openTheme}
          >
            {mounted ? themes.find((t) => t.value === theme)?.label || 'Select Theme' : '...'}
            <span
              className={`ml-2 transform transition-transform duration-200 ${openTheme ? 'rotate-180' : 'rotate-0'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 dark:invert"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>


          <div className="absolute left-0 top-full h-2 w-full" aria-hidden="true" />

          {openTheme && (
            <ul
              role="listbox"
              className="absolute left-0 top-full w-24 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 animate-dropdown"
            >
              {themes.map((t, index) => (
                <li
                  key={t.value}
                  role="option"
                  aria-selected={theme === t.value}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    setTheme(t.value);
                    setOpenTheme(false);
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


        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>


      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-neutral-900 shadow-lg p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-violet-500">Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 hover:text-violet-500 ${
                  pathname === link.href ? 'text-violet-500 font-semibold' : ''
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}


// todo : create the login navbar as private navbar add navigation links for exclusive page . 
// then create the chatBox for prompt they needed to be diff bcz some has include video some don't so i think all the page has prompt + userKnowledge so gonna make that first . after that need to work on main function . i have added the login navbar in the test page for preview of changes .