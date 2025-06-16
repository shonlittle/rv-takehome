"use client";

/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Territory Map Visualization Component
 *
 * Displays a table-based visualization of territories with color-coding based on performance.
 * Shows a grid representation of US regions with performance indicators.
 *
 * @param territoryData - The territory statistics data from the API
 * @param selectedTerritory - Currently selected territory for highlighting
 * @returns A grid-based visualization of territory performance
 */

// Add third-party dependencies
import React, { useState } from "react";
import USMapVisualization from "./USMapVisualization";

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
 * Props for the TerritoryMapVisualization component
 */
interface TerritoryMapVisualizationProps {
  territoryData: Record<string, TerritoryStats>;
  selectedTerritory: string | null;
}

/**
 * Interface for region data used in the visualization
 */
interface RegionData {
  name: string;
  position: [number, number]; // [row, col]
  states: string[];
}

const TerritoryMapVisualization: React.FC<TerritoryMapVisualizationProps> = ({
  territoryData,
  selectedTerritory,
}) => {
  /**
   * Region definitions with their grid positions and states
   */
  const regions: RegionData[] = [
    { name: "Pacific", position: [1, 0], states: ["CA", "WA", "OR"] },
    { name: "Mountain", position: [1, 1], states: ["CO", "AZ", "NM", "UT"] },
    { name: "Midwest", position: [1, 2], states: ["IL", "MN", "MO"] },
    { name: "Northeast", position: [0, 3], states: ["NY", "MA"] },
    { name: "Southeast", position: [2, 3], states: ["FL", "GA"] },
    { name: "Southwest", position: [2, 1], states: ["TX", "NV"] },
    { name: "Other", position: [2, 2], states: [] },
  ];

  /**
   * Determines the performance color based on win rate
   * @param winRate - The win rate (0-1)
   * @returns CSS color class
   */
  const getPerformanceColor = (winRate: number) => {
    if (winRate >= 0.7) return "bg-green-100 border-green-500";
    if (winRate >= 0.5) return "bg-blue-100 border-blue-500";
    if (winRate >= 0.3) return "bg-yellow-100 border-yellow-500";
    return "bg-red-100 border-red-500";
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
   * Creates a grid of cells for the map visualization
   * @returns 2D array of grid cells
   */
  const createGrid = () => {
    // Initialize empty 3x4 grid
    const grid: (RegionData | null)[][] = Array(3)
      .fill(null)
      .map(() => Array(4).fill(null));

    // Place regions in their positions
    regions.forEach((region) => {
      const [row, col] = region.position;
      grid[row][col] = region;
    });

    return grid;
  };

  const grid = createGrid();

  // Track selected territory for both visualizations
  const [selectedTerritoryState, setSelectedTerritoryState] = useState<
    string | null
  >(selectedTerritory);

  // Handle territory selection
  const handleTerritorySelect = (territory: string) => {
    setSelectedTerritoryState(
      territory === selectedTerritoryState ? null : territory
    );
  };

  return (
    <div className="overflow-hidden">
      {/* D3.js Map Visualization */}
      <div className="mb-6">
        <USMapVisualization
          territoryData={territoryData}
          selectedTerritory={selectedTerritoryState}
          onTerritorySelect={handleTerritorySelect}
        />
      </div>

      {/* Existing Grid Visualization */}
      <div className="grid grid-cols-4 gap-4">
        {grid.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => {
              if (!cell) {
                // Empty cell
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="h-40"
                  ></div>
                );
              }

              const stats = territoryData[cell.name] || {
                wins: 0,
                losses: 0,
                winRate: 0,
                totalValue: 0,
                repBreakdown: {},
              };

              const colorClass = getPerformanceColor(stats.winRate);
              const isSelected = selectedTerritory === cell.name;
              const totalDeals = stats.wins + stats.losses;

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`
                    p-4 rounded-lg border-2 h-40 flex flex-col justify-between
                    ${colorClass}
                    ${isSelected ? "ring-2 ring-blue-500" : ""}
                    ${totalDeals === 0 ? "opacity-50" : ""}
                  `}
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{cell.name}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      {cell.states.join(", ")}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Win Rate:</span>
                      <span className="font-medium">
                        {formatPercentage(stats.winRate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Deals:</span>
                      <span className="font-medium">{totalDeals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Value:</span>
                      <span className="font-medium">
                        {formatCurrency(stats.totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">High (≥70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Good (50-69%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Fair (30-49%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Low (&lt;30%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritoryMapVisualization;
