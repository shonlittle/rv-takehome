"use client";

/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Sales Rep Performance Component
 *
 * Displays performance metrics for sales representatives within territories.
 * Shows win/loss statistics for each rep and allows filtering by territory.
 *
 * @param territoryData - The territory statistics data from the API
 * @param selectedTerritory - Currently selected territory for filtering
 * @returns A table showing sales rep performance metrics by territory
 */

// Add third-party dependencies
import React, { useState, useMemo } from "react";

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
 * Props for the SalesRepPerformance component
 */
interface SalesRepPerformanceProps {
  territoryData: Record<string, TerritoryStats>;
  selectedTerritory: string | null;
}

/**
 * Interface for aggregated sales rep data
 */
interface SalesRepData {
  name: string;
  territories: string[];
  totalWins: number;
  totalLosses: number;
  winRate: number;
}

const SalesRepPerformance: React.FC<SalesRepPerformanceProps> = ({
  territoryData,
  selectedTerritory,
}) => {
  const [sortBy, setSortBy] = useState<"name" | "wins" | "losses" | "winRate">(
    "winRate"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  /**
   * Aggregates sales rep data across territories
   * @returns Array of sales rep data objects
   */
  const salesRepData = useMemo(() => {
    const repMap = new Map<string, SalesRepData>();

    // Process each territory
    Object.entries(territoryData).forEach(([territory, stats]) => {
      // Skip if filtering by territory and this isn't the selected one
      if (selectedTerritory && territory !== selectedTerritory) return;

      // Process each rep in this territory
      Object.entries(stats.repBreakdown).forEach(([repName, repStats]) => {
        const existingRep = repMap.get(repName);

        if (existingRep) {
          // Update existing rep data
          existingRep.totalWins += repStats.wins;
          existingRep.totalLosses += repStats.losses;
          existingRep.winRate =
            existingRep.totalWins /
            (existingRep.totalWins + existingRep.totalLosses);

          if (!existingRep.territories.includes(territory)) {
            existingRep.territories.push(territory);
          }
        } else {
          // Create new rep data
          repMap.set(repName, {
            name: repName,
            territories: [territory],
            totalWins: repStats.wins,
            totalLosses: repStats.losses,
            winRate: repStats.wins / (repStats.wins + repStats.losses),
          });
        }
      });
    });

    // Convert map to array and sort
    return Array.from(repMap.values());
  }, [territoryData, selectedTerritory]);

  /**
   * Handles sorting when a column header is clicked
   * @param field - The field to sort by
   */
  const handleSort = (field: "name" | "wins" | "losses" | "winRate") => {
    if (field === sortBy) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending for metrics, ascending for name
      setSortBy(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  /**
   * Sorts sales rep data based on current sort field and direction
   * @returns Sorted array of sales rep data
   */
  const sortedSalesReps = useMemo(() => {
    return [...salesRepData].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "wins") {
        comparison = a.totalWins - b.totalWins;
      } else if (sortBy === "losses") {
        comparison = a.totalLosses - b.totalLosses;
      } else if (sortBy === "winRate") {
        comparison = a.winRate - b.winRate;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [salesRepData, sortBy, sortDirection]);

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
   * Renders a sort indicator arrow
   * @param field - The field to check
   * @returns Sort indicator element or null
   */
  const renderSortIndicator = (
    field: "name" | "wins" | "losses" | "winRate"
  ) => {
    if (sortBy !== field) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <div>
      {selectedTerritory && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            Showing sales reps for <strong>{selectedTerritory}</strong>{" "}
            territory
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Sales Rep {renderSortIndicator("name")}
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Territories
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSalesReps.length > 0 ? (
              sortedSalesReps.map((rep) => (
                <tr key={rep.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rep.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rep.totalWins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rep.totalLosses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(rep.winRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {rep.territories.map((territory) => (
                        <span
                          key={territory}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {territory}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No sales rep data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesRepPerformance;
