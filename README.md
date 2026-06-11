# Syook CRM Prototype

Mobile-first Vite + React + TypeScript prototype for Syook's internal sales CRM challenge.

Live app: https://syookassignment.vercel.app

AI transcript: https://github.com/bhardwajaakriti/syook/blob/main/AI_TRANSCRIPT.md

## Feature

The 30-second deal update: a field sales associate can open a deal, update stage, put it on hold, attach a document, or add a note from a phone-sized deal ticket. Data is seeded locally and persists in `localStorage`.

## Included

- Mobile pipeline with open, hold, stale, stage, and closed-deal views
- Today Focus queue derived from overdue, stale, and document-missing deals
- Deal health strip with docs, activity count, and suggested next action
- Stage update, hold/resume, document attach, and quick note bottom sheets
- Offline mode with queued writes, pending badges, fake sync, and refresh persistence
- Demo reset from the overflow menu

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
