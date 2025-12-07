import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Infos } from './pages/Infos';
import { Exams } from './pages/Exams';
import { Polls } from './pages/Polls';
import { AdminUsers } from './pages/AdminUsers';
import { User, UserRole, Announcement, Exam, Poll, ViewState, ToastMessage } from './types';
import { INITIAL_USERS } from './constants';
import { generateId } from './utils';
import { CheckCircle, AlertCircle, Info, X, Lock, Database } from 'lucide-react';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // --- State Management ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigMissing, setIsConfigMissing] = useState(false);
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [infos, setInfos] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);

  // Forced Password Change State
  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // User Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- Initial Data Loading & Realtime Subscription ---
  useEffect(() => {
    if (!supabase) {
      setIsConfigMissing(true);
      return;
    }
    
    // Initial Fetch
    fetchData();

    // Real-time Subscriptions
    const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          handleRealtimeUserUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          handleRealtimeInfoUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exams' },
        (payload) => {
          handleRealtimeExamUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'polls' },
        (payload) => {
          handleRealtimePollUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  // --- Realtime Handlers ---
  const handleRealtimeUserUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
       const newUser: User = {
        id: payload.new.id,
        nom: payload.new.nom,
        email: payload.new.email,
        role: payload.new.role as UserRole,
        password: payload.new.password,
        mustChangePassword: payload.new.must_change_password
       };
       setUsers(prev => [...prev, newUser]);
    } else if (payload.eventType === 'UPDATE') {
      const updatedUser: User = {
        id: payload.new.id,
        nom: payload.new.nom,
        email: payload.new.email,
        role: payload.new.role as UserRole,
        password: payload.new.password,
        mustChangePassword: payload.new.must_change_password
      };
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      // Update current user session if it's me
      setCurrentUser(prev => (prev && prev.id === updatedUser.id) ? updatedUser : prev);
    } else if (payload.eventType === 'DELETE') {
      setUsers(prev => prev.filter(u => u.id !== payload.old.id));
    }
  };

  const handleRealtimeInfoUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newInfo: Announcement = {
        id: payload.new.id,
        titre: payload.new.titre,
        matiere: payload.new.matiere,
        lienMeet: payload.new.lien_meet,
        date: payload.new.date,
        heure: payload.new.heure,
        importance: payload.new.importance,
        createurId: payload.new.createur_id,
        createurNom: payload.new.createur_nom
      };
      setInfos(prev => [newInfo, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else if (payload.eventType === 'UPDATE') {
      const updatedInfo: Announcement = {
        id: payload.new.id,
        titre: payload.new.titre,
        matiere: payload.new.matiere,
        lienMeet: payload.new.lien_meet,
        date: payload.new.date,
        heure: payload.new.heure,
        importance: payload.new.importance,
        createurId: payload.new.createur_id,
        createurNom: payload.new.createur_nom
      };
      setInfos(prev => prev.map(i => i.id === updatedInfo.id ? updatedInfo : i).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else if (payload.eventType === 'DELETE') {
      setInfos(prev => prev.filter(i => i.id !== payload.old.id));
    }
  };

  const handleRealtimeExamUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newExam: Exam = {
        id: payload.new.id,
        matiere: payload.new.matiere,
        date: payload.new.date,
        heureDebut: payload.new.heure_debut,
        duree: payload.new.duree,
        salle: payload.new.salle,
        notes: payload.new.notes,
        responsableId: payload.new.responsable_id,
        responsableNom: payload.new.responsable_nom
      };
      setExams(prev => [...prev, newExam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } else if (payload.eventType === 'UPDATE') {
      const updatedExam: Exam = {
        id: payload.new.id,
        matiere: payload.new.matiere,
        date: payload.new.date,
        heureDebut: payload.new.heure_debut,
        duree: payload.new.duree,
        salle: payload.new.salle,
        notes: payload.new.notes,
        responsableId: payload.new.responsable_id,
        responsableNom: payload.new.responsable_nom
      };
      setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } else if (payload.eventType === 'DELETE') {
      setExams(prev => prev.filter(e => e.id !== payload.old.id));
    }
  };

  const handleRealtimePollUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newPoll: Poll = {
        id: payload.new.id,
        titre: payload.new.titre,
        anon: payload.new.anon,
        dateCreation: payload.new.date_creation,
        dateExpiration: payload.new.date_expiration,
        options: payload.new.options || [],
        votedUserIds: payload.new.voted_user_ids || []
      };
      setPolls(prev => [newPoll, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      const updatedPoll: Poll = {
        id: payload.new.id,
        titre: payload.new.titre,
        anon: payload.new.anon,
        dateCreation: payload.new.date_creation,
        dateExpiration: payload.new.date_expiration,
        options: payload.new.options || [],
        votedUserIds: payload.new.voted_user_ids || []
      };
      setPolls(prev => prev.map(p => p.id === updatedPoll.id ? updatedPoll : p));
    } else if (payload.eventType === 'DELETE') {
      setPolls(prev => prev.filter(p => p.id !== payload.old.id));
    }
  };

  const fetchData = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      // Fetch Users
      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (usersError) throw usersError;
      
      const mappedUsers: User[] = (usersData || []).map((u: any) => ({
        id: u.id,
        nom: u.nom,
        email: u.email,
        role: u.role as UserRole,
        password: u.password,
        mustChangePassword: u.must_change_password
      }));
      setUsers(mappedUsers);

      // Fetch Announcements
      const { data: infosData, error: infosError } = await supabase.from('announcements').select('*').order('date', { ascending: false });
      if (infosError) throw infosError;
      const mappedInfos: Announcement[] = (infosData || []).map((i: any) => ({
        id: i.id,
        titre: i.titre,
        matiere: i.matiere,
        lienMeet: i.lien_meet,
        date: i.date,
        heure: i.heure,
        importance: i.importance,
        createurId: i.createur_id,
        createurNom: i.createur_nom
      }));
      setInfos(mappedInfos);

      // Fetch Exams
      const { data: examsData, error: examsError } = await supabase.from('exams').select('*').order('date', { ascending: true });
      if (examsError) throw examsError;
      const mappedExams: Exam[] = (examsData || []).map((e: any) => ({
        id: e.id,
        matiere: e.matiere,
        date: e.date,
        heureDebut: e.heure_debut,
        duree: e.duree,
        salle: e.salle,
        notes: e.notes,
        responsableId: e.responsable_id,
        responsableNom: e.responsable_nom
      }));
      setExams(mappedExams);

      // Fetch Polls
      const { data: pollsData, error: pollsError } = await supabase.from('polls').select('*').order('date_expiration', { ascending: false });
      if (pollsError) throw pollsError;
      const mappedPolls: Poll[] = (pollsData || []).map((p: any) => ({
        id: p.id,
        titre: p.titre,
        anon: p.anon,
        dateCreation: p.date_creation,
        dateExpiration: p.date_expiration,
        options: p.options || [], 
        votedUserIds: p.voted_user_ids || [] 
      }));
      setPolls(mappedPolls);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      notify("Erreur de connexion à la base de données", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Toast Logic ---
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers ---

  const handleLogin = async (email: string, pass: string) => {
    if (!supabase) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !data) {
        setLoginError('Identifiants incorrects');
        setIsLoading(false);
        return;
      }

      if (data.password !== pass) {
        setLoginError('Identifiants incorrects');
        setIsLoading(false);
        return;
      }

      const user: User = {
        id: data.id,
        nom: data.nom,
        email: data.email,
        role: data.role as UserRole,
        password: data.password,
        mustChangePassword: data.must_change_password
      };

      setCurrentUser(user);
      setLoginError(undefined);
      if (user.mustChangePassword) {
        setShowForcePasswordChange(true);
      }
      notify(`Bienvenue, ${user.nom}`, 'info');

    } catch (err) {
      setLoginError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(ViewState.DASHBOARD);
    setShowForcePasswordChange(false);
    // Data remains in state but UI resets to login
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !supabase) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ password: newPassword, must_change_password: false })
        .eq('id', currentUser.id);

      if (error) throw error;
      notify("Mot de passe mis à jour avec succès", "success");
      setShowForcePasswordChange(false);
      setNewPassword('');
      // User update will come via Realtime
    } catch (error) {
      notify("Erreur lors de la mise à jour", "error");
    }
  };

  const handleSelfPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !supabase) return;

    if (profileForm.currentPassword !== currentUser.password) {
      notify("Le mot de passe actuel est incorrect", "error");
      return;
    }
    if (profileForm.newPassword.length < 6) {
      notify("Le nouveau mot de passe doit contenir au moins 6 caractères", "error");
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      notify("Les nouveaux mots de passe ne correspondent pas", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ password: profileForm.newPassword })
        .eq('id', currentUser.id);

      if (error) throw error;

      setIsProfileModalOpen(false);
      setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify("Votre mot de passe a été modifié", "success");
      // Update will reflect via Realtime
    } catch (error) {
      notify("Erreur lors de la modification", "error");
    }
  };

  // Content Handlers
  const handleAddInfo = async (info: Omit<Announcement, 'id' | 'createurId' | 'createurNom'>) => {
    if (!currentUser || !supabase) return;
    const newId = generateId();
    const newRecord = {
      id: newId,
      titre: info.titre,
      matiere: info.matiere,
      lien_meet: info.lienMeet,
      date: info.date,
      heure: info.heure,
      importance: info.importance,
      createur_id: currentUser.id,
      createur_nom: currentUser.nom
    };

    const { error } = await supabase.from('announcements').insert(newRecord);
    if (!error) notify("Annonce publiée !", "success");
    else notify("Erreur lors de la publication", "error");
  };

  const handleDeleteInfo = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) notify("Annonce supprimée", "info");
    else notify("Erreur lors de la suppression", "error");
  };

  const handleAddExam = async (exam: Omit<Exam, 'id' | 'responsableId' | 'responsableNom'>) => {
    if (!currentUser || !supabase) return;
    const newId = generateId();
    const newRecord = {
      id: newId,
      matiere: exam.matiere,
      date: exam.date,
      heure_debut: exam.heureDebut,
      duree: exam.duree,
      salle: exam.salle,
      notes: exam.notes,
      responsable_id: currentUser.id,
      responsable_nom: currentUser.nom
    };

    const { error } = await supabase.from('exams').insert(newRecord);
    if (!error) notify("Examen planifié !", "success");
    else notify("Erreur lors de la planification", "error");
  };

  const handleDeleteExam = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (!error) notify("Examen supprimé", "info");
    else notify("Erreur lors de la suppression", "error");
  };

  const handleAddPoll = async (pollData: Omit<Poll, 'id' | 'votedUserIds' | 'dateCreation'>) => {
    if (!supabase) return;
    const newId = generateId();
    const newRecord = {
      id: newId,
      titre: pollData.titre,
      anon: pollData.anon,
      date_creation: new Date().toISOString(),
      date_expiration: pollData.dateExpiration,
      options: pollData.options, // Storing as JSON
      voted_user_ids: [] // Storing as JSON or array
    };

    const { error } = await supabase.from('polls').insert(newRecord);
    if (!error) notify("Sondage créé !", "success");
    else notify("Erreur lors de la création", "error");
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    if (!currentUser || !supabase) return;
    
    // Find poll locally just to get data
    const pollToUpdate = polls.find(p => p.id === pollId);
    if (!pollToUpdate) return;
    if (pollToUpdate.votedUserIds.includes(currentUser.id)) return;

    const updatedVotedIds = [...pollToUpdate.votedUserIds, currentUser.id];
    const updatedOptions = pollToUpdate.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);

    // Update DB
    const { error } = await supabase
      .from('polls')
      .update({ 
        options: updatedOptions,
        voted_user_ids: updatedVotedIds
      })
      .eq('id', pollId);

    if (!error) notify("Vote enregistré !", "success");
    else notify("Erreur lors du vote", "error");
  };

  const handleDeletePoll = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (!error) notify("Sondage supprimé", "info");
    else notify("Erreur lors de la suppression", "error");
  };

  const handleAddUser = async (user: User) => {
    if (!supabase) return;
    const newRecord = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      password: user.password,
      must_change_password: user.mustChangePassword
    };

    const { error } = await supabase.from('users').insert(newRecord);
    if (!error) notify(`Utilisateur ${user.nom} ajouté`, "success");
    else notify("Erreur: Email peut-être déjà existant", "error");
  };

  const handleEditUser = async (updatedUser: User) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('users')
      .update({
        nom: updatedUser.nom,
        email: updatedUser.email,
        role: updatedUser.role
      })
      .eq('id', updatedUser.id);

    if (!error) notify("Utilisateur modifié", "success");
    else notify("Erreur lors de la modification", "error");
  };

  const handleDeleteUser = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) notify("Utilisateur supprimé", "info");
    else notify("Erreur lors de la suppression", "error");
  };

  const handleResetPassword = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('users')
      .update({ password: 'changeMe123', must_change_password: true })
      .eq('id', id);

    if (!error) notify("Mot de passe réinitialisé à 'changeMe123'", "success");
    else notify("Erreur lors de la réinitialisation", "error");
  };

  // --- Components ---

  const Toast = () => {
    if (!toast) return null;
    const bgColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-600'
    };
    const icons = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />
    };

    return (
      <div className={`fixed bottom-4 right-4 z-50 flex items-center ${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in-up`}>
        <div className="mr-3">{icons[toast.type]}</div>
        <p className="font-medium text-sm">{toast.message}</p>
        <button onClick={() => setToast(null)} className="ml-4 text-white hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // --- Missing Config Screen ---
  if (isConfigMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full text-center">
          <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration requise</h1>
          <p className="text-gray-600 mb-6">
            Pour activer la synchronisation des données, vous devez connecter une base de données Supabase.
          </p>
          <div className="bg-blue-50 text-left p-4 rounded-lg border border-blue-100 text-sm space-y-2 mb-6">
            <p>1. Créez un projet sur <a href="https://supabase.com" target="_blank" className="text-blue-700 underline font-medium">supabase.com</a></p>
            <p>2. Allez dans les <strong>Settings {'>'} API</strong>.</p>
            <p>3. Copiez <strong>Project URL</strong> et <strong>anon public key</strong>.</p>
            <p>4. Collez-les dans le fichier <code>constants.ts</code>.</p>
            <p>5. Exécutez le script SQL fourni dans la table <strong>SQL Editor</strong>.</p>
          </div>
          <p className="text-xs text-gray-400">Si vous ne savez pas comment faire, demandez au développeur.</p>
        </div>
      </div>
    );
  }

  // --- Rendering ---

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  if (showForcePasswordChange) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Sécurité du compte</h2>
          <p className="mb-6 text-gray-600">Pour votre première connexion, vous devez changer votre mot de passe.</p>
          <form onSubmit={handleForcePasswordChange}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input 
              type="password" 
              required 
              minLength={6}
              className="w-full border rounded-lg p-2 mb-6" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard 
          currentUser={currentUser} 
          infos={infos} 
          exams={exams} 
          polls={polls} 
          users={users}
          onChangeView={setCurrentView} 
          notify={notify}
        />;
      case ViewState.INFOS:
        return <Infos currentUser={currentUser} infos={infos} onAdd={handleAddInfo} onDelete={handleDeleteInfo} notify={notify} />;
      case ViewState.DS:
        return <Exams currentUser={currentUser} exams={exams} onAdd={handleAddExam} onDelete={handleDeleteExam} notify={notify} />;
      case ViewState.POLLS:
        return <Polls currentUser={currentUser} polls={polls} onVote={handleVotePoll} onAdd={handleAddPoll} onDelete={handleDeletePoll} notify={notify} />;
      case ViewState.ADMIN_USERS:
        return currentUser.role === UserRole.ADMIN ? (
          <AdminUsers 
            users={users} 
            onAddUser={handleAddUser} 
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser} 
            onResetPassword={handleResetPassword} 
            notify={notify}
          />
        ) : (
          <div className="text-center text-red-500 mt-10">Accès non autorisé</div>
        );
      default:
        return <div>Vue non trouvée</div>;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      onLogout={handleLogout}
      onEditProfile={() => setIsProfileModalOpen(true)}
    >
      {renderView()}
      <Toast />

      {/* Self Profile/Password Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Modifier mon mot de passe
              </h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSelfPasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input 
                  type="password" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={profileForm.currentPassword} 
                  onChange={e => setProfileForm({...profileForm, currentPassword: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={profileForm.newPassword} 
                  onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={profileForm.confirmPassword} 
                  onChange={e => setProfileForm({...profileForm, confirmPassword: e.target.value})} 
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;