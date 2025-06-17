# DECISIONS.md

## Feature: Win Rate API Endpoint

### Assumptions

- We want to get the sales performance by transporation mode and by the sales rep.
- Use the stage column with values of 'closed_won' and 'closed_lost' for win rate calculations.
- Formula: `wins / (wins + losses)`.
- It's okay to show win rates for modes and reps that only have wins or only losses.
- I assumed that sales leadership cares more about patterns of success by sales reps and transprotation modes. This would present opportunities for successful reps to share best practices and tips and tricks as well as to train and upskill underperforming reps. Also, would provide insights into outcomes on with tranportation modes are most optimal.
- I prioritized delivering a win rate API and dashboard table first, instead of tackling more ambitious UI visualizations like a geographic map. A quick, working solution that unblocks decision-making seemed more valuable in the short term. Would add mapping to the backlog as a nice-to-have.

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

## Additional Decisions Made

### Territory Mapping Strategy

Decided to hardcode a region-to-state mapping for simplicity, since deal locations were U.S. cities. This mapping powers regional grouping and map overlays. Used D3.js for U.S. map and colored regions by win rate performance.

### Navigation Between Dashboards

Added basic top-level navigation for Forecasting, Territories, and Home to improve usability for non-technical users. Chose simple `Link` components to maintain client-side routing and fast transitions.

### Filtering and Responsive Design

For filtering, I used controlled inputs for rep name and region, enabling dynamic query updates without full page reloads.  
For responsive design, I kept layouts mobile-flexible using Tailwind’s breakpoints and ensured charts/table containers resized cleanly on small screens.
