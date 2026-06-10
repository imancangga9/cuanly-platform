## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Project Structure

- `src/app/(auth)/` - Login, Register pages
- `src/app/(dashboard)/` - Dashboard, Products, Transactions, Expenses, Settings
- `src/actions/` - Server Actions (auth, products, transactions, expenses, pricing, profile)
- `src/components/` - UI components and layout
- `src/lib/` - Utility functions and Supabase clients
- `src/database/` - SQL schema

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in Supabase credentials.
