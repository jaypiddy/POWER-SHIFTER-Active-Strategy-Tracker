
import React, { useState } from 'react';
import { User, UserRole, OwnershipType, Theme } from '../types';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  themes: Theme[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, themes, onAddUser, onUpdateUser }) => {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    role: 'Editor' as UserRole,
    ownedThemeId: '',
    ownershipType: 'Supporting' as OwnershipType
  });

  const isAdmin = currentUser.role === 'Admin';

  const openCreateModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      title: '',
      role: 'Editor',
      ownedThemeId: '',
      ownershipType: 'Supporting'
    });
    setModalMode('create');
  };

  const openEditModal = (user: User) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      title: user.title,
      role: user.role,
      ownedThemeId: user.ownedThemeId || '',
      ownershipType: user.ownershipType || 'Supporting'
    });
    setEditingUserId(user.id);
    setModalMode('edit');
  };

  const handleToggleRole = (user: User) => {
    if (!isAdmin) return;
    const newRole: UserRole = user.role === 'Admin' ? 'Editor' : 'Admin';
    onUpdateUser({ ...user, role: newRole });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const user: User = {
        id: `u-${Date.now()}`,
        ...formData,
        active: true,
        avatar: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`
      };
      onAddUser(user);
    } else if (modalMode === 'edit' && editingUserId) {
      const existingUser = users.find(u => u.id === editingUserId);
      if (existingUser) {
        onUpdateUser({
          ...existingUser,
          ...formData
        });
      }
    }
    setModalMode(null);
    setEditingUserId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Alignment</h1>
          <p className="text-slate-400 mt-1">Manage access levels and strategic ownership areas.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
          >
            <i className="fas fa-user-plus"></i>
            Invite Member
          </button>
        )}
      </header>

      {/* Strategy Ownership Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {themes.map(theme => {
          const owner = users.find(u => u.ownedThemeId === theme.id && u.ownershipType === 'Owner');

          // A supporting user is someone whose primary ownedTheme is this one OR who has it in supportingPillars
          const supporting = users.filter(u => {
            const isPrimarySupporting = u.ownedThemeId === theme.id && u.ownershipType === 'Supporting';
            const isSecondarySupporting = u.supportingPillars?.some(p => p.themeId === theme.id);
            // Don't count them twice if they happen to be listed in both (though UI should prevent this)
            // Also ensure we don't count the primary owner in the supporting list
            return (isPrimarySupporting || isSecondarySupporting) && u.id !== owner?.id;
          });

          return (
            <div key={theme.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col h-full group hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full bg-${theme.color}-500 shadow-[0_0_8px_rgba(var(--${theme.color}-500),0.5)]`}></span>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{theme.name}</h3>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Primary Owner</p>
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <img src={owner.avatar} className="w-6 h-6 rounded-full ring-2 ring-slate-950 bg-slate-800" alt="" />
                      <span className="text-xs font-bold text-slate-200 truncate">{owner.firstName} {owner.lastName}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic font-light">Vacant</p>
                  )}
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Supporting ({supporting.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {supporting.map(u => (
                      <div key={u.id} className="relative group/avatar">
                        <img src={u.avatar} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800" alt="" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/avatar:block z-20">
                          <div className="bg-black text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap border border-slate-800">
                            {u.firstName} {u.lastName}
                          </div>
                        </div>
                      </div>
                    ))}
                    {supporting.length === 0 && <span className="text-[10px] text-slate-600 font-light">None</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Directory */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Team Member</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Access Level</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Strategic Area</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.length > 0 ? users.map(user => {
              const theme = themes.find(t => t.id === user.ownedThemeId);
              const supportCount = user.supportingPillars?.length || 0;

              return (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-800 ring-2 ring-slate-950 shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-slate-200">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 font-light">{user.title}</p>
                      </div>
                      {user.linkedinUrl && (
                        <a
                          href={user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:bg-[#006396] transition-colors shadow-sm"
                          title="View LinkedIn Profile"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fab fa-linkedin-in text-[10px]"></i>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'Admin' ? 'bg-blue-500/10 text-blue-400' :
                        user.role === 'Editor' ? 'bg-slate-800 text-slate-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                        {user.role}
                      </span>
                      {isAdmin && user.id !== currentUser.id && (
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-1 text-slate-600 hover:text-blue-500 transition-colors"
                          title={`Switch to ${user.role === 'Admin' ? 'Editor' : 'Admin'}`}
                        >
                          <i className="fas fa-arrows-rotate text-[10px]"></i>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {theme ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-${theme.color}-500/10 text-${theme.color}-400`}>
                            {theme.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase italic">
                            ({user.ownershipType})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-light">Global / General</span>
                      )}

                      {supportCount > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-slate-600 uppercase">Supporting:</span>
                          {user.supportingPillars?.map(p => {
                            const pTheme = themes.find(t => t.id === p.themeId);
                            return pTheme ? (
                              <span key={p.themeId} className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-800 text-slate-500 border border-slate-700`}>
                                {pTheme.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-slate-600 hover:text-blue-400 p-2 transition-colors"
                        title="Edit member details"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic">
                  No registered users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-800">
            <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">
                {modalMode === 'create' ? 'Invite Strategy Member' : 'Edit Strategy Member'}
              </h3>
              <button
                onClick={() => { setModalMode(null); setEditingUserId(null); }}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <i className="fas fa-times"></i>
              </button>
            </header>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                    value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                    value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Professional Title</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Head of Ops" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Access Role</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Editor">Editor (Bet Management)</option>
                    <option value="Viewer">Viewer (Read Only)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Primary Strategy Alignment</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2">Area of Strategy</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.ownedThemeId} onChange={e => setFormData({ ...formData, ownedThemeId: e.target.value })}>
                      <option value="">None (Global Support)</option>
                      {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2">Ownership Level</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.ownershipType} onChange={e => setFormData({ ...formData, ownershipType: e.target.value as OwnershipType })}>
                      <option value="Owner">Primary Owner</option>
                      <option value="Supporting">Supporting Partner</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModalMode(null); setEditingUserId(null); }}
                  className="flex-1 py-3 border border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                  {modalMode === 'create' ? 'Invite to Strategy' : 'Update Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
