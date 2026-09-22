# PrepXAI — Project Architecture & Changelog Diary

## 📌 Project Overview
- **Product Name**: PrepXAI (Peer Study & CBT Simulator)
- **Target**: JEE Main / Advanced Aspirants
- **Stack**: React (Vite), Tailwind CSS, Lucide Icons, Supabase (PostgreSQL & Auth), Vercel Hosting
- **Marking Scheme**: +4 Correct, -1 Incorrect, 0 Unattempted

---

## 🏛️ Ground Rules & Constraints
1. **Marking & Scoring**: Always respect the +4 / -1 JEE standard in `testEngineService.js`.
2. **Syllabus Structure**: Flat arrays for `Physics`, `Chemistry`, `Mathematics`, `All`, and `Full Syllabus` in `syllabusData.js` to avoid `not iterable` crashes.
3. **UI Parity**: Whatever configuration feature is added to `Practice CBT` (`TestConfig.jsx`) must exist identically in `Study Circles` (`CircleList.jsx`), and vice-versa.
4. **Resilient Data Access**: Always provide fallback defaults when reading `config`, `questions`, and `answers` to prevent `Cannot read properties of undefined` crashes.

---

## 📜 Chronological Dev Diary

### Session 1: Project Stabilization & Schema Fixes
- Resolved Supabase 400 Bad Request errors by creating/updating relational schemas.
- Stabilized database connection and authentication listeners.
- Integrated question bank fallback logic to guarantee tests run even during network timeouts.

### Session 2: Syllabus & CBT Engine Parity
- **Syllabus Iteration Fix**: Rewrote `src/data/syllabusData.js` with direct flat arrays to eliminate `t.Physics is not iterable` runtime exceptions.
- **Scoring Engine**: Overhauled `src/services/testEngineService.js` to support index and ID-based answers, string or integer answer keys ('A'-'D' or 0-3), and zero-division protection so accuracy and scores render correctly.
- **Config Crash Defense**: Hardened `src/features/cbt/TestOrganizer.jsx` with default objects to prevent `Cannot read properties of undefined (reading 'subject')`.

### Session 3: Multi-Chapter Selection & Subject Expansion
- **Circles Test Scheduler**: Added "All" subject option and an interactive, multi-chip chapter selector with a "Reset to All" toggle in `CircleList.jsx`.
- **CBT Parity**: Mirrored the multi-chapter selector into `TestConfig.jsx` and `TestOrganizer.jsx` for standard practice exams.
- **Leaderboard Repair**: Configured `circle_test_submissions` schema and upgraded `getCircleLeaderboard` in `circleService.js` to aggregate total scores, tests taken, and join user profiles correctly.
- **SPA Routing**: Added `vercel.json` rewrite configuration and explicit `base: '/'` in `vite.config.js` to solve Vite `MIME type text/html` module script loading errors.

### Session 4: Rebranding to PrepXAI
- Updated app title to **PrepXAI** in navigation and header.
- Replaced tab favicon in `index.html` with an inline SVG purple flame icon matching the in-app brand header.
- Established `CHANGELOG.md` as the persistent ledger for future updates.