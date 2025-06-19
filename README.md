# Marine Data Hub

A Remix.run v2 web application for managing, querying, and uploading spatio-temporal marine data.  
Demonstrates a hybrid database setup with MySQL, MongoDB, and Redis caching.

---

## Features

- User authentication and session management  
- Upload marine data CSV files, linked to elements  
- Store metadata in MySQL, data points in MongoDB  
- Query data with bounding box filtering and element selection  
- Redis caching for frequently queried data  
- Preview and download uploaded files  
- Responsive UI with Tailwind CSS

---

## Prerequisites

- **Node.js** (v18 or higher recommended)  
- **npm** (comes with Node.js)  
- **MySQL** server running locally or remotely  
- **MongoDB** server running locally or remotely  
- **Redis** server running locally or remotely  
- MacOS tested, should work on Linux/Windows with minimal changes

---

## Setup Instructions

### 1. Clone the Repository
### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL="mysql://root:ppasssword@localhost:3306/oceanic"
MONGODB_URL="mongodb://127.0.0.1:27017/oceanic?directConnection=true&serverSelectionTimeoutMS=2000"

NODE_ENV="development"
SERVER_URL="http://localhost:3000"

SESSION_SECRET="yp7cV8qrMAs3txy7Areb8Wj5d@tc0@y"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

* Replace MySQL connection string (`DATABASE_URL`) with your credentials
* Replace MongoDB URL if different
* Adjust Redis host and port as needed
* Set a strong `SESSION_SECRET` for user session security

---

### 4. Install and Start Databases and Redis

#### MySQL

* Install MySQL via [Homebrew](https://brew.sh) if not installed:

```bash
brew install mysql
brew services start mysql
```

* Create the database and user as per your `.env` credentials.

#### MongoDB

* Install MongoDB via Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

#### Redis

* Install Redis via Homebrew:

```bash
brew install redis
brew services start redis
```

Verify Redis is running:

```bash
redis-cli ping
# Should reply with PONG
```

---

### 5. Set up Prisma and Database Migrations

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma generate --schema=prisma/mongo.prisma
```

---

### 6. Seed the Database

```bash
npm run setup
```

This runs Prisma generate, applies migrations, and seeds initial data like Elements and Element Categories.

---

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure Highlights

* `app/routes/inside/upload.tsx` — Upload new marine data files
* `app/routes/inside/uploads.tsx` — View user uploads with preview and download
* `app/db.server.ts` — MySQL (Prisma) setup
* `app/db2.server.ts` — MongoDB setup
* `app/models/redis.server.ts` — Redis client setup and caching utilities
* `app/components/` — Reusable UI components using Tailwind CSS

---

## Troubleshooting

* If you get errors related to missing environment variables, double-check your `.env`
* Ensure MySQL, MongoDB, and Redis are running and accessible via the configured host/ports
* If you see errors about `Buffer is not defined` in client bundles, ensure your Node and Remix versions are compatible
* Use `redis-cli` to check Redis connectivity

---

## Running

There's a 'test.csv' file in the root directory that you can use to test the upload functionality.

---

## Testing

Run unit and E2E tests with:

```bash
npm test
```

---

## Additional Notes

* Data caching via Redis has a default TTL of 5 minutes
* Uploaded CSVs are parsed and stored in MongoDB with metadata in MySQL
* The UI is built with Tailwind CSS and React Icons for a clean look

---

## License

MIT License © Praise Mlambo

---

If you have any questions or issues, please do not contact me.
