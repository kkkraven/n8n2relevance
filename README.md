# n8n2relevance

This project exposes a Cloudflare Worker built with the Hono framework.
It includes `/api/register` and `/api/login` for user management backed by D1.
Passwords are hashed using bcrypt before storage.

Authenticated requests must provide a JWT issued by `/api/login`.
Tokens expire after one hour. Conversion requests are limited using KV storage.
