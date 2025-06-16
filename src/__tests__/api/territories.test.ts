/**
 * Blame Shon Little
 * 2025-06-16
 */

// Mock Next.js server components before importing
jest.mock("next/server", () => {
  const mockNextResponse = {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  };

  return {
    NextResponse: mockNextResponse,
  };
});

// Add local dependencies
import { GET } from "../../app/api/stats/territories/route";
import { initializeDataSource } from "../../data-source";
import { Deal } from "../../lib/entities/deals/Deal";
import {
  extractStateFromOriginCity,
  getTerritory,
  getTerritoryAnalytics,
} from "../../lib/business/deals/territories";

// Mock the data source
jest.mock("../../data-source");

const mockInitializeDataSource = initializeDataSource as jest.MockedFunction<
  typeof initializeDataSource
>;

describe("Territory Management System", () => {
  describe("Helper Functions", () => {
    describe("extractStateFromOriginCity", () => {
      it("should extract state code from city, state format", () => {
        expect(extractStateFromOriginCity("Los Angeles, CA")).toBe("CA");
        expect(extractStateFromOriginCity("New York, NY")).toBe("NY");
        expect(extractStateFromOriginCity("Chicago, IL")).toBe("IL");
      });

      it("should handle different spacing formats", () => {
        expect(extractStateFromOriginCity("Los Angeles,CA")).toBe("CA");
        expect(extractStateFromOriginCity("New York,  NY")).toBe("NY");
      });

      it("should return null for invalid formats", () => {
        expect(extractStateFromOriginCity("Los Angeles")).toBeNull();
        expect(extractStateFromOriginCity("")).toBeNull();
        expect(
          extractStateFromOriginCity(null as unknown as string)
        ).toBeNull();
      });
    });

    describe("getTerritory", () => {
      it("should map states to correct territories", () => {
        // Pacific
        expect(getTerritory("CA")).toBe("Pacific");
        expect(getTerritory("WA")).toBe("Pacific");
        expect(getTerritory("OR")).toBe("Pacific");

        // Mountain
        expect(getTerritory("CO")).toBe("Mountain");
        expect(getTerritory("AZ")).toBe("Mountain");
        expect(getTerritory("NM")).toBe("Mountain");
        expect(getTerritory("UT")).toBe("Mountain");

        // Midwest
        expect(getTerritory("IL")).toBe("Midwest");
        expect(getTerritory("MN")).toBe("Midwest");
        expect(getTerritory("MO")).toBe("Midwest");

        // Northeast
        expect(getTerritory("NY")).toBe("Northeast");
        expect(getTerritory("MA")).toBe("Northeast");

        // Southeast
        expect(getTerritory("FL")).toBe("Southeast");
        expect(getTerritory("GA")).toBe("Southeast");

        // Southwest
        expect(getTerritory("TX")).toBe("Southwest");
        expect(getTerritory("NV")).toBe("Southwest");
      });

      it("should return 'Other' for unmapped states", () => {
        expect(getTerritory("AL")).toBe("Other");
        expect(getTerritory("HI")).toBe("Other");
        expect(getTerritory(null)).toBe("Other");
      });
    });
  });

  describe("getTerritoryAnalytics", () => {
    it("should group deals by territory correctly", () => {
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Los Angeles, CA",
          stage: "closed_won",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
        {
          deal_id: "d2",
          origin_city: "Denver, CO",
          stage: "closed_won",
          value: 30000,
          sales_rep: "Jennifer Walsh",
        },
        {
          deal_id: "d3",
          origin_city: "Chicago, IL",
          stage: "closed_lost",
          value: 20000,
          sales_rep: "Lisa Anderson",
        },
      ] as Deal[];

      const result = getTerritoryAnalytics(mockDeals);

      // Check territories
      expect(Object.keys(result)).toContain("Pacific");
      expect(Object.keys(result)).toContain("Mountain");
      expect(Object.keys(result)).toContain("Midwest");
    });

    it("should calculate metrics correctly for each territory", () => {
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Los Angeles, CA",
          stage: "closed_won",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
        {
          deal_id: "d2",
          origin_city: "San Francisco, CA",
          stage: "closed_lost",
          value: 30000,
          sales_rep: "Jennifer Walsh",
        },
        {
          deal_id: "d3",
          origin_city: "Seattle, WA",
          stage: "closed_won",
          value: 40000,
          sales_rep: "Mike Rodriguez",
        },
      ] as Deal[];

      const result = getTerritoryAnalytics(mockDeals);

      // Check Pacific territory metrics
      expect(result.Pacific.wins).toBe(2);
      expect(result.Pacific.losses).toBe(1);
      expect(result.Pacific.winRate).toBeCloseTo(2 / 3);
      expect(result.Pacific.totalValue).toBe(90000); // 50000 + 40000 (only counting closed_won)
    });

    it("should handle sales rep breakdown correctly", () => {
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Los Angeles, CA",
          stage: "closed_won",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
        {
          deal_id: "d2",
          origin_city: "San Francisco, CA",
          stage: "closed_lost",
          value: 30000,
          sales_rep: "Jennifer Walsh",
        },
        {
          deal_id: "d3",
          origin_city: "Seattle, WA",
          stage: "closed_won",
          value: 40000,
          sales_rep: "Mike Rodriguez",
        },
      ] as Deal[];

      const result = getTerritoryAnalytics(mockDeals);

      // Check rep breakdown
      expect(result.Pacific.repBreakdown["Mike Rodriguez"].wins).toBe(2);
      expect(result.Pacific.repBreakdown["Mike Rodriguez"].losses).toBe(0);
      expect(result.Pacific.repBreakdown["Jennifer Walsh"].wins).toBe(0);
      expect(result.Pacific.repBreakdown["Jennifer Walsh"].losses).toBe(1);
    });

    it("should handle states not in the mapping", () => {
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Honolulu, HI",
          stage: "closed_won",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
      ] as Deal[];

      const result = getTerritoryAnalytics(mockDeals);

      // Check "Other" territory
      expect(result.Other.wins).toBe(1);
      expect(result.Other.totalValue).toBe(50000);
    });

    it("should handle invalid city formats", () => {
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Los Angeles", // Missing state
          stage: "closed_won",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
      ] as Deal[];

      const result = getTerritoryAnalytics(mockDeals);

      // Should be grouped under "Other"
      expect(result.Other.wins).toBe(1);
    });

    it("should only count closed deals for win/loss stats", () => {
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Los Angeles, CA",
          stage: "prospect",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
        {
          deal_id: "d2",
          origin_city: "San Francisco, CA",
          stage: "qualified",
          value: 30000,
          sales_rep: "Jennifer Walsh",
        },
        {
          deal_id: "d3",
          origin_city: "Seattle, WA",
          stage: "closed_won",
          value: 40000,
          sales_rep: "Mike Rodriguez",
        },
      ] as Deal[];

      const result = getTerritoryAnalytics(mockDeals);

      // Only the closed_won deal should count for wins
      expect(result.Pacific.wins).toBe(1);
      expect(result.Pacific.losses).toBe(0);
      expect(result.Pacific.totalValue).toBe(40000);
    });
  });

  describe("GET /api/stats/territories", () => {
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

    it("should return territory statistics", async () => {
      // Mock sample deals
      const mockDeals = [
        {
          deal_id: "d1",
          origin_city: "Los Angeles, CA",
          stage: "closed_won",
          value: 50000,
          sales_rep: "Mike Rodriguez",
        },
        {
          deal_id: "d2",
          origin_city: "Denver, CO",
          stage: "closed_won",
          value: 30000,
          sales_rep: "Jennifer Walsh",
        },
        {
          deal_id: "d3",
          origin_city: "Chicago, IL",
          stage: "closed_lost",
          value: 20000,
          sales_rep: "Lisa Anderson",
        },
      ] as Deal[];

      // Set up the mock repository to return our test data
      mockRepository.find.mockResolvedValue(mockDeals);

      // Call the API route handler
      const response = await GET();
      const data = await response.json();

      // Verify territories are present
      expect(data.Pacific).toBeDefined();
      expect(data.Mountain).toBeDefined();
      expect(data.Midwest).toBeDefined();

      // Verify the repository's find method was called
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it("should handle empty dataset", async () => {
      mockRepository.find.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      // Should return an empty object
      expect(data).toEqual({});
    });

    it("should handle database errors", async () => {
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
  });
});
