
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Trash2, UserPlus, RefreshCw, Mail, Pencil, Search, ShieldAlert } from 'lucide-react';
import { generateId } from '../utils';

interface AdminUsersProps {
  users: User[];
  onAddUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onResetPassword: (id: string) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onAddUser, onEditUser, onDeleteUser, onResetPassword, notify }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    role: UserRole.ELEVE,
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ nom: '', email: '', role: UserRole.ELEVE });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingId(user.id);
    setFormData({ nom: user.nom, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const originalUser = users.find(u => u.id === editingId);
      if (originalUser) {
        onEditUser({
          ...originalUser,
          ...formData,
        });
      }
    } else {
      onAddUser({
        id: generateId(),
        ...formData,
        password: 'changeMe123',
        mustChangePassword: true
      });
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-500">Ajouter, modifier ou supprimer des accès</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Adresse e-mail</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 && (
                 <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                   <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                   Aucun utilisateur trouvé.
                 </td>
               </tr>
              )}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.nom}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold border ${
                      user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      user.role === UserRole.RESPONSABLE ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(user)}
                      title="Modifier"
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                     <button 
                      onClick={() => {
                        if (window.confirm("Réinitialiser le mot de passe de cet utilisateur ?")) onResetPassword(user.id);
                      }}
                      title="Réinitialiser le mot de passe"
                      className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (users.filter(u => u.role === UserRole.ADMIN).length === 1 && user.role === UserRole.ADMIN) {
                          notify("Impossible de supprimer le dernier administrateur", "error");
                        } else if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
                          onDeleteUser(user.id);
                        }
                      }}
                      title="Supprimer"
                      className={`p-1 transition-colors ${user.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add/Edit User Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? 'Modifier un utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                <input required type="email" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                  <option value={UserRole.ELEVE}>Élève</option>
                  <option value={UserRole.RESPONSABLE}>Responsable</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              
              {!editingId && (
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                  Un mot de passe temporaire sera généré: <strong>changeMe123</strong>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
