"use client";

import React from "react";
import CustomDropdown from "./CustomDropdown";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface ActiveFilter {
  id: string;
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  searchTerm: string;
  onFilterChange: (filterId: string, value: string) => void;
  onFilterRemove: (filter: ActiveFilter) => void;
  onClearAllFilters: () => void;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  searchTerm,
  onFilterChange,
  onFilterRemove,
  onClearAllFilters,
  onSearchChange,
  searchPlaceholder = "Search...",
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <CustomDropdown
            key={filter.id}
            id={filter.id}
            label={filter.label}
            options={filter.options}
            value={activeFilters.find((f) => f.id === filter.id)?.value || ""}
            onChange={(value) => onFilterChange(filter.id, value)}
          />
        ))}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {activeFilters.map((filter) => (
            <div
              key={`${filter.id}-${filter.value}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <span>
                {filter.label}: {filter.value}
              </span>
              <button
                onClick={() => onFilterRemove(filter)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={onClearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
