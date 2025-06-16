/**
 * Blame Shon Little
 * 2025-06-16
 */
import { NextResponse } from "next/server";
import { initializeDataSource } from "../../../../data-source";
import { getWinRates } from "../../../../lib/business/deals/analytics";
import { Deal } from "../../../../lib/entities/deals/Deal";

export async function GET() {
  try {
    // Initialize data source and get repository
    const dataSource = await initializeDataSource();
    const dealRepository = dataSource.getRepository(Deal);

    // Fetch all deals
    const deals = await dealRepository.find();

    // Calculate win rates
    const winRates = getWinRates(deals);

    // Return the results
    return NextResponse.json(winRates);
  } catch (error) {
    console.error("Error calculating win rates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
