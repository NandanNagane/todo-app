# Copilot Instructions - Todoist Clone

## Architecture Overview
This is a full-stack MERN app with a **serverless-first architecture** deployed on Vercel. The backend (`/backend`) and frontend (`/frontend`) are separate deployables with distinct package.json files.

### Key Stack Components
- **Backend**: Express.js + Passport.js (Google OAuth) + JWT cookies + MongoDB/Mongoose
- **Frontend**: Vite + React 19 + TanStack Query + Jotai + shadcn/ui + Tailwind CSS v4
- **Deployment**: Vercel serverless functions for both frontend and backend

## Critical Patterns

### Authentication Architecture
- **JWT Strategy**: Access tokens in `httpOnly` cookies via `passport-jwt` with custom extractors (`accessTokenExtractor`, `refreshTokenExtractor`)
- **Google OAuth**: Full OAuth 2.0 flow in `/backend/config/passport.js` with `passport-google-oauth20`
- **Middleware Pattern**: Custom JWT middleware in `/backend/middlewares/accessTokenMiddlware.js` provides detailed JSON error responses for token expiration vs invalid tokens
- **CORS**: Configured for cross-origin cookies with `credentials: true` and specific origins

### Database Patterns
- **Serverless Connection**: Each request connects via `/backend/utils/conntect-to-DB.js` middleware to handle MongoDB Atlas in serverless environment
- **User Model**: Supports both `google` and `local` auth providers with conditional required fields (`googleId` vs `password`)
- **findOrCreate Plugin**: Uses `mongoose-findorcreate` for OAuth user creation

### Frontend State Management
- **TanStack Query**: Primary server state management with `QueryClientProvider` at app root
- **Jotai**: Global client state with `atomWithQuery` pattern in `/frontend/src/store/atoms/`
- **User State**: `currentUserAtom` formats backend user objects and adds computed fields (`firstName`, `lastName`)

### Component Architecture
- **shadcn/ui Pattern**: All UI components in `/frontend/src/components/ui/` follow radix-ui + class-variance-authority pattern
- **Feature Structure**: Components organized by feature (`auth/`, `dialogs/`, `sidebar/`)
- **Form Handling**: `react-hook-form` + `zod` + `@hookform/resolvers/zod` for all forms
- **Error Boundaries**: Nested error boundaries with custom fallback components

### Routing & Layout
- **Nested Routing**: `createBrowserRouter` with `/auth/*` and `/app/*` routes
- **Layout Pattern**: `AppLayout` wraps protected routes with `ThemeProvider` and `ErrorBoundary`
- **Route Guards**: Authentication handled through TanStack Query patterns, not route-level guards

### Development Workflow
- **Frontend Dev**: `cd frontend && npm run dev` (Vite dev server on :5173)
- **Backend Dev**: `cd backend && npm run dev` (nodemon with cross-env NODE_ENV=development)
- **Build**: `npm run build` in respective directories
- **Deployment**: Automatic Vercel deployment via `vercel.json` configs

### API Patterns
- **Axios Instance**: Centralized in `/frontend/src/api/axios.js` with base URL and credentials
- **API Modules**: Separated by domain (`auth.js`, `task.js`) with consistent error handling
- **Error Handling**: Custom `handleApiError` utility for consistent frontend error processing

### Styling Approach
- **Tailwind CSS v4**: Using new `@tailwindcss/vite` plugin
- **CSS Variables**: Theme system with CSS custom properties for light/dark modes
- **Component Variants**: `class-variance-authority` for component styling variants
- **Path Aliasing**: `@/` alias maps to `/frontend/src/`

## File Conventions
- **Backend**: ES modules (`"type": "module"`) with `.js` extensions
- **Frontend**: JSX files use `.jsx` extension, utilities use `.js`
- **Imports**: Always use file extensions in backend imports
- **SVG**: React components via `vite-plugin-svgr` with `?react` suffix

## Environment & Deployment
- **Backend ENV**: Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `SERVER_URL`, MongoDB connection
- **Serverless**: Express app exported as default for Vercel, conditional local listening
- **CORS**: Hardcoded allowed origins for localhost:5173 and production domain
- **Cookies**: `SameSite=None; Secure` for production cross-domain cookies

## Common Tasks
- **Add new API route**: Create in `/backend/routes/`, add to main router in `index.js`
- **Add new UI component**: Use shadcn/ui CLI or follow existing patterns in `/components/ui/`
- **State management**: Use TanStack Query for server state, Jotai atoms for client state
- **Form creation**: Combine `react-hook-form` + `zod` schema + shadcn form components
- **Error handling**: Use existing error boundary pattern and `handleApiError` utility