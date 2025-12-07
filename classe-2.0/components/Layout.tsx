import React from 'react';
import { User, UserRole, ViewState } from '../types';
import { 
  LayoutDashboard, 
  Video, 
  CalendarDays, 
  BarChart3, 
  Users, 
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface LayoutProps {
  currentUser: User;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  onEditProfile: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentUser, 
  currentView, 
  onChangeView, 
  onLogout,
  onEditProfile,
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label, restrictedTo }: { view: ViewState, icon: any, label: string, restrictedTo?: UserRole[] }) => {
    if (restrictedTo && !restrictedTo.includes(currentUser.role)) return null;
    
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onChangeView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b z-20 px-4 py-3 flex justify-between items-center shadow-sm">
        <span className="font-bold text-lg text-blue-600">Classe 2.0</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="flex items-center h-16 px-6 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Classe 2.0</span>
            </div>
          </div>

          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem view={ViewState.INFOS} icon={Video} label="Infos & Meet" />
            <NavItem view={ViewState.DS} icon={CalendarDays} label="Devoirs (DS)" />
            <NavItem view={ViewState.POLLS} icon={BarChart3} label="Sondages" />
            
            <div className="pt-4 mt-4 border-t border-gray-100">
               <NavItem 
                view={ViewState.ADMIN_USERS} 
                icon={Users} 
                label="Gestion Utilisateurs" 
                restrictedTo={[UserRole.ADMIN]} 
              />
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 flex-shrink-0">
                  {currentUser.nom.charAt(0)}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 truncate">{currentUser.nom}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role.toLowerCase()}</p>
                </div>
              </div>
              <button 
                onClick={onEditProfile}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Modifier mot de passe"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};