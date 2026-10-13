# Knot — web app

Reminders, tasks and goals organised as **Projects → Lists → Tasks**, for personal or team use.
React 19 + Vite + React Router + Tailwind CSS v4 + DayPicker (calendar). No backend yet — auth (`src/lib/auth.tsx`) and projects (`src/lib/projects.tsx`) live in sessionStorage.
Custom field types and templates are defined in `src/lib/fieldTypes.ts`.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build
npm run lint    # oxlint
```

## Screens (current iteration)

| Route              | Screen                                        |
| ------------------ | --------------------------------------------- |
| `/`                | Sign in                                       |
| `/signup`          | Create account                                |
| `/forgot-password` | Reset password (prototype confirmation only)  |
| `/home`            | Home — empty state or project cards           |
| `/projects/new`    | Create project (individual mode)              |
| `/projects/:id`    | Project overview                              |
| `/projects/:id/edit` | Edit / delete project                       |

## Structure

```
src/
  index.css          design tokens (colors, radius, fonts) for both ambients
  router.tsx         route table
  lib/               auth + ambient contexts, validation, storage helpers
  components/        ui primitives, AuthLayout, AppShell, RouteGuards, Toast
  routes/            one file per screen
```

## Ambients

`data-ambient="personal" | "work"` on `<html>` swaps the whole palette (warm coral vs. calm indigo).
Components only use semantic tokens (`bg-primary`, `text-text-muted`, …), so new screens get both for free.
Switch it from the sidebar on the home screen.
