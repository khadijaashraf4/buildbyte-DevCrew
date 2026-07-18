import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, workRecordsAPI, skillsAPI, authAPI, applicationsAPI } from '../services/api';
import { 
  Github, Linkedin, Plus, Edit2, Trash2, Calendar, FileText, CheckCircle, Clock, AlertTriangle, 
  ExternalLink, Code, Briefcase, PlusCircle, Bookmark, CheckCircle2, User, Globe
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, updateProfileState } = useAuth();
  
  // States
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workRecords, setWorkRecords] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals Toggle
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);

  // Form States
  const [selectedProject, setSelectedProject] = useState(null); // null means adding new
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', github_url: '', live_demo_url: '', image_url: ''
  });
  
  const [workForm, setWorkForm] = useState({
    task_title: '', organization: '', responsibilities: '', start_date: '', end_date: ''
  });

  const [bioForm, setBioForm] = useState({
    name: '', bio: '', linkedin_url: '', github_url: '', university: '', gender: '', address: ''
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Fetch Dashboard Data
  const loadData = async () => {
    try {
      const [skillsRes, projsRes, recordsRes, appsRes] = await Promise.all([
        skillsAPI.list(),
        projectsAPI.list(),
        workRecordsAPI.list(),
        applicationsAPI.list()
      ]);
      
      setAvailableSkills(skillsRes.data);
      setProjects(projsRes.data);
      setWorkRecords(recordsRes.data);
      setApplications(appsRes.data);
      
      if (user) {
        setBioForm({
          name: user.name || '',
          bio: user.bio || '',
          linkedin_url: user.linkedin_url || '',
          github_url: user.github_url || '',
          university: user.university || '',
          gender: user.gender || '',
          address: user.address || ''
        });
        setSelectedSkills(user.skills?.map(s => s.id) || []);
      }
    } catch (err) {
      setErrorMessage('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Project Submit (Create / Update)
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await projectsAPI.update(selectedProject.id, projectForm);
      } else {
        await projectsAPI.create(projectForm);
      }
      setShowProjectModal(false);
      loadData();
    } catch (err) {
      alert('Error saving project. Please check URLs.');
    }
  };

  // Work Record Submit
  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      await workRecordsAPI.create(workForm);
      setShowWorkModal(false);
      setWorkForm({ task_title: '', organization: '', responsibilities: '', start_date: '', end_date: '' });
      loadData();
    } catch (err) {
      alert('Error submitting work record.');
    }
  };

  // Bio & Skills Submit
  const handleBioSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bioForm,
        skill_ids: selectedSkills
      };
      const res = await authAPI.updateProfile(payload);
      updateProfileState(res.data);
      setShowBioModal(false);
      loadData();
    } catch (err) {
      alert('Error updating profile.');
    }
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        loadData();
      } catch (err) {
        alert('Failed to delete project.');
      }
    }
  };

  // Open Project Modal for Edit/Add
  const openProjectModal = (proj = null) => {
    setSelectedProject(proj);
    if (proj) {
      setProjectForm({
        title: proj.title,
        description: proj.description,
        github_url: proj.github_url,
        live_demo_url: proj.live_demo_url || '',
        image_url: proj.image_url || ''
      });
    } else {
      setProjectForm({ title: '', description: '', github_url: '', live_demo_url: '', image_url: '' });
    }
    setShowProjectModal(true);
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div class="space-y-10">
      {/* Header Profile Summary */}
      <section class="glass p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div class="h-24 w-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-brand-500/10">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-3 justify-center md:justify-start">
              <h2 class="text-3xl font-extrabold">{user?.name}</h2>
              <span class="px-2.5 py-1 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full">
                Student Account
              </span>
            </div>
            <p class="text-slate-400 max-w-xl">{user?.bio || "No biography added yet. Click 'Edit Profile' to add details."}</p>
            <div class="flex flex-wrap gap-4 pt-1 justify-center md:justify-start text-sm text-slate-400">
              <span class="flex items-center gap-1.5"><Globe class="h-4 w-4 text-slate-500" /> {user?.university}</span>
              <span class="flex items-center gap-1.5"><User class="h-4 w-4 text-slate-500" /> {user?.gender}</span>
              <span>📍 {user?.address}</span>
            </div>
            <div class="flex gap-4 pt-2 justify-center md:justify-start">
              {user?.github_url && (
                <a href={user.github_url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                  <Github class="h-4 w-4" /> GitHub
                </a>
              )}
              {user?.linkedin_url && (
                <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                  <Linkedin class="h-4 w-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowBioModal(true)} 
          class="glow-button px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
        >
          <Edit2 class="h-4 w-4" /> Edit Profile
        </button>
      </section>

      {/* Main Grid: Projects (Left) vs Verification/Applications (Right) */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3 - Portfolio Projects & Skills */}
        <div class="lg:col-span-2 space-y-8">
          
          {/* Skills Section */}
          <section class="glass p-6 rounded-2xl space-y-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <Code class="h-5 w-5 text-brand-400" /> My Skills
            </h3>
            <div class="flex flex-wrap gap-2">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill) => (
                  <span key={skill.id} class="px-3.5 py-1.5 text-sm font-medium bg-slate-900/60 border border-slate-850 rounded-xl">
                    {skill.name}
                  </span>
                ))
              ) : (
                <p class="text-slate-500 text-sm">No skills listed yet. Click 'Edit Profile' to select skills.</p>
              )}
            </div>
          </section>

          {/* Projects Showcase */}
          <section class="glass p-6 rounded-2xl space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold flex items-center gap-2">
                <FileText class="h-5 w-5 text-brand-400" /> Projects Showcase
              </h3>
              <button 
                onClick={() => openProjectModal(null)}
                class="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-bold border border-brand-500/20 bg-brand-500/5 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus class="h-4 w-4" /> Add Project
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length > 0 ? (
                projects.map((proj) => (
                  <div key={proj.id} class="glass-card rounded-2xl overflow-hidden flex flex-col h-full border border-slate-850">
                    <div class="h-40 bg-slate-900 relative overflow-hidden shrink-0">
                      {proj.image_url ? (
                        <img src={proj.image_url} alt={proj.title} class="w-full h-full object-cover" />
                      ) : (
                        <div class="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                          <Code class="h-10 w-10 text-slate-700" />
                        </div>
                      )}
                      <div class="absolute top-3 right-3 flex gap-2">
                        <button onClick={() => openProjectModal(proj)} class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Edit">
                          <Edit2 class="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteProject(proj.id)} class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors" title="Delete">
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div class="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div class="space-y-2">
                        <h4 class="font-bold text-lg text-slate-100">{proj.title}</h4>
                        <p class="text-slate-400 text-xs leading-relaxed line-clamp-3">{proj.description}</p>
                      </div>
                      <div class="flex gap-4 pt-2 text-xs font-semibold">
                        <a href={proj.github_url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-slate-300 hover:text-brand-400 transition-colors">
                          <Github class="h-4.5 w-4.5" /> Repository
                        </a>
                        {proj.live_demo_url && (
                          <a href={proj.live_demo_url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-slate-300 hover:text-brand-400 transition-colors">
                            <ExternalLink class="h-4.5 w-4.5" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div class="col-span-2 text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                  <FileText class="h-8 w-8 text-slate-650 mx-auto mb-2" />
                  <p class="text-slate-500 text-sm">No projects listed. Showcase your coding skills by adding one!</p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right 1/3 - Work Verification Requests & Application Status */}
        <div class="space-y-8">
          
          {/* Verified Work Records */}
          <section class="glass p-6 rounded-2xl space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <Briefcase class="h-5 w-5 text-brand-400" /> Work Verification
              </h3>
              <button 
                onClick={() => setShowWorkModal(true)}
                class="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <PlusCircle class="h-4 w-4" /> Request
              </button>
            </div>

            <div class="space-y-4">
              {workRecords.length > 0 ? (
                workRecords.map((record) => (
                  <div key={record.id} class="p-4 bg-slate-900/50 border border-slate-850 rounded-xl space-y-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-sm text-slate-200">{record.task_title}</h4>
                        <div class="text-xs text-slate-450">{record.organization}</div>
                      </div>
                      
                      {/* Status Badge */}
                      {record.status === 'VERIFIED' ? (
                        <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5">
                          <CheckCircle2 class="h-3 w-3" /> VERIFIED
                        </span>
                      ) : record.status === 'REJECTED' ? (
                        <span class="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-0.5">
                          <AlertTriangle class="h-3 w-3" /> REJECTED
                        </span>
                      ) : (
                        <span class="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-0.5">
                          <Clock class="h-3 w-3" /> PENDING
                        </span>
                      )}
                    </div>
                    
                    <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{record.responsibilities}</p>
                    
                    <div class="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar class="h-3 w-3" /> {record.start_date} to {record.end_date || 'Present'}
                    </div>

                    {record.remarks && (
                      <div class="border-t border-slate-850 pt-2 text-[10px] text-slate-400 leading-normal">
                        <strong>Employer Remarks:</strong> "{record.remarks}"
                        {record.verified_by_company && <span class="block text-slate-500 mt-0.5">— Verified by {record.verified_by_company}</span>}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div class="text-center py-6 text-slate-500 text-xs">
                  No work verification history submitted.
                </div>
              )}
            </div>
          </section>

          {/* Applied Jobs */}
          <section class="glass p-6 rounded-2xl space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <Bookmark class="h-5 w-5 text-brand-400" /> Job Applications
            </h3>

            <div class="space-y-3">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app.id} class="p-3.5 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                    <div class="space-y-1">
                      <h4 class="font-bold text-xs text-slate-200 line-clamp-1">{app.opportunity_details.title}</h4>
                      <p class="text-[10px] text-slate-450">{app.opportunity_details.employer_company}</p>
                    </div>

                    {app.status === 'REVEALED' ? (
                      <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase">Revealed</span>
                    ) : app.status === 'SHORTLISTED' ? (
                      <span class="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase">Shortlisted</span>
                    ) : app.status === 'REJECTED' ? (
                      <span class="text-[10px] font-bold text-rose-450 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20 uppercase">Rejected</span>
                    ) : (
                      <span class="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 uppercase">Applied</span>
                    )}
                  </div>
                ))
              ) : (
                <div class="text-center py-6 text-slate-500 text-xs">
                  No active job applications.
                </div>
              )}
            </div>
          </section>

        </div>

      </div>

      {/* MODAL 1: ADD/EDIT PROJECT */}
      {showProjectModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h4 class="text-xl font-bold border-b border-slate-800 pb-2">
              {selectedProject ? 'Edit Project' : 'Add New Project'}
            </h4>
            <form onSubmit={handleProjectSubmit} class="space-y-4 text-sm">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Project Title *</label>
                <input 
                  type="text" required value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="e.g. ProofPath Application"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Description *</label>
                <textarea 
                  required rows="3" value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="Summarize the project responsibilities, stack used, and outcomes."
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">GitHub Repository URL *</label>
                  <input 
                    type="url" required value={projectForm.github_url}
                    onChange={(e) => setProjectForm({...projectForm, github_url: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Live Demo URL (Optional)</label>
                  <input 
                    type="url" value={projectForm.live_demo_url}
                    onChange={(e) => setProjectForm({...projectForm, live_demo_url: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                    placeholder="https://demo.com"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Thumbnail Image URL (Optional)</label>
                <input 
                  type="url" value={projectForm.image_url}
                  onChange={(e) => setProjectForm({...projectForm, image_url: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="https://unsplash.com/..."
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} class="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" class="glow-button px-5 py-2 rounded-xl">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST WORK VERIFICATION */}
      {showWorkModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h4 class="text-xl font-bold border-b border-slate-800 pb-2">Request Work Verification</h4>
            <p class="text-xs text-slate-400 leading-normal">
              Enter details of tasks or internships you worked on. Employers in ProofPath will be able to review and certify these details.
            </p>
            <form onSubmit={handleWorkSubmit} class="space-y-4 text-sm">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Role / Job Title *</label>
                <input 
                  type="text" required value={workForm.task_title}
                  onChange={(e) => setWorkForm({...workForm, task_title: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="e.g. Frontend Intern"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Organization Name *</label>
                <input 
                  type="text" required value={workForm.organization}
                  onChange={(e) => setWorkForm({...workForm, organization: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  placeholder="e.g. CodeForGood Initiative"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Responsibilities / Description *</label>
                <textarea 
                  required rows="3" value={workForm.responsibilities}
                  onChange={(e) => setWorkForm({...workForm, responsibilities: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="List major features built, frameworks used, or tasks managed."
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Start Date *</label>
                  <input 
                    type="date" required value={workForm.start_date}
                    onChange={(e) => setWorkForm({...workForm, start_date: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">End Date (Leave empty if current)</label>
                  <input 
                    type="date" value={workForm.end_date}
                    onChange={(e) => setWorkForm({...workForm, end_date: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowWorkModal(false)} class="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" class="glow-button px-5 py-2 rounded-xl">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PROFILE / BIO / SKILLS */}
      {showBioModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="glass w-full max-w-2xl rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h4 class="text-xl font-bold border-b border-slate-800 pb-2">Edit Profile details</h4>
            <form onSubmit={handleBioSubmit} class="space-y-4 text-sm">
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Full Name *</label>
                  <input 
                    type="text" required value={bioForm.name}
                    onChange={(e) => setBioForm({...bioForm, name: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">University *</label>
                  <input 
                    type="text" required value={bioForm.university}
                    onChange={(e) => setBioForm({...bioForm, university: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400">Biography / Short Summary</label>
                <textarea 
                  rows="3" value={bioForm.bio}
                  onChange={(e) => setBioForm({...bioForm, bio: e.target.value})}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none resize-none"
                  placeholder="Write a brief introduction about yourself..."
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Gender *</label>
                  <select
                    value={bioForm.gender}
                    onChange={(e) => setBioForm({...bioForm, gender: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 focus:border-brand-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>

                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">Location (City, ST) *</label>
                  <input 
                    type="text" required value={bioForm.address}
                    onChange={(e) => setBioForm({...bioForm, address: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">GitHub Link</label>
                  <input 
                    type="url" value={bioForm.github_url}
                    onChange={(e) => setBioForm({...bioForm, github_url: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-400">LinkedIn Link</label>
                  <input 
                    type="url" value={bioForm.linkedin_url}
                    onChange={(e) => setBioForm({...bioForm, linkedin_url: e.target.value})}
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Skills Selector Badges */}
              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400 block">Select Portfolio Skills</label>
                <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950/40">
                  {availableSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        type="button" key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        class={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected 
                            ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-450 hover:text-white'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBioModal(false)} class="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" class="glow-button px-5 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
