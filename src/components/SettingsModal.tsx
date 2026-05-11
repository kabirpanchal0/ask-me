"use client";

import { X, Settings as SettingsIcon, Bell, Palette, Grid3x3, Database, Shield, Users, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState("general");
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        if (isOpen) {
            const currentTheme = document?.documentElement?.getAttribute('data-theme') || 'light';
            setTheme(currentTheme);
        }
    }, [isOpen]);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        try {
            localStorage.setItem('theme', newTheme);
        } catch (e) {}
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "general", label: "General", icon: SettingsIcon },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "personalization", label: "Personalization", icon: Palette },
        { id: "apps", label: "Apps", icon: Grid3x3 },
        { id: "data", label: "Data controls", icon: Database },
        { id: "security", label: "Security", icon: Shield },
        { id: "parental", label: "Parental controls", icon: Users },
        { id: "account", label: "Account", icon: UserIcon },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center lg:p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div
                className="relative flex flex-col lg:flex-row lg:rounded-2xl overflow-hidden w-full h-full lg:w-[90%] lg:max-w-[1000px] lg:h-[80vh]"
                style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border-color)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile: Top Tabs */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--panel-bg)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--panel-text)' }}>
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ background: 'var(--input-bg)', color: 'var(--panel-text)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mobile: Horizontal Scrollable Tabs */}
                <div className="lg:hidden overflow-x-auto border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--panel-bg)' }}>
                    <div className="flex gap-2 p-3 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
                                    style={{
                                        background: isActive ? 'var(--input-bg)' : 'transparent',
                                        color: 'var(--panel-text)',
                                        opacity: isActive ? 1 : 0.7
                                    }}
                                >
                                    <Icon size={16} />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop: Sidebar */}
                <div
                    className="hidden lg:block w-64 p-4 overflow-y-auto"
                    style={{
                        background: 'var(--panel-bg)',
                        borderRight: '1px solid var(--border-color)'
                    }}
                >
                    <button
                        onClick={onClose}
                        className="mb-6 p-2 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ background: 'var(--input-bg)', color: 'var(--panel-text)' }}
                    >
                        <X size={20} />
                    </button>

                    <div className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                                    style={{
                                        background: isActive ? 'var(--input-bg)' : 'transparent',
                                        color: 'var(--panel-text)',
                                        opacity: isActive ? 1 : 0.7
                                    }}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8">
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 lg:mb-8" style={{ color: 'var(--foreground)' }}>
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>

                        {activeTab === "general" && (
                            <div className="space-y-6">
                                {/* Theme Selection */}
                                <div className="flex items-center justify-between py-4">
                                    <span className="text-base" style={{ color: 'var(--foreground)' }}>Appearance</span>
                                    <select
                                        value={theme}
                                        onChange={(e) => handleThemeChange(e.target.value)}
                                        className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                                        style={{
                                            background: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>

                                <div
                                    className="h-px"
                                    style={{ background: 'var(--border-color)' }}
                                />

                                {/* Language */}
                                <div className="flex items-center justify-between py-4">
                                    <span className="text-base" style={{ color: 'var(--foreground)' }}>Language</span>
                                    <select
                                        className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                                        style={{
                                            background: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <option>Auto-detect</option>
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === "personalization" && (
                            <div className="space-y-6">
                                <p className="text-sm opacity-70" style={{ color: 'var(--foreground)' }}>
                                    Customize your experience
                                </p>
                            </div>
                        )}

                        {activeTab === "data" && (
                            <div className="space-y-6">
                                <p className="text-sm opacity-70" style={{ color: 'var(--foreground)' }}>
                                    Manage your data and privacy settings
                                </p>
                            </div>
                        )}

                        {activeTab === "account" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ background: 'var(--border-color)' }}
                                    >
                                        <UserIcon size={32} style={{ color: 'var(--panel-text)' }} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>User</p>
                                        <p className="text-sm opacity-70" style={{ color: 'var(--foreground)' }}>user@example.com</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
