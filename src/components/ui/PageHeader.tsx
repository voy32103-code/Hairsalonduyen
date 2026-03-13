import React from 'react';

interface PageHeaderProps {
    breadcrumbItems?: { label: string; href?: string }[];
    title: string;
    description?: string;
    actionElement?: React.ReactNode;
}

export default function PageHeader({ breadcrumbItems, title, description, actionElement }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                {breadcrumbItems && breadcrumbItems.length > 0 && (
                    <nav className="flex gap-2 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">
                        {breadcrumbItems.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <span>/</span>}
                                {item.href ? (
                                    <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                                ) : (
                                    <span className={index === breadcrumbItems.length - 1 ? "text-primary" : ""}>
                                        {item.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{title}</h2>
                {description && <p className="text-slate-500 mt-1 font-medium text-sm">{description}</p>}
            </div>
            {actionElement && (
                <div>
                    {actionElement}
                </div>
            )}
        </div>
    );
}
