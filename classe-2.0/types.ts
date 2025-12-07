
export enum UserRole {
  ADMIN = 'ADMIN',
  RESPONSABLE = 'RESPONSABLE',
  ELEVE = 'ELEVE',
}

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  password?: string;
  mustChangePassword?: boolean;
}

export interface Announcement {
  id: string;
  titre: string;
  matiere: string;
  lienMeet?: string;
  date: string;
  heure: string;
  importance: 'normal' | 'urgent';
  createurId: string;
  createurNom: string;
}

export interface Exam {
  id: string;
  matiere: string;
  date: string;
  heureDebut: string;
  duree: string;
  salle: string;
  notes?: string;
  responsableId: string;
  responsableNom: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  titre: string;
  options: PollOption[];
  anon: boolean;
  dateCreation: string;
  dateExpiration: string;
  votedUserIds: string[]; // Track who voted
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INFOS = 'INFOS',
  DS = 'DS',
  POLLS = 'POLLS',
  ADMIN_USERS = 'ADMIN_USERS',
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}
