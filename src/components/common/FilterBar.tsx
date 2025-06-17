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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
        <div className="flex flex-wrap gap-2 sm:gap-3">
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
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
          <span className="text-xs sm:text-sm text-gray-500">
            Active filters:
          </span>
          {activeFilters.map((filter) => (
            <div
              key={`${filter.id}-${filter.value}`}
              className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800"
            >
              <span className="truncate max-w-[120px] sm:max-w-none">
                {filter.label}: {filter.value}
              </span>
              <button
                onClick={() => onFilterRemove(filter)}
                className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={`Remove ${filter.label} filter`}
              >
                <svg
                  className="h-3 w-3 sm:h-4 sm:w-4"
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
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
