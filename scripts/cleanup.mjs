process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://ydbbfseqpzzrtxjveher.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYmJmc2VxcHp6cnR4anZlaGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzY4ODEsImV4cCI6MjEwMjExMjg4MX0.vPfChCcKXttPNoO0gcZAjiPF_XqO0VnWS1BPruMhw7A'
);
const { error: e1 } = await sb.from('slam_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
const { error: e2 } = await sb.from('slam_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
console.log('slam_votes error:', e1);
console.log('slam_sessions error:', e2);
console.log('Done!');
