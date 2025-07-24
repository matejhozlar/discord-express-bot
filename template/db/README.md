# Database Configuration

This folder contains pluggable database modules for your project. You can choose one database backend or disable the database entirely depending on your project needs.

---

## Supported Databases

| Database   | File                    | Env Variables Required                                        |
| ---------- | ----------------------- | ------------------------------------------------------------- |
| PostgreSQL | `postgresql.js`         | `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_DATABASE` |
| MySQL      | `mysql.js`              | `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_DATABASE` |
| MongoDB    | `mongodb.js` (Mongoose) | `DB_URI`, `DB_DATABASE`                                       |
| SQLite     | `sqlite.js`             | _(No `.env` needed by default)_                               |

---

## How to Use a Database

1. **Pick the file** that matches the database you want to use.
2. **Update your import in `server.js`:**

```js
// PostgreSQL
import db, { connectToDatabase } from "./db/postgresql.js";

// MySQL
// import db, { connectToDatabase } from "./db/mysql.js";

// MongoDB
// import mongoose, { connectToDatabase } from "./db/mongodb.js";

// SQLite
// import { getDb, connectToDatabase } from "./db/sqlite.js";
```

3. **Call the `connectToDatabase()` function:**

```js
await connectToDatabase();
```

4. **Pass the database to components like your Discord bot if needed:**

```js
await initDiscordBot(db, io); // or just initDiscordBot(io) if no DB used
```

5. **Handle shutdown (Ctrl+C):**

```js
process.on("SIGINT", async () => {
  if (db?.end) await db.end(); // PostgreSQL, MySQL
  if (mongoose?.connection) await mongoose.connection.close(); // MongoDB
  // SQLite typically requires no shutdown handling
});
```

---

## If You're Not Using a Database

1. Remove the DB import from `server.js`
2. Delete or comment the `connectToDatabase()` call
3. Change `initDiscordBot(db, io)` → `initDiscordBot(io)`
4. Remove the `await db.end()` shutdown line

Your app will still work perfectly without a database.

---

## Files in This Folder

- `postgresql.js` – Connects using `pg.Pool`
- `mysql.js` – Connects using `mysql2/promise`
- `mongodb.js` – Connects using `mongoose`
- `sqlite.js` – Uses `better-sqlite3` (embedded DB)

---

## Example `.env`

```env
# PostgreSQL or MySQL
DB_USER=youruser
DB_PASSWORD=yourpass
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=mydb

# MongoDB
DB_URI=mongodb://localhost:27017
DB_DATABASE=mydb
```

---

## Optional: Adding More Drivers

To add support for another database or ORM:

- Create a new file (e.g., `prisma.js`)
- Follow the same export structure:

  - `connectToDatabase()` for initialization
  - Optional `default` export for the instance
