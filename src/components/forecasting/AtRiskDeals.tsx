/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * At-Risk Deals Component
 *
 * Identifies and displays deals that have been stalled in the sales pipeline.
 * This component:
 * - Fetches deal data from the API
 * - Identifies deals that haven't progressed in 21+ days (excluding closed deals)
 * - Calculates risk levels based on the number of days stalled
 * - Displays key metrics including total at-risk value and average days stalled
 * - Provides a detailed table with risk indicators and deal information
 *
 * This visualization helps sales leaders quickly identify deals that need attention
 * and prioritize follow-up actions based on value and risk level.
 *
 * @returns A component displaying at-risk deals with visualizations and metrics
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
  value: number;
  updated_date: string;
  sales_rep: string;
}

interface PipelineData {
  totalDeals: number;
  stageAnalytics: Record<
    string,
    { deals: Deal[]; count: number; percentage: number }
  >;
}

const AtRiskDeals: React.FC = () => {
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

  const atRiskDeals = useMemo(() => {
    if (!deals.length) return [];

    const now = new Date();
    const STALLED_DAYS_THRESHOLD = 21; // 21+ days considered at risk

    // Filter deals that haven't been updated in 21+ days
    // Exclude closed deals (won or lost)
    return deals
      .filter((deal) => {
        // Skip closed deals
        if (deal.stage === "closed_won" || deal.stage === "closed_lost") {
          return false;
        }

        const updatedDate = new Date(deal.updated_date);
        const daysSinceUpdate = Math.floor(
          (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysSinceUpdate >= STALLED_DAYS_THRESHOLD;
      })
      .map((deal) => {
        const updatedDate = new Date(deal.updated_date);
        const daysSinceUpdate = Math.floor(
          (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...deal,
          daysSinceUpdate,
        };
      })
      .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate); // Sort by most stalled first
  }, [deals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskLevel = (days: number) => {
    if (days >= 60) return "High";
    if (days >= 40) return "Medium";
    return "Low";
  };

  const getRiskColor = (days: number) => {
    if (days >= 60) return "text-red-600";
    if (days >= 40) return "text-orange-500";
    return "text-yellow-500";
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
        Error loading at-risk deals: {error}
      </div>
    );
  }

  if (!atRiskDeals.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No at-risk deals found
      </div>
    );
  }

  // Calculate total value of at-risk deals
  const totalAtRiskValue = atRiskDeals.reduce(
    (sum, deal) => sum + deal.value,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            At-Risk Deals
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {atRiskDeals.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Total At-Risk Value
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalAtRiskValue)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Avg. Days Stalled
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {(
              atRiskDeals.reduce((sum, deal) => sum + deal.daysSinceUpdate, 0) /
              atRiskDeals.length
            ).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days Stalled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales Rep
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {atRiskDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {deal.deal_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {deal.stage.replace("_", " ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(deal.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(deal.updated_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {deal.daysSinceUpdate}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getRiskColor(
                    deal.daysSinceUpdate
                  )}`}
                >
                  {getRiskLevel(deal.daysSinceUpdate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.sales_rep}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AtRiskDeals;
