import React, { useState } from 'react';
import {
  ArrowRight, BookOpen, Brain, CheckCircle2, ChevronDown, Clock3,
  Flame, LineChart, MessageCircle, Sparkles, Target, Users, Zap, Download
} from 'lucide-react';
import { APP_UPDATE_URL } from '../../config/appVersion';

const features = [
  {
    id: 'learn',
    icon: BookOpen,
    title: 'Learn by topic',
    short: 'Structured chapter learning',
    description: 'Break PCMB preparation into focused chapters and subtopics instead of facing the whole syllabus at once.',
    points: ['Chapter and subtopic structure', 'Focused practice after learning', 'JEE and NEET-aware experience']
  },
  {
    id: 'practice',
    icon: Zap,
    title: 'Practice like the real exam',
    short: 'Timed CBT-style practice',
    description: 'Practice with timed questions and exam-style interfaces designed to make your preparation feel closer to test day.',
    points: ['Timed chapter practice', 'CBT-style question flow', 'MCQ and integer-type support']
  },
  {
    id: 'pyq',
    icon: Brain,
    title: 'PYQs that build experience',
    short: 'Previous-year question practice',
    description: 'Work through previous-year questions with year context and focused sessions so you can understand how questions have appeared.',
    points: ['Subtopic-focused PYQs', 'Year-labelled questions', 'Randomized practice sessions']
  },
  {
    id: 'tests',
    icon: Target,
    title: 'Build your own tests',
    short: 'Custom test creation',
    description: 'Choose the chapters, subjects and duration for a custom test instead of waiting for a fixed schedule.',
    points: ['Chapter selection', 'Custom duration', 'Subject-separated sections']
  },
  {
    id: 'analytics',
    icon: LineChart,
    title: 'Understand your progress',
    short: 'Performance analytics',
    description: 'Keep your preparation connected to your performance with test history and analytics.',
    points: ['Test performance history', 'Progress tracking', 'Study-focused insights']
  },
  {
    id: 'social',
    icon: Users,
    title: 'Study with your circle',
    short: 'Peer study features',
    description: 'Connect with other students through study circles, chats, shared sessions and collaborative tests.',
    points: ['Friend connections', 'Study circles', 'Realtime chat and announcements']
  }
];

function FeatureCard({ feature, active, onClick }) {
  const Icon = feature.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 ${active
        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-950/30'
        : 'border-slate-800 bg-slate-900/55 hover:border-indigo-500/30 hover:bg-slate-900'}`}
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${active
        ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-300'
        : 'border-slate-700 bg-slate-950/70 text-slate-400 group-hover:text-indigo-300'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-white">{feature.title}</h3>
      <p className="mt-1 text-xs font-semibold text-indigo-300">{feature.short}</p>
      <ChevronDown className={`mt-4 h-4 w-4 text-slate-500 transition-transform ${active ? 'rotate-180 text-indigo-300' : ''}`} />
    </button>
  );
}

export default function BrandingPage({ onLogin }) {
  const [activeFeature, setActiveFeature] = useState('learn');
  const [activeStep, setActiveStep] = useState(0);
  const [examPreview, setExamPreview] = useState('JEE');

  const selected = features.find((feature) => feature.id === activeFeature) || features[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute right-[-180px] top-[35%] h-[360px] w-[360px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
                PrepXAI
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-300">JEE • NEET</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500">Peer Study & CBT Simulator</p>
            </div>
          </a>
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            Log in <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center py-16 sm:py-24">
          <div className="max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              One place for your preparation
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Prepare smarter.
              <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">Practice with purpose.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              PrepXAI brings learning, PYQs, CBT practice, custom tests, analytics and peer study into one focused preparation platform.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={onLogin} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500 sm:w-auto">
                Start with PrepXAI <ArrowRight className="h-4 w-4" />
              </button>
              <a href={APP_UPDATE_URL} download="PrepXAI.apk" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-7 py-4 text-sm font-bold text-indigo-200 transition hover:bg-indigo-600 hover:text-white sm:w-auto">
                <Download className="h-4 w-4" /> Download Android App
              </a>
              <a href="#features" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/60 px-7 py-4 text-sm font-bold text-slate-300 transition hover:border-indigo-500/40 hover:text-white sm:w-auto">
                Explore features
              </a>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [Clock3, 'Timed practice'], [Brain, 'PYQ sessions'],
                [LineChart, 'Progress'], [Users, 'Peer study']
              ].map(([Icon, label]) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/45 px-3 py-3 text-xs font-semibold text-slate-400">
                  <Icon className="mx-auto mb-1.5 h-4 w-4 text-indigo-400" />{label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/55 p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">A preparation loop</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">From learning to knowing where you stand.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">Move through a simple cycle instead of jumping between disconnected tools.</p>
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
                {[['Learn','01'],['Practice','02'],['Test','03'],['Improve','04']].map(([label, number], index) => (
                  <button key={label} type="button" onClick={() => setActiveStep(index)}
                    className={`min-w-0 rounded-xl px-2 py-3 text-center transition ${activeStep === index ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-200'}`}>
                    <span className="block text-[9px] font-black tracking-widest opacity-70">{number}</span>
                    <span className="mt-1 block text-[10px] font-bold sm:text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-4">
              {[
                ['Learn','Understand the topic in focused chapters and subtopics.'],
                ['Practice','Reinforce it with timed questions and PYQs.'],
                ['Test','Combine chapters into realistic CBT-style tests.'],
                ['Improve','Use your performance to decide what to work on next.']
              ].map(([title, description], index) => (
                <button key={title} type="button" onClick={() => setActiveStep(index)}
                  className={`rounded-2xl border p-4 text-left transition ${activeStep === index ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}>
                  <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${activeStep === index ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{index + 1}</div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 py-16 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">How PrepXAI works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Everything connects to your preparation.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              Tap a feature to see what it does and how it fits into the platform.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  active={activeFeature === feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                />
              ))}
            </div>

            <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-600/15 via-slate-900/90 to-violet-600/10 p-7 shadow-2xl shadow-indigo-950/20 sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                {React.createElement(selected.icon, { className: 'h-6 w-6' })}
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-indigo-300">Selected feature</p>
              <h3 className="mt-2 text-2xl font-black text-white">{selected.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{selected.description}</p>
              <div className="mt-6 space-y-3">
                {selected.points.map((point) => (
                  <div key={point} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-violet-600/15 p-7 text-center shadow-2xl shadow-indigo-950/30 sm:p-12">
            <div className="absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <LogInIcon />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Ready when you are</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Enter your PrepXAI workspace.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Log in or create your account to access your practice, tests, analytics and study connections.</p>
              <button type="button" onClick={onLogin} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500">
                Log in / Sign up <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-12 sm:grid-cols-3">
          {[
            [ShieldIcon, 'Focused', 'A dedicated space for exam preparation.'],
            [Zap, 'Interactive', 'Practice, tests and study tools in one flow.'],
            [MessageCircle, 'Connected', 'Study with peers without leaving your workspace.']
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <Icon className="h-5 w-5 text-indigo-400" />
              <h3 className="mt-4 font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} PrepXAI</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-indigo-300">Privacy Policy</a>
            <a href="/terms" className="hover:text-indigo-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LogInIcon() {
  return <span className="text-lg font-black">→</span>;
}

function ShieldIcon(props) {
  return <div {...props}>✓</div>;
}
