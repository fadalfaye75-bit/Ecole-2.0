
import React, { useState } from 'react';
import { User, UserRole, Announcement } from '../types';
import { formatDate } from '../utils';
import { Video, Trash2, Plus, Clock, User as UserIcon, Search, Filter } from 'lucide-react';

interface InfosProps {
  currentUser: User;
  infos: Announcement[];
  onAdd: (info: Omit<Announcement, 'id' | 'createurId' | 'createurNom'>) => void;
  onDelete: (id: string) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Infos: React.FC<InfosProps> = ({ currentUser, infos, onAdd, onDelete, notify }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newInfo, setNewInfo] = useState({
    titre: '',
    matiere: '',
    lienMeet: '',
    date: new Date().toISOString().split('T')[0],
    heure: '08:00',
    importance: 'normal' as 'normal' | 'urgent',
  });

  const canEdit = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RESPONSABLE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newInfo);
    setIsModalOpen(false);
    setNewInfo({
      titre: '',
      matiere: '',
      lienMeet: '',
      date: new Date().toISOString().split('T')[0],
      heure: '08:00',
      importance: 'normal',
    });
  };

  const filteredInfos = infos.filter(info => 
    info.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.matiere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infos & Meet</h1>
          <p className="text-gray-500">Annonces, cours en visio et informations générales</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canEdit && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nouvelle annonce</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredInfos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune annonce trouvée.</p>
            {searchTerm && <button onClick={() => setSearchTerm('')} className="text-blue-600 text-sm mt-2 hover:underline">Effacer la recherche</button>}
          </div>
        )}

        {filteredInfos.map((info) => (
          <div 
            key={info.id} 
            className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${info.importance === 'urgent' ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-[10px] uppercase rounded-md font-bold ${info.importance === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {info.importance === 'urgent' ? 'URGENT' : 'INFO'}
                  </span>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{info.matiere}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.titre}</h3>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDate(info.date)} à {info.heure}
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1.5" />
                    {info.createurNom}
                  </div>
                </div>

                {info.lienMeet && (
                  <div className="mt-4">
                    <a 
                      href={info.lienMeet} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Rejoindre la réunion Meet
                    </a>
                  </div>
                )}
              </div>

              {canEdit && (
                <button 
                  onClick={() => {
                    if (window.confirm("Supprimer cette annonce ?")) onDelete(info.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Ajouter une annonce</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newInfo.titre} onChange={e => setNewInfo({...newInfo, titre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newInfo.matiere} onChange={e => setNewInfo({...newInfo, matiere: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importance</label>
                  <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newInfo.importance} onChange={e => setNewInfo({...newInfo, importance: e.target.value as any})}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input required type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newInfo.date} onChange={e => setNewInfo({...newInfo, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input required type="time" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newInfo.heure} onChange={e => setNewInfo({...newInfo, heure: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien Google Meet (optionnel)</label>
                <div className="relative">
                  <Video className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input type="url" placeholder="https://meet.google.com/..." className="w-full border rounded-lg pl-9 p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newInfo.lienMeet} onChange={e => setNewInfo({...newInfo, lienMeet: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
