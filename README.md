# RE — Code Variant, Build 01

> **Revive ideas. Find collaborators. Build again.**

RE is a frontend prototype of an open archive where unfinished, paused and abandoned
projects find the people willing to continue them. A project doesn't have to end when its
original creator stops working on it.

Everything here is client-side. There is no backend, no account system, no API calls and no
real requests to project owners.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other commands:

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## The product

| Route | Screen |
| --- | --- |
| `/` | Landing — hero with an art-directed project specimen, featured shelf, how-it-works, category index, closing CTA |
| `/explore` | Project discovery — search, four facets of filtering, five sort orders, live result counts, empty states |
| `/projects/:slug` | Project detail — editorial header, story, what exists, what's missing, why it paused, next steps, materials, field notes, handoff snapshot |
| `/desk` | Revival Desk — saved projects, revival plans with editable checklists, locally submitted projects, demo reset |
| `/submit` | Three-step submission — the idea, the handoff, the invitation — with live preview and validation |
| any other | Designed not-found state |

Discovery filters and sorting are reflected in the URL query string, so a filtered view can
be linked, refreshed, or reached with back/forward without losing context.

## What is functional

- **Navigation** — history-API router. Direct URLs, deep links, refresh and back/forward all
  work; the mobile menu opens, closes, is keyboard accessible and dismisses on selection.
- **Search** — immediate, case-insensitive, tokenised across title, description, summary,
  category, stage, technologies, skills, help needed, existing work, missing work, next
  steps, story, availability and pause reason.
- **Filtering** — category, project stage, help needed and availability combine freely.
  Individual filters can be removed from the active chips; "Clear all" resets everything.
  Facet counts are recomputed against the rest of the active filtering, so the numbers stay
  honest.
- **Sorting** — Curated / Featured, Recently Updated, Most Complete, Needs the Most Help, A–Z.
  All deterministic; no randomness anywhere.
- **Bookmarks** — toggle instantly from a card, a detail page or the specimen. State syncs
  across all three and persists in `localStorage`. A brief toast confirms the change.
- **Revival intent** — "Offer to contribute" and "Request stewardship" open dialogs with
  validation, a summary step and an explicit statement that nothing was sent. The result
  lands on the Revival Desk with a default continuation checklist.
- **Continuation checklists** — each plan carries three editable planning items with a live
  progress indicator, persisted locally.
- **Submission** — a three-step form with per-step validation, character limits, backwards
  navigation that preserves input, and a live dossier preview. Submitting mints a stable
  `RE-0xx` id and slug, adds the project to the local archive, and makes it appear in
  Explore, open at its own detail URL, and show under My Projects.
- **Onboarding** — a single optional, non-blocking welcome on first visit: pick interest
  categories and an intention, then continue or skip. Selections persist and subtly reorder
  the default curated view; they never hide anything.
- **Demo reset** — a confirmed reset clears only RE's own namespaced storage keys.

## What is simulated

| Action | Reality |
| --- | --- |
| Saving a project | Stored in this browser only. No one is notified. |
| Recording contribution or stewardship intent | A personal planning record. No project owner is contacted. |
| Requesting stewardship | A proposal stored locally. Ownership is not transferred and no approval is implied. |
| Submitting a project | Added to the local demo archive. It is not published, and no repository is created. |
| Demo mode badge | Everything runs locally; the badge marks that clearly in the header and footer. |

Every project, creator and field note in the archive is fictional and written for this
demonstration. No repositories are linked and no files are served.

## Data and state

- `src/data/projects.js` — twelve seeded projects, each with a distinct description, origin
  story, pause reason, existing work, three concrete open tasks, next steps, skills, a
  handoff checklist, field notes and materials.
- `src/context/REContext.jsx` — the single source of truth for projects, bookmarks, revival
  plans, submitted projects, onboarding preferences and toasts.
- `src/hooks/useLocalStorage.js` + `src/utils/storage.js` — namespaced, defensively parsed
  persistence. Missing, malformed or unavailable storage degrades to in-memory state rather
  than crashing.

Storage keys: `re:v1:saved`, `re:v1:plans`, `re:v1:projects`, `re:v1:preferences`.

## Accessibility

Semantic landmarks and heading order, a skip link, visible focus everywhere, labelled form
controls with inline validation, focus-trapped modals with focus restore and Escape
dismissal, `aria-live` announcements for search results and toasts, keyboard-operable cards,
touch-sized targets and full `prefers-reduced-motion` support.

## Stack

React 18, Vite 5, JavaScript, plain CSS with custom properties. No router, state-management
or CSS-in-JS dependency was added — the routing is a small history-API implementation and the
state is React Context.
