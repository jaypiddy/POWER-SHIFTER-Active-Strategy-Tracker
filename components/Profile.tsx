
import React, { useState, useRef } from 'react';
import { User, OwnershipType, PillarInvolvement } from '../types';
import { THEMES } from '../constants';
import { deleteUser, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { deleteUserRecord } from '../services/firestoreService';

interface ProfileProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser }) => {
  const [formData, setFormData] = useState<User>({ ...currentUser, supportingPillars: currentUser.supportingPillars || [] });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${formData.firstName} ${formData.lastName}`,
          photoURL: formData.avatar
        });
      }
      onUpdateUser(formData);
      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const addSupportingPillar = () => {
    const newSupport: PillarInvolvement = { themeId: '', type: 'Supporting' };
    setFormData({
      ...formData,
      supportingPillars: [...(formData.supportingPillars || []), newSupport]
    });
  };

  const updateSupportingPillar = (index: number, updates: Partial<PillarInvolvement>) => {
    const updatedList = [...(formData.supportingPillars || [])];
    updatedList[index] = { ...updatedList[index], ...updates };
    setFormData({ ...formData, supportingPillars: updatedList });
  };

  const removeSupportingPillar = (index: number) => {
    const updatedList = (formData.supportingPillars || []).filter((_, i) => i !== index);
    setFormData({ ...formData, supportingPillars: updatedList });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') return;
    
    setIsDeleting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUserRecord(user.uid);
        await deleteUser(user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        alert("For security, please logout and sign in again before deleting your account.");
      } else {
        alert("An error occurred during account deletion.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Profile & Settings</h1>
        <p className="text-slate-500 mt-1 font-light">Manage your strategic identity and personal preferences.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Identity */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Personal Identity</h3>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group relative"
                >
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <i className="fas fa-user text-4xl text-slate-300"></i>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-camera text-white"></i>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Avatar</p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                  <textarea 
                    value={formData.bio || ''} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                    placeholder="Briefly describe your strategic focus..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-light leading-relaxed h-24 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Alignment */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Strategic Alignment</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Pillar (Primary Focus)</label>
                <select 
                  value={formData.ownedThemeId || ''} 
                  onChange={e => setFormData({...formData, ownedThemeId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                >
                  <option value="">Global / Unassigned</option>
                  {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ownership Level</label>
                <select 
                  value={formData.ownershipType || 'Supporting'} 
                  onChange={e => setFormData({...formData, ownershipType: e.target.value as OwnershipType})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                >
                  <option value="Owner">Primary Owner</option>
                  <option value="Supporting">Supporting Partner</option>
                </select>
              </div>
            </div>

            {/* Additional Pillars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Support Pillars</h4>
                <button 
                  type="button"
                  onClick={addSupportingPillar}
                  className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                >
                  <i className="fas fa-plus"></i>
                  Add Supporting Pillar
                </button>
              </div>

              <div className="space-y-3">
                {(formData.supportingPillars || []).map((support, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex-1 space-y-1.5">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Supporting Pillar</label>
                       <select 
                        value={support.themeId} 
                        onChange={e => updateSupportingPillar(idx, { themeId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Pillar...</option>
                        {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Level</label>
                       <select 
                        value={support.type} 
                        onChange={e => updateSupportingPillar(idx, { type: e.target.value as OwnershipType })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Supporting">Supporting</option>
                        <option value="Owner">Co-Owner</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeSupportingPillar(idx)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
                {(formData.supportingPillars || []).length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400 italic font-light border-2 border-dashed border-slate-100 rounded-xl">
                    No additional support pillars defined.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Localization & Social */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Localization & Social</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Local Timezone</label>
              <select 
                value={formData.timezone || 'UTC'} 
                onChange={e => setFormData({...formData, timezone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London / UTC</option>
                <option value="Europe/Paris">Central European Time</option>
                <option value="Asia/Tokyo">Tokyo / Japan</option>
                <option value="Australia/Sydney">Sydney / Australia</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">LinkedIn Profile</label>
              <div className="relative">
                <i className="fab fa-linkedin absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="url" 
                  value={formData.linkedinUrl || ''} 
                  onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} 
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {isSaving ? (
              <i className="fas fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fas fa-check"></i>
            )}
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <section className="mt-20 pt-12 border-t border-slate-200">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-rose-900">Danger Zone</h3>
            <p className="text-sm text-rose-700 font-light mt-1">
              Account deletion is permanent. All your strategic ownership data will be removed.
            </p>
          </div>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-triangle-exclamation"></i>
                Verify Permanent Deletion
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-rose-400 hover:text-rose-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </header>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed font-light">
                This action <strong className="text-slate-900">cannot be undone</strong>. To confirm, please type <span className="font-mono bg-rose-100 px-1.5 py-0.5 rounded text-rose-700 font-bold">delete</span> in the field below.
              </p>
              
              <div className="space-y-1.5">
                <input 
                  autoFocus
                  type="text" 
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="Type 'delete' to confirm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none font-bold text-rose-700 placeholder:font-normal placeholder:text-slate-300"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-900/20 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
                >
                  {isDeleting ? <i className="fas fa-circle-notch animate-spin"></i> : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
