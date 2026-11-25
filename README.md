# Markro API Server

Express 5 + MongoDB/Mongoose API for the **Markro** equipment rental marketplace.

This service owns the listing data and role-protected ad operations. The Next.js client in [`../client`](../client) handles authentication UI, Stripe Checkout sessions, bookings, and payment history.

## Prerequisites

- Node.js 20+
- npm
- MongoDB database named `markro`
- The Markro client running locally, because this API verifies JWTs through the client's Better Auth JWKS endpoint

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this directory:

   ```env
   PORT=5000
   NEXT_API_DATABASE_URL=mongodb://localhost:27017/markro
   NEXT_API_CLIENT_URL=http://localhost:3000
   NEXT_API_SERVER_URL=http://localhost:5000

   NEXT_API_MAX_JSON_FILE=100kb
   NEXT_API_MAX_WINDOWMS=900000
   NEXT_API_MAX_RATE_LIMIT=100
   NEXT_API_URL_ENCODE=true
   NEXT_API_WEB_CACHE=weak
   ```

   `NEXT_API_CLIENT_URL` is used for CORS and as the expected JWT issuer/audience. It must exactly match the client's `NEXT_APP_URL`.

3. Start the server:

   ```bash
   npm start
   ```

   For automatic restarts during development, `nodemon` can be used if available:

   ```bash
   npx nodemon app.js
   ```

4. Health check:

   ```bash
   curl http://localhost:5000/ads
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Express API with `app.js` |
| `npm test` | Placeholder test script |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `5000` |
| `NEXT_API_DATABASE_URL` | MongoDB connection string |
| `NEXT_API_CLIENT_URL` | Allowed browser origin and JWT issuer/audience |
| `NEXT_API_SERVER_URL` | Public API origin used in deployment configuration |
| `NEXT_API_MAX_JSON_FILE` | Maximum JSON request body size |
| `NEXT_API_MAX_WINDOWMS` | Rate-limit window in milliseconds |
| `NEXT_API_MAX_RATE_LIMIT` | Maximum requests per window per client |
| `NEXT_API_URL_ENCODE` | Enables extended URL-encoded parsing when `true` |
| `NEXT_API_WEB_CACHE` | ETag setting |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Present in the local env file; Stripe Checkout currently runs in the client |
| `STRIPE_SECRET_KEY` | Present in the local env file; Stripe Checkout currently runs in the client |

Never commit real environment values.

## API endpoints

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/ads` | Public | List approved ads with filters and sorting |
| `GET` | `/ads/:adminID` | Admin | List pending ads awaiting approval |
| `PATCH` | `/:adminID/ads/:adsID/status` | Admin | Approve or reject an ad |
| `POST` | `/:sellerID/ads` | Seller | Create a new ad |
| `GET` | `/:sellerID/ads` | Seller | List the seller's own ads |

### Listing query parameters

`GET /ads` accepts:

- `search` — matches title and description
- `category` — repeatable
- `city` — repeatable
- `rentType` — repeatable (`hour`, `day`, `week`, `month`)
- `limit` — maximum number of results
- `sort` — sorting key such as `price` or `createdAt`

Repeated parameters are combined with MongoDB `$in`.

## Authentication

Admin and seller routes require:

```http
Authorization: Bearer <better-auth-jwt>
```

The middleware:

1. fetches the signing keys from `${NEXT_API_CLIENT_URL}/api/auth/jwks`;
2. verifies issuer and audience against `NEXT_API_CLIENT_URL`;
3. accepts `EdDSA` or `RS256`;
4. checks the `role` claim is `admin` or `seller` as required.

The client obtains this token with `authClient.token()` from Better Auth.

## Seller posting limit

`POST /:sellerID/ads` allows two free ads. Once a seller has two ads, the third request returns:

```json
{
  "success": false,
  "code": "PAYMENT_REQUIRED",
  "message": "You have used your 2 free ads. Complete the one-time payment to keep posting."
}
```

The client redirects that seller to the $20.00 Stripe checkout. After payment, a record with `product: "seller_pro"` is written to the shared `payments` collection, and the seller can post without further payment. Rental payments use `product: "ad_rental"` and do not satisfy the seller paywall.

## Data models

### `adsPost`

Stores listing fields including `title`, `description`, `category`, `price`, `rentType`, `location`, `quantity`, `image`, `status`, `terms_condition`, and `sellerID`.

`price` is stored in **USD dollars**, for example `35` means `$35.00`. The Next.js client converts it to cents when creating a Stripe Checkout Session.

### `payment`

Shared with the client. Important fields:

- `userId`
- `sessionId` (unique)
- `amountCents`
- `currency`
- `product` (`seller_pro` or `ad_rental`)
- `status` (`paid`)
- `email`
- `paidAt`

### `user`

Managed by Better Auth. The custom `role` field is one of `buyer`, `seller`, or `admin`.

## Security and middleware

- CORS allows only `NEXT_API_CLIENT_URL` with credentials.
- Helmet sets security headers.
- Rate limiting is enabled with configurable window and maximum.
- JSON bodies are limited by `NEXT_API_MAX_JSON_FILE`.
- DNS resolvers are set to Cloudflare and Google public DNS.

## Troubleshooting

- **`Invalid or expired token`**: confirm the client is running and `NEXT_API_CLIENT_URL` exactly matches the client's `NEXT_APP_URL`.
- **`DB connected...` never appears** or **`Operation adsposts.find() buffering timed out`**: the Mongoose connection is not ready. Check `NEXT_API_DATABASE_URL`, MongoDB Atlas credentials, and Atlas Network Access rules for the backend host.
- **`ERR_ERL_FORWARDED_HEADER` / `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`**: these appear behind Vercel if `trust proxy` is disabled. `app.js` sets `app.set("trust proxy", 1)` for this reason.
- **CORS errors in the browser**: confirm the client origin matches `NEXT_API_CLIENT_URL`, including scheme and port.
- **`PAYMENT_REQUIRED` after payment**: verify the seller's Stripe session was completed and that a paid `payments` document has `product: "seller_pro"` and the same `userId`.
