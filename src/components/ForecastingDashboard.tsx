/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Forecasting Dashboard Component
 *
 * A container component that organizes and displays all forecasting sections for the sales dashboard.
 * This component integrates four main visualization sections:
 * 1. Revenue Forecasting - Shows projected revenue for the next three months
 * 2. Win Rate Trends - Displays win rates by transportation mode
 * 3. Deal Velocity Metrics - Shows average time deals spend in each stage
 * 4. At-Risk Deals - Lists deals that have been stalled for 21+ days
 *
 * Each section is rendered in its own card with appropriate styling and headers.
 *
 * @returns A grid layout containing all forecasting visualization components
 */
"use client";

// Third-party dependencies
import React from "react";

// Local dependencies
import RevenueForecasting from "./forecasting/RevenueForecasting";
import WinRateTrends from "./forecasting/WinRateTrends";
import DealVelocityMetrics from "./forecasting/DealVelocityMetrics";
import AtRiskDeals from "./forecasting/AtRiskDeals";

const ForecastingDashboard: React.FC = () => {
  return (
    <div className="grid gap-6">
      {/* 3-Month Revenue Forecast Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3-Month Revenue Forecast
        </h2>
        <RevenueForecasting />
      </div>

      {/* Win Rate Trends Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Win Rate Trends by Transportation Mode
        </h2>
        <WinRateTrends />
      </div>

      {/* Deal Velocity Metrics Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Deal Velocity Metrics
        </h2>
        <DealVelocityMetrics />
      </div>

      {/* At-Risk Deals Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          At-Risk Deals
        </h2>
        <AtRiskDeals />
      </div>
    </div>
  );
};

export default ForecastingDashboard;
