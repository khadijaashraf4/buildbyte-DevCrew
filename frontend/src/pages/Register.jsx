import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, Globe, AlertCircle, ShieldAlert,Eye,EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Registration States
  const [role, setRole] = useState('STUDENT'); // STUDENT or EMPLOYER
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile States
  const [nameOrCompany, setNameOrCompany] = useState('');
  const [universityOrWebsite, setUniversityOrWebsite] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email,
      username,
      password,
      role,
      name_or_company: nameOrCompany,
      university_or_website: universityOrWebsite,
      gender: role === 'STUDENT' ? gender : '',
      address: role === 'STUDENT' ? address : '',
    };

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ')
        : 'Failed to register. Please check your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[85vh] flex items-center justify-center py-6 relative">
      <div class="absolute w-[450px] h-[450px] bg-brand-500/5 rounded-full blur-[90px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div class="glass p-10 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl relative">
        <div class="text-center space-y-2 mb-8">
          <h2 class="text-3xl font-extrabold tracking-tight">Create Your Account</h2>
          <p class="text-slate-400 text-sm">Join ProofPath and start proving your skills</p>
        </div>

        {error && (
          <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl flex items-center gap-2 mb-6 text-sm">
            <AlertCircle class="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-6">
          {/* Role Selection */}
          <div class="grid grid-cols-2 gap-4 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole('STUDENT'); setError(''); }}
              class={`py-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'STUDENT'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              I am a Student
            </button>
            <button
              type="button"
              onClick={() => { setRole('EMPLOYER'); setError(''); }}
              class={`py-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'EMPLOYER'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              I am an Employer
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-brand-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Account Details
              </h3>

              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400">Email Address</label>
                <div class="relative">
                  <Mail class="absolute left-3 top-3 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400">Username</label>
                <div class="relative">
                  <User class="absolute left-3 top-3 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                  />
                </div>
              </div>

           <div class="space-y-2">
  <label class="text-xs font-semibold text-slate-400">Password</label>

  <div class="relative">
    <Key class="absolute left-3 top-3 h-4 text-slate-500" />

    <input
      type={showPassword ? "text" : "password"}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
    >
      {showPassword ? (
        <EyeOff class="h-5 w-5" />
      ) : (
        <Eye class="h-5 w-5" />
      )}
    </button>
  </div>
</div>
            </div>

            {/* Profile Details */}
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-brand-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Profile Details
              </h3>

              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400">
                  {role === 'STUDENT' ? 'Full Name' : 'Company Name'}
                </label>
                <input
                  type="text"
                  required
                  value={nameOrCompany}
                  onChange={(e) => setNameOrCompany(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'Alex Mercer' : 'TechCorp Inc.'}
                  class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400">
                  {role === 'STUDENT' ? 'University' : 'Company Website'}
                </label>
                <input
                  type={role === 'STUDENT' ? 'text' : 'url'}
                  required
                  value={universityOrWebsite}
                  onChange={(e) => setUniversityOrWebsite(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'Stanford University' : 'https://techcorp.com'}
                  class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                />
              </div>

              {role === 'STUDENT' && (
                <>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-xs font-semibold text-slate-400">Gender</label>
                      <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-350 outline-none transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div class="space-y-2">
                      <label class="text-xs font-semibold text-slate-400">Location (City, ST)</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Palo Alto, CA"
                        class="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {role === 'STUDENT' && (
            <div class="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex gap-3 text-xs text-indigo-300">
              <ShieldAlert class="h-5 w-5 shrink-0 text-indigo-400" />
              <span>
                <strong>Privacy Shield:</strong> To ensure equal-opportunity hiring, your Name, University, Gender, and Location will remain hidden from employers until they choose to shortlist you and request your identity reveal.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            class="glow-button w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus class="h-5 w-5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" class="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}