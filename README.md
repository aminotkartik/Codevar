# RE — Code Variant, Build 01

> **Revive ideas. Find collaborators. Build again.**

RE is a frontend prototype of an open archive where unfinished, paused and abandoned
projects find the people willing to continue them. A project doesn't have to end when its
original creator stops working on it.

Everything here is client-side. There is no backend, no account system, no API calls and no
real requests to project owners.

## The Canvas Protocol

This build replaces every primary-action button with **draggable data cards and named Action
Zones**. A drop is the action — a card cannot be saved, published, completed or removed any
other way.

| Card | Dropped into | Result |
| --- | --- | --- |
| Archive project | **Save to Revival Desk** | The project is added to your desk (idempotent). |
| Archive project | **Offer to help** | A contribution composer opens, preselected to that project. |
| Archive project | **Take stewardship** | A stewardship preparation panel opens (only for projects open to it). |
| Revival plan card | **Drafted / Planning / Working / Archived** | The plan's local status changes. The card's status mark updates; there is no status menu. |
| Contribution intent / stewardship proposal | **Add plan to desk** | A local revival plan is committed, with a continuation checklist. |
| Valid project draft | **Publish to archive** | The project joins the local demo archive, Explore and My projects. |
| Edited plan card | **Update plan** | The plan is updated, keeping its plan ID and project link. |
| Saved project or plan | **Remove from desk** | A pending-removal card is created. Nothing is deleted yet. |
| Pending removal card | **Confirm removal** | The named item leaves your desk; the archive project stays. |
| Your own published project | **Discard project** | A staged discard of a locally created project. |
| Open / complete task | **Completed** / **Reopen task** | The task state changes and plan progress follows. |
| Demo records card | **Reset demo data** | A staged reset of RE's own localStorage keys. |

The Action Zone dock is context-aware: at rest it offers the operations that make sense on the
current screen, and during a drag it narrows to exactly the zones that accept the card in hand.

## Discovery sorting

Five deterministic, single-definition comparators in `src/utils/projectSorting.js`:

| Option | Comparator |
| --- | --- |
| Curated / Featured | featured → priority desc → completion desc → archive id |
| Recently Updated | `updatedAt` desc (undated last) → title → archive id |
| Most Complete | `completion` desc → title → archive id |
| Needs the Most Help | priority desc → completion asc → archive id |
| A — Z | title (case-insensitive, numeric aware) → archive id |

The chosen mode lives in the URL (`?sort=…`), is normalised on read (a stale
`?sort=updated` is repaired rather than silently ignored), is pushed into history so
Back/Forward restore the previous order, and is the *only* thing that decides the rendered
order — the interest boost applies to the curated default alone, and an explicit sort always
wins. Facet and sort changes keep the scroll position; only a route change scrolls to top.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run check:canvas  # smoke render, sorting, dispatcher, panels, mount, compliance
```

## The product

| Route | Screen |
| --- | --- |
| `/` | Landing — hero specimen, shelf of draggable cards, how-it-works, category index |
| `/explore` | Canvas worktable — filter rail, draggable cards, live inspector, Action Zone dock |
| `/projects/:slug` | Project detail — story, what exists, what's missing, next steps, handoff snapshot, draggable specimen |
| `/desk` | Revival Desk — saved projects, plans with draggable tasks, locally published projects, staged demo reset |
| `/submit` | Three-step submission with a live draggable draft card and drag-to-publish |
| any other | Designed not-found state |

Discovery filters and sorting are reflected in the URL query string, so a filtered view can
be linked, refreshed, or reached with back/forward without losing context.

## Interaction model

- **Shared drag context.** One `DndContext` wraps the whole app (`src/dnd/CanvasDnd.jsx`), so a
  card picked up in a side panel can be dropped on a zone anywhere — dock, panel or page.
- **One writer.** `performDrop()` is the only place saved projects, plans, plan tasks and
  locally published projects change. Components may open composers, close panels, and edit
  drafts — they cannot commit. A static + live audit in `scripts/compliance-test.jsx` fails
  the build if a component reaches around it, or if any non-grip button on any route writes
  to storage when clicked.
- **Mouse and touch are separate sensors.** `MouseSensor` (6px) never claims a touch, and
  `TouchSensor` lifts a card only after a 220ms press-and-hold, so scrolling a page with a
  thumb resting on a grip stays scrolling.
- **Central registry.** `src/dnd/zones.js` declares every zone, what it accepts, and which card
  states are valid. `performDrop()` in `src/context/REContext.jsx` is the only place a primary
  action is committed, and it rejects anything the registry does not allow.
- **Typed cards.** Every draggable carries `{ type, id, … }` metadata (`src/dnd/items.js`), so a
  zone validates the card itself rather than its position on screen.
- **Mouse, touch and keyboard.** Pointer sensor (6px threshold), touch sensor (180ms hold), and a
  keyboard sensor whose arrow keys jump between compatible zones. Space picks up and drops,
  Escape cancels, and every pickup, traversal and result is announced.
- **Portaled overlays.** Docks, preparation panels, the removal panel, the filter drawer, the
  onboarding dialog and toasts render into `document.body` on a documented z-index ladder. This
  is why the offer-to-help composer always appears above the sticky header and everything else.
- **Honest feedback.** Toasts and a polite live region describe what actually happened, including
  rejected drops ("This project is already on your Revival Desk"). Invalid drops never mutate data.

## The paper system

`src/styles/tokens.css` adds four paper weights (ivory, warm, kraft, kraft-deep) plus an
extremely faint CSS grain, a "lip" under each card (`::after`), and three diffused paper
shadows. Cards use 5px radii and crisp rules; the Action Zone tray is kraft stock so
destinations are never confused with draggable sheets. Terracotta remains the only accent:
grips, active destinations, archive marks and destructive staging.

## What is stored locally

`re:v1:saved`, `re:v1:plans`, `re:v1:projects`, `re:v1:preferences`.
Plan status changes are stored on the plan (`status`, `statusUpdatedAt`); the plan id, its
project link and its tasks are never rewritten by a status drop.

Plans written by an older build that used `checklist` are migrated to `tasks` on read. Malformed
or missing values fall back to safe defaults instead of breaking the app. Demo reset clears only
these four keys, and requires a two-stage drag confirmation.

## Onboarding

First visit opens a short canvas tutorial ("Your next move starts with a drag"). Its sample card
is a real draggable and its Save zone is a real Action Zone: completing the demonstration actually
saves Open Orchard to the desk. Completion is remembered in `re:v1:preferences`.

## What is simulated

| Action | Reality |
| --- | --- |
| Saving a project | Stored in this browser only. No one is notified. |
| Recording contribution or stewardship intent | A personal planning record. No owner is contacted, and no approval is implied. |
| Proposing stewardship | A local proposal. Ownership is not transferred. |
| Publishing a project | Added to the local demo archive only. Nothing is published to the internet. |
| Removing or discarding | Your personal desk only. Seeded archive projects cannot be discarded. |
| Demo mode badge | Everything runs locally; the badge marks that clearly in the header and footer. |

Every project, creator and field note in the archive is fictional and written for this
demonstration. No repositories are linked and no files are served.
