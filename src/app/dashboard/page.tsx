/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Dashboard Page Component
 *
 * Renders the Forecasting Dashboard page that displays sales insights for sales leaders.
 * This page serves as the container for the ForecastingDashboard component which contains
 * all the visualization sections.
 *
 * @returns A page with the ForecastingDashboard component wrapped in appropriate styling
 */
// Third-party dependencies
import React from "react";

// Local dependencies
import ForecastingDashboard from "../../components/ForecastingDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
          Forecasting Dashboard
        </h1>
        <ForecastingDashboard />
      </div>
    </div>
  );
}
