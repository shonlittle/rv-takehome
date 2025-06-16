import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import PipelineDashboard from "../../components/PipelineDashboard";

// Mock the child components
jest.mock("../../components/PipelineFunnel", () => {
  return function MockPipelineFunnel() {
    return (
      <div data-testid="pipeline-funnel">
        <p>Mock Pipeline Funnel</p>
      </div>
    );
  };
});

jest.mock("../../components/PerformanceMetrics", () => {
  return function MockPerformanceMetrics() {
    return (
      <div data-testid="performance-metrics">
        <p>Mock Performance Metrics</p>
      </div>
    );
  };
});

jest.mock("../../components/DealList", () => {
  return function MockDealList() {
    return (
      <div data-testid="deal-list">
        <p>Mock Deal List</p>
      </div>
    );
  };
});

describe("PipelineDashboard", () => {
  it("renders the pipeline dashboard with all components", () => {
    render(<PipelineDashboard />);

    // Check that the section headings are rendered
    expect(screen.getByText("Pipeline Overview")).toBeInTheDocument();
    expect(screen.getByText("Performance Metrics")).toBeInTheDocument();
    expect(screen.getByText("Deal List")).toBeInTheDocument();

    // Check that all mock components are rendered
    expect(screen.getByTestId("pipeline-funnel")).toBeInTheDocument();
    expect(screen.getByTestId("performance-metrics")).toBeInTheDocument();
    expect(screen.getByTestId("deal-list")).toBeInTheDocument();
  });

  it("renders the dashboard with the correct layout", () => {
    render(<PipelineDashboard />);

    // Check that the main container has the expected classes
    const mainContainer = screen
      .getByText("Pipeline Analytics Dashboard")
      .closest("div")?.parentElement;
    expect(mainContainer).toHaveClass("min-h-screen");
    expect(mainContainer).toHaveClass("bg-gray-50");
    expect(mainContainer).toHaveClass("p-6");

    // Check that the grid layout is applied
    const gridContainer = screen
      .getByText("Pipeline Overview")
      .closest("div")?.parentElement;
    expect(gridContainer).toHaveClass("grid");
    expect(gridContainer).toHaveClass("gap-6");
  });

  it("renders the dashboard with the correct section titles", () => {
    render(<PipelineDashboard />);

    // Check for section titles
    expect(screen.getByText("Pipeline Overview")).toBeInTheDocument();
    expect(screen.getByText("Performance Metrics")).toBeInTheDocument();
    expect(screen.getByText("Deal List")).toBeInTheDocument();
  });
});
