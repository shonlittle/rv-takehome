import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import TerritoryComparison from "../../../components/territories/TerritoryComparison";

describe("TerritoryComparison", () => {
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
        "Charlie Brown": { wins: 0, losses: 0 },
      },
    },
  };

  it("renders territory comparison with default metric (win rate)", () => {
    render(<TerritoryComparison territoryData={mockTerritoryData} />);

    // Check that the component renders with the default metric
    expect(screen.getByText(/Compare territories by:/)).toBeInTheDocument();
    expect(screen.getByText("Win Rate")).toBeInTheDocument();

    // Check that all territories are displayed
    expect(screen.getByText("Pacific")).toBeInTheDocument();
    expect(screen.getByText("Mountain")).toBeInTheDocument();
    expect(screen.getByText("Midwest")).toBeInTheDocument();

    // Check that win rates are displayed correctly
    expect(screen.getAllByText("67.0%").length).toBe(3); // All territories have 67.0% win rate
  });

  it("handles empty territory data", () => {
    render(<TerritoryComparison territoryData={{}} />);

    expect(
      screen.getByText("No territory data available for comparison")
    ).toBeInTheDocument();
  });

  it("changes the comparison metric when dropdown is changed", () => {
    render(<TerritoryComparison territoryData={mockTerritoryData} />);

    // Change metric to Total Value
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "totalValue" },
    });

    // Check that the metric display name is updated
    expect(
      screen.getByText(/Compare territories by: Total Value/)
    ).toBeInTheDocument();

    // Check that values are formatted as currency
    expect(screen.getByText("$600,000")).toBeInTheDocument(); // Midwest
    expect(screen.getByText("$500,000")).toBeInTheDocument(); // Pacific
    expect(screen.getByText("$350,000")).toBeInTheDocument(); // Mountain
  });

  it("changes the comparison metric to Total Deals", () => {
    render(<TerritoryComparison territoryData={mockTerritoryData} />);

    // Change metric to Total Deals
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "totalDeals" },
    });

    // Check that the metric display name is updated
    expect(
      screen.getByText(/Compare territories by: Total Deals/)
    ).toBeInTheDocument();

    // Check that values are displayed correctly
    expect(screen.getByText("54")).toBeInTheDocument(); // Midwest: 36 + 18 = 54
    expect(screen.getByText("45")).toBeInTheDocument(); // Pacific: 30 + 15 = 45
    expect(screen.getByText("36")).toBeInTheDocument(); // Mountain: 24 + 12 = 36
  });

  it("changes the comparison metric to Sales Reps", () => {
    render(<TerritoryComparison territoryData={mockTerritoryData} />);

    // Change metric to Number of Sales Reps
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "reps" },
    });

    // Check that the metric display name is updated
    expect(
      screen.getByText(/Compare territories by: Sales Reps/)
    ).toBeInTheDocument();

    // Check that values are displayed correctly
    expect(screen.getByText("3")).toBeInTheDocument(); // Midwest: 3 reps

    // Use getAllByText for elements that appear multiple times
    const repCountElements = screen.getAllByText("2");
    expect(repCountElements.length).toBe(2); // Pacific and Mountain both have 2 reps
  });

  it("sorts territories by the selected metric", () => {
    render(<TerritoryComparison territoryData={mockTerritoryData} />);

    // Change metric to Total Value
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "totalValue" },
    });

    // Get all territory names in the order they appear
    const territoryElements = screen.getAllByText(/Pacific|Mountain|Midwest/);

    // Check if they're sorted by total value (descending)
    expect(territoryElements[0]).toHaveTextContent("Midwest"); // $600,000
    expect(territoryElements[1]).toHaveTextContent("Pacific"); // $500,000
    expect(territoryElements[2]).toHaveTextContent("Mountain"); // $350,000
  });

  it("displays bars with correct widths based on metric values", () => {
    render(<TerritoryComparison territoryData={mockTerritoryData} />);

    // Change metric to Total Value
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "totalValue" },
    });

    // Get all bar elements
    const barElements = document.querySelectorAll(".bg-green-500");

    // Check that we have the right number of bars
    expect(barElements.length).toBe(3);

    // Check that the bars have the correct width styles
    // Midwest has the highest value, so it should be 100%
    expect(barElements[0]).toHaveStyle("width: 100%");

    // Pacific has 500000/600000 = 83.33% of Midwest's value
    const pacificWidth = parseFloat(
      (barElements[1] as HTMLElement).style.width
    );
    expect(pacificWidth).toBeGreaterThan(80);
    expect(pacificWidth).toBeLessThan(85);

    // Mountain has 350000/600000 = 58.33% of Midwest's value
    const mountainWidth = parseFloat(
      (barElements[2] as HTMLElement).style.width
    );
    expect(mountainWidth).toBeGreaterThan(55);
    expect(mountainWidth).toBeLessThan(60);
  });
});
