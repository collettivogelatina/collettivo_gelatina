import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://ydbbfseqpzzrtxjveher.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYmJmc2VxcHp6cnR4anZlaGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzY4ODEsImV4cCI6MjEwMjExMjg4MX0.vPfChCcKXttPNoO0gcZAjiPF_XqO0VnWS1BPruMhw7A'
);

// Prima pulisci eventuali residui
await sb.from('slam_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await sb.from('slam_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

const poets = [1,2,3,4,5,6,7].map(n => ({
  poet_name: `Poeta ${n}`,
  poem_title: '',
  voting_open: false,
  audio_url: null,
  manche: 1,
}));

const { data, error } = await sb.from('slam_sessions').insert(poets).select();
if (error) {
  // Prova senza manche se la colonna non esiste
  const poets2 = [1,2,3,4,5,6,7].map(n => ({
    poet_name: `Poeta ${n}`,
    poem_title: '',
    voting_open: false,
    audio_url: null,
  }));
  const { data: d2, error: e2 } = await sb.from('slam_sessions').insert(poets2).select();
  console.log('Inseriti (senza manche):', d2?.length, 'errore:', e2?.message);
} else {
  console.log('Inseriti:', data?.length, 'sessioni demo OK');
}
