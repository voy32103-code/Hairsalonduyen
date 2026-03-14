'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayoutClient({
    children,
    activeSession
}: {
    children: React.ReactNode;
    activeSession: any;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <Header 
                initialActiveSession={activeSession} 
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-80px)] relative">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                />
                
                {/* Mobile Backdrop */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
                        onClick={() => setIsSidebarOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsSidebarOpen(false);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Close sidebar"
                    />
                )}

                <main className="flex-1 auto-rows-min overflow-y-auto p-4 md:p-6 space-y-6">
                    {children}
                </main>
            </div>
        </>
    );
}
