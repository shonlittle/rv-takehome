"use client";

/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Territory Performance Overview Component
 *
 * Displays high-level metrics for each territory in a sortable table format.
 * Shows wins, losses, win rates, and total value for each territory.
 * Allows sorting by different metrics and selecting a territory for filtering.
 *
 * @param territoryData - The territory statistics data from the API
 * @param onTerritorySelect - Callback function when a territory is selected
 * @param selectedTerritory - Currently selected territory for highlighting
 * @returns A table showing territory performance metrics
 */

// Add third-party dependencies
import React, { useState } from "react";

/**
 * Interface for territory statistics
 */
interface TerritoryStats {
  wins: number;
  losses: number;
  winRate: number;
  totalValue: number;
  repBreakdown: Record<string, { wins: number; losses: number }>;
}

/**
 * Props for the TerritoryPerformanceOverview component
 */
interface TerritoryPerformanceOverviewProps {
  territoryData: Record<string, TerritoryStats>;
  onTerritorySelect: (territory: string) => void;
  selectedTerritory: string | null;
}

/**
 * Type for sortable fields in the territory table
 */
type SortField = "territory" | "wins" | "losses" | "winRate" | "totalValue";

/**
 * Type for sort direction
 */
type SortDirection = "asc" | "desc";

const TerritoryPerformanceOverview: React.FC<
  TerritoryPerformanceOverviewProps
> = ({ territoryData, onTerritorySelect, selectedTerritory }) => {
  const [sortField, setSortField] = useState<SortField>("totalValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  /**
   * Handles sorting when a column header is clicked
   * @param field - The field to sort by
   */
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending for metrics, ascending for territory name
      setSortField(field);
      setSortDirection(field === "territory" ? "asc" : "desc");
    }
  };

  /**
   * Formats a number as currency
   * @param value - The number to format
   * @returns Formatted currency string
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Formats a number as percentage
   * @param value - The number to format (0-1)
   * @returns Formatted percentage string
   */
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  /**
   * Sorts territories based on current sort field and direction
   * @returns Sorted array of territory entries
   */
  const getSortedTerritories = () => {
    return Object.entries(territoryData).sort(
      ([territoryA, statsA], [territoryB, statsB]) => {
        let comparison = 0;

        if (sortField === "territory") {
          comparison = territoryA.localeCompare(territoryB);
        } else {
          const valueA = statsA[sortField];
          const valueB = statsB[sortField];
          comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      }
    );
  };

  /**
   * Renders a sort indicator arrow
   * @param field - The field to check
   * @returns Sort indicator element or null
   */
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  const sortedTerritories = getSortedTerritories();

  return (
    <div>
      {/* Table View (visible on md screens and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("territory")}
              >
                Territory {renderSortIndicator("territory")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("wins")}
              >
                Wins {renderSortIndicator("wins")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("losses")}
              >
                Losses {renderSortIndicator("losses")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("winRate")}
              >
                Win Rate {renderSortIndicator("winRate")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("totalValue")}
              >
                Total Value {renderSortIndicator("totalValue")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTerritories.length > 0 ? (
              sortedTerritories.map(([territory, stats]) => (
                <tr
                  key={territory}
                  className={`${
                    selectedTerritory === territory ? "bg-blue-50" : ""
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onTerritorySelect(territory)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {territory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.wins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(stats.winRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(stats.totalValue)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No territory data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card View (visible on small screens only) */}
      <div className="md:hidden space-y-3">
        {sortedTerritories.length > 0 ? (
          sortedTerritories.map(([territory, stats]) => (
            <div
              key={territory}
              className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
                selectedTerritory === territory ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onTerritorySelect(territory)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {territory}
                </h3>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {formatPercentage(stats.winRate)} Win Rate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Wins</p>
                  <p className="font-medium text-gray-900">{stats.wins}</p>
                </div>
                <div>
                  <p className="text-gray-500">Losses</p>
                  <p className="font-medium text-gray-900">{stats.losses}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Total Value</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            No territory data available
          </div>
        )}
      </div>
    </div>
  );
};

export default TerritoryPerformanceOverview;
