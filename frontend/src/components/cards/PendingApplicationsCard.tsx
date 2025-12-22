// PendingApplicationsContainer.tsx

import React, { memo } from 'react';
import { type InstructorApplication } from '../../api/instructorApplications';

interface PendingApplicationsContainerProps {
    icon: React.ElementType;
    title: string;
    totalCount: number;
    applications: InstructorApplication[];
    color: string; 
    cardClassName?: string;
}

const PendingApplicationsCard: React.FC<PendingApplicationsContainerProps> = memo(({
    icon: Icon,
    title,
    totalCount,
    applications,
    color,
    cardClassName = ''
}) => {
    
    const getApplicationStatus = (index: number) => {
        if (index === 0) return { label: 'Latest', theme: 'emerald' };
        if (index === 1) return { label: 'Oldest', theme: 'amber' };
        return { label: 'Pending', theme: 'slate' };
    };

    return (
        <div className={`p-8 rounded-[2rem] bg-slate-50/50 border border-white shadow-xl shadow-slate-200/50 flex flex-col h-full backdrop-blur-sm ${cardClassName}`}>
            
            {/* Header Section */}
            <div className="flex justify-between items-end mb-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-100 ${color.replace('bg-', 'text-')}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase">{title}</h3> 
                        <p className="text-slate-900 font-semibold">Review Queue</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-4xl font-light text-slate-900 tracking-tight">
                        {(totalCount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-slate-400/60">Total Apps</span>
                </div>
            </div>

            {/* Scrollable List Section */}
            {/* Added pr-4 to prevent the scrollbar from overlapping the hover shadow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto pr-4 max-h-[550px] custom-scrollbar pb-4">
                {applications?.map((app, index) => {
                    const status = getApplicationStatus(index);
                    const fullName = app.user?.name || app.name || "Unknown";
                    const initials = fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                    
                    return (
                        <div 
                            key={app.id} 
                            className="isolate relative bg-white rounded-3xl p-5 border border-slate-100 transition-all duration-300 ease-out hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 hover:z-20"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar Section */}
                                <div className="relative">
                                    <div className="h-20 w-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                        {app.user?.avatar_url ? (
                                            <img src={app.user.avatar_url} alt={fullName} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-300">{initials}</span>
                                        )}
                                    </div>
                                    {/* Indicator Dot */}
                                    <div className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm
                                        ${status.theme === 'emerald' ? 'bg-emerald-400' : status.theme === 'amber' ? 'bg-amber-400' : 'bg-slate-200'}`} 
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors duration-300">
                                        {fullName}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mb-3 font-medium">
                                        {app.user?.email || app.email}
                                    </p>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider
                                            ${status.theme === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                                              status.theme === 'amber' ? 'bg-amber-50 text-amber-700' : 
                                              'bg-slate-50 text-slate-500'}`}
                                        >
                                            {status.label}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-200">#ID-{app.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                
                                {/* Refined button transition */}
                                <button className="text-[10px] font-black text-indigo-500 tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
                                    DETAILS <span className="text-xs">→</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default PendingApplicationsCard;