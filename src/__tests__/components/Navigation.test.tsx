import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Navigation from "../../components/Navigation";
import { usePathname } from "next/navigation";

// Mock the usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Navigation", () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    (usePathname as jest.Mock).mockReset();
  });

  it("renders the navigation component with all links", () => {
    (usePathname as jest.Mock).mockReturnValue("/");

    render(<Navigation />);

    // Check that the logo text is rendered
    expect(screen.getByText("SalesViz")).toBeInTheDocument();

    // Check that all navigation links are rendered
    expect(screen.getAllByText("Home")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Forecasting")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Territories")[0]).toBeInTheDocument();
  });

  it("highlights the active link based on current path", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    render(<Navigation />);

    // The Dashboard link should have the active class
    const dashboardLink = screen.getAllByText("Forecasting")[0].closest("a");
    expect(dashboardLink).toHaveClass("border-blue-500");

    // Other links should not have the active class
    const homeLink = screen.getAllByText("Home")[0].closest("a");
    expect(homeLink).not.toHaveClass("border-blue-500");
  });

  it("highlights the Territories link when on territories page", () => {
    (usePathname as jest.Mock).mockReturnValue("/territories");

    render(<Navigation />);

    // The Territories link should have the active class
    const territoriesLink = screen.getAllByText("Territories")[0].closest("a");
    expect(territoriesLink).toHaveClass("border-blue-500");

    // Other links should not have the active class
    const homeLink = screen.getAllByText("Home")[0].closest("a");
    expect(homeLink).not.toHaveClass("border-blue-500");
  });

  it("highlights the Forecasting link when on dashboard page", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    render(<Navigation />);

    // The Forecasting link should have the active class
    const forecastingLink = screen.getAllByText("Forecasting")[0].closest("a");
    expect(forecastingLink).toHaveClass("border-blue-500");
  });

  it("toggles mobile menu when hamburger button is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/");

    render(<Navigation />);

    // Get the mobile menu container
    const mobileMenuContainer = screen.getByRole("navigation").children[1];

    // Check that the mobile menu is hidden initially
    expect(mobileMenuContainer).toHaveClass("hidden");

    // Click the hamburger button
    const hamburgerButton = screen.getByRole("button", {
      name: /open main menu/i,
    });
    fireEvent.click(hamburgerButton);

    // Check that the mobile menu is now visible
    expect(mobileMenuContainer).toHaveClass("block");

    // Click the hamburger button again
    fireEvent.click(hamburgerButton);

    // Check that the mobile menu is hidden again
    expect(mobileMenuContainer).toHaveClass("hidden");
  });

  it("closes mobile menu when a link is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/");

    render(<Navigation />);

    // Open the mobile menu
    const hamburgerButton = screen.getByRole("button", {
      name: /open main menu/i,
    });
    fireEvent.click(hamburgerButton);

    // Get the mobile menu container
    const mobileMenuContainer = screen.getByRole("navigation").children[1];

    // Check that the mobile menu is visible
    expect(mobileMenuContainer).toHaveClass("block");

    // Click a link in the mobile menu
    const homeLink = screen.getAllByText("Home")[1]; // The second one is in the mobile menu
    fireEvent.click(homeLink);

    // Mobile menu should be hidden after clicking a link
    expect(mobileMenuContainer).toHaveClass("hidden");
  });
});
