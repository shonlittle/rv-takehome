"use client";

/**
 * Blame Shon Little
 * 2025-06-16
 */

/**
 * US Map Visualization Component
 *
 * Renders an interactive U.S. map using D3.js that visualizes territory performance.
 * States are color-coded based on their territory's win rate.
 *
 * @param territoryData - The territory statistics data from the API
 * @param selectedTerritory - Currently selected territory for highlighting
 * @param onTerritorySelect - Callback function when a territory is selected
 * @returns An interactive D3.js map visualization of territory performance
 */

// Add third-party dependencies
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Feature, Geometry } from "geojson";
import { Topology, GeometryCollection } from "topojson-specification";

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
 * Props for the USMapVisualization component
 */
interface USMapVisualizationProps {
  territoryData: Record<string, TerritoryStats>;
  selectedTerritory: string | null;
  onTerritorySelect: (territory: string) => void;
}

/**
 * Mapping of state codes to territories
 */
const STATE_TO_TERRITORY: Record<string, string> = {
  // Pacific
  "06": "Pacific", // CA
  "53": "Pacific", // WA
  "41": "Pacific", // OR
  // Mountain
  "08": "Mountain", // CO
  "04": "Mountain", // AZ
  "35": "Mountain", // NM
  "49": "Mountain", // UT
  // Midwest
  "17": "Midwest", // IL
  "27": "Midwest", // MN
  "29": "Midwest", // MO
  // Northeast
  "36": "Northeast", // NY
  "25": "Northeast", // MA
  // Southeast
  "12": "Southeast", // FL
  "13": "Southeast", // GA
  // Southwest
  "48": "Southwest", // TX
  "32": "Southwest", // NV
};

/**
 * USMapVisualization component
 */
const USMapVisualization: React.FC<USMapVisualizationProps> = ({
  territoryData,
  selectedTerritory,
  onTerritorySelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mapData, setMapData] = useState<Topology | null>(null);

  // Define types for the TopoJSON data
  interface StateFeature extends Feature<Geometry> {
    id: string;
    properties: {
      name: string;
      code?: string;
    };
  }

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
   * Determines the performance color based on win rate
   * @param winRate - The win rate (0-1)
   * @returns CSS color
   */
  const getPerformanceColor = (winRate: number) => {
    if (winRate >= 0.7) return "#22c55e"; // green-500
    if (winRate >= 0.5) return "#eab308"; // yellow-500
    if (winRate >= 0.3) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  /**
   * Fetches the TopoJSON data for U.S. states
   */
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch("/data/us-states.json");
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error("Error loading map data:", error);
      }
    };

    fetchMapData();
  }, []);

  /**
   * Renders the D3.js map when data is available
   */
  useEffect(() => {
    if (!svgRef.current || !mapData || !territoryData) return;

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up dimensions
    const width = svgRef.current.clientWidth;
    const height = width < 500 ? 300 : 400; // Smaller height on smaller screens
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    // Create the SVG container
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Create a projection for the map
    const projection = d3
      .geoAlbersUsa()
      .fitSize(
        [
          width - margin.left - margin.right,
          height - margin.top - margin.bottom,
        ],
        topojson.feature(mapData, mapData.objects.states)
      );

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Extract the states from the TopoJSON
    const states = topojson.feature(
      mapData,
      mapData.objects.states as GeometryCollection
    ).features as StateFeature[];

    // Draw the states
    const stateGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    stateGroup
      .selectAll("path")
      .data(states)
      .join("path")
      .attr("d", (d) => path(d))
      .attr("fill", (d: StateFeature) => {
        const stateCode = d.id;
        const territory = STATE_TO_TERRITORY[stateCode] || "Other";
        const stats = territoryData[territory];
        return stats ? getPerformanceColor(stats.winRate) : "#d1d5db"; // gray-300 for states without data
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5)
      .attr("class", (d: StateFeature) => {
        const stateCode = d.id;
        const territory = STATE_TO_TERRITORY[stateCode] || "Other";
        return territory === selectedTerritory ? "selected" : "";
      })
      .classed("hover:cursor-pointer", true)
      .on("mouseover", function (event, d: StateFeature) {
        // Highlight state on hover
        d3.select(this).attr("stroke", "#000000").attr("stroke-width", 1.5);

        // Show tooltip
        if (tooltipRef.current) {
          const stateCode = d.id;
          const territory = STATE_TO_TERRITORY[stateCode] || "Other";
          const stats = territoryData[territory];

          if (stats) {
            const tooltip = d3.select(tooltipRef.current);
            tooltip
              .html(
                `
                <div>
                  <div class="font-bold">${territory}</div>
                  <div>State: ${d.properties.name}</div>
                  <div>Win Rate: ${formatPercentage(stats.winRate)}</div>
                  <div>Total Value: ${formatCurrency(stats.totalValue)}</div>
                  <div>Deals: ${stats.wins + stats.losses}</div>
                </div>
              `
              )
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`)
              .classed("hidden", false);
          }
        }
      })
      .on("mouseout", function () {
        // Reset state styling on mouseout
        d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 0.5);

        // Hide tooltip
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).classed("hidden", true);
        }
      })
      .on("click", (event, d: StateFeature) => {
        const stateCode = d.id;
        const territory = STATE_TO_TERRITORY[stateCode] || "Other";
        onTerritorySelect(territory);
      });

    // Highlight selected territory
    if (selectedTerritory) {
      // Re-select all paths and apply styling based on data
      stateGroup
        .selectAll("path")
        .data(states)
        .attr("stroke", (d: StateFeature) => {
          const stateCode = d.id;
          const territory = STATE_TO_TERRITORY[stateCode] || "Other";
          return territory === selectedTerritory ? "#000000" : "#ffffff";
        })
        .attr("stroke-width", (d: StateFeature) => {
          const stateCode = d.id;
          const territory = STATE_TO_TERRITORY[stateCode] || "Other";
          return territory === selectedTerritory ? 1.5 : 0.5;
        });
    }

    // Add legend
    const legendData = [
      { label: "High (≥70%)", color: "#22c55e" },
      { label: "Good (50-69%)", color: "#eab308" },
      { label: "Fair (30-49%)", color: "#f97316" },
      { label: "Low (<30%)", color: "#ef4444" },
    ];

    // Position legend based on screen size
    const legendX = width < 500 ? 10 : width - 150;
    const legendY = width < 500 ? 10 : height - 100;

    const legend = svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    legend
      .selectAll("rect")
      .data(legendData)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => d.color);

    legend
      .selectAll("text")
      .data(legendData)
      .join("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 20 + 10)
      .text((d) => d.label)
      .attr("font-size", width < 500 ? "8px" : "10px") // Smaller font on smaller screens
      .attr("fill", "#4b5563"); // gray-600
  }, [mapData, territoryData, selectedTerritory, onTerritorySelect]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full h-[300px] sm:h-[400px]" />
      <div
        ref={tooltipRef}
        className="absolute hidden bg-white p-2 rounded shadow-md border border-gray-200 text-xs sm:text-sm z-10"
      />
    </div>
  );
};

export default USMapVisualization;
