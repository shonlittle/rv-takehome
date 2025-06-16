import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DealList from "../../components/DealList";

// Mock fetch API
global.fetch = jest.fn();

describe("DealList", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockReset();
  });

  const mockPipelineData = {
    totalDeals: 3,
    stageAnalytics: {
      proposal: {
        deals: [
          {
            id: 1,
            deal_id: "DEAL-001",
            company_name: "Acme Corp",
            contact_name: "John Contact",
            transportation_mode: "rail",
            stage: "proposal",
            value: 50000,
            probability: 70,
            created_date: "2025-06-01",
            updated_date: "2025-06-10",
            expected_close_date: "2025-07-15",
            sales_rep: "John Smith",
            origin_city: "Los Angeles",
            destination_city: "San Francisco",
            cargo_type: "Electronics",
          },
        ],
        count: 1,
        percentage: 33.33,
      },
      negotiation: {
        deals: [
          {
            id: 2,
            deal_id: "DEAL-002",
            company_name: "Beta Industries",
            contact_name: "Jane Contact",
            transportation_mode: "truck",
            stage: "negotiation",
            value: 75000,
            probability: 85,
            created_date: "2025-05-15",
            updated_date: "2025-06-12",
            expected_close_date: "2025-07-30",
            sales_rep: "Jane Doe",
            origin_city: "Chicago",
            destination_city: "New York",
            cargo_type: "Machinery",
          },
        ],
        count: 1,
        percentage: 33.33,
      },
      qualified: {
        deals: [
          {
            id: 3,
            deal_id: "DEAL-003",
            company_name: "Gamma Services",
            contact_name: "Alice Contact",
            transportation_mode: "ship",
            stage: "qualified",
            value: 25000,
            probability: 30,
            created_date: "2025-06-05",
            updated_date: "2025-06-08",
            expected_close_date: "2025-08-15",
            sales_rep: "Alice Johnson",
            origin_city: "Seattle",
            destination_city: "Portland",
            cargo_type: "Furniture",
          },
        ],
        count: 1,
        percentage: 33.33,
      },
    },
  };

  it("renders loading state initially", () => {
    // Mock fetch to return a pending promise
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<DealList />);

    // Check for loading spinner
    expect(
      screen.getByText("", { selector: "div.animate-spin" })
    ).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    // Mock fetch to reject with an error
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch data")
    );

    render(<DealList />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading deals/)).toBeInTheDocument();
    });
  });

  it("renders deals when fetch is successful", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPipelineData,
    });

    render(<DealList />);

    // Wait for deals to load
    await waitFor(() => {
      expect(
        screen.queryByText("", { selector: "div.animate-spin" })
      ).not.toBeInTheDocument();
    });

    // Check that deals are rendered
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Beta Industries")).toBeInTheDocument();
    expect(screen.getByText("Gamma Services")).toBeInTheDocument();

    // Check that deal details are rendered
    expect(screen.getByText("$50,000.00")).toBeInTheDocument();
    expect(screen.getByText("proposal")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
  });

  it("allows searching deals", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPipelineData,
    });

    render(<DealList />);

    // Wait for deals to load
    await waitFor(() => {
      expect(
        screen.queryByText("", { selector: "div.animate-spin" })
      ).not.toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText("Search deals...");
    fireEvent.change(searchInput, { target: { value: "Beta" } });

    // Only Beta Industries should be visible
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
    expect(screen.getByText("Beta Industries")).toBeInTheDocument();
    expect(screen.queryByText("Gamma Services")).not.toBeInTheDocument();
  });

  it("allows sorting deals by value", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPipelineData,
    });

    render(<DealList />);

    // Wait for deals to load
    await waitFor(() => {
      expect(
        screen.queryByText("", { selector: "div.animate-spin" })
      ).not.toBeInTheDocument();
    });

    // Click the Value header to sort
    fireEvent.click(screen.getByText("Value"));

    // Check the order of deals (should be ascending by default)
    const dealRows = screen.getAllByRole("row").slice(1); // Skip header row
    expect(dealRows[0]).toHaveTextContent("Gamma Services");
    expect(dealRows[1]).toHaveTextContent("Acme Corp");
    expect(dealRows[2]).toHaveTextContent("Beta Industries");

    // Click again to sort in descending order
    fireEvent.click(screen.getByText("Value"));

    // Check the order of deals (should now be descending)
    const dealRowsDesc = screen.getAllByRole("row").slice(1); // Skip header row
    expect(dealRowsDesc[0]).toHaveTextContent("Beta Industries");
    expect(dealRowsDesc[1]).toHaveTextContent("Acme Corp");
    expect(dealRowsDesc[2]).toHaveTextContent("Gamma Services");
  });

  it("shows empty state when no deals match search", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPipelineData,
    });

    render(<DealList />);

    // Wait for deals to load
    await waitFor(() => {
      expect(
        screen.queryByText("", { selector: "div.animate-spin" })
      ).not.toBeInTheDocument();
    });

    // Enter search term that won't match any deals
    const searchInput = screen.getByPlaceholderText("Search deals...");
    fireEvent.change(searchInput, { target: { value: "XYZ" } });

    // Empty state message should be visible
    expect(
      screen.getByText("No deals found matching your search criteria.")
    ).toBeInTheDocument();
  });

  it("displays deal count information", async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPipelineData,
    });

    render(<DealList />);

    // Wait for deals to load
    await waitFor(() => {
      expect(
        screen.queryByText("", { selector: "div.animate-spin" })
      ).not.toBeInTheDocument();
    });

    // Check that deal count information is displayed
    expect(screen.getByText("Showing 3 of 3 deals")).toBeInTheDocument();

    // Enter search term to filter deals
    const searchInput = screen.getByPlaceholderText("Search deals...");
    fireEvent.change(searchInput, { target: { value: "Beta" } });

    // Check that deal count information is updated
    expect(screen.getByText("Showing 1 of 3 deals")).toBeInTheDocument();
  });
});
