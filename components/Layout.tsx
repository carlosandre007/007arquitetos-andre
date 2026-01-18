
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, PlusCircle, LogOut, Home, FileText } from 'lucide-react';

const Layout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Home className="text-indigo-400" />
            ArchMaster <span className="text-indigo-400">Pro</span>
          </h1>
        </div>
        
        <nav className="mt-6 flex-1 px-4 space-y-2">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/wizard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/wizard') ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
          >
            <PlusCircle size={20} />
            Novo Projeto
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-4 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Usuário
          </div>
          <div className="px-4 mb-4 text-sm font-medium truncate">
            {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
