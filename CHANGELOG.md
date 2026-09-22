# PrepXAI — Project Architecture & Changelog Diary

## 📌 Project Overview
- **Product Name**: PrepXAI (Peer Study & CBT Simulator)
- **Target**: JEE Main / Advanced Aspirants
- **Stack**: React (Vite), Tailwind CSS, Lucide Icons, Supabase (PostgreSQL & Auth), Vercel Hosting
- **Marking Scheme**: +4 Correct, -1 Incorrect, 0 Unattempted

---

## 🏛️ Ground Rules & Constraints

### ⚠️ Critical Operating Protocol
1. **Uncertainty Guardrail (Code Verification First)**: If there is ever any ambiguity, unfamiliarity with a file, or uncertainty about past changes, STOP and ask the user to share the current file content or past actions before making changes. Never guess file state to avoid regressing or breaking existing functionality.
2. **Complete Code Deliverables**: Never provide partial code snippets, diff fragments, or vague instructions. Always deliver the **complete, fully-formed file** ready for a clean select-all-and-replace (`Ctrl + A` -> `Ctrl + V`).
3. **Exact Command Prompt Workflow**: Every modification must come paired with step-by-step Command Prompt (`cmd`) instructions for opening the target file in Notepad, running `npm run build`, and pushing cleanly through Git.

### 📐 Architectural & Domain Rules
4. **Marking & Scoring Standard**: Maintain the JEE standard marking scheme (+4 correct, -1 incorrect, 0 unattempted) across `testEngineService.js` and all result views.
5. **Syllabus Structure**: Maintain flat, iterable arrays for `Physics`, `Chemistry`, `Mathematics`, `All`, and `Full Syllabus` in `syllabusData.js` to safeguard against `not iterable` crashes.
6. **Feature Parity**: Any test configuration option, selector, or rule added to `Practice CBT` (`TestConfig.jsx`) must be mirrored in `Study Circles` (`CircleList.jsx`), and vice versa.
7. **Defensive Object Access**: Always supply fallback default values when reading configurations, question banks, or member profiles to permanently prevent `Cannot read properties of undefined` runtime exceptions.

---

## 📜 Chronological Dev Diary

### Session 1: Project Stabilization & Schema Fixes
- Resolved Supabase 400 Bad Request errors by creating and aligning relational database tables.
- Stabilized database connection and authentication listeners.
- Integrated question bank fallback logic to guarantee tests run even during network timeouts.

### Session 2: Syllabus & CBT Engine Parity
- **Syllabus Iteration Fix**: Rewrote `src/data/syllabusData.js` with direct flat arrays to eliminate `t.Physics is not iterable` runtime exceptions.
- **Scoring Engine**: Overhauled `src/services/testEngineService.js` to support index- and ID-based answers, string/integer answer keys ('A'-'D' or 0-3), and zero-division protection so accuracy and scores render reliably.
- **Config Crash Defense**: Hardened `src/features/cbt/TestOrganizer.jsx` with safe default objects to prevent `Cannot read properties of undefined (reading 'subject')`.

### Session 3: Multi-Chapter Selection & Subject Expansion
- **Circles Test Scheduler**: Added "All" subject option and an interactive, multi-chip chapter selector with a "Reset to All" toggle in `CircleList.jsx`.
- **CBT Parity**: Mirrored the multi-chapter chip selector into `TestConfig.jsx` and `TestOrganizer.jsx` for standard practice exams.
- **Leaderboard Repair**: Configured `circle_test_submissions` schema and upgraded `getCircleLeaderboard` in `circleService.js` to aggregate total scores, tests taken, and join user profiles correctly.
- **SPA Routing**: Added `vercel.json` rewrite configuration and explicit `base: '/'` in `vite.config.js` to resolve Vite `MIME type text/html` module script loading errors.

### Session 4: Rebranding to PrepXAI & Operational Safeguards
- Rebranded app to **PrepXAI** across UI navigation and app header.
- Replaced tab favicon in `index.html` with an inline SVG purple flame icon matching the brand header.
- Established `CHANGELOG.md` with explicit operating rules: complete code replacement files only, `cmd` instructions, and strict verification before modifying unfamiliar code.