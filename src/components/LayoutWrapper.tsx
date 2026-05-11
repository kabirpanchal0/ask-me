"use client";

import { useState, useEffect } from "react";
import { Menu, MoveLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSidebarOpen(window.innerWidth >= 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="flex h-full relative">
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden w-full lg:w-auto">
                {/* Top Bar with Toggle Button */}
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 rounded-md transition-all duration-300 hover:opacity-80 cursor-pointer"
                        style={{ 
                            background: 'var(--panel-bg)', 
                            color: 'var(--panel-text)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        {isSidebarOpen ? <MoveLeft size={14} /> : <Menu size={14} />}
                    </button>
                    {/* <ThemeToggle /> */}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
