import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import TerritoryDashboard from "../../../components/territories/TerritoryDashboard";

// Mock the child components
jest.mock(
  "../../../components/territories/TerritoryPerformanceOverview",
  () => {
    return function MockTerritoryPerformanceOverview({
      // territoryData is received but not used in the mock
      selectedTerritory,
      onTerritorySelect,
    }: {
      territoryData: Record<
        string,
        {
          wins: number;
          losses: number;
          winRate: number;
          totalValue: number;
          repBreakdown: Record<string, { wins: number; losses: number }>;
        }
      >;
      selectedTerritory: string | null;
      onTerritorySelect: (territory: string) => void;
    }) {
      return (
        <div data-testid="territory-performance-overview">
          <p>Mock Territory Performance Overview</p>
          <p>Selected Territory: {selectedTerritory || "None"}</p>
          <button onClick={() => onTerritorySelect("Pacific")}>
            Select Pacific
          </button>
        </div>
      );
    };
  }
);

jest.mock("../../../components/territories/TerritoryMapVisualization", () => {
  return function MockTerritoryMapVisualization({
    // territoryData is received but not used in the mock
    selectedTerritory,
  }: {
    territoryData: Record<
      string,
      {
        wins: number;
        losses: number;
        winRate: number;
        totalValue: number;
        repBreakdown: Record<string, { wins: number; losses: number }>;
      }
    >;
    selectedTerritory: string | null;
  }) {
    return (
      <div data-testid="territory-map-visualization">
        <p>Mock Territory Map Visualization</p>
        <p>Selected Territory: {selectedTerritory || "None"}</p>
      </div>
    );
  };
});

jest.mock("../../../components/territories/SalesRepPerformance", () => {
  return function MockSalesRepPerformance({
    // territoryData is received but not used in the mock
    selectedTerritory,
  }: {
    territoryData: Record<
      string,
      {
        wins: number;
        losses: number;
        winRate: number;
        totalValue: number;
        repBreakdown: Record<string, { wins: number; losses: number }>;
      }
    >;
    selectedTerritory: string | null;
  }) {
    return (
      <div data-testid="sales-rep-performance">
        <p>Mock Sales Rep Performance</p>
        <p>Selected Territory: {selectedTerritory || "None"}</p>
      </div>
    );
  };
});

jest.mock("../../../components/territories/TerritoryComparison", () => {
  return function MockTerritoryComparison({}: // territoryData is received but not used in the mock
  {
    territoryData: Record<
      string,
      {
        wins: number;
        losses: number;
        winRate: number;
        totalValue: number;
        repBreakdown: Record<string, { wins: number; losses: number }>;
      }
    >;
  }) {
    return (
      <div data-testid="territory-comparison">
        <p>Mock Territory Comparison</p>
      </div>
    );
  };
});

// Mock fetch API
const mockTerritoryData = {
  Pacific: {
    wins: 30,
    losses: 10,
    winRate: 0.75,
    totalValue: 500000,
    repBreakdown: {
      "John Smith": { wins: 10, losses: 5 },
      "Jane Doe": { wins: 20, losses: 5 },
    },
  },
  Mountain: {
    wins: 24,
    losses: 16,
    winRate: 0.6,
    totalValue: 350000,
    repBreakdown: {
      "John Smith": { wins: 8, losses: 4 },
      "Alice Johnson": { wins: 16, losses: 12 },
    },
  },
};

describe("TerritoryDashboard", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  it("renders loading state initially", () => {
    // Mock fetch to return a pending promise
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TerritoryDashboard />);

    expect(screen.getByText("Loading territory data...")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    // Mock fetch to reject with an error
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch data")
    );

    render(<TerritoryDashboard />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load territory data/)
      ).toBeInTheDocument();
    });

    // Check that retry button is rendered
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders all territory components when data is loaded", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTerritoryData,
    });

    render(<TerritoryDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.queryByText("Loading territory data...")
      ).not.toBeInTheDocument();
    });

    // Check that all section headings are rendered
    expect(
      screen.getByText("Territory Performance Overview")
    ).toBeInTheDocument();
    expect(screen.getByText("Territory Map Visualization")).toBeInTheDocument();
    expect(
      screen.getByText("Sales Rep Performance by Territory")
    ).toBeInTheDocument();
    expect(screen.getByText("Territory Comparison")).toBeInTheDocument();

    // Check that all mock components are rendered
    expect(
      screen.getByTestId("territory-performance-overview")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("territory-map-visualization")
    ).toBeInTheDocument();
    expect(screen.getByTestId("sales-rep-performance")).toBeInTheDocument();
    expect(screen.getByTestId("territory-comparison")).toBeInTheDocument();
  });

  it("handles territory selection", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTerritoryData,
    });

    render(<TerritoryDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.queryByText("Loading territory data...")
      ).not.toBeInTheDocument();
    });

    // Initially, no territory should be selected
    expect(screen.getAllByText(/Selected Territory: None/).length).toBe(3);

    // Click the "Select Pacific" button in the mock TerritoryPerformanceOverview
    await act(async () => {
      screen.getByText("Select Pacific").click();
    });

    // After selection, all components should show "Pacific" as selected
    await waitFor(() => {
      const pacificElements = screen.getAllByText(
        /Selected Territory: Pacific/
      );
      expect(pacificElements.length).toBe(3);
    });
  });

  it("handles API response with non-OK status", async () => {
    // Mock fetch with non-OK response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<TerritoryDashboard />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load territory data/)
      ).toBeInTheDocument();
    });
  });
});
