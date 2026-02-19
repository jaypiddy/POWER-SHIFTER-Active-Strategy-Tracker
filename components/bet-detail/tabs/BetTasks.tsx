import React, { useState } from 'react';
import { useBetDetail } from '../BetDetailContext';
import { BetAction, ActionProgress } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

export const BetTasks: React.FC = () => {
    const { bet, onSaveTask, onDeleteTask, canEdit, users, initialFocusTaskId } = useBetDetail();
    const [editingAction, setEditingAction] = useState<BetAction | null>(null);

    // Handle deep linking to a specific task
    React.useEffect(() => {
        if (initialFocusTaskId) {
            const task = bet.actions.find(a => a.id === initialFocusTaskId);
            if (task) {
                // Open the edit modal
                setEditingAction(task);

                // Scroll into view
                setTimeout(() => {
                    const el = document.getElementById(`task-${initialFocusTaskId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a temporary highlight effect
                        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 2000);
                    }
                }, 100); // Slight delay to ensure rendering
            }
        }
    }, [initialFocusTaskId, bet.actions]);

    const handleAddAction = () => {
        const newAction: BetAction = {
            id: `a-${Date.now()}`,
            bet_id: bet.id,
            title: 'New Strategic Task',
            description: '',
            tshirt_size: 'M',
            progress: 0,
            start_date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0]
        };
        setEditingAction(newAction);
    };

    const handleRemoveAction = (id: string) => {
        if (window.confirm('Remove this strategic task?')) {
            onDeleteTask(id);
        }
    };

    const handleUpdateActionLocal = (updates: Partial<BetAction>) => {
        if (!editingAction) return;
        setEditingAction({ ...editingAction, ...updates });
    };

    const handleDoneEditing = () => {
        if (editingAction) {
            onSaveTask(editingAction);
            setEditingAction(null);
        }
    };

    const progressSteps: ActionProgress[] = [0, 25, 50, 75, 100];

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Bet Tasks</h3>
                    {canEdit && (
                        <motion.button
                            onClick={handleAddAction}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                        >
                            <i className="fas fa-plus mr-1.5"></i> Add Task
                        </motion.button>
                    )}
                </div>
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {bet.actions.map((action) => {
                            const assignee = users.find(u => u.id === action.owner_id);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    key={action.id}
                                    id={`task-${action.id}`}
                                    className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 transition-all hover:border-blue-200 shadow-sm relative group"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-800 truncate">{action.title}</p>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded">{action.tshirt_size}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-light line-clamp-1 mb-3">{action.description || 'No description provided.'}</p>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                                    <i className="far fa-calendar"></i>
                                                    <span>{action.due_date || 'No date'}</span>
                                                </div>
                                                <div className="flex-1 max-w-[100px] flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${action.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500">{action.progress}%</span>
                                                </div>
                                                {assignee && (
                                                    <div className="flex items-center gap-1">
                                                        <img src={assignee.avatar} className="w-4 h-4 rounded-full" alt="" />
                                                        <span className="text-[10px] font-bold text-slate-600">{assignee.firstName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {canEdit && (
                                                <button onClick={() => setEditingAction(action)} className="text-slate-400 hover:text-blue-600 p-2 transition-colors">
                                                    <i className="fas fa-pen text-sm"></i>
                                                </button>
                                            )}
                                            {canEdit && (
                                                <button onClick={() => handleRemoveAction(action.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                                                    <i className="fas fa-trash-alt text-sm"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {bet.actions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl"
                            >
                                <p className="text-sm text-slate-400 italic">No tasks defined for this bet.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {editingAction && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Edit Strategic Task</h3>
                            <button onClick={() => setEditingAction(null)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </header>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                    value={editingAction.title}
                                    onChange={(e) => handleUpdateActionLocal({ title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assignee</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 appearance-none cursor-pointer"
                                        value={editingAction.owner_id || ''}
                                        onChange={(e) => handleUpdateActionLocal({ owner_id: e.target.value || undefined })}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                        ))}
                                    </select>
                                    <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Task Completion (%)</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                    {progressSteps.map((step) => (
                                        <button
                                            key={step}
                                            type="button"
                                            onClick={() => handleUpdateActionLocal({ progress: step })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editingAction.progress === step
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {step}%
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Task progress increments are restricted to 25% steps.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleDoneEditing}
                                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                                >
                                    Done Editing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
