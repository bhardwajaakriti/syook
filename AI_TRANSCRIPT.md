# AI Collaboration Transcript

This is a shareable, cleaned-but-faithful transcript of the AI-assisted build session for the Syook CRM prototype. It preserves the important prompts, implementation decisions, course corrections, and verification steps without including private local files, credentials, or noisy terminal dumps.

## Project Context

- Repository: https://github.com/bhardwajaakriti/syook
- Live prototype: https://syookassignment.vercel.app
- Feature built: Syook internal sales CRM mobile prototype, focused on the 30-second deal update.
- Stack used: Vite, React 18, TypeScript, Tailwind CSS, localStorage.

## Transcript

### 1. Initial Build Request

**User**

> I have attached the `syook-prototype-build-prompt.md` which will guide you. Also attached `Syook_FSD.pdf`, `Syook_OnePager.pdf` and `Product Challenge.pdf`. Make sure that you put the code in the same folder with which this chat is aligned.
>
> Ask me questions whenever you need more information.

**Assistant**

I read the markdown prompt and extracted text from the PDFs. The requirements were clear enough to proceed without questions:

- Build one feature: the 30-second deal update.
- Use Vite + React + TypeScript + Tailwind.
- No backend, no auth, no router.
- Persist state in localStorage.
- Build exact seed data.
- Include pipeline, deal ticket, stage update, hold/resume, doc attach, note, offline queue, reset, closed deals.
- Verify the acceptance checklist.

I scaffolded the app directly inside `/Users/Aakriti/Downloads/syook_assignment`.

### 2. First Implementation Pass

**Assistant**

I created the core project files:

- `src/App.tsx`
- `src/data/seed.ts`
- `src/lib/store.ts`
- `src/lib/format.ts`
- `src/components/PipelineScreen.tsx`
- `src/components/DealScreen.tsx`
- `src/components/UpdateStageSheet.tsx`
- `src/components/HoldResumeSheet.tsx`
- `src/components/AddDocumentSheet.tsx`
- `src/components/QuickNoteSheet.tsx`

Implemented:

- Mobile phone frame on desktop and full-bleed mobile layout.
- Pipeline counts and filters.
- Staleness calculation from `lastActivityAt`.
- Resume-overdue pinning.
- Deal ticket quick actions.
- Bottom sheets for write flows.
- Append-only activity log.
- Simulated document attach.
- Offline toggle, queued badges, and fake sync.
- localStorage reset.

### 3. First Build Issue Caught

**Assistant**

The first `npm run build` failed with a TypeScript/Vite module resolution issue:

```text
Cannot find module '@vitejs/plugin-react' ... Consider updating to 'node16', 'nodenext', or 'bundler'.
```

I fixed this by changing TypeScript module resolution to `Bundler` in:

- `tsconfig.app.json`
- `tsconfig.node.json`

The build then passed.

### 4. Browser Verification and Polish

**Assistant**

I opened the local app in the in-app browser and verified the initial UI. A few issues surfaced during real browser testing:

- Product strings needed to exactly match the prompt, including the em dash in names like `InSite — Truck-In Truck-Out`.
- BRL compact currency was rendering as locale-specific `mi`; I normalized non-INR compact currency formatting to cleaner strings like `BRL 2.1M`.
- Generated TypeScript build artifacts appeared in the root; I moved build info into `node_modules/.tmp` and added a proper `.gitignore`.

Verified locally:

- Stale deal stage update resets staleness.
- Hold flow validates reason and resume date.
- Document attach appears in Documents and Activity.
- Offline queue reaches `2 updates queued` and clears after sync.
- Refresh preserves state.
- Won deal moves to Closed.
- Mobile and desktop phone-frame layouts render correctly.

### 5. Push to GitHub

**User**

> push my code to github it already has repo, `bhardwajaakriti/syook`

**Assistant**

I checked GitHub authentication, initialized Git locally, fetched the existing repo, preserved the existing `README.md`, ignored local PDFs and prompt files, committed the app, and pushed to `main`.

Initial app commit:

```text
871b014 Build Syook CRM prototype
```

Then Vercel metadata was ignored and pushed:

```text
1c1435e Ignore Vercel project metadata
```

### 6. Deploy to Vercel

**User**

> push this repo to vercel now

**Assistant**

I checked the Vercel CLI session. The account was already authenticated.

First attempt with `--project syook` failed because that Vercel project did not exist in the current scope.

I then used Vercel link/setup, which created and connected:

```text
aakriti-bhardwaj-s-projects/syook_assignment
```

The project was connected to:

```text
https://github.com/bhardwajaakriti/syook
```

Production deployment succeeded:

```text
https://syookassignment.vercel.app
```

I verified the live URL returned HTTP 200.

### 7. Add Preferred Project-Style Polish

**User**

> Great, you have my previous projects history from which you know what all types of features i usually prefer to develop and functionality also. Make sure you add that, push the code on github and make the version live with vercel.
>
> Do a final check where you test and see all working functionalities and it should be error free.

**Assistant**

I clarified that I did not have hidden memory of previous projects. I inspected the public GitHub account instead. The only other visible public project was:

```text
bhardwajaakriti/jove
```

From that repo, I inferred recurring preferences:

- TypeScript-first structure.
- Derived KPI/filter logic.
- Shared helper modules.
- Dashboard-style summary signals.
- Clear mock/demo data behavior.
- Strong README and run instructions.

I added Syook-compatible polish without expanding beyond the challenge scope:

- `src/lib/insights.ts`
- Pipeline `Today Focus` queue.
- Deal health strip with document and activity counts.
- Suggested next action button on deal tickets.
- Cleaner queue-count logic based on activity writes.
- Better README.
- Storage key bump to ensure clean seeded state after deployment.

Commit:

```text
d3e48ec Add CRM insight polish
```

### 8. Mistakes Caught During Final Testing

**Assistant**

A few issues were caught and fixed before the final deploy:

- The browser had old localStorage state from previous test flows, which made seed data look changed. I changed the storage key from `syook-crm-v1` to `syook-crm-v3` so the deployed version starts clean.
- The Vite dev server was holding hot-reloaded state during tests. I stopped and restarted it to verify against the current source.
- One browser automation script had a variable-name collision. I reran the check in a scoped block.
- One browser automation click timed out while the app itself was still responsive. I took a fresh DOM snapshot and reran the offline flow in smaller chunks.

### 9. Final Verification

**Assistant**

Local checks passed:

- `npm run build`
- Focus queue opens the right deal.
- Deal health strip appears.
- Suggested next action opens the correct sheet.
- Stale stage update loop works.
- Hold save is disabled until reason/date are valid.
- Held card shows resume date.
- Seeded overdue hold deal is pinned at top.
- Document attach appears in Documents and Activity.
- Offline stage change and document attach show `2 updates queued`.
- Sync clears queued badges and shows `Synced 2 updates`.
- Refresh preserves offline mode.
- Marking a deal Won moves it into Closed.
- Mobile full-bleed layout works.
- Desktop phone bezel layout works.
- Browser console had `0` errors.

Live Vercel smoke test passed:

```json
{
  "hasTodayFocus": true,
  "cleanSeedCounts": true,
  "exactSeedText": true,
  "errorCount": 0
}
```

### 10. Shareable Transcript Request

**User**

> I want this chat to be shareable, could you please make it shareable either as MD file on github

**Assistant**

I created this `AI_TRANSCRIPT.md` file and linked it from the README so it can be shared directly from GitHub.

## Final Links

- Live app: https://syookassignment.vercel.app
- GitHub repo: https://github.com/bhardwajaakriti/syook
- Transcript file: https://github.com/bhardwajaakriti/syook/blob/main/AI_TRANSCRIPT.md
