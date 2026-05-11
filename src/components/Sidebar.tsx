"use client";

import { MessageSquare, Settings, User, LogOut, Menu, X, MoveLeft } from "lucide-react";
import { useState } from "react";
import SettingsModal from "./SettingsModal";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            {/* Overlay for mobile/tablet */}
            <div
                className="lg:hidden fixed inset-0 bg-black z-30 transition-opacity duration-300"
                style={{
                    opacity: isOpen ? 0.5 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none'
                }}
                onClick={onToggle}
            />

            {/* Sidebar Container */}
            <aside
                className="h-full flex flex-col transition-all duration-300 ease-in-out lg:rounded-r-3xl lg:relative fixed left-0 top-0 z-40"
                style={{
                    width: isOpen ? '260px' : '0',
                    minWidth: isOpen ? '260px' : '0',
                    background: 'var(--panel-bg)',
                    borderRight: isOpen ? '1px solid var(--border-color)' : 'none',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-semibold whitespace-nowrap" style={{ color: 'var(--panel-text)' }}>
                        Ask.
                    </h2>
                    <button
                        onClick={onToggle}
                        className="transition-all duration-300 hover:opacity-80 lg:hidden block cursor-pointer"
                    >
                        <MoveLeft size={14} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 overflow-y-auto">
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap"
                        style={{ background: 'var(--input-bg)', color: 'var(--panel-text)' }}
                    >
                        <MessageSquare size={18} />
                        <span className="text-sm">New Chat</span>
                    </button>

                    <div className="mt-4">
                        <p className="text-xs px-3 py-2 opacity-60 whitespace-nowrap" style={{ color: 'var(--panel-text)' }}>
                            Recent
                        </p>
                        {/* Chat history items would go here */}
                    </div>
                </nav>

                {/* Profile Menu at Bottom */}
                <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: 'var(--input-bg)' }}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--border-color)' }}
                        >
                            <User size={16} style={{ color: 'var(--panel-text)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--panel-text)' }}>
                                User
                            </p>
                            <p className="text-xs opacity-60 truncate" style={{ color: 'var(--panel-text)' }}>
                                user@example.com
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                            style={{ background: 'var(--input-bg)', color: 'var(--panel-text)' }}
                        >
                            <Settings size={16} />
                            <span className="text-xs">Settings</span>
                        </button>
                        <button
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                            style={{ background: 'var(--input-bg)', color: 'var(--panel-text)' }}
                        >
                            <LogOut size={16} />
                            <span className="text-xs">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Settings Modal */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
}
