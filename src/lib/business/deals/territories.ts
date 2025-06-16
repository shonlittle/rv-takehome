/**
 * Blame Shon Little
 * 2025-06-16
 */

// Add local dependencies
import { Deal } from "../../entities/deals/Deal";

/**
 * Interface for territory statistics
 */
export interface TerritoryStats {
  wins: number;
  losses: number;
  winRate: number;
  totalValue: number;
  repBreakdown: Record<string, { wins: number; losses: number }>;
}

/**
 * Mapping of state codes to territories
 */
const STATE_TO_TERRITORY: Record<string, string> = {
  // Pacific
  CA: "Pacific",
  WA: "Pacific",
  OR: "Pacific",
  // Mountain
  CO: "Mountain",
  AZ: "Mountain",
  NM: "Mountain",
  UT: "Mountain",
  // Midwest
  IL: "Midwest",
  MN: "Midwest",
  MO: "Midwest",
  // Northeast
  NY: "Northeast",
  MA: "Northeast",
  // Southeast
  FL: "Southeast",
  GA: "Southeast",
  // Southwest
  TX: "Southwest",
  NV: "Southwest",
};

/**
 * Extracts the state code from an origin city string (e.g., "Los Angeles, CA" -> "CA")
 * @param originCity - The origin city string in format "City, ST"
 * @returns The 2-letter state code or null if not found
 */
export function extractStateFromOriginCity(originCity: string): string | null {
  if (!originCity) return null;

  const match = originCity.match(/,\s*([A-Z]{2})$/);
  return match ? match[1] : null;
}

/**
 * Determines the territory for a given state code
 * @param stateCode - The 2-letter state code
 * @returns The territory name or "Other" if the state is not mapped
 */
export function getTerritory(stateCode: string | null): string {
  if (!stateCode) return "Other";
  return STATE_TO_TERRITORY[stateCode] || "Other";
}

/**
 * Groups deals by territory based on the state in origin_city field
 * and calculates performance metrics for each territory.
 * @param deals - Array of Deal objects
 * @returns Record of territory names to their statistics
 */
export function getTerritoryAnalytics(
  deals: Deal[]
): Record<string, TerritoryStats> {
  // Initialize result object
  const territories: Record<string, TerritoryStats> = {};

  // Process each deal
  deals.forEach((deal) => {
    // Extract state and determine territory
    const stateCode = extractStateFromOriginCity(deal.origin_city);
    const territory = getTerritory(stateCode);

    // Initialize territory stats if not exists
    if (!territories[territory]) {
      territories[territory] = {
        wins: 0,
        losses: 0,
        winRate: 0,
        totalValue: 0,
        repBreakdown: {},
      };
    }

    // Initialize sales rep breakdown if not exists
    if (!territories[territory].repBreakdown[deal.sales_rep]) {
      territories[territory].repBreakdown[deal.sales_rep] = {
        wins: 0,
        losses: 0,
      };
    }

    // Update territory stats based on deal stage
    if (deal.stage === "closed_won") {
      territories[territory].wins++;
      territories[territory].repBreakdown[deal.sales_rep].wins++;
    } else if (deal.stage === "closed_lost") {
      territories[territory].losses++;
      territories[territory].repBreakdown[deal.sales_rep].losses++;
    }

    // Add deal value to total (only count value for closed_won deals)
    if (deal.stage === "closed_won") {
      territories[territory].totalValue += deal.value;
    }
  });

  // Calculate win rates for each territory
  Object.keys(territories).forEach((territory) => {
    const { wins, losses } = territories[territory];
    const total = wins + losses;
    territories[territory].winRate = total > 0 ? wins / total : 0;
  });

  return territories;
}
