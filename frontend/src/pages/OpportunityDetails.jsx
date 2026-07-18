import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opportunitiesAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Briefcase, ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [opp, setOpp] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const loadData = async () => {
    try {
      const oppRes = await opportunitiesAPI.retrieve(id);
      setOpp(oppRes.data);

      const appsRes = await applicationsAPI.list();
      const applied = appsRes.data.some(app => app.opportunity === parseInt(id));
      setHasApplied(applied);
    } catch (err) {
      alert('Error loading opportunity details.');
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await opportunitiesAPI.apply(id, coverLetter);
      setHasApplied(true);
      setShowApplyModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Application failed.');
    }
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!opp) return null;

  const isStudent = user?.role === 'STUDENT';

  return (
    <div class="max-w-3xl mx-auto space-y-6">
      <Link to="/opportunities" class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ChevronLeft class="h-4 w-4" /> Back to Listings
      </Link>

      <div class="glass p-8 rounded-3xl border border-slate-800 space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
              {opp.employer_logo ? (
                <img src={opp.employer_logo} alt={opp.employer_company} class="w-full h-full object-cover" />
              ) : (
                <Briefcase class="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div>
              <h2 class="text-2xl font-extrabold">{opp.title}</h2>
              <span class="text-sm text-slate-400">{opp.employer_company}</span>
            </div>
          </div>

          {isStudent && (
            <div class="text-right shrink-0">
              <span class="text-[9px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Match Rating</span>
              <span class="text-base font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                {opp.match_percentage}%
              </span>
            </div>
          )}
        </div>

        <div class="flex flex-wrap gap-4 text-xs font-semibold text-slate-450 border-y border-slate-850 py-3">
          <span class="uppercase">Type: {opp.opportunity_type}</span>
          <span>•</span>
          <span class="flex items-center gap-1"><Calendar class="h-4 w-4" /> Apply by {opp.deadline}</span>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-slate-300">Job Description</h4>
          <p class="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{opp.description}</p>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-slate-300">Required Skills</h4>
          <div class="flex flex-wrap gap-2">
            {isStudent ? (
              <>
                {opp.matched_skills?.map(skillName => (
                  <span key={skillName} class="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                    ✓ {skillName} (Matched)
                  </span>
                ))}
                {opp.missing_skills?.map(skillName => (
                  <span key={skillName} class="px-3 py-1 text-xs font-medium bg-slate-900/50 text-slate-550 border border-slate-850 rounded-xl">
                    {skillName} (Missing)
                  </span>
                ))}
              </>
            ) : (
              opp.required_skills?.map(skill => (
                <span key={skill.id} class="px-3 py-1 text-xs font-medium bg-slate-900 text-slate-400 border border-slate-850 rounded-xl">
                  {skill.name}
                </span>
              ))
            )}
          </div>
        </div>

        <div class="pt-4 border-t border-slate-850 flex justify-end">
          {isStudent ? (
            hasApplied ? (
              <button disabled class="flex items-center gap-1.5 px-6 py-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold rounded-xl cursor-not-allowed">
                <CheckCircle2 class="h-4.5 w-4.5" /> Applied to Listing
              </button>
            ) : (
              <button onClick={() => setShowApplyModal(true)} class="glow-button px-6 py-3 rounded-xl font-bold">
                Apply to Opportunity
              </button>
            )
          ) : (
            <span class="text-xs text-brand-400 font-bold uppercase tracking-wider">Posted by you</span>
          )}
        </div>
      </div>

      {/* APPLICATION MODAL */}
      {showApplyModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div class="border-b border-slate-800 pb-2">
              <h4 class="text-xl font-bold">Apply to {opp.title}</h4>
              <p class="text-xs text-slate-400 mt-1">at {opp.employer_company}</p>
            </div>
            
            <div class="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex gap-2 text-xs text-indigo-300">
              <ShieldCheck class="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Anonymity Guard enabled:</strong> Your identity parameters remain hidden. Employers will only evaluate your skills, projects, and work verification requests.
              </span>
            </div>

            <form onSubmit={handleApply} class="space-y-4 text-sm">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Cover Letter (Optional)</label>
                <textarea 
                  rows="4" value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="Tell the employer why your skillset matches this opportunity..."
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowApplyModal(false)} class="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" class="glow-button px-5 py-2 rounded-xl">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
