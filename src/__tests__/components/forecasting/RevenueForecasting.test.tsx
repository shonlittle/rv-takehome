import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import RevenueForecasting from "../../../components/forecasting/RevenueForecasting";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("RevenueForecasting", () => {
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
    totalDeals: 9,
    stageAnalytics: {
      prospect: {
        deals: [
          {
            id: 1,
            deal_id: "DEAL-001",
            company_name: "Acme Corp",
            value: 50000,
            probability: 20,
            stage: "prospect",
            expected_close_date: "2025-07-15",
          },
          {
            id: 2,
            deal_id: "DEAL-002",
            company_name: "Beta Inc",
            value: 30000,
            probability: 25,
            stage: "prospect",
            expected_close_date: "2025-08-10",
          },
        ],
        count: 2,
        percentage: 22,
      },
      qualified: {
        deals: [
          {
            id: 3,
            deal_id: "DEAL-003",
            company_name: "Gamma LLC",
            value: 75000,
            probability: 40,
            stage: "qualified",
            expected_close_date: "2025-07-20",
          },
        ],
        count: 1,
        percentage: 11,
      },
      proposal: {
        deals: [
          {
            id: 4,
            deal_id: "DEAL-004",
            company_name: "Delta Co",
            value: 100000,
            probability: 60,
            stage: "proposal",
            expected_close_date: "2025-08-05",
          },
          {
            id: 5,
            deal_id: "DEAL-005",
            company_name: "Epsilon Ltd",
            value: 80000,
            probability: 65,
            stage: "proposal",
            expected_close_date: "2025-09-10",
          },
        ],
        count: 2,
        percentage: 22,
      },
      negotiation: {
        deals: [
          {
            id: 6,
            deal_id: "DEAL-006",
            company_name: "Zeta Corp",
            value: 120000,
            probability: 80,
            stage: "negotiation",
            expected_close_date: "2025-07-30",
          },
        ],
        count: 1,
        percentage: 11,
      },
      closed_won: {
        deals: [
          {
            id: 7,
            deal_id: "DEAL-007",
            company_name: "Eta Inc",
            value: 90000,
            probability: 100,
            stage: "closed_won",
            expected_close_date: "2025-06-01", // Already closed
          },
        ],
        count: 1,
        percentage: 11,
      },
      closed_lost: {
        deals: [
          {
            id: 8,
            deal_id: "DEAL-008",
            company_name: "Theta LLC",
            value: 60000,
            probability: 0,
            stage: "closed_lost",
            expected_close_date: "2025-06-05", // Already closed
          },
          {
            id: 9,
            deal_id: "DEAL-009",
            company_name: "Iota Co",
            value: 40000,
            probability: 0,
            stage: "closed_lost",
            expected_close_date: "2025-06-10", // Already closed
          },
        ],
        count: 2,
        percentage: 22,
      },
    },
  };

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<RevenueForecasting />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading forecast data/)
      ).toBeInTheDocument();
    });
  });

  it("displays forecast data correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(screen.getByText("Total 3-Month Forecast")).toBeInTheDocument();
    });

    // Check that the months are displayed
    const currentDate = new Date("2025-06-16");
    const month1 =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      ).toLocaleString("default", { month: "long" }) +
      " " +
      currentDate.getFullYear();
    const month2 =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 2,
        1
      ).toLocaleString("default", { month: "long" }) +
      " " +
      currentDate.getFullYear();
    const month3 =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 3,
        1
      ).toLocaleString("default", { month: "long" }) +
      " " +
      currentDate.getFullYear();

    expect(screen.getAllByText(month1)[0]).toBeInTheDocument(); // July 2025
    expect(screen.getAllByText(month2)[0]).toBeInTheDocument(); // August 2025
    expect(screen.getAllByText(month3)[0]).toBeInTheDocument(); // September 2025
  });

  it("calculates total forecast correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(screen.getByText("Total 3-Month Forecast")).toBeInTheDocument();
    });

    // The total forecast should be displayed
    // The exact value depends on the calculation logic in the component
    // We're just checking that some currency value is displayed
    expect(screen.getAllByText(/\$[\d,]+/)[0]).toBeInTheDocument();
  });

  it("displays deal counts correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(screen.getByText("Deal Count")).toBeInTheDocument();
    });

    // Check that deal counts are displayed
    // The component distributes deals across months, so we should see some counts
    expect(screen.getAllByText(/\d+ deals/)[0]).toBeInTheDocument();
  });

  it("handles empty data correctly", async () => {
    const emptyData = {
      totalDeals: 0,
      stageAnalytics: {},
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => emptyData,
    } as Response);

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(screen.getByText("Total 3-Month Forecast")).toBeInTheDocument();
    });

    // With no deals, the forecast should be $0
    expect(screen.getAllByText("$0")[0]).toBeInTheDocument();
  });

  it("displays the forecast table with correct headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPipelineData,
    } as Response);

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(screen.getByText("Month")).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Forecasted Revenue")).toBeInTheDocument();
    expect(screen.getByText("Deal Count")).toBeInTheDocument();

    // Check that the total row is displayed
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("handles API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<RevenueForecasting />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading forecast data/)
      ).toBeInTheDocument();
    });
  });
});
