import React from 'react';
import { Theme, User } from '../types';

interface GenericFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    themes: Theme[];
    selectedTheme: string;
    onThemeChange: (value: string) => void;

    users: User[];
    selectedUser: string;
    onUserChange: (value: string) => void;

    // Optional generic status/stage filter
    statusOptions?: { label: string; value: string }[];
    selectedStatus?: string;
    onStatusChange?: (value: string) => void;
    statusLabel?: string; // e.g. "All Stages"
}

const GenericFilterBar: React.FC<GenericFilterBarProps> = ({
    search,
    onSearchChange,
    searchPlaceholder = "Search...",
    themes,
    selectedTheme,
    onThemeChange,
    users,
    selectedUser,
    onUserChange,
    statusOptions,
    selectedStatus,
    onStatusChange,
    statusLabel = "All Statuses"
}) => {
    return (
        <div className="bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px] relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-11 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-3">
                <select
                    className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 focus:outline-none"
                    value={selectedTheme}
                    onChange={(e) => onThemeChange(e.target.value)}
                >
                    <option value="all">All Themes</option>
                    {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                {statusOptions && onStatusChange && (
                    <select
                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 focus:outline-none"
                        value={selectedStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                    >
                        <option value="all">{statusLabel}</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}

                <select
                    className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 focus:outline-none"
                    value={selectedUser}
                    onChange={(e) => onUserChange(e.target.value)}
                >
                    <option value="all">All Owners</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
            </div>
        </div>
    );
};

export default GenericFilterBar;
