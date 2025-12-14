import { supabase } from '@/integrations/supabase/client';

// Word list for generating backup phrases (BIP39 subset)
const WORD_LIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
  'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
  'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
  'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
  'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
  'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
  'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
  'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
  'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
  'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
  'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
  'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
  'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
  'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
  'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
  'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
  'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body'
];

// Generate a 12-word backup phrase
export function generateBackupPhrase(): string {
  const words: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    words.push(WORD_LIST[randomIndex]);
  }
  return words.join(' ');
}

// Simple hash function for password (NOT cryptographically secure - for demo purposes)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + password.length.toString(16);
}

// Verify password against hash
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export interface UserProfile {
  id: string;
  username: string;
  last_active_at: string;
  created_at: string;
}

// Register a new user
export async function registerUser(username: string, password: string): Promise<{ user: UserProfile; backupPhrase: string } | { error: string }> {
  const backupPhrase = generateBackupPhrase();
  const passwordHash = hashPassword(password);

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      username: username.toLowerCase().trim(),
      password_hash: passwordHash,
      backup_phrase: backupPhrase,
    })
    .select('id, username, last_active_at, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'Username already taken' };
    }
    return { error: error.message };
  }

  return { user: data, backupPhrase };
}

// Login user
export async function loginUser(username: string, password: string): Promise<{ user: UserProfile } | { error: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, password_hash, last_active_at, created_at')
    .eq('username', username.toLowerCase().trim())
    .single();

  if (error || !data) {
    return { error: 'Invalid username or password' };
  }

  if (!verifyPassword(password, data.password_hash)) {
    return { error: 'Invalid username or password' };
  }

  // Update last active time
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', data.id);

  const { password_hash, ...user } = data;
  return { user };
}

// Recover account with backup phrase
export async function recoverAccount(backupPhrase: string, newPassword: string): Promise<{ user: UserProfile } | { error: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, last_active_at, created_at')
    .eq('backup_phrase', backupPhrase.toLowerCase().trim())
    .single();

  if (error || !data) {
    return { error: 'Invalid recovery phrase' };
  }

  // Update password and last active time
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      password_hash: hashPassword(newPassword),
      last_active_at: new Date().toISOString()
    })
    .eq('id', data.id);

  if (updateError) {
    return { error: 'Failed to update password' };
  }

  return { user: data };
}

// Update user's last active time
export async function updateLastActive(userId: string): Promise<void> {
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId);
}
