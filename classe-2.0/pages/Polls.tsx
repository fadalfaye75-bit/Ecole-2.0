
import React, { useState } from 'react';
import { User, UserRole, Poll } from '../types';
import { formatDate } from '../utils';
import { BarChart3, Trash2, Plus, Users, Clock } from 'lucide-react';

interface PollsProps {
  currentUser: User;
  polls: Poll[];
  onVote: (pollId: string, optionId: string) => void;
  onAdd: (poll: Omit<Poll, 'id' | 'votedUserIds' | 'dateCreation'>) => void;
  onDelete: (id: string) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Polls: React.FC<PollsProps> = ({ currentUser, polls, onVote, onAdd, onDelete, notify }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [newPollDate, setNewPollDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [newPollAnon, setNewPollAnon] = useState(false);

  const canEdit = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RESPONSABLE;

  const handleOptionChange = (index: number, value: string) => {
    const opts = [...newPollOptions];
    opts[index] = value;
    setNewPollOptions(opts);
  };

  const addOptionField = () => setNewPollOptions([...newPollOptions, '']);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedOptions = newPollOptions
      .filter(opt => opt.trim() !== '')
      .map((opt, idx) => ({ id: `opt-${Date.now()}-${idx}`, text: opt, votes: 0 }));

    if (formattedOptions.length < 2) {
      notify("Veuillez saisir au moins 2 options", "error");
      return;
    }

    onAdd({
      titre: newPollTitle,
      options: formattedOptions,
      anon: newPollAnon,
      dateExpiration: new Date(newPollDate).toISOString()
    });

    setIsModalOpen(false);
    setNewPollTitle('');
    setNewPollOptions(['', '']);
    setNewPollAnon(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sondages & Quiz</h1>
          <p className="text-gray-500">Exprimez votre avis et participez aux décisions</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau sondage
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.length === 0 && (
           <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
             <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun sondage actif.</p>
          </div>
        )}

        {polls.map((poll) => {
          const hasVoted = poll.votedUserIds.includes(currentUser.id);
          const isExpired = new Date(poll.dateExpiration) < new Date();
          const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
          const showResults = hasVoted || isExpired || canEdit;

          return (
            <div key={poll.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{poll.titre}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Fin: {formatDate(poll.dateExpiration)}</span>
                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {totalVotes} votes</span>
                    {poll.anon && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Anonyme</span>}
                  </div>
                </div>
                {canEdit && (
                  <button onClick={() => {
                    if (window.confirm("Supprimer ce sondage ?")) onDelete(poll.id);
                  }} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3 flex-1">
                {poll.options.map((option) => {
                  const percent = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                  
                  if (showResults) {
                    return (
                      <div key={option.id} className="relative pt-1">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="font-medium text-gray-700">{option.text}</span>
                          <span className="text-gray-500">{percent}% ({option.votes})</span>
                        </div>
                        <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-gray-100">
                          <div 
                            style={{ width: `${percent}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        key={option.id}
                        onClick={() => onVote(poll.id, option.id)}
                        className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium text-gray-700"
                      >
                        {option.text}
                      </button>
                    );
                  }
                })}
              </div>
              
              {!showResults && (
                <p className="text-xs text-center text-gray-400 mt-4">Sélectionnez une option pour voter</p>
              )}
              {hasVoted && (
                <p className="text-xs text-center text-green-600 mt-4 font-medium flex items-center justify-center">
                   <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs mr-2">Voté</span>
                   Vous avez participé
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
             <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Créer un sondage</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du sondage</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newPollTitle} onChange={e => setNewPollTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {newPollOptions.map((opt, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      placeholder={`Option ${idx + 1}`}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={opt} 
                      onChange={e => handleOptionChange(idx, e.target.value)} 
                    />
                  ))}
                </div>
                <button type="button" onClick={addOptionField} className="text-sm text-blue-600 font-medium mt-2 hover:underline">+ Ajouter une option</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de clôture</label>
                  <input required type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newPollDate} onChange={e => setNewPollDate(e.target.value)} />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={newPollAnon} onChange={e => setNewPollAnon(e.target.checked)} />
                    <span className="ml-2 text-sm text-gray-700">Vote anonyme</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
