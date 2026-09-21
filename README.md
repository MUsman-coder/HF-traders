# HF Traders — Backend

Express API backed by **PostgreSQL**. Every form on the site (contact,
sign up, quote requests, business plan inquiries) writes to real database
tables — nothing is stored in local JSON files anymore.

## 1. Set up PostgreSQL

You need a running Postgres server. Options:

**A) Local install** — install Postgres for your OS, then create a database:
```sql
CREATE DATABASE hftraders;
```

**B) Docker (simplest if you have Docker installed):**
```bash
docker run --name hf-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hftraders -p 5432:5432 -d postgres:16
```

## 2. Configure and install

```bash
cd backend
npm install
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

Open `.env` and set `DATABASE_URL` to match your Postgres setup, e.g.:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hftraders
```

## 3. Create tables + seed products

```bash
npm run db:setup
```

This runs `schema.sql` (creates all tables) and inserts the starting
product catalog. Safe to re-run any time — it won't duplicate data.

## 4. Start the server

```bash
npm run dev
```

Visit `http://localhost:4000/api/health` — it should say
`"database": "connected"`. If it says `"unreachable"`, double check
`DATABASE_URL` and that Postgres is actually running.

## Endpoints

| Method | Path                          | Purpose                                  |
|--------|-------------------------------|-------------------------------------------|
| GET    | `/api/health`                 | Health check + DB connectivity            |
| GET    | `/api/products`               | List products. Query: `?q=` `?category=`  |
| GET    | `/api/products/:id`           | Single product lookup                     |
| POST   | `/api/contact`                | Submit the homepage contact form          |
| POST   | `/api/quote`                  | Request a quote for a product             |
| POST   | `/api/business-plan`          | Submit interest in a business plan        |
| POST   | `/api/signup`                 | Register a business account               |
| POST   | `/api/signup/login`           | Log in with email + password              |
| POST   | `/api/signup/forgot-password` | Request a password reset link             |
| POST   | `/api/signup/reset-password`  | Set a new password using a reset token    |

## Important: password reset emails aren't actually sent

`/api/signup/forgot-password` generates a real, working reset token and
stores it in the `password_resets` table — but since there's no email
service configured, the response includes the reset link directly
(`devResetUrl`) instead of emailing it.

**Before using this for real customers**, wire up an email provider
(e.g. Resend, SendGrid, or Nodemailer + SMTP) in
`routes/signup.js` → `/forgot-password`, and remove `devResetToken` /
`devResetUrl` from the response so tokens are never exposed via the API.

## Data

All data lives in Postgres now:
- `products` — the catalog (edit via `scripts/migrate.js` and re-run `npm run db:setup`, or update rows directly with SQL)
- `contacts`, `quotes`, `business_plan_inquiries` — form submissions
- `users` — accounts (passwords stored as bcrypt hashes only)
- `password_resets` — reset tokens with expiry

Query them directly with `psql` or a GUI like pgAdmin/TablePlus whenever
you want to see what's come in.
