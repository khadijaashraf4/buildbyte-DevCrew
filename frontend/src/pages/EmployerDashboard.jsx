import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { opportunitiesAPI, applicationsAPI, workRecordsAPI, skillsAPI, authAPI } from '../services/api';
import { 
  Building, Globe, Plus, Trash2, Calendar, FileText, CheckCircle2, XCircle, Eye, EyeOff,
  UserCheck, AlertCircle, PlusCircle, Check, X, ShieldAlert, Award
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user, updateProfileState } = useAuth();
  
  // Dashboard Data
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null); // active opportunity to view applicants
  const [applicants, setApplicants] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  
  // States
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // Active Work Record being verified
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [verificationRemarks, setVerificationRemarks] = useState('');

  // Form States
  const [oppForm, setOppForm] = useState({
    title: '', description: '', opportunity_type: 'JOB', deadline: '', required_skill_ids: []
  });

  const [companyForm, setCompanyForm] = useState({
    company_name: '', website: '', description: '', logo_url: ''
  });

  const loadData = async () => {
    try {
      const [oppsRes, skillsRes, verifsRes] = await Promise.all([
        opportunitiesAPI.list('', true), // mine = true
        skillsAPI.list(),
        workRecordsAPI.list() // get all records for verification list
      ]);
      
      setOpportunities(oppsRes.data);
      setAvailableSkills(skillsRes.data);
      
      // Filter work records that are PENDING to show in the employer's verification pane
      setPendingVerifications(verifsRes.data.filter(r => r.status === 'PENDING'));
      
      if (user) {
        setCompanyForm({
          company_name: user.company_name || '',
          website: user.website || '',
          description: user.description || '',
          logo_url: user.logo_url || ''
        });
      }

      // If an opportunity is selected, refresh its applicants
      if (selectedOpp) {
        const appsRes = await applicationsAPI.list(selectedOpp.id);
        setApplicants(appsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Select opportunity to view applicants
  const handleSelectOpportunity = async (opp) => {
    setSelectedOpp(opp);
    setLoading(true);
    try {
      const res = await applicationsAPI.list(opp.id);
      setApplicants(res.data);
    } catch (err) {
      alert('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  // Create Opportunity
  const handleOppSubmit = async (e) => {
    e.preventDefault();
    try {
      await opportunitiesAPI.create(oppForm);
      setShowOpportunityModal(false);
      setOppForm({ title: '', description: '', opportunity_type: 'JOB', deadline: '', required_skill_ids: [] });
      loadData();
    } catch (err) {
      alert('Error creating opportunity. Please check details.');
    }
  };

  // Edit Company Profile
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.updateProfile(companyForm);
      updateProfileState(res.data);
      setShowCompanyModal(false);
      loadData();
    } catch (err) {
      alert('Error updating company profile.');
    }
  };

  // Delete Opportunity
  const handleDeleteOpportunity = async (id, e) => {
    e.stopPropagation(); // prevent selecting
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await opportunitiesAPI.delete(id);
        if (selectedOpp?.id === id) {
          setSelectedOpp(null);
          setApplicants([]);
        }
        loadData();
      } catch (err) {
        alert('Failed to delete listing.');
      }
    }
  };

  // Shortlist Applicant
  const handleShortlist = async (appId) => {
    try {
      await applicationsAPI.shortlist(appId);
      refreshApplicants();
    } catch (err) {
      alert('Error shortlisting candidate.');
    }
  };

  // Reject Applicant
  const handleReject = async (appId) => {
    try {
      await applicationsAPI.reject(appId);
      refreshApplicants();
    } catch (err) {
      alert('Error rejecting candidate.');
    }
  };

  // Reveal Identity
  const handleReveal = async (appId) => {
    try {
      await applicationsAPI.reveal(appId);
      refreshApplicants();
    } catch (err) {
      alert('Error revealing candidate identity.');
    }
  };

  // Open Verification Modal
  const openVerificationModal = (record) => {
    setVerifyingRecord(record);
    setVerificationRemarks('');
    setShowVerificationModal(true);
  };

  // Submit Verification Decision
  const handleVerificationDecision = async (statusVal) => {
    try {
      await workRecordsAPI.verify(verifyingRecord.id, statusVal, verificationRemarks);
      setShowVerificationModal(false);
      loadData();
    } catch (err) {
      alert('Failed to submit verification status.');
    }
  };

  const refreshApplicants = async () => {
    if (!selectedOpp) return;
    try {
      const res = await applicationsAPI.list(selectedOpp.id);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSkill = (skillId) => {
    setOppForm(prev => {
      const skill_ids = prev.required_skill_ids.includes(skillId)
        ? prev.required_skill_ids.filter(id => id !== skillId)
        : [...prev.required_skill_ids, skillId];
      return { ...prev, required_skill_ids: skill_ids };
    });
  };

  if (loading && opportunities.length === 0) {
    return (
      <div class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div class="space-y-10">
      {/* Employer Profile summary */}
      <section class="glass p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div class="h-20 w-20 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            {user?.logo_url ? (
              <img src={user.logo_url} alt={user.company_name} class="w-full h-full object-cover" />
            ) : (
              <Building class="h-10 w-10 text-slate-550" />
            )}
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-3 justify-center md:justify-start">
              <h2 class="text-3xl font-extrabold">{user?.company_name}</h2>
              <span class="px-2.5 py-1 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full">
                Employer Account
              </span>
            </div>
            <p class="text-slate-400 max-w-xl">{user?.description || 'No description listed. Add company info to attract top talent.'}</p>
            {user?.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
                <Globe class="h-4 w-4" /> {user.website}
              </a>
            )}
          </div>
        </div>
        <button 
          onClick={() => setShowCompanyModal(true)}
          class="glow-button px-5 py-2.5 rounded-xl font-bold"
        >
          Edit Company Profile
        </button>
      </section>

      {/* Main workspace splits */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Opportunity Listings & Pending Verifications */}
        <div class="space-y-8">
          
          {/* Opportunities Section */}
          <section class="glass p-6 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <Building class="h-5 w-5 text-brand-400" /> My Job Listings
              </h3>
              <button 
                onClick={() => setShowOpportunityModal(true)}
                class="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-bold"
              >
                <Plus class="h-4 w-4" /> Post Job
              </button>
            </div>

            <div class="space-y-3">
              {opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <div 
                    key={opp.id} 
                    onClick={() => handleSelectOpportunity(opp)}
                    class={`p-4 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                      selectedOpp?.id === opp.id 
                        ? 'bg-brand-500/10 border-brand-500' 
                        : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/60 hover:border-slate-800'
                    }`}
                  >
                    <div class="space-y-1">
                      <h4 class="font-bold text-sm text-slate-100">{opp.title}</h4>
                      <div class="flex gap-2 text-[10px] text-slate-450 uppercase font-semibold">
                        <span>{opp.opportunity_type}</span>
                        <span>•</span>
                        <span>{opp.deadline}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteOpportunity(opp.id, e)}
                      class="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 class="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div class="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  No listings posted yet.
                </div>
              )}
            </div>
          </section>

          {/* Pending Work Record Verifications */}
          <section class="glass p-6 rounded-2xl space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <Award class="h-5 w-5 text-brand-400" /> Verify Student Work
            </h3>
            <p class="text-xs text-slate-400 leading-normal">
              Review and verify tasks claimed by students at various projects.
            </p>

            <div class="space-y-3">
              {pendingVerifications.length > 0 ? (
                pendingVerifications.map((record) => (
                  <div key={record.id} class="p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                    <div class="space-y-0.5">
                      <h4 class="font-semibold text-xs text-slate-200">{record.task_title}</h4>
                      <p class="text-[10px] text-slate-400">{record.organization}</p>
                    </div>
                    <button 
                      onClick={() => openVerificationModal(record)}
                      class="text-xs font-bold text-brand-400 hover:text-brand-350 shrink-0"
                    >
                      Review
                    </button>
                  </div>
                ))
              ) : (
                <div class="text-center py-6 text-slate-500 text-xs">
                  No pending verification requests.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right 2 Cols: Applicants for Selected Opportunity */}
        <div class="lg:col-span-2 space-y-8">
          <section class="glass p-6 rounded-2xl min-h-[500px] space-y-6">
            <div class="border-b border-slate-800 pb-4">
              {selectedOpp ? (
                <div class="space-y-1">
                  <span class="text-xs text-brand-400 font-semibold uppercase tracking-wider">Evaluating Applicants For</span>
                  <h3 class="text-2xl font-extrabold">{selectedOpp.title}</h3>
                </div>
              ) : (
                <div class="text-center py-16 text-slate-500">
                  <FileText class="h-10 w-10 text-slate-700 mx-auto mb-2" />
                  <p class="text-sm">Select a job listing on the left to review applicants.</p>
                </div>
              )}
            </div>

            {selectedOpp && (
              <div class="space-y-6">
                {applicants.length > 0 ? (
                  applicants.map((app) => {
                    const isAnon = app.student_profile.is_anonymous;
                    return (
                      <div key={app.id} class="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-5">
                        
                        {/* Applicant Header */}
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                          <div class="flex items-center gap-4">
                            {/* Avatar */}
                            <div class="h-14 w-14 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-400 overflow-hidden shrink-0">
                              {!isAnon && app.student_profile.photo_url ? (
                                <img src={app.student_profile.photo_url} alt={app.student_profile.name} class="w-full h-full object-cover" />
                              ) : (
                                <EyeOff class="h-6 w-6 text-slate-650" />
                              )}
                            </div>
                            
                            <div class="space-y-0.5">
                              <h4 class="font-extrabold text-lg text-slate-200">
                                {app.student_profile.name}
                              </h4>
                              <div class="text-xs text-slate-450 flex flex-wrap gap-x-2">
                                <span>{isAnon ? 'Identity Protected' : app.student_profile.university}</span>
                                {isAnon && <span>•</span>}
                                {isAnon && <span class="text-brand-400">Bias-Free Mode Active</span>}
                              </div>
                            </div>
                          </div>

                          {/* Skill Match Indicator */}
                          <div class="text-right sm:text-right shrink-0">
                            <span class="text-xs font-semibold text-slate-400 block mb-1">Skill Match Score</span>
                            <span class="text-lg font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                              {app.match_percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Summary Details */}
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                          
                          {/* Left Column: Skills & Details */}
                          <div class="space-y-4">
                            <div class="space-y-1">
                              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Skills</h5>
                              <div class="flex flex-wrap gap-1.5 pt-1">
                                {app.student_profile.skills?.map(s => (
                                  <span key={s.id} class="px-2 py-1 text-[11px] font-medium bg-slate-950 border border-slate-850 rounded">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {!isAnon && (
                              <div class="space-y-1 text-xs">
                                <h5 class="font-bold text-slate-400 uppercase tracking-wider">Demographic Details</h5>
                                <div class="text-slate-300">Gender: {app.student_profile.gender}</div>
                                <div class="text-slate-300">Location: {app.student_profile.address}</div>
                              </div>
                            )}
                          </div>

                          {/* Middle Column: Projects Showcase */}
                          <div class="space-y-2">
                            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects Showcase</h5>
                            <div class="space-y-2">
                              {app.student_profile.projects?.map(p => (
                                <div key={p.id} class="p-2 bg-slate-950 border border-slate-850 rounded-lg">
                                  <div class="font-bold text-xs text-slate-200">{p.title}</div>
                                  <p class="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                                  <a href={p.github_url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 text-[9px] text-brand-400 hover:underline mt-1 font-semibold">Repository</a>
                                </div>
                              ))}
                              {(!app.student_profile.projects || app.student_profile.projects.length === 0) && (
                                <span class="text-slate-500 text-xs italic">No projects listed</span>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Work Verification History */}
                          <div class="space-y-2">
                            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Work Records</h5>
                            <div class="space-y-2">
                              {app.student_profile.work_records?.map(w => (
                                <div key={w.id} class="p-2 bg-slate-950 border border-slate-850 rounded-lg flex flex-col justify-between">
                                  <div>
                                    <div class="font-bold text-xs text-slate-200 flex items-center justify-between">
                                      <span>{w.task_title}</span>
                                      {w.status === 'VERIFIED' ? (
                                        <span class="text-[8px] font-black text-emerald-400">VERIFIED</span>
                                      ) : w.status === 'REJECTED' ? (
                                        <span class="text-[8px] font-black text-rose-400">REJECTED</span>
                                      ) : (
                                        <span class="text-[8px] font-black text-amber-400">PENDING</span>
                                      )}
                                    </div>
                                    <div class="text-[9px] text-slate-450">{w.organization}</div>
                                  </div>
                                  <p class="text-[10px] text-slate-400 line-clamp-1 mt-1">{w.responsibilities}</p>
                                </div>
                              ))}
                              {(!app.student_profile.work_records || app.student_profile.work_records.length === 0) && (
                                <span class="text-slate-500 text-xs italic">No verified records</span>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Cover Letter */}
                        {app.cover_letter && (
                          <div class="p-4 bg-slate-950/60 border border-slate-850/80 rounded-xl space-y-1">
                            <h5 class="text-xs font-bold text-slate-450 uppercase tracking-wider">Applicant Note</h5>
                            <p class="text-xs text-slate-300 leading-relaxed">"{app.cover_letter}"</p>
                          </div>
                        )}

                        {/* Action Buttons based on status */}
                        <div class="flex items-center justify-between border-t border-slate-850 pt-4">
                          
                          {/* Anonymity Alert */}
                          {isAnon && (
                            <div class="flex items-center gap-1.5 text-xs text-slate-450 font-medium">
                              <ShieldAlert class="h-4 w-4 text-indigo-400" />
                              Personal identifiers hidden for unbiased review.
                            </div>
                          )}

                          <div class="flex gap-2 ml-auto">
                            {/* Reject / Shortlist actions */}
                            {app.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleReject(app.id)}
                                  class="flex items-center gap-1 px-4 py-2 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 rounded-xl text-xs font-bold text-rose-400 transition-colors"
                                >
                                  <XCircle class="h-4 w-4" /> Reject Candidate
                                </button>
                                <button 
                                  onClick={() => handleShortlist(app.id)}
                                  class="flex items-center gap-1 px-4 py-2 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-xl text-xs font-bold text-emerald-400 transition-colors"
                                >
                                  <UserCheck class="h-4 w-4" /> Shortlist Candidate
                                </button>
                              </>
                            )}

                            {/* Shortlisted Candidate: Reveal Identity option */}
                            {app.status === 'SHORTLISTED' && (
                              <button 
                                onClick={() => handleReveal(app.id)}
                                class="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white transition-colors glow-button"
                              >
                                <Eye class="h-4 w-4" /> Reveal Identity
                              </button>
                            )}

                            {/* Rejected candidate text */}
                            {app.status === 'REJECTED' && (
                              <span class="text-xs text-slate-500 font-bold border border-slate-800 px-3 py-1.5 rounded-lg bg-slate-900/20">Rejected Candidate</span>
                            )}

                            {/* Revealed Candidate status */}
                            {app.status === 'REVEALED' && (
                              <span class="text-xs text-emerald-400 font-bold border border-emerald-500/20 px-3 py-1.5 rounded-lg bg-emerald-500/5 flex items-center gap-1">
                                <CheckCircle2 class="h-4 w-4" /> Identity Revealed & Shortlisted
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div class="text-center py-16 text-slate-500">
                    <FileText class="h-10 w-10 text-slate-700 mx-auto mb-2" />
                    <p class="text-sm">No applications received for this job listing yet.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

      </div>

      {/* MODAL 1: POST OPPORTUNITY */}
      {showOpportunityModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h4 class="text-xl font-bold border-b border-slate-800 pb-2">Post New Opportunity</h4>
            <form onSubmit={handleOppSubmit} class="space-y-4 text-sm">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Opportunity Title *</label>
                <input 
                  type="text" required value={oppForm.title}
                  onChange={(e) => setOppForm({...oppForm, title: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="e.g. React Developer"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Opportunity Type *</label>
                  <select 
                    value={oppForm.opportunity_type}
                    onChange={(e) => setOppForm({...oppForm, opportunity_type: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 focus:border-brand-500 outline-none"
                  >
                    <option value="JOB">Job</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="VOLUNTEER">Volunteer Opportunity</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Application Deadline *</label>
                  <input 
                    type="date" required value={oppForm.deadline}
                    onChange={(e) => setOppForm({...oppForm, deadline: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Job Description *</label>
                <textarea 
                  required rows="3" value={oppForm.description}
                  onChange={(e) => setOppForm({...oppForm, description: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="Summarize the role requirements and daily responsibilities..."
                />
              </div>

              {/* Skills Selector */}
              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400 block">Required Skills *</label>
                <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950/40">
                  {availableSkills.map((skill) => {
                    const isSelected = oppForm.required_skill_ids.includes(skill.id);
                    return (
                      <button
                        type="button" key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        class={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected 
                            ? 'bg-brand-600 border-brand-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowOpportunityModal(false)} class="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" class="glow-button px-5 py-2 rounded-xl">Post Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COMPANY PROFILE */}
      {showCompanyModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h4 class="text-xl font-bold border-b border-slate-800 pb-2">Edit Company Profile</h4>
            <form onSubmit={handleCompanySubmit} class="space-y-4 text-sm">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Company Name *</label>
                <input 
                  type="text" required value={companyForm.company_name}
                  onChange={(e) => setCompanyForm({...companyForm, company_name: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Company Website URL</label>
                <input 
                  type="url" value={companyForm.website}
                  onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="https://company.com"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Company Logo Image URL</label>
                <input 
                  type="url" value={companyForm.logo_url}
                  onChange={(e) => setCompanyForm({...companyForm, logo_url: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="https://company.com/logo.png"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">About Company</label>
                <textarea 
                  rows="3" value={companyForm.description}
                  onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="Briefly describe what your organization does..."
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCompanyModal(false)} class="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" class="glow-button px-5 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WORK RECORD VERIFICATION FORM */}
      {showVerificationModal && verifyingRecord && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h4 class="text-xl font-bold border-b border-slate-800 pb-2">Review Work Record Request</h4>
            
            <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
              <div>
                <span class="text-slate-500 block">Candidate Identity (Protected)</span>
                <span class="font-bold text-slate-200">Candidate #{verifyingRecord.student}</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-slate-500 block">Task / Role Title</span>
                  <span class="font-bold text-slate-200">{verifyingRecord.task_title}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Organization</span>
                  <span class="font-bold text-slate-200">{verifyingRecord.organization}</span>
                </div>
              </div>
              <div>
                <span class="text-slate-500 block">Duration</span>
                <span class="font-bold text-slate-200">{verifyingRecord.start_date} to {verifyingRecord.end_date || 'Present'}</span>
              </div>
              <div>
                <span class="text-slate-500 block">Claimed Responsibilities</span>
                <p class="text-slate-300 leading-relaxed mt-1 font-medium bg-slate-950/80 p-2.5 rounded border border-slate-900">{verifyingRecord.responsibilities}</p>
              </div>
            </div>

            <div class="space-y-3">
              <label class="text-xs font-semibold text-slate-400 block">Verification Remarks / Feedback *</label>
              <textarea 
                rows="3" value={verificationRemarks}
                onChange={(e) => setVerificationRemarks(e.target.value)}
                class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:border-brand-500 outline-none resize-none"
                placeholder="Leave feedback on their performance or verify accuracy..."
              />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button 
                type="button" onClick={() => setShowVerificationModal(false)} 
                class="px-4 py-2 border border-slate-850 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button 
                type="button" onClick={() => handleVerificationDecision('REJECTED')}
                class="flex items-center gap-1 px-4 py-2 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-xs font-bold text-rose-400 rounded-xl transition-colors"
              >
                <X class="h-3.5 w-3.5" /> Reject Claim
              </button>
              <button 
                type="button" onClick={() => handleVerificationDecision('VERIFIED')}
                class="flex items-center gap-1 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 rounded-xl transition-colors glow-button"
              >
                <Check class="h-3.5 w-3.5" /> Verify & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
