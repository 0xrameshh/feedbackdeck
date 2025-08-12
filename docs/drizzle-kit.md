# Drizzle Kit Documentation

## Overview
Drizzle Kit is a CLI tool that provides database migration utilities for Drizzle ORM. It helps manage database schema changes, generate migrations, and introspect existing databases.

## Installation
Drizzle Kit is typically installed as a dev dependency:

```bash
pnpm add -D drizzle-kit
```

## Configuration

### Basic Configuration File (`drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // 'mysql' | 'sqlite' | 'postgresql' | 'turso' | 'singlestore'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Configuration with Multiple Schema Files
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema', // Directory containing schema files
  out: './drizzle',
});
```

### Advanced Configuration Options
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/*', // Wildcard pattern
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Schema filtering for multi-schema databases
  schemaFilter: ['public', 'auth', 'billing'],
  // Migration table configuration
  migrations: {
    table: '__drizzle_migrations',
    schema: 'drizzle'
  }
});
```

## Core Commands

### 1. Generate Migrations
Creates migration files based on schema changes:

```bash
# Generate migration with auto-generated name
npx drizzle-kit generate

# Generate migration with custom name
npx drizzle-kit generate --name=init
```

This command:
- Compares your current schema with the database
- Creates SQL migration files in the `out` directory
- Tracks schema changes for version control

### 2. Apply Migrations
Applies pending migrations to the database:

```bash
npx drizzle-kit migrate
```

This command:
- Executes all pending migration files
- Updates the migration log table
- Brings database schema up to date

### 3. Push Schema Changes
Directly applies schema changes without generating migration files:

```bash
npx drizzle-kit push
```

**When to use `push`:**
- Local development and prototyping
- Quick schema iterations
- When you don't need migration history

**When to use `generate` + `migrate`:**
- Production environments
- Team collaboration
- When you need migration version control

### 4. Introspect Database
Generates schema files from an existing database:

```bash
npx drizzle-kit pull
```

This command:
- Connects to your database
- Generates TypeScript schema files
- Creates migration snapshots
- Useful for reverse-engineering existing databases

## Migration Workflow

### Development Workflow
```bash
# 1. Make changes to your schema files
# 2. Generate migration
npx drizzle-kit generate

# 3. Review the generated SQL migration
# 4. Apply the migration
npx drizzle-kit migrate
```

### Production Deployment
```bash
# 1. Generate migrations in development
npx drizzle-kit generate

# 2. Commit migration files to version control
# 3. In production, apply migrations
npx drizzle-kit migrate
```

## Configuration Options

### Schema Filter
For PostgreSQL databases with multiple schemas:

```typescript
export default defineConfig({
  dialect: "postgresql",
  schemaFilter: ["public", "auth", "billing"], // Only manage these schemas
});
```

### Migration Configuration
Customize migration table settings:

```typescript
export default defineConfig({
  migrations: {
    table: "__drizzle_migrations", // Migration log table name
    schema: "drizzle" // Schema for migration table
  }
});
```

## Environment-Specific Configurations

### Development Configuration
```typescript
// drizzle.config.dev.ts
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DEV_DATABASE_URL!,
  }
});
```

### Production Configuration
```typescript
// drizzle.config.prod.ts
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PROD_DATABASE_URL!,
  }
});
```

## Integration Examples

### With Supabase
```typescript
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:pull": "drizzle-kit pull",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Best Practices

### 1. Migration Management
- Always review generated migrations before applying
- Use descriptive names for migrations: `--name=add-billing-tables`
- Keep migrations atomic and reversible when possible
- Test migrations on staging before production

### 2. Schema Organization
- Keep related tables in the same schema file
- Use clear, descriptive table and column names
- Document complex relationships and constraints
- Use TypeScript types for better development experience

### 3. Environment Management
- Use different databases for dev/staging/production
- Never run `push` in production (use migrations instead)
- Keep environment variables secure and properly configured
- Use schema filtering for multi-tenant applications

### 4. Version Control
- Always commit migration files to version control
- Include both generated SQL and TypeScript schema changes
- Use meaningful commit messages for schema changes
- Review migration files in pull requests

## Common Use Cases

### Adding New Tables
```bash
# 1. Add table definition to schema.ts
# 2. Generate migration
npx drizzle-kit generate --name=add-subscriptions-table

# 3. Apply migration
npx drizzle-kit migrate
```

### Modifying Existing Columns
```bash
# 1. Modify column in schema
# 2. Generate migration
npx drizzle-kit generate --name=update-user-table

# 3. Review generated SQL carefully
# 4. Apply migration
npx drizzle-kit migrate
```

### Setting Up New Environment
```bash
# 1. Pull existing schema
npx drizzle-kit pull

# 2. Or apply all migrations
npx drizzle-kit migrate
```

## Troubleshooting

### Common Issues

1. **Migration conflicts**: 
   - Resolve by manually editing migration files
   - Ensure team coordination on schema changes

2. **Database connection errors**:
   - Verify DATABASE_URL environment variable
   - Check database credentials and network access

3. **Schema drift**:
   - Use `drizzle-kit pull` to sync with database
   - Compare generated schema with your files

### Debug Mode
Add verbose logging to commands:
```bash
npx drizzle-kit generate --verbose
npx drizzle-kit migrate --verbose
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Database Migration
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run migrations
        run: npx drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

This comprehensive documentation should help you effectively use Drizzle Kit for managing your database schema and migrations in your SaaS template project.