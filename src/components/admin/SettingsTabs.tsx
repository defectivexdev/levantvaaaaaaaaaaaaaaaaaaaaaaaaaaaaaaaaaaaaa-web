'use client';

import { useState } from 'react';
import { Settings, DollarSign, Plane, Trophy, Zap, Radio } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { id: 'general', label: 'General Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'pilot', label: 'Pilot System', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'flight', label: 'Flight System', icon: <Plane className="w-4 h-4" /> },
    { id: 'economy', label: 'Economy System', icon: <Zap className="w-4 h-4" /> },
    { id: 'acars', label: 'ACARS Settings', icon: <Radio className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
];

interface SettingsTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-4 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                            ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
