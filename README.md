# Disclone Chat - Database Setup

To fix the "relation already exists" error, copy and paste the entire block below into your Supabase SQL Editor. This will reset the tables and ensure they match the application logic exactly.

## 1. Complete Schema Reset

```sql
-- 1. DROP EXISTING TABLES (Clean start)
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.reactions;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.channels;
DROP TABLE IF EXISTS public.profiles;

-- 2. CREATE TABLES

-- Profiles table (Acts as our Users table)
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Stored as text for simplicity
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Channels table
CREATE TABLE public.channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  forwarded_from_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_gif BOOLEAN DEFAULT FALSE,
  gif_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT message_scope_check CHECK (
    (channel_id IS NOT NULL AND recipient_id IS NULL) OR
    (channel_id IS NULL AND recipient_id IS NOT NULL)
  )
);

-- Reactions table
CREATE TABLE public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(message_id, user_id, emoji)
);

-- Announcements table (Required for App.tsx)
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DISABLE RLS (For easier testing with custom auth)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- 4. INSERT INITIAL DATA (Optional)
INSERT INTO public.channels (name) VALUES ('general'), ('random'), ('dev-talk');
```

## 2. Realtime Setup
1. Go to **Database** -> **Replication** in Supabase.
2. Click on **'supabase_realtime'** (or create it).
3. Toggle on the tables: `messages`, `channels`, `profiles`, and `reactions`.

## 3. Creating an Admin
To create an admin user, register normally in the app, then run this in the SQL editor:
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE username = 'YOUR_USERNAME';
```
