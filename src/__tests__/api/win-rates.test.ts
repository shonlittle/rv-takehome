/**
 * Blame Shon Little
 * 2025-06-16
 */

// Mock Next.js server components before importing
jest.mock("next/server", () => {
  const mockNextRequest = jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || "GET",
    json: jest.fn().mockImplementation(() => {
      try {
        return Promise.resolve(JSON.parse(options?.body || "{}"));
      } catch {
        return Promise.reject(new Error("Invalid JSON"));
      }
    }),
    text: jest.fn().mockResolvedValue(options?.body || ""),
  }));

  const mockNextResponse = {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  };

  return {
    NextRequest: mockNextRequest,
    NextResponse: mockNextResponse,
  };
});

// Add local dependencies
import { GET } from "../../app/api/stats/win-rates/route";
import { initializeDataSource } from "../../data-source";
import { Deal } from "../../lib/entities/deals/Deal";

// Mock the data source
jest.mock("../../data-source");

const mockInitializeDataSource = initializeDataSource as jest.MockedFunction<
  typeof initializeDataSource
>;

describe("GET /api/stats/win-rates", () => {
  let mockRepository: { find: jest.Mock<Promise<Deal[]>> };
  let mockDataSource: {
    getRepository: jest.Mock<{ find: jest.Mock<Promise<Deal[]>> }>;
  };

  beforeEach(() => {
    mockRepository = {
      find: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    // Use a type assertion for the mock - this is necessary for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockInitializeDataSource.mockResolvedValue(mockDataSource as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate win rates correctly", async () => {
    // Mock sample deals
    const mockDeals = [
      {
        id: 1,
        deal_id: "deal1",
        transportation_mode: "trucking",
        stage: "closed_won",
        sales_rep: "John Doe",
        value: 1000,
      },
      {
        id: 2,
        deal_id: "deal2",
        transportation_mode: "trucking",
        stage: "closed_lost",
        sales_rep: "John Doe",
        value: 2000,
      },
      {
        id: 3,
        deal_id: "deal3",
        transportation_mode: "rail",
        stage: "closed_won",
        sales_rep: "Jane Smith",
        value: 3000,
      },
      {
        id: 4,
        deal_id: "deal4",
        transportation_mode: "ocean",
        stage: "closed_won",
        sales_rep: "Jane Smith",
        value: 4000,
      },
      {
        id: 5,
        deal_id: "deal5",
        transportation_mode: "air",
        stage: "closed_lost",
        sales_rep: "Bob Johnson",
        value: 5000,
      },
      {
        id: 6,
        deal_id: "deal6",
        transportation_mode: "air",
        stage: "prospect",
        sales_rep: "Bob Johnson",
        value: 6000,
      },
    ] as Deal[];

    // Set up the mock repository to return our test data
    mockRepository.find.mockResolvedValue(mockDeals);

    // Call the API route handler
    const response = await GET();
    const data = await response.json();

    // Expected results
    // Trucking: 1 win, 1 loss = 0.5 win rate
    // Rail: 1 win, 0 loss = 1.0 win rate
    // Ocean: 1 win, 0 loss = 1.0 win rate
    // Air: 0 win, 1 loss = 0.0 win rate
    expect(data.byTransportationMode.trucking.winRate).toBeCloseTo(0.5);
    expect(data.byTransportationMode.rail.winRate).toBeCloseTo(1.0);
    expect(data.byTransportationMode.ocean.winRate).toBeCloseTo(1.0);
    expect(data.byTransportationMode.air.winRate).toBeCloseTo(0.0);

    // John Doe: 1 win, 1 loss = 0.5 win rate
    // Jane Smith: 2 wins, 0 loss = 1.0 win rate
    // Bob Johnson: 0 win, 1 loss = 0.0 win rate
    expect(data.bySalesRep["John Doe"].winRate).toBeCloseTo(0.5);
    expect(data.bySalesRep["Jane Smith"].winRate).toBeCloseTo(1.0);
    expect(data.bySalesRep["Bob Johnson"].winRate).toBeCloseTo(0.0);

    // Verify that the repository's find method was called
    expect(mockRepository.find).toHaveBeenCalled();
  });

  it("should handle errors correctly", async () => {
    // Mock the repository to throw an error
    mockRepository.find.mockRejectedValue(new Error("Database error"));

    // Call the API route handler
    const response = await GET();

    // Verify the response status is 500
    expect(response.status).toBe(500);

    // Verify the response contains an error message
    const data = await response.json();
    expect(data.error).toBe("Internal server error");
  });

  // Edge case test: what happens if the database returns no deals.
  it("should return empty results if no deals exist", async () => {
    mockRepository.find.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(data.byTransportationMode).toEqual({});
    expect(data.bySalesRep).toEqual({});
  });

  // Edge case test: make sure non-terminal stages are ignored.
  it("should ignore deals that are not closed_won or closed_lost", async () => {
    const mockDeals = [
      {
        deal_id: "d1",
        transportation_mode: "trucking",
        stage: "prospect",
        sales_rep: "Alice",
      },
      {
        deal_id: "d2",
        transportation_mode: "rail",
        stage: "qualified",
        sales_rep: "Bob",
      },
    ] as Deal[];

    mockRepository.find.mockResolvedValue(mockDeals);

    const response = await GET();
    const data = await response.json();

    expect(data.byTransportationMode).toEqual({});
    expect(data.bySalesRep).toEqual({});
  });

  // Additional test: Check for invalid stage values.
  it("should gracefully skip deals with invalid stage values", async () => {
    const mockDeals = [
      {
        deal_id: "d1",
        transportation_mode: "trucking",
        stage: "unknown_stage",
        sales_rep: "Alice",
      },
      {
        deal_id: "d2",
        transportation_mode: "air",
        stage: "closed_won",
        sales_rep: "Bob",
      },
    ] as Deal[];

    mockRepository.find.mockResolvedValue(mockDeals);

    const response = await GET();
    const data = await response.json();

    expect(data.byTransportationMode.trucking).toBeUndefined();
    expect(data.byTransportationMode.air.winRate).toBeCloseTo(1);
  });
});
