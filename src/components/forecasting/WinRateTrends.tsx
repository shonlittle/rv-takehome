/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Win Rate Trends Component
 *
 * Analyzes and displays win rate statistics by transportation mode.
 * This component:
 * - Fetches win rate data from the /api/stats/win-rates endpoint
 * - Calculates and displays the highest and lowest win rates across transportation modes
 * - Visualizes win rates using both a bar chart and a detailed table
 * - Shows additional metrics like total wins, losses, and deal counts
 *
 * The component provides sales leaders with insights into which transportation
 * modes are performing best and which need attention.
 *
 * @returns A component displaying win rate trends with visualizations
 */
"use client";

// Third-party dependencies
import React, { useEffect, useState } from "react";

// Local dependencies

interface WinRateData {
  byTransportationMode: Record<
    string,
    { wins: number; losses: number; winRate: number }
  >;
  bySalesRep: Record<string, { wins: number; losses: number; winRate: number }>;
}

const WinRateTrends: React.FC = () => {
  const [winRates, setWinRates] = useState<WinRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWinRates = async () => {
      try {
        const response = await fetch("/api/stats/win-rates");
        if (!response.ok) {
          throw new Error("Failed to fetch win rates");
        }
        const data = await response.json();
        setWinRates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchWinRates();
  }, []);

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading win rate data: {error}
      </div>
    );
  }

  if (!winRates || !Object.keys(winRates.byTransportationMode).length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No win rate data available
      </div>
    );
  }

  // Prepare data for the chart
  const transportationModes = Object.keys(winRates.byTransportationMode);

  // Get the mode with the highest win rate
  const highestWinRateMode = transportationModes.reduce(
    (highest, current) =>
      winRates.byTransportationMode[current].winRate >
      winRates.byTransportationMode[highest].winRate
        ? current
        : highest,
    transportationModes[0]
  );

  // Get the mode with the lowest win rate
  const lowestWinRateMode = transportationModes.reduce(
    (lowest, current) =>
      winRates.byTransportationMode[current].winRate <
      winRates.byTransportationMode[lowest].winRate
        ? current
        : lowest,
    transportationModes[0]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Transportation Modes
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {transportationModes.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Highest Win Rate
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(
              winRates.byTransportationMode[highestWinRateMode].winRate
            )}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {highestWinRateMode}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Lowest Win Rate
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(
              winRates.byTransportationMode[lowestWinRateMode].winRate
            )}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {lowestWinRateMode}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 relative mt-8">
        <div className="absolute inset-0 flex items-end justify-around">
          {transportationModes.map((mode, index) => {
            const winRate = winRates.byTransportationMode[mode].winRate * 100;
            const height = Math.max(winRate, 5); // Minimum 5% height for visibility

            return (
              <div key={index} className="flex flex-col items-center w-1/4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {formatPercentage(
                    winRates.byTransportationMode[mode].winRate
                  )}
                </div>
                <div
                  className="w-20 bg-green-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-sm text-gray-600 mt-2 capitalize">
                  {mode}
                </div>
                <div className="text-xs text-gray-500">
                  {winRates.byTransportationMode[mode].wins} wins /
                  {winRates.byTransportationMode[mode].losses} losses
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transportation Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Losses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Deals
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transportationModes.map((mode, index) => {
              const { wins, losses, winRate } =
                winRates.byTransportationMode[mode];
              const total = wins + losses;

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {mode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(winRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {wins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinRateTrends;
