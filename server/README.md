## Getting Started

```
npm install
npm run dev
```

```
open http://localhost:3000
```

## Database

The project uses Drizzle ORM with PostgreSQL. Database schema is defined in `src/db/schema.ts`.

### Database Commands

- `npm run db:generate` - Generate SQL migrations from schema changes
- `npm run db:migrate` - Apply pending migrations to the database
- `npm run db:push` - Push schema changes directly to the database (useful for development, bypasses migrations)

### Updating the Database

When you make changes to the schema in `src/db/schema.ts`, you can update your database using:

#### For Development (Direct Push)
```bash
npm run db:push
```
This will directly synchronize your database with the schema. You may be prompted to confirm if the changes require truncating tables.

#### For Production (Using Migrations)
```bash
npm run db:generate  # Creates migration files
npm run db:migrate   # Applies migrations to database
```

**Note:** `db:push` is faster for development but will prompt for confirmation if changes conflict with existing data. Use migrations for production deployments to maintain a history of schema changes.
