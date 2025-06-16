// Add local dependencies
import { Deal } from "../../entities/deals/Deal";

export function getStageAnalytics(deals: Deal[]): {
  totalDeals: number;
  stageAnalytics: Record<
    string,
    { deals: Deal[]; count: number; percentage: number }
  >;
} {
  const dealsByStage = getDealsByStage(deals);
  // Calculate totals and percentages
  const totalDeals = deals.length;
  const stageAnalytics = Object.entries(dealsByStage).reduce(
    (acc, [stage, stageDeals]) => {
      const count = stageDeals.length;
      const percentage =
        totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0;

      acc[stage] = {
        deals: stageDeals,
        count,
        percentage,
      };
      return acc;
    },
    {} as Record<string, { deals: Deal[]; count: number; percentage: number }>
  );
  return { totalDeals, stageAnalytics };
}

/**
 * Blame Shon Little
 * 2025-06-16
 */
export function getWinRates(deals: Deal[]): {
  byTransportationMode: Record<
    string,
    { wins: number; losses: number; winRate: number }
  >;
  bySalesRep: Record<string, { wins: number; losses: number; winRate: number }>;
} {
  // Filter deals to only include closed deals (won or lost)
  const closedDeals = deals.filter(
    (deal) => deal.stage === "closed_won" || deal.stage === "closed_lost"
  );

  // Group by transportation mode
  const byTransportationMode: Record<
    string,
    { wins: number; losses: number; winRate: number }
  > = {};

  // Group by sales rep
  const bySalesRep: Record<
    string,
    { wins: number; losses: number; winRate: number }
  > = {};

  // Process each deal
  closedDeals.forEach((deal) => {
    // Process by transportation mode
    if (!byTransportationMode[deal.transportation_mode]) {
      byTransportationMode[deal.transportation_mode] = {
        wins: 0,
        losses: 0,
        winRate: 0,
      };
    }

    // Process by sales rep
    if (!bySalesRep[deal.sales_rep]) {
      bySalesRep[deal.sales_rep] = {
        wins: 0,
        losses: 0,
        winRate: 0,
      };
    }

    // Increment wins or losses based on deal stage
    if (deal.stage === "closed_won") {
      byTransportationMode[deal.transportation_mode].wins++;
      bySalesRep[deal.sales_rep].wins++;
    } else if (deal.stage === "closed_lost") {
      byTransportationMode[deal.transportation_mode].losses++;
      bySalesRep[deal.sales_rep].losses++;
    }
  });

  // Calculate win rates for transportation modes
  Object.keys(byTransportationMode).forEach((mode) => {
    const { wins, losses } = byTransportationMode[mode];
    const total = wins + losses;
    byTransportationMode[mode].winRate = total > 0 ? wins / total : 0;
  });

  // Calculate win rates for sales reps
  Object.keys(bySalesRep).forEach((rep) => {
    const { wins, losses } = bySalesRep[rep];
    const total = wins + losses;
    bySalesRep[rep].winRate = total > 0 ? wins / total : 0;
  });

  return { byTransportationMode, bySalesRep };
}

function getDealsByStage(deals: Deal[]): Record<string, Deal[]> {
  return deals.reduce((acc: Record<string, Deal[]>, deal: Deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = [];
    }
    acc[deal.stage].push(deal);
    return acc;
  }, {} as Record<string, Deal[]>);
}
