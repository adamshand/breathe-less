# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Breathe Less is a timer and progress tracking Progressive Web App (PWA) for the Buteyko Method Maximum Pause exercise. The app guides users through a structured breathing exercise with multiple stages including pulse measurement, control pauses, very shallow breathing, and maximum pause holds.

## Development Commands

- `pnpm dev` - Start development server (runs on port 5172 with host access)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Svelte type checking
- `pnpm check:watch` - Run Svelte type checking in watch mode
- `pnpm format` - Format code with Prettier
- `pnpm lint` - Run linting checks (Prettier + ESLint)
- `pnpm test:unit` - Run unit tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright
- `pnpm test` - Run all tests (unit + e2e)

## Architecture

### Technology Stack
- **Framework**: SvelteKit 5 with runes enabled
- **Styling**: Open Props CSS framework
- **Storage**: IndexedDB for local data persistence via custom storage class
- **Audio**: Web Audio API for timer sounds
- **Deployment**: Node.js adapter for production

### Key Components

#### Core State Management
- `src/lib/session.svelte.ts` - Central session state using Svelte 5 runes
- `src/lib/breathingStorage.ts` - IndexedDB wrapper for data persistence with migration support

#### Timer System
- `src/lib/timers.ts` - Exercise stage definitions and sequencing
- `src/lib/components/Timer.svelte` - Countdown timer component
- `src/lib/components/PulseTimer.svelte` - Pulse measurement timer

#### Data Structure
Sessions store: pulse readings (x2), control pauses (x2), maximum pauses (x3), and personal best tracking. Data persists locally in IndexedDB with automatic migration between schema versions.

#### Exercise Flow
The app follows a fixed sequence defined in `timers.ts`: pulse → control pause → very shallow breathing → recover → maximum pause (3 rounds with increasing intensity) → final control pause → pulse → finished.

### Route Structure
- `/` - Main exercise interface
- `/history` - Session history and statistics  
- `/settings` - App configuration
- `/instructions` - Exercise instructions
- `/about` - App information

### PWA Features
- Service worker for offline functionality
- Progressive enhancement design
- Mobile-optimized with gesture support
- Audio feedback with iOS compatibility

## Testing
- Unit tests use Vitest with Testing Library
- E2E tests use Playwright
- Test setup configured in `vitest-setup-client.ts`