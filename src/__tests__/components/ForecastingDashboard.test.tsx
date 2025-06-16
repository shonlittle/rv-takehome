import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ForecastingDashboard from "../../components/ForecastingDashboard";

// Mock the child components
jest.mock("../../components/forecasting/RevenueForecasting", () => {
  return function MockRevenueForecasting() {
    return (
      <div data-testid="revenue-forecasting">
        <p>Mock Revenue Forecasting</p>
      </div>
    );
  };
});

jest.mock("../../components/forecasting/WinRateTrends", () => {
  return function MockWinRateTrends() {
    return (
      <div data-testid="win-rate-trends">
        <p>Mock Win Rate Trends</p>
      </div>
    );
  };
});

jest.mock("../../components/forecasting/DealVelocityMetrics", () => {
  return function MockDealVelocityMetrics() {
    return (
      <div data-testid="deal-velocity-metrics">
        <p>Mock Deal Velocity Metrics</p>
      </div>
    );
  };
});

jest.mock("../../components/forecasting/AtRiskDeals", () => {
  return function MockAtRiskDeals() {
    return (
      <div data-testid="at-risk-deals">
        <p>Mock At Risk Deals</p>
      </div>
    );
  };
});

describe("ForecastingDashboard", () => {
  it("renders the forecasting dashboard with all components", () => {
    render(<ForecastingDashboard />);

    // Check that the section headings are rendered
    expect(screen.getByText("3-Month Revenue Forecast")).toBeInTheDocument();
    expect(
      screen.getByText("Win Rate Trends by Transportation Mode")
    ).toBeInTheDocument();
    expect(screen.getByText("Deal Velocity Metrics")).toBeInTheDocument();
    expect(screen.getByText("At-Risk Deals")).toBeInTheDocument();

    // Check that all mock components are rendered
    expect(screen.getByTestId("revenue-forecasting")).toBeInTheDocument();
    expect(screen.getByTestId("win-rate-trends")).toBeInTheDocument();
    expect(screen.getByTestId("deal-velocity-metrics")).toBeInTheDocument();
    expect(screen.getByTestId("at-risk-deals")).toBeInTheDocument();
  });

  it("renders the dashboard with the correct layout", () => {
    render(<ForecastingDashboard />);

    // Check that the grid layout is applied
    const gridContainer = screen
      .getByText("3-Month Revenue Forecast")
      .closest("div")?.parentElement;
    expect(gridContainer).toHaveClass("grid");
    expect(gridContainer).toHaveClass("gap-6");
  });

  it("renders the dashboard with the correct section titles", () => {
    render(<ForecastingDashboard />);

    // Check for section titles
    expect(screen.getByText("3-Month Revenue Forecast")).toBeInTheDocument();
    expect(
      screen.getByText("Win Rate Trends by Transportation Mode")
    ).toBeInTheDocument();
    expect(screen.getByText("Deal Velocity Metrics")).toBeInTheDocument();
    expect(screen.getByText("At-Risk Deals")).toBeInTheDocument();
  });
});
