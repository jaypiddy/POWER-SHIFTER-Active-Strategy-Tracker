import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-800 rounded ${className}`} />
);

export const AppSkeleton: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-900 text-slate-300 overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-20 md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300">
                <div className="p-6 flex items-center gap-3 mb-6">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="hidden md:block h-6 w-32" />
                </div>

                <div className="px-4 space-y-4 flex-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="w-6 h-6 rounded-md" />
                            <Skeleton className="hidden md:block h-4 w-24" />
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="hidden md:block space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-32 rounded-xl" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Cards */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                </div>
                                <Skeleton className="h-10 w-16" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 h-64">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 h-64">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <Skeleton className="h-full w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
