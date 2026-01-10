# AGENTS.md

This file provides guidance for agentic coding agents operating in this
repository.

## Project Overview

Breathe Less is a Progressive Web App (PWA) for the Buteyko Method Maximum Pause
breathing exercise. Built with SvelteKit 5 using runes, Open Props CSS, and
IndexedDB for local storage.

## Build Commands

```bash
pnpm dev          # Start dev server on port 5172 with host access
pnpm build        # Build for production (Node.js adapter)
pnpm preview      # Preview production build
pnpm check        # Run Svelte type checking
pnpm check:watch  # Run Svelte type checking in watch mode
```

## Lint & Format

```bash
pnpm format       # Format code with Prettier (writes changes)
pnpm lint         # Run Prettier check + ESLint
```

## Testing

```bash
pnpm test:unit          # Run Vitest unit tests
pnpm test:unit -- --run --reporter=verbose  # Run with verbose output
pnpm test:e2e           # Run Playwright E2E tests
pnpm test               # Run all tests (unit + e2e)
```

### Running a Single Test

```bash
pnpm test:unit -- src/lib/timers.test.ts       # Single test file
pnpm test:unit -- --testNamePattern="timer"    # Tests matching pattern
pnpm test:e2e -- src/test/smoke.spec.ts        # Single E2E file
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with `strict: true` in tsconfig.json
- Avoid `any` type; use explicit types or `unknown` with type guards
- Use TypeScript interfaces for object shapes, types for unions/primitives
- Prefer explicit return types on public functions

### Svelte 5 Runes

- Use runes (`$state`, `$derived`, `$effect`, `$props`) for reactivity
- Classes use `$derived` for computed values, `$state` for mutable state
- Components use `$props()` for props with interface definition
- Use `$effect` for side effects; clean up in the cleanup function
- Svelte 5 event handlers: `onclick` not `on:click`

### Naming Conventions

- Classes: PascalCase (e.g., `BreathingStorage`, `Session`)
- Functions/variables: camelCase (e.g., `loadTodaysSessions`, `sessionSaved`)
- Constants: SCREAMING_SNAKE_CASE for global constants
- Interfaces: PascalCase with descriptive names (e.g., `BreathingSession`)
- File names: kebab-case for components (e.g., `pulse-timer.svelte`)

### Imports

- SvelteKit imports from `$app/environment` and `$app/state`
- Library imports from `$lib/` alias
- Group imports: SvelteKit → $lib → third-party → local
- Sort imports alphabetically within groups

### Error Handling

- Use try/catch for async operations
- Set user-facing error state in stores for UI feedback
- Log errors with `console.error` for debugging
- Gracefully handle null/undefined with optional chaining and nullish coalescing

### CSS & Styling

- Use Open Props CSS variables (e.g., `var(--surface-2)`, `var(--brand)`)
- Avoid custom CSS when Open Props provides suitable variables
- Use CSS containment for performance
- Mobile-first responsive design

### Component Patterns

- Define Props interface in `<script>` with `interface Props`
- Use `$props()` destructuring with defaults
- Callback props use optional function type with `?`
- Use `onTimerDone?.(value)` optional chaining for callbacks

### File Organization

- Components in `src/lib/components/`
- Core logic in `src/lib/` (session, storage, timers)
- Routes in `src/routes/`
- Tests co-located or in `src/test/`

### Misc

- No comments unless explaining complex logic (per CLAUDE.md)
- ESLint with perfectionist plugin sorts class members
- Disable lint rules sparingly with inline comments explaining why
