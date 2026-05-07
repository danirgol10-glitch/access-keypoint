# Trade11 — Codex Context

## Repo
Repository: danirgol10-glitch/access-keypoint  
App: Trade11

## Important environment note
This Codex chat may not have previous conversation history.

The source of truth is the current repository state, not previous Codex chats.

Before modifying code:
- Inspect the current files in the active branch.
- Do not rely on old diffs.
- Do not assume previous context unless it is written here or present in the repo.

This machine may not have Node/npm available.
- Do not run `npm install` or `npm run build` if Node/npm is unavailable.
- Do not claim local build passed unless it was actually executed.
- Validation can be done through GitHub Actions Web Build after opening a PR.

## Project context
Trade11 is a mobile app for organizing sticker albums and coordinating sticker exchanges between collectors.

The app was rejected by Apple under Guideline 5.6 because the experience did not meet the expected quality/polish standard. The current work is focused on improving UI quality, consistency, mobile polish, safe areas, visual hierarchy and interaction feel without breaking business logic.

## Working rules
- Work in small phases.
- One branch per phase.
- One PR per phase.
- Do not work directly on `main`.
- Always start from updated `main`.
- Do Plan Mode first.
- Do not modify code until the plan is approved.
- Keep diffs small and scoped.
- Do not touch Supabase, hooks, routes, contexts, MainLayout or business logic unless explicitly approved.
- Do not introduce new libraries.
- Prefer visual refactors over logic rewrites.
- Preserve existing handlers, queries, data structures and navigation.

## Visual system already available
The repo already includes:
- Premium global tokens in `src/index.css`.
- Premium shadcn/ui primitives.
- Premium app shell and bottom navigation.
- Shared UI components:
  - `AppScreen`
  - `PageHeader`
  - `AppCard`
  - `ListRow`
  - `EmptyState`
  - `StatTile`
  - `AvatarCircle`

Use these components when appropriate.

Avoid using `AppScreen` inside pages if it risks creating double scroll with `MainLayout`.

Preferred page root pattern:
```tsx
<div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
  <div className="page-vignette" />
  ...
</div>
Completed phases merged into main
Fase 1A: Premium global visual tokens.
Fase 1B: Premium UI primitives.
Fase 1C: Premium app shell and bottom navigation.
Fase 1D: Shared premium UI components.
Fase 1E: Home/Progreso migrated.
Fase 2A: Trading/Intercambio migrated.
Fase 2B: Album migrated.
Fase 2C: Friends/Amigos migrated.
Current next phase

Next phase: Fase 2D — Chats.

Goal:
Migrate Chats visually without changing business logic.

Likely scope:

src/pages/Chats.tsx
src/pages/ChatDetail.tsx if needed for the direct chat flow

Do not touch:

Other pages
Hooks
Supabase
Routes
AuthContext
LanguageContext
ThemeContext
MainLayout
Global components unless there is a real bug

Special risk:
Chat screens are sensitive because of:

message sending
scroll-to-bottom behavior
keyboard/mobile safe area
fixed input area
back navigation
avoiding double scroll

Codex must audit current files before proposing changes.
