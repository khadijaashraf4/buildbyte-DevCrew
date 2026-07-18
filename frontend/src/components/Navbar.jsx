import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User as UserIcon, LogOut, LayoutDashboard, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav class="glass sticky top-0 z-50 border-b border-slate-800/80 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" class="flex items-center gap-2 group">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <Briefcase class="h-5 w-5 text-white" />
          </div>
          <span class="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-brand-400 bg-clip-text text-transparent tracking-tight">
            ProofPath
          </span>
        </Link>

        {/* Navigation Links */}
        <div class="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                class={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard class="h-4 w-4" />
                Dashboard
              </Link>
              
              <Link
                to="/opportunities"
                class={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/opportunities')
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Globe class="h-4 w-4" />
                Browse Jobs
              </Link>

              <div class="h-6 w-px bg-slate-800"></div>

              {/* User Details */}
              <div class="flex items-center gap-3">
                <div class="flex flex-col text-right">
                  <span class="text-xs font-semibold text-slate-300">
                    {user.name || user.company_name || 'User'}
                  </span>
                  <span class="text-[10px] font-medium text-brand-400 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut class="h-4.5 w-4.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                class="glow-button px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
