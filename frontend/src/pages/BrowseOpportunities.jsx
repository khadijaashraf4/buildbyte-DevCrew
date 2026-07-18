import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar, Briefcase, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BrowseOpportunities() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // States
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states for Applying
  const [applyingOpp, setApplyingOpp] = useState(null); // opp ID being applied to
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const loadData = async () => {
    try {
      const [oppsRes, appsRes] = await Promise.all([
        opportunitiesAPI.list(searchQuery),
        applicationsAPI.list()
      ]);
      setOpportunities(oppsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const hasApplied = (oppId) => {
    return applications.some(app => app.opportunity === oppId);
  };

  const openApplyModal = (opp) => {
    setApplyingOpp(opp);
    setCoverLetter('');
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await opportunitiesAPI.apply(applyingOpp.id, coverLetter);
      setShowApplyModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit application.');
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <div class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div class="space-y-8">
      {/* Search Header */}
      <section class="space-y-4 max-w-2xl">
        <h2 class="text-3xl font-extrabold tracking-tight">Explore Opportunities</h2>
        <p class="text-slate-400 text-sm leading-relaxed">
          Search jobs, internships, and volunteer roles. Our bias-free matching checks your verified portfolio against role requirements.
        </p>
        <div class="relative">
          <Search class="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by job title, description, or skill (e.g. React, Django)..."
            class="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
          />
        </div>
      </section>

      {/* Grid of Listings */}
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.length > 0 ? (
          opportunities.map((opp) => {
            const alreadyApplied = hasApplied(opp.id);
            const isStudent = user?.role === 'STUDENT';
            
            return (
              <div key={opp.id} class="glass-card p-6 rounded-2xl flex flex-col justify-between h-full border border-slate-850 space-y-6">
                
                {/* Upper row: Company, Title, Match percentage */}
                <div class="space-y-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-400 overflow-hidden shrink-0">
                        {opp.employer_logo ? (
                          <img src={opp.employer_logo} alt={opp.employer_company} class="w-full h-full object-cover" />
                        ) : (
                          <Briefcase class="h-5 w-5 text-slate-550" />
                        )}
                      </div>
                      <div>
                        <h4 class="font-extrabold text-slate-100 line-clamp-1">{opp.title}</h4>
                        <span class="text-xs text-slate-450">{opp.employer_company}</span>
                      </div>
                    </div>

                    {/* Show Match Percentage to Students */}
                    {isStudent && (
                      <div class="text-right shrink-0">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Match Score</span>
                        <span class="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {opp.match_percentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <p class="text-slate-400 text-xs leading-relaxed line-clamp-3">{opp.description}</p>
                  
                  {/* Skill breakdown (Matched vs Missing) */}
                  <div class="space-y-2 border-t border-slate-850 pt-3">
                    <div class="text-[10px] font-bold text-slate-405 uppercase tracking-wider">Required Skills</div>
                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                      {isStudent ? (
                        <>
                          {/* Matched Skills */}
                          {opp.matched_skills?.map(skillName => (
                            <span key={skillName} class="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/5 text-emerald-400 border border-emerald-500/15 rounded flex items-center gap-0.5">
                              ✓ {skillName}
                            </span>
                          ))}
                          {/* Missing Skills */}
                          {opp.missing_skills?.map(skillName => (
                            <span key={skillName} class="px-2 py-0.5 text-[10px] font-medium bg-slate-950 text-slate-500 border border-slate-850 rounded">
                              {skillName}
                            </span>
                          ))}
                        </>
                      ) : (
                        opp.required_skills?.map(skill => (
                          <span key={skill.id} class="px-2 py-0.5 text-[10px] font-medium bg-slate-950 text-slate-400 border border-slate-850 rounded">
                            {skill.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer details & Action */}
                <div class="flex items-center justify-between border-t border-slate-850 pt-4 text-xs">
                  <div class="text-slate-500 flex items-center gap-1.5">
                    <Calendar class="h-4 w-4" /> Apply by {opp.deadline}
                  </div>
                  
                  {isStudent ? (
                    alreadyApplied ? (
                      <button disabled class="flex items-center gap-1 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl cursor-not-allowed">
                        <CheckCircle2 class="h-4 w-4" /> Applied
                      </button>
                    ) : (
                      <button 
                        onClick={() => openApplyModal(opp)}
                        class="glow-button px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        Apply Now
                      </button>
                    )
                  ) : (
                    <span class="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Posted by you</span>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div class="col-span-2 text-center py-24 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <Search class="h-12 w-12 text-slate-750 mx-auto mb-2 animate-pulse" />
            <h4 class="text-lg font-bold text-slate-400">No opportunities found</h4>
            <p class="text-slate-500 text-sm">Try searching for other keywords or skills.</p>
          </div>
        )}
      </section>

      {/* APPLICATION MODAL */}
      {showApplyModal && applyingOpp && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div class="border-b border-slate-800 pb-2">
              <h4 class="text-xl font-bold">Apply to {applyingOpp.title}</h4>
              <p class="text-xs text-slate-400 mt-1">at {applyingOpp.employer_company}</p>
            </div>
            
            <div class="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex gap-2 text-xs text-indigo-300">
              <ShieldCheck class="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Anonymity Guard enabled:</strong> Your application details (Name, School, Gender, Location) are masked. Evaluation is based on your projects, skills, and work credentials.
              </span>
            </div>

            <form onSubmit={handleApplySubmit} class="space-y-4 text-sm">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Cover Letter / Note (Optional)</label>
                <textarea 
                  rows="4" value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="Explain why you are a good fit for this role based on your skills..."
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
