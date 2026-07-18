import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div class="space-y-24 py-10">
      {/* Hero Section */}
      <section class="text-center max-w-4xl mx-auto space-y-8 relative">
        {/* Glow background */}
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold tracking-wide">
          <ShieldCheck class="h-4 w-4" />
          The Bias-Free Recruitment Platform
        </div>

        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Prove your skills, <br/>
          <span class="bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
            not your privilege.
          </span>
        </h1>

        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          ProofPath connects students with employers through verified work records, portfolio items, and skills—completely hiding personal background identifiers until shortlisting.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          {user ? (
            <Link to="/dashboard" class="glow-button px-8 py-4 rounded-xl font-bold flex items-center gap-2 group">
              Go to Dashboard
              <ArrowRight class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link to="/register" class="glow-button px-8 py-4 rounded-xl font-bold flex items-center gap-2 group">
                Get Started
                <ArrowRight class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" class="px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 transition-colors font-bold text-slate-300">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="glass-card p-8 rounded-2xl space-y-4">
          <div class="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <EyeOff class="h-6 w-6 text-brand-400" />
          </div>
          <h3 class="text-xl font-bold">Blind Review Process</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Candidate names, photos, universities, genders, and locations are completely hidden from employers initially, keeping the focus entirely on skills and achievements.
          </p>
        </div>

        <div class="glass-card p-8 rounded-2xl space-y-4">
          <div class="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <ShieldCheck class="h-6 w-6 text-brand-400" />
          </div>
          <h3 class="text-xl font-bold">Verified Work History</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Submit task records to past employers to be verified. Confirmed work records receive a verification badge, certifying true hands-on credentials.
          </p>
        </div>

        <div class="glass-card p-8 rounded-2xl space-y-4">
          <div class="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <BarChart3 class="h-6 w-6 text-brand-400" />
          </div>
          <h3 class="text-xl font-bold">Skill Match Analytics</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Opportunities show exact skill match percentages. See instantly which skills match a job post and which requirements you are missing to grow your portfolio.
          </p>
        </div>
      </section>

      {/* How it works section */}
      <section class="glass p-12 rounded-3xl border border-slate-800 space-y-12 relative overflow-hidden">
        <div class="absolute right-0 bottom-0 w-80 h-80 bg-brand-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div class="text-center space-y-4 max-w-2xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold">How ProofPath Level-Plays Hiring</h2>
          <p class="text-slate-400">Our structured workflow ensures candidates are evaluated purely on the value they add.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="h-8 w-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0 mt-1">1</div>
              <div>
                <h4 class="font-bold text-lg">Build Your Verified Portfolio</h4>
                <p class="text-slate-400 text-sm mt-1">Students import projects, add links, and request past organizations to verify their actual tasks and duties.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="h-8 w-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0 mt-1">2</div>
              <div>
                <h4 class="font-bold text-lg">Apply to Opportunities</h4>
                <p class="text-slate-400 text-sm mt-1">Apply to jobs, internships, or volunteer roles. Our algorithm computes a direct match index comparing your skills to the post requirements.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="h-8 w-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0 mt-1">3</div>
              <div>
                <h4 class="font-bold text-lg">Bias-Free Review & Reveal</h4>
                <p class="text-slate-400 text-sm mt-1">Employers inspect applications showing projects, skills, and work marks. After shortlisting, they click "Reveal Identity" to see the personal profile.</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl space-y-6">
            <h4 class="font-bold text-xl border-b border-slate-800 pb-3 flex items-center gap-2">
              <EyeOff class="h-5 w-5 text-brand-400" />
              Employer Applicant View
            </h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-850">
                <span class="font-semibold text-slate-300">Candidate #1029</span>
                <span class="text-xs font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10">92% Match</span>
              </div>
              <div class="space-y-1">
                <div class="text-xs font-semibold text-slate-400">Verified Work History</div>
                <div class="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <div class="text-sm font-semibold text-slate-300">Frontend Intern</div>
                    <div class="text-xs text-slate-500">TechCorp Inc.</div>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                    <CheckCircle2 class="h-3 w-3" /> VERIFIED
                  </span>
                </div>
              </div>
              <div class="flex gap-2 justify-end pt-2">
                <span class="text-xs font-bold text-brand-400 px-3 py-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5">Shortlisted</span>
                <button class="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 pointer-events-none">Reveal Identity</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
