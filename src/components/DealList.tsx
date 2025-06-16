"use client";
import React, { useEffect, useMemo, useState } from "react";
import FilterBar, { ActiveFilter, FilterConfig } from "./common/FilterBar";

interface Deal {
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

interface PipelineData {
  totalDeals: number;
  stageAnalytics: Record<
    string,
    { deals: Deal[]; count: number; percentage: number }
  >;
}

type SortField = keyof Deal;
type SortDirection = "asc" | "desc";

const DealList: React.FC = () => {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error("Failed to fetch deals");
        }
        const data = await response.json();
        setPipelineData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Flatten all deals from all stages
  const allDeals = useMemo(() => {
    if (!pipelineData) return [];

    const deals: Deal[] = [];
    Object.values(pipelineData.stageAnalytics).forEach((stageData) => {
      deals.push(...stageData.deals);
    });
    return deals;
  }, [pipelineData]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    if (!allDeals.length)
      return {
        stages: [],
        salesReps: [],
        transportationModes: [],
        territories: [],
      };

    const stages = [...new Set(allDeals.map((deal) => deal.stage))].map(
      (value) => ({
        value,
        label: value.replace(/_/g, " "),
      })
    );

    const salesReps = [...new Set(allDeals.map((deal) => deal.sales_rep))].map(
      (value) => ({
        value,
        label: value,
      })
    );

    const transportationModes = [
      ...new Set(allDeals.map((deal) => deal.transportation_mode)),
    ].map((value) => ({
      value,
      label: value,
    }));

    // Extract territories from origin_city
    const territories = [
      ...new Set(
        allDeals.map((deal) => {
          const match = deal.origin_city.match(/,\s*([A-Z]{2})$/);
          return match ? match[1] : "Other";
        })
      ),
    ].map((value) => ({
      value,
      label: value,
    }));

    return { stages, salesReps, transportationModes, territories };
  }, [allDeals]);

  // Create filter configurations
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: "stage",
        label: "Stage",
        options: filterOptions.stages,
      },
      {
        id: "salesRep",
        label: "Sales Rep",
        options: filterOptions.salesReps,
      },
      {
        id: "transportationMode",
        label: "Transportation Mode",
        options: filterOptions.transportationModes,
      },
      {
        id: "territory",
        label: "Territory",
        options: filterOptions.territories,
      },
    ],
    [filterOptions]
  );

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string) => {
    if (!value) {
      // If empty value, remove the filter
      setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
      return;
    }

    // Find the filter config to get the label
    const filterConfig = filterConfigs.find((f) => f.id === filterId);
    if (!filterConfig) return;

    // Find the option to get its label
    const option = filterConfig.options.find((o) => o.value === value);
    if (!option) return;

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

  // Handle filter removal
  const handleFilterRemove = (filter: ActiveFilter) => {
    setActiveFilters(
      activeFilters.filter(
        (f) => !(f.id === filter.id && f.value === filter.value)
      )
    );
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setActiveFilters([]);
  };

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    console.log("Running filter with active filters:", activeFilters);

    // First filter by search term
    const searchFiltered = allDeals.filter(
      (deal) =>
        deal.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.deal_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then apply active filters
    let filtered = searchFiltered;

    if (activeFilters.length > 0) {
      filtered = searchFiltered.filter((deal) => {
        // Check each active filter
        return activeFilters.every((filter) => {
          let result = false;

          switch (filter.id) {
            case "stage":
              result = deal.stage === filter.value;
              console.log(
                `Deal ${deal.deal_id} - Stage filter: ${filter.value}, Deal stage: ${deal.stage}, Match: ${result}`
              );
              break;
            case "salesRep":
              result = deal.sales_rep === filter.value;
              break;
            case "transportationMode":
              result = deal.transportation_mode === filter.value;
              break;
            case "territory": {
              const match = deal.origin_city.match(/,\s*([A-Z]{2})$/);
              const state = match ? match[1] : "Other";
              result = state === filter.value;
              break;
            }
            default:
              result = true;
          }

          return result;
        });
      });
    }

    // Log filtering for debugging
    console.log("Active filters:", activeFilters);
    console.log("Filtered deals:", filtered.length);
    console.log("All deals:", allDeals.length);

    if (activeFilters.length > 0) {
      console.log(
        "Filter values:",
        activeFilters.map((f) => `${f.id}: ${f.value}`).join(", ")
      );
      console.log(
        "Sample deal stages:",
        allDeals.slice(0, 3).map((d) => d.stage)
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (bValue === undefined) return sortDirection === "asc" ? 1 : -1;

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [allDeals, searchTerm, sortField, sortDirection, activeFilters]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageColor = (stage: string) => {
    const colors = {
      prospect: "bg-blue-100 text-blue-800",
      qualified: "bg-green-100 text-green-800",
      proposal: "bg-yellow-100 text-yellow-800",
      negotiation: "bg-orange-100 text-orange-800",
      closed_won: "bg-emerald-100 text-emerald-800",
      closed_lost: "bg-red-100 text-red-800",
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading deals: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="space-y-2">
        <FilterBar
          filters={filterConfigs}
          activeFilters={activeFilters}
          searchTerm={searchTerm}
          onFilterChange={handleFilterChange}
          onFilterRemove={handleFilterRemove}
          onClearAllFilters={handleClearAllFilters}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search company names..."
        />
        <div className="text-sm text-gray-600 text-right">
          Showing {filteredAndSortedDeals.length} of {allDeals.length} deals
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "deal_id", label: "Deal ID" },
                { key: "company_name", label: "Company" },
                { key: "contact_name", label: "Contact" },
                { key: "stage", label: "Stage" },
                { key: "transportation_mode", label: "Mode" },
                { key: "value", label: "Value" },
                { key: "probability", label: "Probability" },
                { key: "sales_rep", label: "Sales Rep" },
                { key: "expected_close_date", label: "Expected Close" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(key as SortField)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {sortField === key && (
                      <span className="text-blue-500">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {deal.deal_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.contact_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(
                      deal.stage
                    )}`}
                  >
                    {deal.stage.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {deal.transportation_mode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(deal.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.probability}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.sales_rep}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(deal.expected_close_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedDeals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No deals found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default DealList;
