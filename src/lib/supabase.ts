import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadedFile {
  id: string;
  filename: string;
  content: string;
  file_type: 'instruction' | 'sample';
  uploaded_at: string;
  user_id: string | null;
}
