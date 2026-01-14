
export interface Profile {
  id: string;
  username: string;
  is_admin: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}

export interface Message {
  id: string;
  content: string;
  author_id: string;
  channel_id: string | null;
  recipient_id: string | null;
  reply_to_id: string | null;
  forwarded_from_id: string | null;
  is_gif: boolean;
  gif_url?: string;
  created_at: string;
  author?: Profile;
  reply_to?: Message;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface Announcement {
  id: string;
  content: string;
  starts_at: string;
  ends_at: string;
  created_by: string;
  created_at: string;
}

export type ViewState = {
  type: 'channel' | 'dm';
  id: string;
  name?: string;
};
