import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Classe 2.0</h1>
          <p className="text-blue-100">Plateforme de gestion scolaire</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="nom@ecole.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-1">
                <button 
                  type="button" 
                  onClick={() => setForgotPasswordMsg(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}
            
            {forgotPasswordMsg && (
              <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 text-center animate-fade-in">
                Veuillez contacter l'administrateur pour réinitialiser votre mot de passe.
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};