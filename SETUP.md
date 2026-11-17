# Setup Guide - Lab Register Management System

## ✅ Package.json Files Created

All package.json files have been created for the monorepo structure:

- ✅ Root `package.json` - Workspace configuration
- ✅ `packages/core/package.json` - Core utilities package
- ✅ `packages/storage/package.json` - Database package
- ✅ `apps/api/package.json` - API server package
- ✅ `apps/web/package.json` - Frontend package

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd saas-starter
bun install
```

### 2. Create Environment File

Create a `.env` file in the `saas-starter` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lab_registers

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_BASE_PATH=/api/auth

# App URLs
VITE_PUBLIC_API_URL=http://localhost:3000
VITE_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: 
- Replace `DATABASE_URL` with your actual PostgreSQL connection string
- Generate a secure random string for `BETTER_AUTH_SECRET` (you can use: `openssl rand -base64 32`)

### 3. Set Up Database

```bash
# Generate migrations from schemas
bun run db:generate

# Push schemas to database
bun run db:push
```

### 4. Start Development Servers

```bash
# Start both API and Web servers
bun run dev
```

Or start them separately:

```bash
# Terminal 1 - API Server
cd apps/api
bun run dev

# Terminal 2 - Web Server
cd apps/web
bun run dev
```

## 📋 Available Scripts

### Root Level

- `bun run dev` - Start both API and web servers
- `bun run build` - Build all packages
- `bun run typecheck` - Type check all packages
- `bun run lint` - Lint all packages
- `bun run db:generate` - Generate database migrations
- `bun run db:push` - Push database schemas

### Package Level

Each package has its own scripts. Run with:
```bash
bun run --filter=<package-name> <script>
```

Example:
```bash
bun run --filter=storage db:studio  # Open Drizzle Studio
```

## 🔧 Troubleshooting

### Dependencies Not Installing

If you encounter issues with workspace dependencies:

```bash
# Clear cache and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
bun install
```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` is correct
3. Ensure database exists: `CREATE DATABASE lab_registers;`
4. Check network/firewall settings

### Better Auth Issues

1. Ensure `BETTER_AUTH_SECRET` is set
2. Verify `BETTER_AUTH_URL` matches your app URL
3. Check that auth tables exist in database

### Type Errors

If you see TypeScript errors about missing types:

```bash
bun run typecheck
```

This will show all type errors across the monorepo.

## 📝 Next Steps

1. ✅ Install dependencies: `bun install`
2. ✅ Set up `.env` file
3. ✅ Run database migrations
4. ✅ Start development servers
5. ✅ Test the application at `http://localhost:3000`

## 🎯 Testing the App

Once running:

1. **Sign Up**: Navigate to `/auth/signup` and create an account
2. **Login**: Use your credentials at `/auth/login`
3. **Dashboard**: View statistics at `/app/dashboard`
4. **Registers**: Browse and manage registers at `/app/registers`

## 📚 Documentation

- See `README.md` for project overview
- See `docs/` folder for detailed documentation
- See `TEST_RESULTS.md` for validation results

---

**Ready to go!** 🚀
