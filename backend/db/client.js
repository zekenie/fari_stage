const { Client } = require("pg");

// [PROBLEM] your app does not make use of connection pooling. If you have a spike in traffic,
// your app will try to execute all requests to the database concurrently and will exceed
// postgres' `max_connections`. This can be a big issue.

// Fortunately, the package your using supports connection pooling:
// https://node-postgres.com/features/pooling
const client = new Client({
  connectionString:
    process.env.DATABASE_URL || "postgres://localhost:5432/faristage",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

module.exports = client;
