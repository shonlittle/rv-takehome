import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import DealVelocityMetrics from "../../../components/forecasting/DealVelocityMetrics";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("DealVelocityMetrics", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockPipelineData = {
    totalDeals: 6,
    stageAnalytics: {
      prospect: {
        deals: [
          {
            id: 1,
            deal_id: "DEAL-001",
            company_name: "Acme Corp",
            stage: "prospect",
            created_date: "2025-06-01",
            updated_date: "2025-06-05", // 4 days
          },
          {
            id: 2,
            deal_id: "DEAL-002",
            company_name: "Beta Inc",
            stage: "prospect",
            created_date: "2025-06-02",
            updated_date: "2025-06-08", // 6 days
          },
        ],
        count: 2,
        percentage: 33.33,
      },
      qualified: {
        deals: [
          {
            id: 3,
            deal_id: "DEAL-003",
            company_name: "Gamma LLC",
            stage: "qualified",
            created_date: "2025-06-01",
            updated_date: "2025-06-11", // 10 days
          },
        ],
        count: 1,
        percentage: 16.67,
      },
      proposal: {
        deals: [
          {
            id: 4,
            deal_id: "DEAL-004",
            company_name: "Delta Co",
            stage: "proposal",
            created_date: "2025-06-05",
            updated_date: "2025-06-20", // 15 days
          },
        ],
        count: 1,
        percentage: 16.67,
      },
      negotiation: {
        deals: [
          {
            id: 5,
            deal_id: "DEAL-005",
            company_name: "Epsilon Ltd",
            stage: "negotiation",
            created_date: "2025-06-10",
            updated_date: "2025-06-30", // 20 days
          },
        ],
        count: 1,
        percentage: 16.67,
      },
      closed_won: {
        deals: [
          {
            id: 6,
            deal_id: "DEAL-006",
            company_name: "Zeta Corp",
            stage: "closed_won",
            created_date: "2025-06-15",
            updated_date: "2025-06-25", // 10 days
          },
        ],
        count: 1,
        percentage: 16.67,
      },
    },
  };

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DealVelocityMetrics />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<DealVelocityMetrics />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading velocity data/)
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when no data is available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalDeals: 0, stageAnalytics: {} }),
    } as Response);

    render(<DealVelocityMetrics />);

    await waitFor(() => {
      expect(
        screen.getByText("No velocity data available")
      ).toBeInTheDocument();
    });
  });

  it("displays velocity metrics correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<DealVelocityMetrics />);

    await waitFor(() => {
      expect(
        screen.getByText("Overall Average Time in Stage")
      ).toBeInTheDocument();
    });

    // Check that the stages are displayed
    expect(screen.getAllByText("prospect")[0]).toBeInTheDocument();
    expect(screen.getAllByText("qualified")[0]).toBeInTheDocument();
    expect(screen.getAllByText("proposal")[0]).toBeInTheDocument();
    expect(screen.getAllByText("negotiation")[0]).toBeInTheDocument();
    expect(screen.getAllByText("closed won")[0]).toBeInTheDocument();

    // Check the average days for each stage
    expect(screen.getAllByText("5.0 days")[0]).toBeInTheDocument(); // prospect: (4+6)/2 = 5
    expect(screen.getAllByText("10.0 days")[0]).toBeInTheDocument(); // qualified: 10
    expect(screen.getAllByText("15.0 days")[0]).toBeInTheDocument(); // proposal: 15
    expect(screen.getAllByText("20.0 days")[0]).toBeInTheDocument(); // negotiation: 20
    expect(screen.getAllByText("10.0 days")[0]).toBeInTheDocument(); // closed_won: 10

    // Check the overall average (should be the weighted average of all stages)
    // (5*2 + 10*1 + 15*1 + 20*1 + 10*1) / 6 = 10.83
    expect(screen.getAllByText("10.8 days")[0]).toBeInTheDocument();
  });

  it("handles API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<DealVelocityMetrics />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading velocity data/)
      ).toBeInTheDocument();
    });
  });

  it("displays the correct deal count for each stage", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<DealVelocityMetrics />);

    await waitFor(() => {
      expect(
        screen.getByText("Overall Average Time in Stage")
      ).toBeInTheDocument();
    });

    // Check the deal counts
    expect(screen.getAllByText("2 deals")[0]).toBeInTheDocument(); // prospect
    expect(screen.getAllByText("1 deals")[0]).toBeInTheDocument(); // qualified

    // Check the total deal count in the table
    expect(screen.getByText("6")).toBeInTheDocument(); // Total deals
  });
});
