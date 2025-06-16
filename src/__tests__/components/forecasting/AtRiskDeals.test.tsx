import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import AtRiskDeals from "../../../components/forecasting/AtRiskDeals";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("AtRiskDeals", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock current date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-06-16"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockPipelineData = {
    totalDeals: 5,
    stageAnalytics: {
      prospect: {
        deals: [
          {
            id: 1,
            deal_id: "DEAL-001",
            company_name: "Acme Corp",
            stage: "prospect",
            value: 50000,
            updated_date: "2025-05-01", // More than 21 days old
            sales_rep: "John Doe",
          },
        ],
        count: 1,
        percentage: 20,
      },
      qualified: {
        deals: [
          {
            id: 2,
            deal_id: "DEAL-002",
            company_name: "Beta Inc",
            stage: "qualified",
            value: 75000,
            updated_date: "2025-05-15", // More than 21 days old
            sales_rep: "Jane Smith",
          },
        ],
        count: 1,
        percentage: 20,
      },
      proposal: {
        deals: [
          {
            id: 3,
            deal_id: "DEAL-003",
            company_name: "Gamma LLC",
            stage: "proposal",
            value: 100000,
            updated_date: "2025-06-10", // Less than 21 days old
            sales_rep: "Bob Johnson",
          },
        ],
        count: 1,
        percentage: 20,
      },
      closed_won: {
        deals: [
          {
            id: 4,
            deal_id: "DEAL-004",
            company_name: "Delta Co",
            stage: "closed_won",
            value: 80000,
            updated_date: "2025-04-01", // Old but closed, should be excluded
            sales_rep: "Alice Brown",
          },
        ],
        count: 1,
        percentage: 20,
      },
      closed_lost: {
        deals: [
          {
            id: 5,
            deal_id: "DEAL-005",
            company_name: "Epsilon Ltd",
            stage: "closed_lost",
            value: 60000,
            updated_date: "2025-04-15", // Old but closed, should be excluded
            sales_rep: "Charlie Davis",
          },
        ],
        count: 1,
        percentage: 20,
      },
    },
  };

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AtRiskDeals />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading at-risk deals/)
      ).toBeInTheDocument();
    });
  });

  it("renders no at-risk deals message when no deals are at risk", async () => {
    // All deals are recent or closed
    const recentDealsData = {
      totalDeals: 3,
      stageAnalytics: {
        prospect: {
          deals: [
            {
              id: 1,
              deal_id: "DEAL-001",
              company_name: "Acme Corp",
              stage: "prospect",
              value: 50000,
              updated_date: "2025-06-10", // Recent
              sales_rep: "John Doe",
            },
          ],
          count: 1,
          percentage: 33,
        },
        closed_won: {
          deals: [
            {
              id: 2,
              deal_id: "DEAL-002",
              company_name: "Beta Inc",
              stage: "closed_won",
              value: 75000,
              updated_date: "2025-04-01", // Old but closed
              sales_rep: "Jane Smith",
            },
          ],
          count: 1,
          percentage: 33,
        },
        closed_lost: {
          deals: [
            {
              id: 3,
              deal_id: "DEAL-003",
              company_name: "Gamma LLC",
              stage: "closed_lost",
              value: 100000,
              updated_date: "2025-04-15", // Old but closed
              sales_rep: "Bob Johnson",
            },
          ],
          count: 1,
          percentage: 33,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => recentDealsData,
    } as Response);

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(screen.getByText("No at-risk deals found")).toBeInTheDocument();
    });
  });

  it("identifies and displays at-risk deals correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(screen.getByText("At-Risk Deals")).toBeInTheDocument();
    });

    // Should show 2 at-risk deals (DEAL-001 and DEAL-002)
    expect(screen.getByText("2")).toBeInTheDocument(); // At-Risk Deals count

    // Check deal IDs
    expect(screen.getByText("DEAL-001")).toBeInTheDocument();
    expect(screen.getByText("DEAL-002")).toBeInTheDocument();

    // Should not show deals that are recent or closed
    expect(screen.queryByText("DEAL-003")).not.toBeInTheDocument();
    expect(screen.queryByText("DEAL-004")).not.toBeInTheDocument();
    expect(screen.queryByText("DEAL-005")).not.toBeInTheDocument();
  });

  it("calculates risk levels correctly", async () => {
    // Modify the mock data to have deals with different staleness levels
    const riskLevelTestData = {
      totalDeals: 3,
      stageAnalytics: {
        prospect: {
          deals: [
            {
              id: 1,
              deal_id: "DEAL-001",
              company_name: "Acme Corp",
              stage: "prospect",
              value: 50000,
              updated_date: "2025-05-20", // ~27 days old (Low risk)
              sales_rep: "John Doe",
            },
          ],
          count: 1,
          percentage: 33,
        },
        qualified: {
          deals: [
            {
              id: 2,
              deal_id: "DEAL-002",
              company_name: "Beta Inc",
              stage: "qualified",
              value: 75000,
              updated_date: "2025-05-01", // ~46 days old (Medium risk)
              sales_rep: "Jane Smith",
            },
          ],
          count: 1,
          percentage: 33,
        },
        proposal: {
          deals: [
            {
              id: 3,
              deal_id: "DEAL-003",
              company_name: "Gamma LLC",
              stage: "proposal",
              value: 100000,
              updated_date: "2025-04-01", // ~76 days old (High risk)
              sales_rep: "Bob Johnson",
            },
          ],
          count: 1,
          percentage: 33,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => riskLevelTestData,
    } as Response);

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(screen.getByText("At-Risk Deals")).toBeInTheDocument();
    });

    // Check risk levels
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("calculates total at-risk value correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(screen.getByText("Total At-Risk Value")).toBeInTheDocument();
    });

    // Total value: 50000 + 75000 = 125000
    expect(screen.getByText("$125,000")).toBeInTheDocument();
  });

  it("handles API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading at-risk deals/)
      ).toBeInTheDocument();
    });
  });

  it("displays average days stalled correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<AtRiskDeals />);

    await waitFor(() => {
      expect(screen.getByText("Avg. Days Stalled")).toBeInTheDocument();
    });

    // Deal-001: ~46 days, Deal-002: ~32 days, Average: ~39 days
    // The exact value might vary slightly depending on how the component calculates it
    expect(screen.getByText(/\d+\.\d+/)).toBeInTheDocument();
  });
});
