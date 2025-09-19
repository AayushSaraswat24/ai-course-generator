'use client'; 

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx'; 
type ThemeOption = 'light' | 'dark' | 'system';

interface CustomSelectProps {
  options: ThemeOption[];
  value: ThemeOption;
  onChange: (value: ThemeOption) => void;
  className?: string;
}


export function CustomSelect({ options, value, onChange, className }: CustomSelectProps) {

  const [isOpen, setIsOpen] = useState(false);
  
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
     
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);


  const handleSelect = (option: ThemeOption) => {
    onChange(option);
    setIsOpen(false); 
  };

  return (
    <div 
      className={clsx("relative font-inter", className)}
      ref={selectRef}
      onMouseEnter={() => setIsOpen(!isOpen)}
    >
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:text-white transition-colors duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <span className="capitalize">{value}</span>
       
        <svg 
          className={clsx("w-4 h-4 ml-2 transition-transform duration-300", isOpen && "rotate-180 dark:text-white")}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div 
        className={clsx(
          "absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out origin-top",
          isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        )}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={clsx(
              "w-full text-left px-4 py-2 text-sm capitalize transition-colors duration-150 ease-in-out",
              value === option
                ? "bg-indigo-500 text-white dark:bg-indigo-600"
                : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
