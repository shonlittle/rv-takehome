"use client";

/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Territory Comparison Component
 *
 * Allows comparing performance metrics between territories.
 * Displays a bar chart visualization for easy comparison of key metrics.
 *
 * @param territoryData - The territory statistics data from the API
 * @returns A visualization comparing territory metrics
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
 * Props for the TerritoryComparison component
 */
interface TerritoryComparisonProps {
  territoryData: Record<string, TerritoryStats>;
}

/**
 * Type for the metric to compare
 */
type ComparisonMetric = "winRate" | "totalValue" | "totalDeals" | "reps";

const TerritoryComparison: React.FC<TerritoryComparisonProps> = ({
  territoryData,
}) => {
  const [metric, setMetric] = useState<ComparisonMetric>("winRate");

  /**
   * Gets the display name for a metric
   * @param metricName - The metric identifier
   * @returns The display name
   */
  const getMetricDisplayName = (metricName: ComparisonMetric): string => {
    switch (metricName) {
      case "winRate":
        return "Win Rate";
      case "totalValue":
        return "Total Value";
      case "totalDeals":
        return "Total Deals";
      case "reps":
        return "Sales Reps";
      default:
        return "";
    }
  };

  /**
   * Gets the value for a specific metric from territory stats
   * @param stats - The territory statistics
   * @param metricName - The metric to extract
   * @returns The metric value
   */
  const getMetricValue = (
    stats: TerritoryStats,
    metricName: ComparisonMetric
  ): number => {
    switch (metricName) {
      case "winRate":
        return stats.winRate;
      case "totalValue":
        return stats.totalValue;
      case "totalDeals":
        return stats.wins + stats.losses;
      case "reps":
        return Object.keys(stats.repBreakdown).length;
      default:
        return 0;
    }
  };

  /**
   * Formats a value based on the metric type
   * @param value - The value to format
   * @param metricName - The metric type
   * @returns Formatted string
   */
  const formatValue = (value: number, metricName: ComparisonMetric): string => {
    switch (metricName) {
      case "winRate":
        return new Intl.NumberFormat("en-US", {
          style: "percent",
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(value);
      case "totalValue":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case "totalDeals":
      case "reps":
        return value.toString();
      default:
        return "";
    }
  };

  /**
   * Gets the maximum value for the current metric across all territories
   * @returns The maximum value
   */
  const getMaxValue = (): number => {
    return Math.max(
      ...Object.values(territoryData).map((stats) =>
        getMetricValue(stats, metric)
      ),
      0.1 // Ensure we have a non-zero value for empty data
    );
  };

  /**
   * Gets the bar width as a percentage based on the metric value
   * @param value - The metric value
   * @returns CSS width percentage
   */
  const getBarWidth = (value: number): string => {
    const maxValue = getMaxValue();
    const percentage = (value / maxValue) * 100;
    return `${Math.max(percentage, 2)}%`; // Ensure at least 2% width for visibility
  };

  /**
   * Gets the color class for a bar based on the metric
   * @param metricName - The metric type
   * @returns CSS color class
   */
  const getBarColor = (metricName: ComparisonMetric): string => {
    switch (metricName) {
      case "winRate":
        return "bg-blue-500";
      case "totalValue":
        return "bg-green-500";
      case "totalDeals":
        return "bg-purple-500";
      case "reps":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  /**
   * Sorts territories by the current metric value
   * @returns Sorted array of territory entries
   */
  const getSortedTerritories = () => {
    return Object.entries(territoryData).sort(([, statsA], [, statsB]) => {
      const valueA = getMetricValue(statsA, metric);
      const valueB = getMetricValue(statsB, metric);
      return valueB - valueA; // Sort descending
    });
  };

  const sortedTerritories = getSortedTerritories();
  const barColor = getBarColor(metric);

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="metric-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Compare territories by: {getMetricDisplayName(metric)}
        </label>
        <select
          id="metric-select"
          value={metric}
          onChange={(e) => setMetric(e.target.value as ComparisonMetric)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="winRate">Win Rate</option>
          <option value="totalValue">Total Value</option>
          <option value="totalDeals">Total Deals</option>
          <option value="reps">Number of Sales Reps</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedTerritories.length > 0 ? (
          sortedTerritories.map(([territory, stats]) => {
            const value = getMetricValue(stats, metric);
            return (
              <div
                key={territory}
                className="bg-white rounded-md p-4 shadow-sm"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {territory}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatValue(value, metric)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`${barColor} h-4 rounded-full`}
                    style={{ width: getBarWidth(value) }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-4">
            No territory data available for comparison
          </div>
        )}
      </div>
    </div>
  );
};

export default TerritoryComparison;
