import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle,Eye,EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[75vh] flex items-center justify-center relative">
      <div class="absolute w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div class="glass p-10 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl relative">
        <div class="text-center space-y-2 mb-8">
          <h2 class="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
          <p class="text-slate-400 text-sm">Sign in to your ProofPath account</p>
        </div>

        {error && (
          <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center gap-2 mb-6 text-sm">
            <AlertCircle class="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <div class="relative">
              <Key class="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
        <input
  type={showPassword ? "text" : "password"}
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="••••••••"
  className="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
/>

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
>
  {showPassword ? (
    <EyeOff className="h-5 w-5" />
  ) : (
    <Eye className="h-5 w-5" />
  )}
</button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="glow-button w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn class="h-4.5 w-4.5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-400">
          New to ProofPath?{' '}
          <Link to="/register" class="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
