import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import WinRateTrends from "../../../components/forecasting/WinRateTrends";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("WinRateTrends", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockWinRateData = {
    byTransportationMode: {
      air: {
        wins: 15,
        losses: 5,
        winRate: 0.75, // 75%
      },
      sea: {
        wins: 20,
        losses: 10,
        winRate: 0.667, // 66.7%
      },
      rail: {
        wins: 8,
        losses: 12,
        winRate: 0.4, // 40%
      },
      road: {
        wins: 30,
        losses: 10,
        winRate: 0.75, // 75%
      },
    },
    bySalesRep: {
      // Not used in the component currently, but included for completeness
      "John Doe": {
        wins: 25,
        losses: 15,
        winRate: 0.625,
      },
      "Jane Smith": {
        wins: 48,
        losses: 22,
        winRate: 0.686,
      },
    },
  };

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<WinRateTrends />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<WinRateTrends />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading win rate data/)
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when no data is available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ byTransportationMode: {}, bySalesRep: {} }),
    } as Response);

    render(<WinRateTrends />);

    await waitFor(() => {
      expect(
        screen.getByText("No win rate data available")
      ).toBeInTheDocument();
    });
  });

  it("displays win rate trends correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWinRateData,
    } as Response);

    render(<WinRateTrends />);

    await waitFor(() => {
      expect(screen.getByText("Transportation Modes")).toBeInTheDocument();
    });

    // Check that the transportation modes are displayed
    expect(screen.getAllByText("air")[0]).toBeInTheDocument();
    expect(screen.getAllByText("sea")[0]).toBeInTheDocument();
    expect(screen.getAllByText("rail")[0]).toBeInTheDocument();
    expect(screen.getAllByText("road")[0]).toBeInTheDocument();

    // Check the win rates for each mode
    expect(screen.getAllByText("75.0%")[0]).toBeInTheDocument(); // air
    expect(screen.getAllByText("66.7%")[0]).toBeInTheDocument(); // sea
    expect(screen.getAllByText("40.0%")[0]).toBeInTheDocument(); // rail
    // road also has 75.0% but we already checked for that with air

    // Check the total number of transportation modes
    expect(screen.getByText("4")).toBeInTheDocument(); // 4 transportation modes

    // Check the highest win rate (air and road both have 75%)
    const highestWinRateElements = screen.getAllByText("75.0%");
    expect(highestWinRateElements.length).toBeGreaterThan(0);

    // Check the lowest win rate (rail with 40%)
    expect(screen.getAllByText("40.0%")[0]).toBeInTheDocument();
  });

  it("handles API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<WinRateTrends />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading win rate data/)
      ).toBeInTheDocument();
    });
  });

  it("displays the correct win/loss counts for each mode", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWinRateData,
    } as Response);

    render(<WinRateTrends />);

    await waitFor(() => {
      expect(screen.getByText("Transportation Modes")).toBeInTheDocument();
    });

    // Check the win/loss counts
    expect(screen.getByText("15 wins /5 losses")).toBeInTheDocument(); // air
    expect(screen.getByText("20 wins /10 losses")).toBeInTheDocument(); // sea
    expect(screen.getByText("8 wins /12 losses")).toBeInTheDocument(); // rail
    expect(screen.getByText("30 wins /10 losses")).toBeInTheDocument(); // road

    // Check the total deals in the table
    expect(screen.getAllByText("20")[0]).toBeInTheDocument(); // air: 15 + 5 = 20
    expect(screen.getAllByText("30")[0]).toBeInTheDocument(); // sea: 20 + 10 = 30
    expect(screen.getAllByText("40")[0]).toBeInTheDocument(); // road: 30 + 10 = 40
  });

  it("displays the highest and lowest win rates correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWinRateData,
    } as Response);

    render(<WinRateTrends />);

    await waitFor(() => {
      expect(screen.getByText("Highest Win Rate")).toBeInTheDocument();
      expect(screen.getByText("Lowest Win Rate")).toBeInTheDocument();
    });

    // The highest win rate should be 75.0% (air or road)
    const highestWinRateSection = screen
      .getByText("Highest Win Rate")
      .closest("div");
    expect(highestWinRateSection).toHaveTextContent("75.0%");

    // The lowest win rate should be 40.0% (rail)
    const lowestWinRateSection = screen
      .getByText("Lowest Win Rate")
      .closest("div");
    expect(lowestWinRateSection).toHaveTextContent("40.0%");
    expect(lowestWinRateSection).toHaveTextContent("rail");
  });
});
