import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main class="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>
      <footer class="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-sm text-slate-500">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} ProofPath. All rights reserved.</span>
          <div class="flex gap-4">
            <a href="#" class="hover:text-brand-400 transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-brand-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
