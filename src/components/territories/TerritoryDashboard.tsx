"use client";

/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Territory Dashboard Component
 *
 * A container component that organizes and displays all territory performance sections.
 * This component integrates four main visualization sections:
 * 1. Territory Performance Overview - Shows high-level metrics for each territory
 * 2. Territory Map Visualization - Displays performance by region
 * 3. Sales Rep Performance - Shows breakdown by sales rep within territories
 * 4. Territory Comparison - Allows comparing metrics between territories
 *
 * This component handles data fetching from the API and distributes the data to child components.
 *
 * @returns A grid layout containing all territory visualization components
 */

// Add third-party dependencies
import React, { useState, useEffect } from "react";

// Add local dependencies
import TerritoryPerformanceOverview from "./TerritoryPerformanceOverview";
import TerritoryMapVisualization from "./TerritoryMapVisualization";
import SalesRepPerformance from "./SalesRepPerformance";
import TerritoryComparison from "./TerritoryComparison";

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

const TerritoryDashboard: React.FC = () => {
  const [territoryData, setTerritoryData] = useState<Record<
    string,
    TerritoryStats
  > | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(
    null
  );

  useEffect(() => {
    /**
     * Fetches territory data from the API
     */
    const fetchTerritoryData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/stats/territories");

        if (!response.ok) {
          throw new Error(`Error fetching territory data: ${response.status}`);
        }

        const data = await response.json();
        setTerritoryData(data);
        setError(null);
      } catch (err) {
        setError(
          `Failed to load territory data: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerritoryData();
  }, []);

  /**
   * Handles territory selection for filtering
   * @param territory - The territory to select or deselect
   */
  const handleTerritorySelect = (territory: string) => {
    setSelectedTerritory(territory === selectedTerritory ? null : territory);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
          <div className="animate-pulse text-xl text-gray-500">
            Loading territory data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-500">{error}</div>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Territory Performance Overview Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Territory Performance Overview
        </h2>
        <TerritoryPerformanceOverview
          territoryData={territoryData || {}}
          onTerritorySelect={handleTerritorySelect}
          selectedTerritory={selectedTerritory}
        />
      </div>

      {/* Territory Map Visualization Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Territory Map Visualization
        </h2>
        <TerritoryMapVisualization
          territoryData={territoryData || {}}
          selectedTerritory={selectedTerritory}
        />
      </div>

      {/* Sales Rep Performance Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Sales Rep Performance by Territory
        </h2>
        <SalesRepPerformance
          territoryData={territoryData || {}}
          selectedTerritory={selectedTerritory}
        />
      </div>

      {/* Territory Comparison Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Territory Comparison
        </h2>
        <TerritoryComparison territoryData={territoryData || {}} />
      </div>
    </div>
  );
};

export default TerritoryDashboard;
