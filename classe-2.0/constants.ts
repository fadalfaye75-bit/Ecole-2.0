
import { User, UserRole, Announcement, Exam, Poll } from './types';

export const SUPABASE_URL = 'https://pcoqlbykfukrqfycyldd.supabase.co'; 
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjb3FsYnlrZnVrcnFmeWN5bGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjczNDgsImV4cCI6MjA4MDYwMzM0OH0.F4tU2kgi8QhjxhX_dcoQWyIT8Gv4OcnltBJ4GWjTaNE';

export const INITIAL_USERS: User[] = [
  { id: 'u1', nom: 'Super Admin', email: 'serignefalloufaye@ecole.com', role: UserRole.ADMIN, password: 'passer25' },
];

// Ces données initiales ne sont utilisées que si la DB est vide ou non connectée localement pour tester
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_EXAMS: Exam[] = [];
export const INITIAL_POLLS: Poll[] = [];
