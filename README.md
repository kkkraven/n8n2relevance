# n8n2relevance

This project demonstrates a simple setup using Vite for building a small SPA and Cloudflare Workers for the backend worker code.

## Scripts
- `npm run test:fe` - run front-end tests with Vitest
- `npm run test:worker` - run worker tests with Jest
- `npm test` - run all tests
- `npm run build` - build the SPA with Vite
- `npm run deploy` - deploy using `wrangler deploy`

## GitHub Actions
A workflow (`.github/workflows/ci.yml`) installs dependencies, runs tests, builds the project and deploys via `wrangler`.
