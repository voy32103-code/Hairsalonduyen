import React from 'react';

export interface StatItem {
    label: string;
    value: string | number;
    icon: string;
    colorClass: string;
    iconBgClass?: string;
}

interface StatCardsProps {
    stats: StatItem[];
}

export default function StatCards({ stats }: StatCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-5 flex items-center gap-4 border border-white/5">
                    {stat.iconBgClass ? (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBgClass} ${stat.colorClass}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                    ) : (
                        <span className={`material-symbols-outlined text-3xl ${stat.colorClass}`}>{stat.icon}</span>
                    )}
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
