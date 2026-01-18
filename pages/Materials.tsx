
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../contexts/AuthContext';
import { Material, MaterialCategory } from '../types';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Hammer, Plus, Trash2, Tag, Box, Hash } from 'lucide-react';

const Materials: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: MaterialCategory.CONSTRUCAO,
    quantidade: 1,
    unidade: 'Un'
  });

  useEffect(() => {
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('materiais')
      .select('*')
      .eq('project_id', id);
    
    if (data) setMaterials(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const { data, error } = await supabase
      .from('materiais')
      .insert({
        ...formData,
        project_id: id
      })
      .select()
      .single();

    if (!error) {
      setMaterials([...materials, data]);
      setIsModalOpen(false);
      setFormData({
        nome: '',
        categoria: MaterialCategory.CONSTRUCAO,
        quantidade: 1,
        unidade: 'Un'
      });
      toast.success('Material adicionado');
    }
  };

  const deleteMaterial = async (matId: string) => {
    const { error } = await supabase.from('materiais').delete().eq('id', matId);
    if (!error) {
      setMaterials(materials.filter(m => m.id !== matId));
      toast.success('Material removido');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${id}`} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Lista de Materiais</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Adicionar Item
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20">Carregando materiais...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(MaterialCategory).map(cat => (
            <div key={cat} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                {cat}
              </h3>
              <div className="space-y-3">
                {materials.filter(m => m.categoria === cat).length > 0 ? (
                  materials.filter(m => m.categoria === cat).map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-800">{m.nome}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Hash size={12}/> {m.quantidade}</span>
                            <span className="flex items-center gap-1"><Box size={12}/> {m.unidade}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteMaterial(m.id)}
                          className="p-2 text-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-slate-100/50 rounded-2xl text-slate-400 text-sm italic">
                    Nenhum item em {cat}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Adicionar Material</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Material</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value as MaterialCategory})}
                >
                  {Object.values(MaterialCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qtd</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.unidade}
                    onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
