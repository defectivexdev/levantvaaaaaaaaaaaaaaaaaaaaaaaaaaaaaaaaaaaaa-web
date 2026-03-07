'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface AnnouncementPreviewProps {
    title: string;
    departureIcao: string;
    departureAirport: string;
    arrivalIcao: string;
    arrivalAirport: string;
    startTime: string;
    estimatedFlightTime: string;
    planeType: string;
    route: string;
    reminderMinutes: number;
    localTime: boolean;
}

export default function AnnouncementPreview(props: AnnouncementPreviewProps) {
    const [copied, setCopied] = useState(false);

    const generateAnnouncement = () => {
        const date = props.startTime ? new Date(props.startTime) : new Date();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = props.localTime 
            ? '(THE LOCAL TIME IN YOUR PC)' 
            : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        // Calculate time remaining
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
        const timeRemainStr = hoursRemaining > 0 ? `in ${hoursRemaining} hours` : 'STARTING SOON';

        return `DEAR LEVANT MEMBER 

We Would like to invite you to the group flights from ${props.departureAirport || props.departureIcao} (${props.departureIcao}) to ${props.arrivalAirport || props.arrivalIcao} (${props.arrivalIcao}) on ${dayName}

:calendar: date:
${dateStr}

:clock8: time:
${props.localTime ? timeStr : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}

:clock8: TIME REMAIN :
${timeRemainStr}

:clock8: Air time :
- ${props.estimatedFlightTime || 'TBD'} 
 
-:airplane: Plane type :
- ${props.planeType || 'Any'} 

${props.route ? `مسار الرحلة - Route
${props.route}` : ''}

:warning: * ملاحظة
يفضل التواجد قبل موعد الاقلاع بـ ${props.reminderMinutes} دقيقة
-be there before ${props.reminderMinutes} of the dep 
يرجى التأكد من تحميل المطارات لضمان تجربة طيران ممتعة
be sure that you download the airport

We hope to see you with us  :heart: :airplane:
@everyone`;
    };

    const announcement = generateAnnouncement();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(announcement);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 bg-[#2b2d31] border border-[#3f4147] rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#232428] border-b border-[#3f4147] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-bold text-white">Discord Announcement Preview</span>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium transition-colors"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="p-4">
                <pre className="text-sm text-[#dbdee1] whitespace-pre-wrap font-['Whitney','Helvetica_Neue','Helvetica','Arial',sans-serif] leading-relaxed">
{announcement}
                </pre>
            </div>
            <div className="px-4 py-2 bg-[#232428] border-t border-[#3f4147] text-xs text-gray-500">
                💡 Click "Copy" to copy this announcement to your clipboard, then paste it in your Discord channel
            </div>
        </div>
    );
}
