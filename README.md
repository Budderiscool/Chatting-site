# Disclone Chat - Database Schema

This document outlines the Supabase PostgreSQL schema required to run the Disclone Chat application. To set up your project, run the following SQL in your Supabase SQL Editor.

## 1. Tables

```sql
-- Profiles table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
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
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  forwarded_from_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_gif BOOLEAN DEFAULT FALSE,
  gif_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Ensure either channel_id or recipient_id is set (Channel message vs DM)
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

-- Announcements table
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 2. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can view, only owner can manage
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Channels: Anyone can view, only admins can manage
CREATE POLICY "Channels are viewable by everyone" ON public.channels
  FOR SELECT USING (true);
CREATE POLICY "Admins can create channels" ON public.channels
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update channels" ON public.channels
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete channels" ON public.channels
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Messages: Complex visibility (Channel vs DM)
CREATE POLICY "Messages are viewable by participants" ON public.messages
  FOR SELECT USING (
    channel_id IS NOT NULL OR 
    auth.uid() = author_id OR 
    auth.uid() = recipient_id
  );
CREATE POLICY "Authenticated users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Reactions: Anyone can view, users can manage their own
CREATE POLICY "Reactions are viewable by everyone" ON public.reactions
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.reactions
  FOR ALL USING (auth.uid() = user_id);

-- Announcements: Anyone can view, only admins manage
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements
  FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
```

## 3. Indexes for Performance

```sql
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_author_id ON public.messages(author_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_reactions_message_id ON public.reactions(message_id);
CREATE INDEX idx_announcements_dates ON public.announcements(starts_at, ends_at);
```

## 4. Setup Notes

1. **Admin User**: To set a user as an admin, find their UUID in the `profiles` table and run:
   ```sql
   UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_UUID';
   ```
2. **Realtime**: Ensure you enable the "Realtime" replication for the `messages`, `channels`, and `reactions` tables in the Supabase Dashboard (Database -> Replication).
