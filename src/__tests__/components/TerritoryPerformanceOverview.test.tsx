import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import TerritoryPerformanceOverview from "../../components/territories/TerritoryPerformanceOverview";

describe("TerritoryPerformanceOverview", () => {
  // Mock territory data for testing
  const mockTerritoryData = {
    Pacific: {
      wins: 10,
      losses: 5,
      winRate: 0.67,
      totalValue: 500000,
      repBreakdown: {},
    },
    Mountain: {
      wins: 8,
      losses: 4,
      winRate: 0.67,
      totalValue: 350000,
      repBreakdown: {},
    },
    Midwest: {
      wins: 12,
      losses: 6,
      winRate: 0.67,
      totalValue: 600000,
      repBreakdown: {},
    },
  };

  const mockOnTerritorySelect = jest.fn();

  beforeEach(() => {
    mockOnTerritorySelect.mockClear();
  });

  it("renders territory data in a table", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={mockTerritoryData}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory={null}
      />
    );

    // Check table headers
    expect(screen.getByText("Territory")).toBeInTheDocument();
    expect(screen.getByText("Wins")).toBeInTheDocument();
    expect(screen.getByText("Losses")).toBeInTheDocument();
    expect(screen.getByText("Win Rate")).toBeInTheDocument();
    expect(screen.getByText("Total Value")).toBeInTheDocument();

    // Check territory names
    expect(screen.getByText("Pacific")).toBeInTheDocument();
    expect(screen.getByText("Mountain")).toBeInTheDocument();
    expect(screen.getByText("Midwest")).toBeInTheDocument();

    // Check values
    expect(screen.getByText("10")).toBeInTheDocument(); // Pacific wins
    expect(screen.getByText("5")).toBeInTheDocument(); // Pacific losses
    expect(screen.getAllByText("67.0%")[0]).toBeInTheDocument(); // Win rate
    expect(screen.getByText("$500,000")).toBeInTheDocument(); // Pacific total value
  });

  it("handles empty territory data", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={{}}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory={null}
      />
    );

    expect(screen.getByText("No territory data available")).toBeInTheDocument();
  });

  it("highlights selected territory", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={mockTerritoryData}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory="Pacific"
      />
    );

    // Find the row with Pacific and check if it has the bg-blue-50 class
    const pacificRow = screen.getByText("Pacific").closest("tr");
    expect(pacificRow).toHaveClass("bg-blue-50");
  });

  it("calls onTerritorySelect when a territory row is clicked", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={mockTerritoryData}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory={null}
      />
    );

    // Click on Pacific row
    fireEvent.click(screen.getByText("Pacific"));

    expect(mockOnTerritorySelect).toHaveBeenCalledWith("Pacific");
  });

  it("sorts territories by name when territory header is clicked", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={mockTerritoryData}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory={null}
      />
    );

    // Initially sorted by totalValue (default)
    const rows = screen.getAllByRole("row");
    // Header row + 3 data rows
    expect(rows.length).toBe(4);

    // Click on Territory header to sort by name
    fireEvent.click(screen.getByText("Territory"));

    // Get all territory cells (first cell in each row, excluding header)
    const territoryCells = screen.getAllByRole("cell", {
      name: /Pacific|Mountain|Midwest/,
    });

    // Check if they're in alphabetical order
    expect(territoryCells[0]).toHaveTextContent("Midwest");
    expect(territoryCells[1]).toHaveTextContent("Mountain");
    expect(territoryCells[2]).toHaveTextContent("Pacific");
  });

  it("sorts territories by total value when value header is clicked", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={mockTerritoryData}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory={null}
      />
    );

    // Click on Total Value header
    fireEvent.click(screen.getByText("Total Value"));

    // The component sorts by totalValue by default, so we need to click again to ensure descending order
    fireEvent.click(screen.getByText("Total Value"));

    // Get all value cells again after re-sorting
    const sortedValueCells = screen.getAllByText(/\$[0-9,]+/);

    // Check if they're in descending order by value
    expect(sortedValueCells[0]).toHaveTextContent("$600,000"); // Midwest
    expect(sortedValueCells[1]).toHaveTextContent("$500,000"); // Pacific
    expect(sortedValueCells[2]).toHaveTextContent("$350,000"); // Mountain
  });

  it("toggles sort direction when clicking the same header twice", () => {
    render(
      <TerritoryPerformanceOverview
        territoryData={mockTerritoryData}
        onTerritorySelect={mockOnTerritorySelect}
        selectedTerritory={null}
      />
    );

    // Click on Total Value header three times
    // First click: Set sort field to totalValue (descending by default)
    // Second click: Toggle to ascending
    // Third click: Toggle back to descending
    fireEvent.click(screen.getByText("Total Value"));
    fireEvent.click(screen.getByText("Total Value"));
    fireEvent.click(screen.getByText("Total Value"));

    // Get all value cells after sorting
    const sortedValueCells = screen.getAllByText(/\$[0-9,]+/);

    // Check if they're in ascending order by value
    expect(sortedValueCells[0]).toHaveTextContent("$350,000"); // Mountain
    expect(sortedValueCells[1]).toHaveTextContent("$500,000"); // Pacific
    expect(sortedValueCells[2]).toHaveTextContent("$600,000"); // Midwest
  });
});
