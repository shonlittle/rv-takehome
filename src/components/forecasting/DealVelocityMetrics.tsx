/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Deal Velocity Metrics Component
 *
 * Analyzes and displays the average time deals spend in each sales pipeline stage.
 * This component:
 * - Fetches deal data from the API
 * - Calculates the average time (in days) that deals spend in each stage
 * - Computes an overall average across all stages
 * - Visualizes the metrics using both a bar chart and a detailed table
 * - Provides insights into pipeline efficiency and potential bottlenecks
 *
 * The velocity metrics help sales leaders identify which stages are taking longer
 * than expected and may require process improvements.
 *
 * @returns A component displaying deal velocity metrics with visualizations
 */
"use client";

// Third-party dependencies
import React, { useEffect, useState, useMemo } from "react";

// Local dependencies

interface Deal {
  id: number;
  deal_id: string;
  company_name: string;
  stage: string;
  created_date: string;
  updated_date: string;
}

interface PipelineData {
  totalDeals: number;
  stageAnalytics: Record<
    string,
    { deals: Deal[]; count: number; percentage: number }
  >;
}

interface StageVelocity {
  stage: string;
  avgDays: number;
  dealCount: number;
}

const DealVelocityMetrics: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error("Failed to fetch deals");
        }
        const data: PipelineData = await response.json();

        // Flatten all deals from all stages
        const allDeals: Deal[] = [];
        Object.values(data.stageAnalytics).forEach((stageData) => {
          allDeals.push(...stageData.deals);
        });

        setDeals(allDeals);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const stageVelocityData = useMemo(() => {
    if (!deals.length) return [];

    // Define the order of stages for consistent display
    const stageOrder = [
      "prospect",
      "qualified",
      "proposal",
      "negotiation",
      "closed_won",
      "closed_lost",
    ];

    // Group deals by stage
    const dealsByStage = deals.reduce((acc, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = [];
      }
      acc[deal.stage].push(deal);
      return acc;
    }, {} as Record<string, Deal[]>);

    // Calculate average time in each stage
    // Note: This is a simplified calculation since we don't have actual stage transition data
    // In a real system, you would track when each deal entered and exited each stage
    const stageVelocities: StageVelocity[] = stageOrder
      .filter((stage) => dealsByStage[stage])
      .map((stage) => {
        const stageDeals = dealsByStage[stage];

        // Calculate average days in stage based on created_date and updated_date
        const totalDays = stageDeals.reduce((sum, deal) => {
          const createdDate = new Date(deal.created_date);
          const updatedDate = new Date(deal.updated_date);
          const daysDiff = Math.max(
            0,
            Math.floor(
              (updatedDate.getTime() - createdDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          return sum + daysDiff;
        }, 0);

        const avgDays =
          stageDeals.length > 0 ? totalDays / stageDeals.length : 0;

        return {
          stage,
          avgDays,
          dealCount: stageDeals.length,
        };
      });

    return stageVelocities;
  }, [deals]);

  // Calculate overall average velocity
  const overallAvgVelocity = useMemo(() => {
    if (!stageVelocityData.length) return 0;

    const totalDays = stageVelocityData.reduce(
      (sum, stage) => sum + stage.avgDays * stage.dealCount,
      0
    );
    const totalDeals = stageVelocityData.reduce(
      (sum, stage) => sum + stage.dealCount,
      0
    );

    return totalDeals > 0 ? totalDays / totalDeals : 0;
  }, [stageVelocityData]);

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
        Error loading velocity data: {error}
      </div>
    );
  }

  if (!stageVelocityData.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No velocity data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-gray-600">
          Overall Average Time in Stage
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
          {overallAvgVelocity.toFixed(1)} days
        </p>
      </div>

      {/* Bar Chart */}
      <div className="h-48 sm:h-64 relative">
        <div className="absolute inset-0 flex items-end justify-around">
          {stageVelocityData.map((data, index) => {
            const maxValue = Math.max(
              ...stageVelocityData.map((d) => d.avgDays)
            );
            const height = maxValue > 0 ? (data.avgDays / maxValue) * 100 : 0;

            return (
              <div key={index} className="flex flex-col items-center w-1/6">
                <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  {data.avgDays.toFixed(1)} days
                </div>
                <div
                  className="w-10 sm:w-16 bg-purple-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(height, 5)}%` }}
                ></div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 capitalize truncate max-w-full">
                  {data.stage.replace("_", " ")}
                </div>
                <div className="text-xs text-gray-500">
                  {data.dealCount} deals
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table View (visible on md screens and up) */}
      <div className="hidden md:block overflow-x-auto mt-4 sm:mt-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Days in Stage
              </th>
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stageVelocityData.map((data, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 capitalize">
                  {data.stage.replace("_", " ")}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                  {data.avgDays.toFixed(1)} days
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                  {data.dealCount}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                Overall Average
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                {overallAvgVelocity.toFixed(1)} days
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                {stageVelocityData.reduce(
                  (sum, data) => sum + data.dealCount,
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Card View (visible on small screens only) */}
      <div className="md:hidden space-y-3 mt-4">
        {stageVelocityData.map((data, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-900 capitalize">
                {data.stage.replace("_", " ")}
              </h3>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                {data.avgDays.toFixed(1)} days
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {data.dealCount} deals in this stage
            </div>
          </div>
        ))}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Overall Average
            </h3>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {overallAvgVelocity.toFixed(1)} days
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {stageVelocityData.reduce((sum, data) => sum + data.dealCount, 0)}{" "}
            total deals
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealVelocityMetrics;
