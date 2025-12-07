
import React, { useState } from 'react';
import { User, UserRole, Exam } from '../types';
import { formatDate, isWithinDays } from '../utils';
import { Calendar, Trash2, Plus, Download, Clock, MapPin, Search } from 'lucide-react';

interface ExamsProps {
  currentUser: User;
  exams: Exam[];
  onAdd: (exam: Omit<Exam, 'id' | 'responsableId' | 'responsableNom'>) => void;
  onDelete: (id: string) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Exams: React.FC<ExamsProps> = ({ currentUser, exams, onAdd, onDelete, notify }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExam, setNewExam] = useState({
    matiere: '',
    date: new Date().toISOString().split('T')[0],
    heureDebut: '10:00',
    duree: '1h',
    salle: '',
    notes: ''
  });

  const canEdit = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RESPONSABLE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newExam);
    setIsModalOpen(false);
    setNewExam({
      matiere: '',
      date: new Date().toISOString().split('T')[0],
      heureDebut: '10:00',
      duree: '1h',
      salle: '',
      notes: ''
    });
  };

  const downloadCSV = () => {
    const headers = ["Matière", "Date", "Heure", "Durée", "Salle", "Responsable"];
    const rows = exams.map(e => [e.matiere, e.date, e.heureDebut, e.duree, e.salle, e.responsableNom]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "planning_ds.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Téléchargement du planning lancé", "info");
  };

  // Filter & Sort
  const filteredExams = exams
    .filter(e => e.matiere.toLowerCase().includes(searchTerm.toLowerCase()) || e.salle.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devoirs Surveillés</h1>
          <p className="text-gray-500">Planning des examens et évaluations</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Chercher matière..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full md:w-48 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
          {canEdit && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Planifier
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Date & Heure</th>
                <th className="px-6 py-4">Matière</th>
                <th className="px-6 py-4">Salle & Durée</th>
                <th className="px-6 py-4">Responsable</th>
                {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    Aucun examen trouvé.
                  </td>
                </tr>
              )}
              {filteredExams.map((exam) => {
                const isUrgent = isWithinDays(exam.date, 7);
                return (
                  <tr key={exam.id} className={`hover:bg-gray-50 transition-colors ${isUrgent ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center mr-3 ${isUrgent ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                          <span className="text-xs font-bold">{new Date(exam.date).getDate()}</span>
                          <span className="text-[10px] uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' }).slice(0, 3)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{exam.heureDebut}</p>
                          {isUrgent && <span className="text-[10px] text-orange-600 font-bold bg-orange-100 px-1.5 rounded">J-{Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 block">{exam.matiere}</span>
                      {exam.notes && <span className="text-xs text-gray-500">{exam.notes}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <MapPin className="w-3 h-3 mr-1.5" /> {exam.salle}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1.5" /> {exam.duree}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {exam.responsableNom}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            if (window.confirm("Supprimer ce DS ?")) onDelete(exam.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Planifier un DS</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newExam.matiere} onChange={e => setNewExam({...newExam, matiere: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input required type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                  <input required type="time" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newExam.heureDebut} onChange={e => setNewExam({...newExam, heureDebut: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                  <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newExam.salle} onChange={e => setNewExam({...newExam, salle: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <input required type="text" placeholder="ex: 2h" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newExam.duree} onChange={e => setNewExam({...newExam, duree: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={2} value={newExam.notes} onChange={e => setNewExam({...newExam, notes: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
