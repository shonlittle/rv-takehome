"use client";

import React, { useState, useRef, useEffect } from "react";
import { FilterOption } from "./FilterBar";

interface CustomDropdownProps {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  id,
  label,
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get the selected option label
  const selectedOption = options.find((option) => option.value === value);
  const displayText = value ? selectedOption?.label : label;

  return (
    <div className="relative min-w-[120px] sm:min-w-[150px]" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        className="flex justify-between items-center w-full py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        id={`dropdown-button-${id}`}
      >
        <span className="truncate max-w-[100px] sm:max-w-full">
          {displayText}
        </span>
        <svg
          className={`ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 sm:max-h-60 rounded-md py-1 text-xs sm:text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
          role="listbox"
          aria-labelledby={`dropdown-button-${id}`}
        >
          {/* Default "Select" option */}
          <div
            className={`cursor-pointer select-none relative py-1.5 sm:py-2 pl-2 sm:pl-3 pr-6 sm:pr-9 hover:bg-blue-50 ${
              !value ? "bg-blue-100 text-blue-900" : "text-gray-900"
            }`}
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
          >
            {label}
          </div>

          {/* Options */}
          {options.map((option) => (
            <div
              key={option.value}
              className={`cursor-pointer select-none relative py-1.5 sm:py-2 pl-2 sm:pl-3 pr-6 sm:pr-9 hover:bg-blue-50 ${
                value === option.value
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-900"
              }`}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="block truncate">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
