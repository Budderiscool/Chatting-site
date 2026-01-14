
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Message, Profile, ViewState, MessageReaction } from '../types';
import { MessageItem } from './MessageItem';

interface ChatPanelProps {
  view: ViewState;
  userProfile: Profile;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ view, userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    setReplyingTo(null);
    setInputValue('');

    // Listen for new messages
    const messageSub = supabase
      .channel(`chat:${view.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'messages', 
        schema: 'public'
      }, async (payload) => {
        const newMessage = payload.new as Message;
        // Verify it belongs to this view
        const isTarget = view.type === 'channel' 
          ? newMessage.channel_id === view.id 
          : (newMessage.author_id === view.id && newMessage.recipient_id === userProfile.id) ||
            (newMessage.author_id === userProfile.id && newMessage.recipient_id === view.id);

        if (isTarget) {
          // Fetch the author profile for display
          const { data: author } = await supabase.from('profiles').select('*').eq('id', newMessage.author_id).single();
          setMessages(prev => [...prev, { ...newMessage, author }]);
        }
      })
      .subscribe();

    return () => {
      messageSub.unsubscribe();
    };
  }, [view.id, userProfile.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    let query = supabase
      .from('messages')
      .select('*, author:profiles(*), reply_to:messages(*, author:profiles(*)), reactions(*)')
      .order('created_at', { ascending: true });

    if (view.type === 'channel') {
      query = query.eq('channel_id', view.id);
    } else {
      query = query.or(`and(author_id.eq.${userProfile.id},recipient_id.eq.${view.id}),and(author_id.eq.${view.id},recipient_id.eq.${userProfile.id})`);
    }

    const { data } = await query;
    if (data) setMessages(data as any);
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue;
    setInputValue('');

    const payload: any = {
      content,
      author_id: userProfile.id,
      reply_to_id: replyingTo?.id || null
    };

    if (view.type === 'channel') payload.channel_id = view.id;
    else payload.recipient_id = view.id;

    const { error } = await supabase.from('messages').insert([payload]);
    
    if (error) {
      alert(error.message);
      setInputValue(content);
    } else {
      setReplyingTo(null);
    }
  };

  const handleForward = async (message: Message) => {
    const targetChannelId = prompt("Enter target Channel ID or name (Simulated selection)");
    if (!targetChannelId) return;

    await supabase.from('messages').insert([{
      content: message.content,
      author_id: userProfile.id,
      channel_id: targetChannelId,
      forwarded_from_id: message.id
    }]);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#313338] h-full overflow-hidden relative">
      {/* Header */}
      <div className="h-12 border-b border-[#1e1f22] flex items-center px-4 shrink-0 shadow-sm z-10 bg-[#313338]/95 backdrop-blur-sm">
        <span className="text-[#80848e] mr-2 text-xl">{view.type === 'channel' ? '#' : '@'}</span>
        <h3 className="font-bold text-white truncate">{view.name}</h3>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar scroll-smooth"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
             <div className="w-16 h-16 bg-[#2b2d31] rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21l-8-4.5v-9L12 3l8 4.5v9L12 21z" strokeWidth="2"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" strokeWidth="2"/></svg>
             </div>
             <p className="text-white">Start of the conversation with {view.name}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              userProfile={userProfile}
              showAuthor={i === 0 || messages[i-1].author_id !== msg.author_id || (new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime() > 300000)}
              onReply={() => setReplyingTo(msg)}
              onForward={() => handleForward(msg)}
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 shrink-0 bg-[#313338]">
        {replyingTo && (
          <div className="mb-2 p-2 bg-[#2b2d31] rounded-t border-l-4 border-indigo-500 flex items-center justify-between text-xs">
            <span className="text-[#b5bac1] truncate">Replying to <span className="font-bold text-white">{replyingTo.author?.username}</span>: {replyingTo.content}</span>
            <button onClick={() => setReplyingTo(null)} className="ml-2 text-[#b5bac1] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`w-full p-3 pl-4 pr-12 bg-[#383a40] text-[#dbdee1] border-none focus:ring-0 outline-none transition-all ${replyingTo ? 'rounded-b' : 'rounded-lg'}`}
            placeholder={`Message ${view.type === 'channel' ? '#' + view.name : '@' + view.name}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-[#b5bac1]">
            <button type="button" className="hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button type="submit" disabled={!inputValue.trim()} className="hover:text-indigo-400 transition-colors disabled:opacity-30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
