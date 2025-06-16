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

### AI Collaboration Report

For this project, I used a combination of Claude Sonnet 4 in cursor and I also used Cline with OpenRouter in VSCode as well as ChatGPT 4o for some of the prose tasks.

- **Analytics Logic Refactor**: Claude proposed a basic implementation for calculating win rates by sales rep and transportation mode. I improved this by explicitly filtering out non-final deal stages like "prospect", ensuring accurate metrics.
- **Test Coverage**: I added unit tests that covered edge cases, such as no deals present, invalid stage entries. These were beyond the inital test suggestions from AI.

Using AI as a collaborator helped me move faster, but I took care to always review and elevate the generated code to meet production standards.

Manually, I addressed some of the linting and "Problems" that were being reported.

### Technical Decisions

- **Path Selection**: I chose the Sales Forecasting Engine (Milestone 1, Option A) to flex my BCG experience in working with business logic and decision-making. I am also new to Next.js (I use Express.js) and wanted to prove I could work with it.
- **Entity Grouping**: I focused on grouping by `transportation_mode` and `sales_rep` for the win rate calculations, as these are the most actionable and consistently available fields.
- **Territories and Reassignment**: Since the system doesn’t yet support territory definitions or reassignment workflows, I treated sales rep names as primary identifiers for performance comparison.
- **Tech Stack Respect**: I did not introduce Docker or external frameworks to avoid interfering with the provided repo setup. I ensured compatibility with the SQLite database and existing TypeORM structure. I tend to favor microservices but am fine not using containers if that is the working norm.

## Demo Guide

To view the implemented win-rate analytics:

1. Start the development server with:
   ```bash
   npm install
   npm run dev
   ```
2. Navigate to [http://localhost:3000/api/stats/win-rates](http://localhost:3000/api/stats/win-rates)

You’ll see a JSON object showing win rates by transportation mode and by sales rep, like so:

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

### Win Rates Endpoint

Here's a screenshot showing the `/api/stats/win-rates` endpoint response:

![Win Rates Endpoint](./screen-shots/win-rates-endpoint.png)
