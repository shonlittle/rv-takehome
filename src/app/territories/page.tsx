/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * Territory Dashboard Page Component
 *
 * Renders the Territory Performance Dashboard page that displays territory insights
 * for revenue operations leaders. This page serves as the container for the
 * TerritoryDashboard component which contains all the visualization sections.
 *
 * @returns A page with the TerritoryDashboard component wrapped in appropriate styling
 */

// Add third-party dependencies
import React from "react";

// Add local dependencies
import TerritoryDashboard from "../../components/territories/TerritoryDashboard";

export default function TerritoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Territory Performance Dashboard
        </h1>
        <TerritoryDashboard />
      </div>
    </div>
  );
}
