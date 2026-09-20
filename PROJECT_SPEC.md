# ApexPrep — Technical Specification & Architecture Spec

## 1. Project Overview & Rules of Engagement
- **App Name:** ApexPrep (JEE/NEET Prep Platform)
- **Stack:** React 19, Vite, Tailwind CSS v4, Lucide React, Supabase (Backend/Auth/Realtime).
- **Architecture Rule:** Strictly modular. No monolithic code in `App.jsx`. All logic is decomposed into dedicated helper functions (`src/services/`) and UI modules (`src/features/`). `App.jsx` only mounts components and handles routing/layout.
- **State Preservation:** This document is the single source of truth across all chat sessions.

---

## 2. Core Feature Pillars

### Feature 1: Authentication & User System
- Login & registration using Email and unique Username.
- Profile metadata: target exam (JEE Main / JEE Advanced / NEET), target year, avatar.
- Session persistence via Supabase Auth.

### Feature 2: Social & 1-on-1 Chat
- Search registered users by `@username`.
- Friend request workflow: `Send Request` -> `Pending` -> `Accepted` / `Declined`.
- Real-time direct chat between mutual friends using Supabase Realtime channels.

### Feature 3: Friend Circles (Study Groups) & Leaderboards
- Circle creation (creator has admin rights to invite/admit members).
- Creator can schedule tests (sets subject, chapters, start date/time, and duration).
- Automated Circle Leaderboard: ranks members by cumulative average percentage score across all circle-scheduled tests.

### Feature 4: CBT Test Organizer Engine
- Custom test generator: select subjects, specific chapters, number of questions, and custom timer.
- Standard JEE/NEET CBT interface:
  - Live countdown timer.
  - Question status palette (Not Visited, Unanswered, Answered, Marked for Review).
  - Both Single-Choice MCQs (+4, -1) and Numerical Value inputs (+4, 0).

### Feature 5: Question Pool & Practice Bank
- Searchable, filterable question repository.
- Filters: Subject -> Chapter -> Topic -> Year Tag (e.g., JEE Main 2024 Shift 1) -> Difficulty.
- Immediate practice mode with step-by-step LaTeX solution reveals.

### Feature 6: Growth & Weak-Area Analytics
- Automated performance categorization:
  - **Weak (< 45% accuracy):** Flagged for revision.
  - **Moderate (45% - 75% accuracy).**
  - **Strong (> 75% accuracy).**
- Visual charts breaking down accuracy by chapter and average time spent per question.

---

## 3. Directory Layout Blueprint

```text
apexprep/
├── PROJECT_SPEC.md
├── package.json
├── vite.config.js
└── src/
    ├── assets/
    ├── components/         # Shared UI (Navbar, Modal, Timer, Button)
    ├── features/
    │   ├── auth/           # LoginModal, RegisterModal, ProfileCard
    │   ├── social/         # UserSearch, FriendList, ChatWindow
    │   ├── circles/        # CircleList, CircleView, LeaderboardTable
    │   ├── cbt/            # TestConfig, TestRunner, QuestionPalette
    │   ├── question-pool/  # QuestionBank, FilterBar, QuestionCard
    │   └── analytics/      # GrowthDashboard, TopicBreakdown
    ├── services/           # Reusable business logic & API calls
    │   ├── supabaseClient.js
    │   ├── authService.js
    │   ├── socialService.js
    │   ├── circleService.js
    │   ├── testEngineService.js
    │   └── analyticsService.js
    ├── App.jsx             # Shell layout & view router only
    ├── App.css
    ├── index.css
    └── main.jsx

## Auto-Recorded Progress Log

- [x] 20/9/2026, 1:09:18 pm — Added Question Pool module with search and filters
- [x] 20/9/2026, 1:21:34 pm — Decoupled questions to JSON bank and added UI question append capability
- [x] 20/9/2026, 1:39:50 pm — Implemented NTA CBT test engine with presets and 75 PYQs
- [x] 20/9/2026, 1:46:08 pm — Wired CBT TestOrganizer into App.jsx shell router
- [x] 20/9/2026, 1:55:06 pm — Connected CBT engine to dynamically draw questions from the shared Question Pool
- [x] 20/9/2026, 2:03:21 pm — Added tab switch detection and exam proctoring hindrance safeguards