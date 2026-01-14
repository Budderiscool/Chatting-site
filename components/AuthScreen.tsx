
import React, { useState } from 'react';
import { supabase } from '../supabase';

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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        
        // After signup, we need to manually insert into the profiles table
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            { id: data.user.id, username, is_admin: false }
          ]);
          if (profileError) console.error("Profile creation error:", profileError);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1920/1080')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#313338] rounded-lg shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p className="text-[#b5bac1]">{isLogin ? 'We\'re so excited to see you again!' : 'Join the conversation today.'}</p>
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
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <span className="text-[#b5bac1]">
            {isLogin ? "Need an account?" : "Already have an account?"}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-sky-400 hover:underline focus:outline-none"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
