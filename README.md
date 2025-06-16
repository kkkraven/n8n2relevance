# n8n2relevance

This example repo exposes an API endpoint for converting JSON files into `.rai` archives.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node server.js
   ```

The server listens on port `3000` by default.

## `/api/convert`

`POST /api/convert` accepts a JSON file via `multipart/form-data` under the field name `file`.
The JSON must contain a `name` field and a `data` property. A successful request returns the
ID of the conversion and whether it was uploaded to R2.

Conversion metadata is stored in a local SQLite database (`d1.sqlite`) which acts as the D1 database,
and the resulting archive is uploaded to R2 when credentials are provided via environment variables.
