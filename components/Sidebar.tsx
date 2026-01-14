
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Channel, Profile, ViewState } from '../types';

interface SidebarProps {
  userProfile: Profile | null;
  currentView: ViewState | null;
  onViewChange: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userProfile, currentView, onViewChange }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  useEffect(() => {
    fetchChannels();
    fetchProfiles();

    // Real-time channel updates
    const channelSub = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', table: 'channels', schema: 'public' }, () => {
        fetchChannels();
      })
      .subscribe();

    return () => {
      channelSub.unsubscribe();
    };
  }, []);

  const fetchChannels = async () => {
    const { data } = await supabase.from('channels').select('*').order('name');
    if (data) setChannels(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userProfile?.id)
      .limit(20);
    if (data) setProfiles(data);
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    const { error } = await supabase.from('channels').insert([{ 
      name: newChannelName.trim(), 
      created_by: userProfile?.id 
    }]);
    if (error) alert(error.message);
    else {
      setNewChannelName('');
      setIsChannelModalOpen(false);
    }
  };

  const logout = () => supabase.auth.signOut();

  return (
    <div className="w-64 bg-[#2b2d31] flex flex-col h-full border-r border-[#1e1f22]">
      {/* Channels Section */}
      <div className="flex items-center justify-between px-4 py-3 h-12 border-b border-[#1e1f22] shadow-sm">
        <h2 className="font-bold text-white truncate">Disclone</h2>
        {userProfile?.is_admin && (
          <button 
            onClick={() => setIsChannelModalOpen(true)}
            className="p-1 hover:bg-[#35373c] rounded text-[#b5bac1] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-4 space-y-4">
        {/* Text Channels */}
        <div className="px-2">
          <div className="flex items-center px-2 mb-1">
            <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider flex-1">Text Channels</span>
          </div>
          <div className="space-y-0.5">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => onViewChange({ type: 'channel', id: ch.id, name: ch.name })}
                className={`w-full flex items-center px-2 py-1.5 rounded group transition-colors ${
                  currentView?.id === ch.id ? 'bg-[#35373c] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                }`}
              >
                <span className="mr-1.5 text-[#80848e]">#</span>
                <span className="truncate flex-1 text-left text-[15px] font-medium">{ch.name}</span>
                {userProfile?.is_admin && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm(`Delete ${ch.name}?`)) supabase.from('channels').delete().eq('id', ch.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div className="px-2">
          <div className="flex items-center px-2 mb-1">
            <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">Direct Messages</span>
          </div>
          <div className="space-y-0.5">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => onViewChange({ type: 'dm', id: p.id, name: p.username })}
                className={`w-full flex items-center px-2 py-1.5 rounded group transition-colors ${
                  currentView?.id === p.id ? 'bg-[#35373c] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                }`}
              >
                <div className="relative mr-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#2b2d31] rounded-full"></div>
                </div>
                <span className="truncate flex-1 text-left text-[15px] font-medium">{p.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="p-2 bg-[#232428] flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {userProfile?.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{userProfile?.username}</p>
          <p className="text-xs text-[#b5bac1] truncate">Online</p>
        </div>
        <button 
          onClick={logout}
          className="p-1.5 hover:bg-[#35373c] rounded text-[#b5bac1] hover:text-[#dbdee1] transition-colors"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* New Channel Modal */}
      {isChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-[#313338] rounded-lg shadow-xl overflow-hidden">
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-4 text-center">Create Text Channel</h3>
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-2">Channel Name</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5bac1]">#</span>
                   <input
                    type="text"
                    autoFocus
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full p-2 pl-7 bg-[#1e1f22] text-[#dbdee1] rounded border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="new-channel"
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#2b2d31] p-4 flex justify-end space-x-3">
              <button 
                onClick={() => setIsChannelModalOpen(false)}
                className="px-4 py-2 text-sm text-white hover:underline"
              >
                Cancel
              </button>
              <button 
                onClick={createChannel}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded transition-colors"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
