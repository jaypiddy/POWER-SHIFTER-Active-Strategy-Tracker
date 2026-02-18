import React, { useState } from 'react';
import { useBetDetail } from './BetDetailContext';

export const BetDetailHeader: React.FC = () => {
    const { bet, themes, onClose, onArchive, onDelete, onUpdate, canEdit } = useBetDetail();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const theme = themes.find(t => t.id === bet.theme_id);
    const isArchived = bet.stage === 'Archived';

    return (
        <>
            <header className="px-8 pt-8 pb-0 bg-white relative">
                <button
                    onClick={onClose}
                    className="absolute left-2 top-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>

                <div className="flex justify-between items-start pl-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded bg-${theme?.color || 'blue'}-50 text-${theme?.color || 'blue'}-600 text-[10px] font-bold uppercase tracking-widest`}>
                                {theme?.name || 'Theme'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                {bet.bet_type}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                            {bet.title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {canEdit && (
                            <>
                                {!isArchived && (
                                    <button
                                        onClick={() => onArchive(bet)}
                                        className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                        title="Archive Bet"
                                    >
                                        <i className="fas fa-box-archive"></i>
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete Permanently"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => {
                                onUpdate(bet);
                                setShowSaved(true);
                                setTimeout(() => setShowSaved(false), 2000);
                            }}
                            className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${showSaved
                                ? 'bg-emerald-500 text-white shadow-emerald-900/20'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20'
                                }`}
                        >
                            {showSaved ? (
                                <>
                                    <i className="fas fa-check"></i>
                                    Saved!
                                </>
                            ) : (
                                'Save Bet Details'
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Delete Confirmation Modal - moved here or extracted further */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
                            <h3 className="text-xs font-bold text-rose-800 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-triangle-exclamation"></i>
                                Confirm Permanent Deletion
                            </h3>
                            <button onClick={() => setShowDeleteConfirm(false)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </header>
                        <div className="p-8 space-y-6 text-center">
                            <p className="text-sm text-slate-600 leading-relaxed font-light">
                                Are you sure you want to delete <strong className="text-slate-900">"{bet.title}"</strong>?
                                This action will permanently remove all associated tasks, history, and discussions from the platform.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { onDelete(bet.id); setShowDeleteConfirm(false); }}
                                    className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
