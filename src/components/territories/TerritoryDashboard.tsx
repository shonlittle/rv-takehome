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
import React, { useState, useEffect, useMemo } from "react";

// Add local dependencies
import TerritoryPerformanceOverview from "../territories/TerritoryPerformanceOverview";
import TerritoryMapVisualization from "../territories/TerritoryMapVisualization";
import SalesRepPerformance from "../territories/SalesRepPerformance";
import TerritoryComparison from "../territories/TerritoryComparison";
import FilterBar, {
  ActiveFilter,
  FilterConfig,
  FilterOption,
} from "../common/FilterBar";

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
 * Interface for deal data
 */
interface DealData {
  id: number;
  deal_id: string;
  company_name: string;
  contact_name: string;
  transportation_mode: string;
  stage: string;
  value: number;
  probability: number;
  created_date: string;
  updated_date: string;
  expected_close_date: string;
  sales_rep: string;
  origin_city: string;
  destination_city: string;
  cargo_type?: string;
}

/**
 * Interface for stage analytics
 */
interface StageAnalytics {
  deals: DealData[];
  count: number;
  percentage: number;
}

/**
 * Interface for pipeline data
 */
interface PipelineData {
  totalDeals: number;
  stageAnalytics: Record<string, StageAnalytics>;
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

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

    // Update active filters when territory is selected
    if (territory === selectedTerritory) {
      // Remove territory filter if deselecting
      setActiveFilters(activeFilters.filter((f) => f.id !== "territory"));
    } else {
      // Add or update territory filter
      const existingFilterIndex = activeFilters.findIndex(
        (f) => f.id === "territory"
      );

      if (existingFilterIndex >= 0) {
        // Update existing filter
        const updatedFilters = [...activeFilters];
        updatedFilters[existingFilterIndex] = {
          id: "territory",
          value: territory,
          label: "Territory",
        };
        setActiveFilters(updatedFilters);
      } else {
        // Add new filter
        setActiveFilters([
          ...activeFilters,
          {
            id: "territory",
            value: territory,
            label: "Territory",
          },
        ]);
      }
    }
  };

  /**
   * Get unique sales reps from territory data
   */
  const salesReps = useMemo(() => {
    if (!territoryData) return [];

    const reps = new Set<string>();

    Object.values(territoryData).forEach((territory) => {
      Object.keys(territory.repBreakdown).forEach((rep) => {
        reps.add(rep);
      });
    });

    return Array.from(reps).map((rep) => ({
      value: rep,
      label: rep,
    }));
  }, [territoryData]);

  // State for transportation modes and territory-to-modes mapping
  const [transportationModes, setTransportationModes] = useState<
    FilterOption[]
  >([]);
  const [territoryToModesMap, setTerritoryToModesMap] = useState<
    Record<string, Set<string>>
  >({});

  // Map of state abbreviations to territory names
  const stateToTerritoryMap: Record<string, string> = {
    // Pacific territory
    CA: "Pacific",
    WA: "Pacific",
    OR: "Pacific",
    HI: "Pacific",
    AK: "Pacific",

    // Mountain territory
    CO: "Mountain",
    UT: "Mountain",
    MT: "Mountain",
    ID: "Mountain",
    WY: "Mountain",
    NV: "Mountain",
    AZ: "Mountain",
    NM: "Mountain",

    // Southeast territory
    FL: "Southeast",
    GA: "Southeast",
    SC: "Southeast",
    NC: "Southeast",
    VA: "Southeast",
    WV: "Southeast",
    KY: "Southeast",
    TN: "Southeast",
    MS: "Southeast",
    AL: "Southeast",
    LA: "Southeast",
    AR: "Southeast",

    // Midwest territory
    IL: "Midwest",
    IN: "Midwest",
    OH: "Midwest",
    MI: "Midwest",
    WI: "Midwest",
    MN: "Midwest",
    IA: "Midwest",
    MO: "Midwest",
    KS: "Midwest",
    NE: "Midwest",
    SD: "Midwest",
    ND: "Midwest",

    // Northeast territory
    NY: "Northeast",
    PA: "Northeast",
    NJ: "Northeast",
    CT: "Northeast",
    RI: "Northeast",
    MA: "Northeast",
    VT: "Northeast",
    NH: "Northeast",
    ME: "Northeast",
    DE: "Northeast",
    MD: "Northeast",
    DC: "Northeast",

    // Southwest territory
    TX: "Southwest",
    OK: "Southwest",
  };

  // Fetch transportation modes and deals data
  useEffect(() => {
    const fetchDealsData = async () => {
      try {
        const response = await fetch("/api/deals");
        if (response.ok) {
          const data = (await response.json()) as PipelineData;
          if (data.stageAnalytics) {
            const modes = new Set<string>();
            const territoryModes: Record<string, Set<string>> = {};

            // Extract all deals from all stages
            Object.values(data.stageAnalytics).forEach((stageData) => {
              if (stageData.deals) {
                stageData.deals.forEach((deal) => {
                  if (deal.transportation_mode) {
                    modes.add(deal.transportation_mode);

                    // Extract state from origin_city (e.g., "New York, NY" -> "NY")
                    const match = deal.origin_city.match(/,\s*([A-Z]{2})$/);
                    const state = match ? match[1] : null;

                    // Map state to territory
                    const territory =
                      state && stateToTerritoryMap[state]
                        ? stateToTerritoryMap[state]
                        : "Other";

                    // Log for debugging
                    console.log(
                      `Mapping ${deal.origin_city} (${state}) to territory: ${territory}`
                    );

                    // Initialize set for this territory if it doesn't exist
                    if (!territoryModes[territory]) {
                      territoryModes[territory] = new Set<string>();
                    }

                    // Add this transportation mode to the territory's set
                    territoryModes[territory].add(deal.transportation_mode);
                  }
                });
              }
            });

            setTerritoryToModesMap(territoryModes);
            setTransportationModes(
              Array.from(modes).map((mode) => ({
                value: mode,
                label: mode,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching deals data:", error);
      }
    };

    fetchDealsData();
  }, []);

  /**
   * Combine all filter options
   */
  const filterOptions = useMemo(() => {
    return {
      salesReps,
      stages: [
        { value: "closed_won", label: "Closed Won" },
        { value: "closed_lost", label: "Closed Lost" },
      ],
      transportationModes,
    };
  }, [salesReps, transportationModes]);

  /**
   * Create filter configurations
   */
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: "salesRep",
        label: "Sales Rep",
        options: filterOptions.salesReps,
      },
      {
        id: "stage",
        label: "Stage",
        options: filterOptions.stages,
      },
      {
        id: "transportationMode",
        label: "Transportation Mode",
        options: filterOptions.transportationModes,
      },
    ],
    [filterOptions]
  );

  /**
   * Handle filter changes
   */
  const handleFilterChange = (filterId: string, value: string) => {
    if (!value) {
      // If empty value, remove the filter
      setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
      return;
    }

    // Find the filter config to get the label
    const filterConfig = filterConfigs.find((f) => f.id === filterId);
    if (!filterConfig) return;

    // Check if this filter is already active
    const existingFilterIndex = activeFilters.findIndex(
      (f) => f.id === filterId
    );

    if (existingFilterIndex >= 0) {
      // Update existing filter
      const updatedFilters = [...activeFilters];
      updatedFilters[existingFilterIndex] = {
        id: filterId,
        value,
        label: filterConfig.label,
      };
      setActiveFilters(updatedFilters);
    } else {
      // Add new filter
      setActiveFilters([
        ...activeFilters,
        {
          id: filterId,
          value,
          label: filterConfig.label,
        },
      ]);
    }
  };

  /**
   * Handle filter removal
   */
  const handleFilterRemove = (filter: ActiveFilter) => {
    setActiveFilters(
      activeFilters.filter(
        (f) => !(f.id === filter.id && f.value === filter.value)
      )
    );

    // If removing territory filter, also clear selectedTerritory
    if (filter.id === "territory") {
      setSelectedTerritory(null);
    }
  };

  /**
   * Clear all filters
   */
  const handleClearAllFilters = () => {
    setActiveFilters([]);
    setSelectedTerritory(null);
  };

  /**
   * Filter territory data based on active filters and search term
   */
  const filteredTerritoryData = useMemo(() => {
    if (!territoryData) return null;

    // If no filters and no search term, return original data
    if (activeFilters.length === 0 && !searchTerm) {
      return territoryData;
    }

    // Create a filtered copy of the territory data
    const filtered: Record<string, TerritoryStats> = {};

    // Process each territory
    Object.entries(territoryData).forEach(([territory, stats]) => {
      // Check if territory matches territory filter
      const territoryFilter = activeFilters.find((f) => f.id === "territory");
      if (territoryFilter && territoryFilter.value !== territory) {
        return;
      }

      // Check if any sales rep in this territory matches the sales rep filter
      const salesRepFilter = activeFilters.find((f) => f.id === "salesRep");
      if (salesRepFilter) {
        const hasMatchingRep = Object.keys(stats.repBreakdown).includes(
          salesRepFilter.value
        );
        if (!hasMatchingRep) {
          return;
        }
      }

      // Check for stage filter
      const stageFilter = activeFilters.find((f) => f.id === "stage");
      if (stageFilter) {
        // For stage filter, we need to check if this territory has deals in that stage
        // We can use the wins/losses data as a proxy for closed_won/closed_lost stages
        if (stageFilter.value === "closed_won" && stats.wins === 0) {
          return; // No closed_won deals in this territory
        }
        if (stageFilter.value === "closed_lost" && stats.losses === 0) {
          return; // No closed_lost deals in this territory
        }
      }

      // Check for transportation mode filter
      const transportationModeFilter = activeFilters.find(
        (f) => f.id === "transportationMode"
      );
      if (transportationModeFilter) {
        // Check if this territory has deals with the specified transportation mode
        const territoryModes = territoryToModesMap[territory];
        if (
          !territoryModes ||
          !territoryModes.has(transportationModeFilter.value)
        ) {
          return; // This territory doesn't have deals with the specified transportation mode
        }
      }

      // Check if territory name matches search term
      if (
        searchTerm &&
        !territory.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return;
      }

      // If all filters pass, include this territory in the filtered data
      filtered[territory] = stats;
    });

    return filtered;
  }, [territoryData, activeFilters, searchTerm, territoryToModesMap]);

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
    <div className="grid gap-4 sm:gap-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Filter Territories
        </h2>
        <FilterBar
          filters={filterConfigs}
          activeFilters={activeFilters}
          searchTerm={searchTerm}
          onFilterChange={handleFilterChange}
          onFilterRemove={handleFilterRemove}
          onClearAllFilters={handleClearAllFilters}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search territories..."
        />
      </div>

      {/* Territory Performance Overview Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Territory Performance Overview
        </h2>
        <TerritoryPerformanceOverview
          territoryData={filteredTerritoryData || {}}
          onTerritorySelect={handleTerritorySelect}
          selectedTerritory={selectedTerritory}
        />
      </div>

      {/* Territory Map Visualization Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Territory Map Visualization
        </h2>
        <TerritoryMapVisualization
          territoryData={filteredTerritoryData || {}}
          selectedTerritory={selectedTerritory}
        />
      </div>

      {/* Sales Rep Performance Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Sales Rep Performance by Territory
        </h2>
        <SalesRepPerformance
          territoryData={filteredTerritoryData || {}}
          selectedTerritory={selectedTerritory}
        />
      </div>

      {/* Territory Comparison Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Territory Comparison
        </h2>
        <TerritoryComparison territoryData={filteredTerritoryData || {}} />
      </div>
    </div>
  );
};

export default TerritoryDashboard;
