import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import TerritoryMapVisualization from "../../../components/territories/TerritoryMapVisualization";

// Mock the USMapVisualization component
jest.mock("../../../components/territories/USMapVisualization", () => {
  return function MockUSMapVisualization({
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
    onTerritorySelect: (territory: string) => void;
  }) {
    return (
      <div data-testid="us-map-visualization">
        <p>Mock US Map Visualization</p>
        <p>Selected Territory: {selectedTerritory || "None"}</p>
      </div>
    );
  };
});

describe("TerritoryMapVisualization", () => {
  // Mock territory data for testing
  const mockTerritoryData = {
    Pacific: {
      wins: 30,
      losses: 10,
      winRate: 0.75, // 75% - High performance (green)
      totalValue: 500000,
      repBreakdown: {
        "John Smith": { wins: 10, losses: 5 },
        "Jane Doe": { wins: 20, losses: 5 },
      },
    },
    Mountain: {
      wins: 24,
      losses: 16,
      winRate: 0.6, // 60% - Good performance (blue)
      totalValue: 350000,
      repBreakdown: {
        "John Smith": { wins: 8, losses: 4 },
        "Alice Johnson": { wins: 16, losses: 12 },
      },
    },
    Midwest: {
      wins: 12,
      losses: 28,
      winRate: 0.3, // 30% - Fair performance (yellow)
      totalValue: 600000,
      repBreakdown: {
        "Bob Williams": { wins: 6, losses: 14 },
        "Jane Doe": { wins: 6, losses: 14 },
      },
    },
    Northeast: {
      wins: 5,
      losses: 25,
      winRate: 0.17, // 17% - Low performance (red)
      totalValue: 200000,
      repBreakdown: {
        "Charlie Brown": { wins: 5, losses: 25 },
      },
    },
    Southeast: {
      wins: 40,
      losses: 10,
      winRate: 0.8, // 80% - High performance (green)
      totalValue: 700000,
      repBreakdown: {
        "David Miller": { wins: 40, losses: 10 },
      },
    },
  };

  it("renders the territory map visualization with mock data", () => {
    render(
      <TerritoryMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Check that the US Map Visualization is rendered
    expect(screen.getByTestId("us-map-visualization")).toBeInTheDocument();
    expect(screen.getByText("Mock US Map Visualization")).toBeInTheDocument();

    // Check that all regions are displayed
    expect(screen.getByText("Pacific")).toBeInTheDocument();
    expect(screen.getByText("Mountain")).toBeInTheDocument();
    expect(screen.getByText("Midwest")).toBeInTheDocument();
    expect(screen.getByText("Northeast")).toBeInTheDocument();
    expect(screen.getByText("Southeast")).toBeInTheDocument();

    // Check that the legend is displayed
    expect(screen.getByText("High (≥70%)")).toBeInTheDocument();
    expect(screen.getByText("Good (50-69%)")).toBeInTheDocument();
    expect(screen.getByText("Fair (30-49%)")).toBeInTheDocument();
    expect(screen.getByText("Low (<30%)")).toBeInTheDocument();
  });

  it("displays correct performance metrics for each territory", () => {
    render(
      <TerritoryMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Check Pacific metrics - find the parent div that contains all the metrics
    const pacificCell = screen.getByText("Pacific").closest(".rounded-lg");
    expect(pacificCell).not.toBeNull();
    expect(pacificCell).toHaveTextContent("75.0%"); // Win rate
    expect(pacificCell).toHaveTextContent("40"); // Total deals (30 + 10)
    expect(pacificCell).toHaveTextContent("$500,000"); // Total value

    // Check Mountain metrics
    const mountainCell = screen.getByText("Mountain").closest(".rounded-lg");
    expect(mountainCell).not.toBeNull();
    expect(mountainCell).toHaveTextContent("60.0%"); // Win rate
    expect(mountainCell).toHaveTextContent("40"); // Total deals (24 + 16)
    expect(mountainCell).toHaveTextContent("$350,000"); // Total value

    // Check Midwest metrics
    const midwestCell = screen.getByText("Midwest").closest(".rounded-lg");
    expect(midwestCell).not.toBeNull();
    expect(midwestCell).toHaveTextContent("30.0%"); // Win rate
    expect(midwestCell).toHaveTextContent("40"); // Total deals (12 + 28)
    expect(midwestCell).toHaveTextContent("$600,000"); // Total value
  });

  it("applies correct color coding based on win rates", () => {
    render(
      <TerritoryMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Pacific has 75% win rate - should have green styling
    const pacificCell = screen.getByText("Pacific").closest(".rounded-lg");
    expect(pacificCell).not.toBeNull();
    expect(pacificCell).toHaveClass("bg-green-100");
    expect(pacificCell).toHaveClass("border-green-500");

    // Mountain has 60% win rate - should have blue styling
    const mountainCell = screen.getByText("Mountain").closest(".rounded-lg");
    expect(mountainCell).not.toBeNull();
    expect(mountainCell).toHaveClass("bg-blue-100");
    expect(mountainCell).toHaveClass("border-blue-500");

    // Midwest has 30% win rate - should have yellow styling
    const midwestCell = screen.getByText("Midwest").closest(".rounded-lg");
    expect(midwestCell).not.toBeNull();
    expect(midwestCell).toHaveClass("bg-yellow-100");
    expect(midwestCell).toHaveClass("border-yellow-500");

    // Northeast has 17% win rate - should have red styling
    const northeastCell = screen.getByText("Northeast").closest(".rounded-lg");
    expect(northeastCell).not.toBeNull();
    expect(northeastCell).toHaveClass("bg-red-100");
    expect(northeastCell).toHaveClass("border-red-500");
  });

  it("highlights the selected territory", () => {
    render(
      <TerritoryMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory="Pacific"
      />
    );

    // Pacific should have the ring class for highlighting
    const pacificCell = screen.getByText("Pacific").closest(".rounded-lg");
    expect(pacificCell).not.toBeNull();
    expect(pacificCell).toHaveClass("ring-2");
    expect(pacificCell).toHaveClass("ring-blue-500");

    // Other territories should not have the ring class
    const mountainCell = screen.getByText("Mountain").closest(".rounded-lg");
    expect(mountainCell).not.toBeNull();
    expect(mountainCell).not.toHaveClass("ring-2");
    expect(mountainCell).not.toHaveClass("ring-blue-500");
  });

  it("displays state abbreviations for each region", () => {
    render(
      <TerritoryMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Check that state abbreviations are displayed
    expect(screen.getByText("CA, WA, OR")).toBeInTheDocument(); // Pacific
    expect(screen.getByText("CO, AZ, NM, UT")).toBeInTheDocument(); // Mountain
    expect(screen.getByText("IL, MN, MO")).toBeInTheDocument(); // Midwest
    expect(screen.getByText("NY, MA")).toBeInTheDocument(); // Northeast
    expect(screen.getByText("FL, GA")).toBeInTheDocument(); // Southeast
  });

  it("handles territories with no data", () => {
    // Create a copy of the mock data without the "Other" territory
    const partialData = { ...mockTerritoryData };

    render(
      <TerritoryMapVisualization
        territoryData={partialData}
        selectedTerritory={null}
      />
    );

    // The "Other" region should still be displayed but with default values
    const otherCell = screen.getByText("Other").closest(".rounded-lg");
    expect(otherCell).not.toBeNull();
    expect(otherCell).toBeInTheDocument();
    expect(otherCell).toHaveTextContent("0.0%"); // Default win rate
    expect(otherCell).toHaveTextContent("0"); // Default total deals
    expect(otherCell).toHaveTextContent("$0"); // Default total value
  });
});
