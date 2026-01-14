
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Profile, ViewState, Announcement } from './types';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState | null>(null);
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setUserProfile(data);
    }
    setLoading(false);
  };

  const fetchAnnouncements = useCallback(async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .lte('starts_at', now)
      .gte('ends_at', now);
    
    if (data) setActiveAnnouncements(data);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#313338]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#313338]">
      {/* Announcement System */}
      {activeAnnouncements.map(ann => (
        <AnnouncementBanner 
          key={ann.id} 
          announcement={ann} 
          onClose={() => setActiveAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
        />
      ))}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          userProfile={userProfile} 
          currentView={view}
          onViewChange={setView}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {view ? (
            <ChatPanel 
              view={view} 
              userProfile={userProfile!} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#313338]">
              <div className="w-24 h-24 mb-6 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                 <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {userProfile?.username}!</h1>
              <p className="text-[#b5bac1] max-w-md">Select a channel from the left sidebar to start chatting, or find a friend to DM.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
