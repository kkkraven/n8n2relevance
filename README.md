# n8n2relevance


This project exposes a Cloudflare Worker built with the Hono framework.
It includes `/api/register` and `/api/login` for user management backed by D1.
Passwords are hashed using bcrypt before storage.

Authenticated requests must provide a JWT issued by `/api/login`.
Tokens expire after one hour. Conversion requests are limited using KV storage.

n8n2relevance is a small demonstration project that exposes a simple API and single-page application (SPA) for converting n8n workflows into a "relevance" score.

## Installation

Clone the repository and install the dependencies:

```bash
git clone <repo-url>
cd n8n2relevance
npm install
```

## Building

Build the server and the client SPA:

```bash
npm run build        # compile the backend
npm run client:build # bundle the SPA
```

## Running

During development you can run both pieces with hot reload:

```bash
npm run dev
```

For a production build start the API and serve the compiled SPA:

```bash
npm start
```

## API overview

The API is organized under `/api` and exposes a few basic endpoints:

- `GET /api/health` &mdash; simple health check returning `200` when the service is running.
- `POST /api/workflows` &mdash; submit an n8n workflow and receive relevance metrics in the response.
- `GET /api/results/:id` &mdash; retrieve the processed results for a workflow by id.

## SPA structure

The front end lives in the `client/` directory and is organised as a typical SPA:

- `src/` &mdash; application source code.
- `src/pages/` &mdash; top level routes.
- `src/components/` &mdash; shared UI widgets.
- `src/services/` &mdash; helpers for calling the API.

The SPA communicates with the API endpoints listed above to submit workflows and display the relevance data to the user.

