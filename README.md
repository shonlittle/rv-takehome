This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## From Developer

### Setup

1. Fork the repo
2. Clone the repo
3. Run `npm install` to install dependencies
4. Start the app: `npm run dev`
5. The app runs on [http://localhost:3000](http://localhost:3000) by default
6. Seed the database with:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```
7. Run `npm dev` to run dev environment

### Notes

- This repo is a fork of the original [Revenue Vessel take-home](https://github.com/Revenue-Vessel/rv-takehome).
- An `npm install` is required before `npm dev`.
- Only the default port `3000` is used even though port `3001` is mentioned.
- No Docker used — setup ran smoothly with local SQLite database.
- Assumes Node.js 18+ is installed.

### Win Rate API (Milestone 1 Feature)

This feature introduces an advanced analytics endpoint that calculates win rates for deals based on two key dimensions:

- **Transportation Mode** (e.g., trucking, ocean, rail, air)
- **Sales Representative**

#### Endpoint

```
GET /api/stats/win-rates
```

#### Response Format

```json
{
  "byTransportationMode": {
    "ocean": {
      "wins": 1,
      "losses": 0,
      "winRate": 1
    },
    "trucking": {
      "wins": 0,
      "losses": 1,
      "winRate": 0
    }
  },
  "bySalesRep": {
    "Mike Rodriguez": {
      "wins": 1,
      "losses": 0,
      "winRate": 1
    },
    "Jennifer Walsh": {
      "wins": 0,
      "losses": 1,
      "winRate": 0
    }
  }
}
```

#### Implementation Notes

- Only deals in the `closed_won` and `closed_lost` stages are considered.
- Win rate is calculated using the formula:

  ```
  winRate = wins / (wins + losses)
  ```

- The logic lives in:
  - `src/lib/business/deals/analytics.ts`: core win rate calculation
  - `src/app/api/stats/win-rates/route.ts`: API handler

#### Testing

- Unit tests for this API are located in:  
  `src/__tests__/api/win-rates.test.ts`

- Run all tests using:

  ```bash
  npm test
  ```

- If you encounter mocking errors during testing, ensure the mock path for `AppDataSource` is correctly set to:

  ```ts
  jest.mock("../../data-source", () => ({
    AppDataSource: {
      isInitialized: true,
      getRepository: jest.fn(),
    },
  }));
  ```
