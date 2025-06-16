import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import USMapVisualization from "../../../components/territories/USMapVisualization";

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock D3 and topojson
jest.mock("d3", () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      remove: jest.fn(),
    })),
    append: jest.fn(() => ({
      attr: jest.fn(() => ({
        attr: jest.fn(() => ({
          attr: jest.fn(() => ({
            attr: jest.fn(() => ({
              attr: jest.fn(() => ({
                attr: jest.fn(() => ({
                  attr: jest.fn(() => ({
                    classed: jest.fn(() => ({
                      on: jest.fn(() => ({
                        on: jest.fn(() => ({
                          on: jest.fn(),
                        })),
                      })),
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
    })),
    attr: jest.fn(() => ({
      attr: jest.fn(() => ({
        attr: jest.fn(() => ({
          attr: jest.fn(),
        })),
      })),
    })),
  })),
  geoAlbersUsa: jest.fn(() => ({
    fitSize: jest.fn(() => ({})),
  })),
  geoPath: jest.fn(() => ({
    projection: jest.fn(() => ({})),
  })),
}));

jest.mock("topojson-client", () => ({
  feature: jest.fn(() => ({
    features: [],
  })),
}));

describe("USMapVisualization", () => {
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

  const mockOnTerritorySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the map container and SVG", () => {
    render(
      <USMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
        onTerritorySelect={mockOnTerritorySelect}
      />
    );

    // Check that the SVG element is rendered
    const svgElement = screen.getByText("", { selector: "svg" });
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass("w-full");
  });

  it("renders the tooltip container", () => {
    render(
      <USMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
        onTerritorySelect={mockOnTerritorySelect}
      />
    );

    // Check that the tooltip container is rendered
    const tooltipContainer = screen.getByText("", {
      selector: "div.absolute.hidden",
    });
    expect(tooltipContainer).toBeInTheDocument();
    expect(tooltipContainer).toHaveClass("hidden");
  });

  it("fetches map data on mount", () => {
    render(
      <USMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory={null}
        onTerritorySelect={mockOnTerritorySelect}
      />
    );

    // Check that fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith("/data/us-states.json");
  });

  it("renders with selected territory", () => {
    render(
      <USMapVisualization
        territoryData={mockTerritoryData}
        selectedTerritory="Pacific"
        onTerritorySelect={mockOnTerritorySelect}
      />
    );

    // Just checking that it renders without errors
    const svgElement = screen.getByText("", { selector: "svg" });
    expect(svgElement).toBeInTheDocument();
  });
});
