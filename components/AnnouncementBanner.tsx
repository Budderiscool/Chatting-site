
import React from 'react';
import { Announcement } from '../types';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onClose: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement, onClose }) => {
  return (
    <div className="w-full bg-indigo-600 px-4 py-2 flex items-center justify-between text-white text-sm font-medium z-[100] shadow-lg animate-slide-down">
      <div className="flex items-center space-x-3">
        <div className="p-1.5 bg-indigo-500 rounded-full">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167H3.38a1.588 1.588 0 01-1.58-1.58V8.337a1.588 1.588 0 011.58-1.58h1.056l2.147-6.167a1.76 1.76 0 013.417.592v3.3zM15 15.5a3 3 0 000-6M15 19.5a7 7 0 000-14" />
           </svg>
        </div>
        <p className="flex-1">{announcement.content}</p>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 p-1 hover:bg-white/20 rounded transition-all"
        title="Dismiss for this session"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};
