/**
 * Blame Shon Little
 * 2025-06-16
 */

// Add third-party dependencies
import { NextResponse } from "next/server";

// Add local dependencies
import { initializeDataSource } from "../../../../data-source";
import { getTerritoryAnalytics } from "../../../../lib/business/deals/territories";
import { Deal } from "../../../../lib/entities/deals/Deal";

/**
 * GET handler for /api/stats/territories
 * Returns deal statistics grouped by territory
 */
export async function GET() {
  try {
    // Initialize data source and get repository
    const dataSource = await initializeDataSource();
    const dealRepository = dataSource.getRepository(Deal);

    // Fetch all deals
    const deals = await dealRepository.find();

    // Calculate territory analytics
    const territoryStats = getTerritoryAnalytics(deals);

    // Return the results
    return NextResponse.json(territoryStats);
  } catch (error) {
    console.error("Error calculating territory statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
