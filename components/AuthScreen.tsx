
import React, { useState } from 'react';
import { supabase, SUPABASE_URL } from '../supabase';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Supabase needs an email, so we derive a pseudo-email from username
    const email = `${username.toLowerCase().trim()}@disclone.local`;

    try {
      if (isLogin) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // After signup, manually insert into the profiles table
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert([
            { id: data.user.id, username, is_admin: false }
          ], { onConflict: 'id' });
          
          if (profileError) {
            console.error("Profile creation error:", profileError);
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError(`Network Error: Browser could not reach the database. Please verify your Supabase URL and Keys.`);
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#313338] rounded-lg shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p className="text-[#b5bac1]">{isLogin ? 'We\'re so excited to see you again!' : 'Join the Disclone community today.'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 bg-[#1e1f22] text-[#dbdee1] rounded border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-[#1e1f22] text-[#dbdee1] rounded border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm flex items-start">
               <svg className="w-4 h-4 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            ) : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-sm text-center">
          <span className="text-[#b5bac1]">
            {isLogin ? "Need an account?" : "Already have an account?"}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-sky-400 hover:underline focus:outline-none font-medium"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
