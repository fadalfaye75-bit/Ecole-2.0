
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

let supabaseClient = null;

// Vérification basique pour s'assurer que les valeurs par défaut ont été remplacées
const isUrlValid = SUPABASE_URL && SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('VOTRE_PROJET');
const isKeyValid = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes('VOTRE_CLE');

if (isUrlValid && isKeyValid) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = supabaseClient;
