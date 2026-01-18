
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
// Fixed: Added Home to the icon imports
import { Plus, Search, MapPin, Sun, ChevronRight, Calendar, Home } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const filteredProjects = projects.filter(p => 
    p.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seus Projetos</h1>
          <p className="text-slate-500 mt-1">Gerencie e documente seus projetos residenciais de alto padrão.</p>
        </div>
        <Link 
          to="/wizard"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          Criar Novo Projeto
        </Link>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome do projeto ou cidade..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}`}
              className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Home size={24} />
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">
                  {project.nome_projeto}
                </h3>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={16} />
                    {project.cidade}, {project.estado}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sun size={16} />
                    Orientação: {project.orientacao_solar}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 pt-4 border-t border-slate-50 mt-4">
                    <Calendar size={14} />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-3xl">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-slate-300" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">Nenhum projeto encontrado</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Comece criando seu primeiro projeto arquitetônico clicando no botão acima.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
