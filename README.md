BabuVault

Overview
- BabuVault is a modern Indian automotive web platform featuring auctions, price checking, and curated number plate lookup. This repository contains the React + TypeScript frontend built with Vite and the Supabase Edge Functions used for secure server-side logic.

Tech Stack
- React 18 + TypeScript
- Vite + @vitejs/plugin-react-swc
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- React Router, React Query, Framer Motion

Getting Started
1) Install dependencies
- npm install

2) Environment variables
- Copy your Supabase URL and anon/publishable key into a .env file:
- VITE_SUPABASE_URL=your_project_url
- VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

3) Run the dev server
- npm run dev

Build
- npm run build
- npm run preview

Branding
- The application branding is BabuVault. All Lovable or starter-template branding has been removed.

Notes
- This README focuses on local development for the UI and basic configuration only. Backend and database schemas are managed via Supabase and SQL migrations within the supabase/ directory.
