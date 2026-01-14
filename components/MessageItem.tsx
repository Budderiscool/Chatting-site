
import React, { useState } from 'react';
import { Message, Profile } from '../types';
import { format } from 'date-fns';
import { supabase } from '../supabase';

interface MessageItemProps {
  message: Message;
  userProfile: Profile;
  showAuthor: boolean;
  onReply: () => void;
  onForward: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, userProfile, showAuthor, onReply, onForward }) => {
  const [showMenu, setShowMenu] = useState(false);

  const addReaction = async (emoji: string) => {
    await supabase.from('reactions').upsert([{ 
      message_id: message.id, 
      user_id: userProfile.id, 
      emoji 
    }], { onConflict: 'message_id,user_id,emoji' });
    setShowMenu(false);
  };

  const deleteMessage = async () => {
    if(confirm('Delete this message?')) {
      await supabase.from('messages').delete().eq('id', message.id);
    }
  };

  const reactionGroups = (message.reactions || []).reduce((acc: any, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div 
      className={`group relative flex flex-col px-4 hover:bg-[#2e3035] transition-colors py-1 ${showAuthor ? 'mt-4' : 'mt-0'}`}
      onContextMenu={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
    >
      {/* Reply Reference Header */}
      {message.reply_to && showAuthor && (
        <div className="flex items-center space-x-2 text-xs text-[#b5bac1] mb-1 pl-12 opacity-80">
          <div className="w-4 h-2 border-l-2 border-t-2 border-[#4e5058] rounded-tl mr-1"></div>
          <img src={`https://ui-avatars.com/api/?name=${message.reply_to.author?.username}&background=random`} className="w-4 h-4 rounded-full" />
          <span className="font-bold hover:underline cursor-pointer">@{message.reply_to.author?.username}</span>
          <span className="truncate max-w-[200px] italic">{message.reply_to.content}</span>
        </div>
      )}

      {/* Forwarded Header */}
      {message.forwarded_from_id && showAuthor && (
        <div className="flex items-center space-x-2 text-[10px] text-[#b5bac1] mb-1 pl-12 italic uppercase tracking-wider font-bold">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
           <span>Forwarded Message</span>
        </div>
      )}

      <div className="flex items-start">
        {/* Avatar */}
        <div className="w-10 h-10 shrink-0 mt-0.5 mr-4">
          {showAuthor ? (
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {message.author?.username.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-10 h-4 text-[10px] text-transparent group-hover:text-[#949ba4] flex items-center justify-center transition-colors">
              {format(new Date(message.created_at), 'HH:mm')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {showAuthor && (
            <div className="flex items-baseline space-x-2 mb-0.5">
              <span className="font-bold text-white hover:underline cursor-pointer">{message.author?.username}</span>
              <span className="text-[10px] text-[#949ba4]">{format(new Date(message.created_at), 'MM/dd/yyyy HH:mm')}</span>
            </div>
          )}
          <div className="text-[#dbdee1] leading-snug whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Reactions Row */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.entries(reactionGroups).map(([emoji, count]: [string, any]) => (
                <button 
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className="flex items-center space-x-1.5 px-1.5 py-0.5 bg-[#2b2d31] border border-transparent hover:border-indigo-500 rounded text-sm transition-all"
                >
                  <span>{emoji}</span>
                  <span className="text-indigo-400 font-bold text-xs">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Menu */}
      <div className="absolute right-4 -top-4 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl bg-[#313338] border border-[#1e1f22] rounded flex overflow-hidden">
        <button onClick={onReply} className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white" title="Reply">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </button>
        <button onClick={() => addReaction('👍')} className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white" title="React with 👍">
          👍
        </button>
        <button onClick={() => addReaction('🔥')} className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white" title="React with 🔥">
          🔥
        </button>
        <button onClick={onForward} className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white" title="Forward">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
        {(message.author_id === userProfile.id || userProfile.is_admin) && (
          <button onClick={deleteMessage} className="p-2 hover:bg-[#35373c] text-red-400" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>

      {/* Right Click Context Menu (Simulated) */}
      {showMenu && (
        <div className="fixed z-50 bg-[#111214] border border-[#1e1f22] rounded shadow-2xl p-1 min-w-[180px] text-sm text-[#b5bac1]" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <button onClick={onReply} className="w-full text-left px-3 py-2 hover:bg-indigo-500 hover:text-white rounded transition-colors flex justify-between items-center">
            Reply <span>Enter</span>
          </button>
          <button onClick={onForward} className="w-full text-left px-3 py-2 hover:bg-indigo-500 hover:text-white rounded transition-colors flex justify-between items-center">
            Forward <span>F</span>
          </button>
          <div className="h-px bg-[#1e1f22] my-1"></div>
          <button onClick={() => addReaction('❤️')} className="w-full text-left px-3 py-2 hover:bg-indigo-500 hover:text-white rounded transition-colors">Add Reaction ❤️</button>
          <button onClick={() => addReaction('😂')} className="w-full text-left px-3 py-2 hover:bg-indigo-500 hover:text-white rounded transition-colors">Add Reaction 😂</button>
          <button onClick={() => setShowMenu(false)} className="w-full text-left px-3 py-2 hover:bg-[#35373c] rounded transition-colors text-red-400 mt-2 border-t border-[#1e1f22]">Close Menu</button>
        </div>
      )}
    </div>
  );
};
