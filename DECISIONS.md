# DECISIONS.md

## Feature: Win Rate API Endpoint

### Assumptions

- We want to get the sales performance by transporation mode and by the sales rep.
- Use the stage column with values of 'closed_won' and 'closed_lost' for win rate calculations.
- Formula: `wins / (wins + losses)`.
- It's okay to show win rates for modes and reps that only have wins or only losses.

### Key Decisions

- Added a new function called `getWinRates` to the `analytics.ts` file to calculate win rates grouped by mode and rep.
- Added a new API endpoint at `/api/stats/win-rates` to make result available to the FE.
- Used seeded data in the database for development and testing.
- Included basic unit teesting to validate the logic and ensure proper API behavior.
- Decided to use a table-based display format (per Danny’s approval) rather than a chart or graph for now.
- Thought about adding additional devide by zero testing but since the code checks for total > 0 didn't seem necessary.
- Added

### Trade-offs

- Did not implement historical filtering or time-windowed win rate analysis to keep scope manageable.
- Kept the API stateless for simplicity and clarity; future enhancements could involve caching, lazy loading, or pagination for large datasets.
- Focused on clarity and extensibility over performance optimization, considering that the sample dataset is small.

### Edge & Additional Unit Tests

- Added a unit test for when the database returns and empty array of deals.
- Added a unit test to make sure non-terminal stages are ignored.
- Added a unit test to valide unexpected values don't break the logic.

### Notes

- We could later expand this to include trends over time, industry benchmarking, or conversion funnels.
- Documentation and README were updated to reflect new setup and usage. All my edits are under `From Developer` heading.
