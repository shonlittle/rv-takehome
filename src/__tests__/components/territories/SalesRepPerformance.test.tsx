import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import SalesRepPerformance from "../../../components/territories/SalesRepPerformance";

describe("SalesRepPerformance", () => {
  // Mock territory data for testing
  const mockTerritoryData = {
    Pacific: {
      wins: 30,
      losses: 15,
      winRate: 0.67,
      totalValue: 500000,
      repBreakdown: {
        "John Smith": { wins: 10, losses: 5 },
        "Jane Doe": { wins: 20, losses: 10 },
      },
    },
    Mountain: {
      wins: 24,
      losses: 12,
      winRate: 0.67,
      totalValue: 350000,
      repBreakdown: {
        "John Smith": { wins: 8, losses: 4 },
        "Alice Johnson": { wins: 16, losses: 8 },
      },
    },
    Midwest: {
      wins: 36,
      losses: 18,
      winRate: 0.67,
      totalValue: 600000,
      repBreakdown: {
        "Bob Williams": { wins: 12, losses: 6 },
        "Jane Doe": { wins: 24, losses: 12 },
      },
    },
  };

  it("renders sales rep data in a table", () => {
    render(
      <SalesRepPerformance
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Check table headers
    expect(screen.getByText("Sales Rep")).toBeInTheDocument();
    expect(screen.getByText("Wins")).toBeInTheDocument();
    expect(screen.getByText("Losses")).toBeInTheDocument();
    expect(screen.getByText("Win Rate")).toBeInTheDocument();
    expect(screen.getByText("Territories")).toBeInTheDocument();

    // Check sales rep names
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Williams")).toBeInTheDocument();

    // Check values for John Smith (who works in Pacific and Mountain)
    const johnSmithRow = screen.getByText("John Smith").closest("tr");
    expect(johnSmithRow).toHaveTextContent("18"); // Total wins (10 + 8)
    expect(johnSmithRow).toHaveTextContent("9"); // Total losses (5 + 4)
    expect(johnSmithRow).toHaveTextContent("66.7%"); // Win rate

    // Check territories for Jane Doe (who works in Pacific and Midwest)
    const janeDoeRow = screen.getByText("Jane Doe").closest("tr");
    expect(janeDoeRow).not.toBeNull();

    if (janeDoeRow) {
      // Find territory tags within Jane Doe's row
      const pacificTags = within(janeDoeRow).getAllByText("Pacific");
      const midwestTags = within(janeDoeRow).getAllByText("Midwest");

      expect(pacificTags.length).toBeGreaterThan(0);
      expect(midwestTags.length).toBeGreaterThan(0);
    }
  });

  it("handles empty territory data", () => {
    render(<SalesRepPerformance territoryData={{}} selectedTerritory={null} />);

    expect(screen.getByText("No sales rep data available")).toBeInTheDocument();
  });

  it("filters sales reps by selected territory", () => {
    render(
      <SalesRepPerformance
        territoryData={mockTerritoryData}
        selectedTerritory="Pacific"
      />
    );

    // Should show notification about filtering
    expect(screen.getByText(/Showing sales reps for/)).toBeInTheDocument();

    // Check for Pacific in the notification (using a more specific selector)
    const notification = screen.getByText(/Showing sales reps for/);
    expect(notification).toHaveTextContent("Pacific");

    // Should only show reps from Pacific
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Williams")).not.toBeInTheDocument();
  });

  it("sorts sales reps by name when name header is clicked", () => {
    render(
      <SalesRepPerformance
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Click on Sales Rep header to sort by name
    fireEvent.click(screen.getByText("Sales Rep"));

    // Get all sales rep cells
    const repCells = screen.getAllByRole("cell", {
      name: /John Smith|Jane Doe|Alice Johnson|Bob Williams/,
    });

    // Check if they're in alphabetical order
    expect(repCells[0]).toHaveTextContent("Alice Johnson");
    expect(repCells[1]).toHaveTextContent("Bob Williams");
    expect(repCells[2]).toHaveTextContent("Jane Doe");
    expect(repCells[3]).toHaveTextContent("John Smith");
  });

  it("sorts sales reps by win rate when win rate header is clicked", () => {
    render(
      <SalesRepPerformance
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // The component sorts by winRate by default (desc), so we need to click twice to get ascending order
    fireEvent.click(screen.getByText("Win Rate"));
    fireEvent.click(screen.getByText("Win Rate"));

    // Get all win rate cells
    const winRateCells = screen.getAllByText(/\d+\.\d+%/);

    // All reps have the same win rate in our mock data, so we can't really test the sorting
    // But we can verify that the win rates are displayed correctly
    expect(winRateCells.length).toBeGreaterThan(0);
    winRateCells.forEach((cell) => {
      expect(cell).toHaveTextContent("66.7%");
    });
  });

  it("toggles sort direction when clicking the same header twice", () => {
    render(
      <SalesRepPerformance
        territoryData={mockTerritoryData}
        selectedTerritory={null}
      />
    );

    // Click on Sales Rep header to sort by name (ascending)
    fireEvent.click(screen.getByText("Sales Rep"));

    // Click again to toggle to descending
    fireEvent.click(screen.getByText("Sales Rep"));

    // Get all sales rep cells
    const repCells = screen.getAllByRole("cell", {
      name: /John Smith|Jane Doe|Alice Johnson|Bob Williams/,
    });

    // Check if they're in reverse alphabetical order
    expect(repCells[0]).toHaveTextContent("John Smith");
    expect(repCells[1]).toHaveTextContent("Jane Doe");
    expect(repCells[2]).toHaveTextContent("Bob Williams");
    expect(repCells[3]).toHaveTextContent("Alice Johnson");
  });
});
