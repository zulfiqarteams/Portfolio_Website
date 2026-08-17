# Urdu Typing Tutorial — Part 1: Project Foundation

A modern, professional platform for learning Urdu phonetic typing.
This is **Part 1**: foundation only — routing, design system, layout,
and a polished home page. No typing engine, keyboard mapping,
lessons, progress tracking, or backend yet.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens the app locally (Vite will print the local URL, typically
`http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview   # optional: serve the production build locally
```

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · lucide-react.
No backend, no database, no auth — fully client-side.

## Folder structure

```
src/
  components/   Reusable UI primitives (Button, Card, Badge, Section, PageContainer, PlaceholderPage)
  layouts/      App chrome shared across routes (RootLayout, Navbar, Footer)
  pages/        One file per route
  features/     Empty homes for future modules (typing-engine, keyboard, lessons,
                practice, tests, progress, profiles, settings) — each has a README
                explaining its intended purpose
  hooks/        Shared hooks (useDocumentTitle)
  lib/          Small framework-agnostic utilities (cn)
  data/         Static data (nav config)
  types/        Shared TypeScript types
  styles/       Reserved for future design-system CSS beyond index.css
  utils/        Reserved for future RTL/formatting helpers
```

See the full Part 1 report in the chat for the reasoning behind this
structure, what was verified, and what's intentionally out of scope.
