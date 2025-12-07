
import React, { useState, useEffect } from 'react';
import { User, UserRole, Announcement, Exam, Poll, ViewState } from '../types';
import { isWithinDays, formatDate } from '../utils';
import { Bell, Calendar, CheckCircle, AlertTriangle, FileText, Users, Clock, Edit3, Save } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  infos: Announcement[];
  exams: Exam[];
  polls: Poll[];
  users: User[];
  onChangeView: (view: ViewState) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  infos, 
  exams, 
  polls, 
  users,
  onChangeView,
  notify
}) => {
  // Clock State
  const [time, setTime] = useState(new Date());
  // Get user's timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Personal Note State
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Load note
    const savedNote = localStorage.getItem(`note_${currentUser.id}`);
    if (savedNote) setNote(savedNote);

    return () => clearInterval(timer);
  }, [currentUser.id]);

  const saveNote = () => {
    setIsSavingNote(true);
    localStorage.setItem(`note_${currentUser.id}`, note);
    setTimeout(() => {
      setIsSavingNote(false);
      notify("Note sauvegardée avec succès", "success");
    }, 500);
  };

  const upcomingExams = exams
    .filter(e => isWithinDays(e.date, 7))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const urgentInfos = infos.filter(i => i.importance === 'urgent');
  const activePolls = polls.filter(p => new Date(p.dateExpiration) > new Date());

  const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
    <div onClick={onClick} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-all group">
      <div className={`p-4 rounded-full ${color} bg-opacity-10 mr-4 group-hover:bg-opacity-20 transition-all`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header & Clock */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {currentUser.nom} 👋</h1>
          <p className="text-gray-500 capitalize">
            {formatDate(new Date().toISOString())}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
              {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-gray-400 uppercase font-semibold flex justify-end items-center gap-1">
              {timeZone.replace('_', ' ')}
            </p>
          </div>
          <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
            {currentUser.role.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Infos urgentes" 
          value={urgentInfos.length} 
          icon={Bell} 
          color="bg-red-500" 
          onClick={() => onChangeView(ViewState.INFOS)}
        />
        <StatCard 
          title="DS de la semaine" 
          value={upcomingExams.length} 
          icon={Calendar} 
          color="bg-orange-500" 
          onClick={() => onChangeView(ViewState.DS)}
        />
        <StatCard 
          title="Sondages en cours" 
          value={activePolls.length} 
          icon={CheckCircle} 
          color="bg-green-500" 
          onClick={() => onChangeView(ViewState.POLLS)}
        />
        {currentUser.role === UserRole.ADMIN ? (
           <StatCard 
           title="Utilisateurs inscrits" 
           value={users.length} 
           icon={Users} 
           color="bg-indigo-500" 
           onClick={() => onChangeView(ViewState.ADMIN_USERS)}
         />
        ) : (
          <StatCard 
            title="Total annonces" 
            value={infos.length} 
            icon={FileText} 
            color="bg-blue-500" 
            onClick={() => onChangeView(ViewState.INFOS)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Alertes & Rappels
            </h2>
          </div>
          <div className="p-5 space-y-4 flex-1">
            {upcomingExams.length === 0 && urgentInfos.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-gray-500">Rien à signaler pour le moment !</p>
                <p className="text-sm text-gray-400">Profitez de votre journée.</p>
              </div>
            )}
            
            {urgentInfos.map(info => (
              <div key={info.id} className="flex items-start p-3 bg-red-50 rounded-lg border border-red-100 animate-fade-in">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded uppercase">Important</span>
                  <h4 className="text-sm font-semibold text-gray-900 mt-1">{info.titre}</h4>
                  <p className="text-xs text-gray-600">{info.matiere}</p>
                </div>
                <button onClick={() => onChangeView(ViewState.INFOS)} className="text-xs text-blue-600 hover:underline mt-1 font-medium">
                  Voir
                </button>
              </div>
            ))}

            {upcomingExams.map(exam => (
              <div key={exam.id} className="flex items-start p-3 bg-orange-50 rounded-lg border border-orange-100 animate-fade-in">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded uppercase">Examen</span>
                  <h4 className="text-sm font-semibold text-gray-900 mt-1">{exam.matiere}</h4>
                  <p className="text-xs text-gray-600">Le {new Date(exam.date).toLocaleDateString()} à {exam.heureDebut}</p>
                </div>
                <button onClick={() => onChangeView(ViewState.DS)} className="text-xs text-blue-600 hover:underline mt-1 font-medium">
                  Détails
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">
                {currentUser.role === UserRole.ELEVE ? 'Derniers sondages' : 'Actions rapides'}
              </h2>
            </div>
            <div className="p-5">
              {currentUser.role === UserRole.ELEVE ? (
                <div className="space-y-3">
                  {activePolls.slice(0, 3).map(poll => (
                    <div key={poll.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-700 truncate mr-2">{poll.titre}</span>
                      <button 
                        onClick={() => onChangeView(ViewState.POLLS)}
                        className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${poll.votedUserIds.includes(currentUser.id) ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {poll.votedUserIds.includes(currentUser.id) ? 'Voté' : 'Voter'}
                      </button>
                    </div>
                  ))}
                  {activePolls.length === 0 && <p className="text-gray-500 text-sm text-center">Aucun sondage en cours.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => onChangeView(ViewState.INFOS)} className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors text-left group">
                    <div className="p-2 bg-blue-100 w-fit rounded-lg mb-2 group-hover:bg-blue-200">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Publier une annonce</h3>
                  </button>

                  <button onClick={() => onChangeView(ViewState.DS)} className="p-4 border rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-colors text-left group">
                    <div className="p-2 bg-orange-100 w-fit rounded-lg mb-2 group-hover:bg-orange-200">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Planifier un devoir</h3>
                  </button>
                  
                  <button onClick={() => onChangeView(ViewState.POLLS)} className="p-4 border rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors text-left group">
                    <div className="p-2 bg-green-100 w-fit rounded-lg mb-2 group-hover:bg-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Créer un sondage</h3>
                  </button>

                  {currentUser.role === UserRole.ADMIN && (
                    <button onClick={() => onChangeView(ViewState.ADMIN_USERS)} className="p-4 border rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left group">
                      <div className="p-2 bg-indigo-100 w-fit rounded-lg mb-2 group-hover:bg-indigo-200">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm">Gestion des utilisateurs</h3>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Personal Notepad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center text-sm">
                <Edit3 className="w-4 h-4 mr-2 text-gray-500" />
                Bloc-notes personnel
              </h2>
              <button 
                onClick={saveNote}
                className={`text-xs flex items-center px-2 py-1 rounded transition-colors ${isSavingNote ? 'bg-green-100 text-green-700' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <Save className="w-3 h-3 mr-1" />
                {isSavingNote ? 'Sauvegardé' : 'Enregistrer'}
              </button>
            </div>
            <textarea
              className="w-full p-4 text-sm text-gray-700 resize-none focus:outline-none flex-1 min-h-[120px] bg-yellow-50/20"
              placeholder="Écrivez vos notes ici (devoirs, rappels...)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
