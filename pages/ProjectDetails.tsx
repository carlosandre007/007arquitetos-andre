
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../contexts/AuthContext';
import { Project, Floor, Room, MaterialCategory } from '../types';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Layers, Plus, Trash2, Home, Sun, Info, 
  Settings, Hammer, FileText, Download, Edit3, Ruler 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    if (!id) return;
    setLoading(true);
    
    const [projRes, floorRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('pavimentos').select('*').eq('project_id', id).order('nivel', { ascending: true })
    ]);

    if (projRes.data) setProject(projRes.data);
    if (floorRes.data) {
      setFloors(floorRes.data);
      const floorIds = floorRes.data.map(f => f.id);
      if (floorIds.length > 0) {
        const { data: roomData } = await supabase.from('ambientes').select('*').in('pavimento_id', floorIds);
        if (roomData) setRooms(roomData);
      }
    }
    setLoading(false);
  };

  const addFloor = async () => {
    if (!id || !newFloorName) return;
    const { data, error } = await supabase.from('pavimentos').insert({
      project_id: id,
      nome: newFloorName,
      nivel: floors.length
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar pavimento');
    } else {
      setFloors([...floors, data]);
      setNewFloorName('');
      setIsFloorModalOpen(false);
      toast.success('Pavimento adicionado');
    }
  };

  const addRoom = async (floorId: string) => {
    const type = window.prompt('Tipo do ambiente (ex: Sala de Estar, Cozinha):');
    if (!type) return;
    const { data, error } = await supabase.from('ambientes').insert({
      pavimento_id: floorId,
      tipo: type,
      metragem: 0,
      posicao_solar: 'North',
      observacoes: ''
    }).select().single();

    if (!error) {
      setRooms([...rooms, data]);
      toast.success('Ambiente adicionado');
    }
  };

  const deleteFloor = async (floorId: string) => {
    if (!confirm('Deseja excluir este pavimento e todos os seus ambientes?')) return;
    const { error } = await supabase.from('pavimentos').delete().eq('id', floorId);
    if (!error) {
      setFloors(floors.filter(f => f.id !== floorId));
      setRooms(rooms.filter(r => r.pavimento_id !== floorId));
      toast.success('Pavimento removido');
    }
  };

  const generatePDF = () => {
    if (!project) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(`Documentação Técnica: ${project.nome_projeto}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Localização: ${project.cidade} - ${project.estado}`, 20, 30);
    doc.text(`Dimensões: ${project.largura_terreno}m x ${project.comprimento_terreno}m`, 20, 37);
    doc.text(`Orientação Solar Principal: ${project.orientacao_solar}`, 20, 44);

    let y = 60;
    doc.setFontSize(16);
    doc.text('Distribuição por Pavimentos', 20, y);
    y += 10;

    floors.forEach(floor => {
      doc.setFontSize(14);
      doc.text(`${floor.nome}`, 20, y);
      y += 8;
      
      const floorRooms = rooms.filter(r => r.pavimento_id === floor.id);
      floorRooms.forEach(room => {
        doc.setFontSize(11);
        doc.text(`- ${room.tipo} (${room.metragem}m²) - Sol: ${room.posicao_solar}`, 30, y);
        y += 6;
      });
      y += 5;
    });

    doc.save(`Projeto_${project.nome_projeto.replace(/\s/g, '_')}.pdf`);
  };

  if (loading) return <div className="text-center py-20">Carregando detalhes do projeto...</div>;
  if (!project) return <div className="text-center py-20">Projeto não encontrado.</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.nome_projeto}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin size={14} /> {project.cidade}, {project.estado}
              </span>
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Sun size={14} /> Sol Nascente: {project.sol_nascente_pos}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/projects/${id}/materials`}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
          >
            <Hammer size={18} />
            Materiais
          </Link>
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100"
          >
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Specs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="text-indigo-500" size={18} />
              Especificações Técnicas
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">Largura</span>
                <span className="font-semibold">{project.largura_terreno}m</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">Comprimento</span>
                <span className="font-semibold">{project.comprimento_terreno}m</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">Área Total</span>
                <span className="font-semibold text-indigo-600">{(project.largura_terreno * project.comprimento_terreno).toFixed(2)}m²</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">Orientação</span>
                <span className="font-semibold">{project.orientacao_solar}</span>
              </div>
              <div className="flex justify-between p-3 bg-amber-50 rounded-xl text-amber-900">
                <span className="text-sm font-medium">Suíte Master</span>
                <span className="font-bold">{project.quarto_casal_pos}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Pronto para comercializar?</h3>
              <p className="text-indigo-100 text-sm mb-4">
                A documentação técnica está completa. Você pode enviar o relatório para engenheiros e fornecedores.
              </p>
              <button className="w-full bg-white text-indigo-900 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
                Configurar Venda
              </button>
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right Col: Floors and Rooms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Pavimentos e Ambientes</h2>
            <button 
              onClick={() => setIsFloorModalOpen(true)}
              className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
              title="Adicionar Pavimento"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {floors.map((floor) => (
              <div key={floor.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="text-slate-400" size={18} />
                    <h4 className="font-bold text-slate-700">{floor.nome}</h4>
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Nível {floor.nivel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => addRoom(floor.id)}
                      className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-md transition-colors"
                      title="Adicionar Ambiente"
                    >
                      <Plus size={18} />
                    </button>
                    <button 
                      onClick={() => deleteFloor(floor.id)}
                      className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {rooms.filter(r => r.pavimento_id === floor.id).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rooms.filter(r => r.pavimento_id === floor.id).map((room) => (
                        <div key={room.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-slate-800">{room.tipo}</span>
                            <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">{room.posicao_solar}</span>
                          </div>
                          <div className="text-xs text-slate-500 mb-2">Área: {room.metragem}m²</div>
                          <p className="text-xs text-slate-400 italic line-clamp-2">
                            {room.observacoes || "Nenhuma observação técnica..."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 text-sm py-4">Nenhum ambiente cadastrado.</p>
                  )}
                </div>
              </div>
            ))}

            {floors.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                <Layers className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500">Crie o primeiro pavimento para começar o layout.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floor Modal */}
      {isFloorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6">Novo Pavimento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Pavimento</label>
                <input 
                  type="text"
                  placeholder="Ex: Térreo, Superior, Subsolo"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setIsFloorModalOpen(false)}
                  className="flex-1 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={addFloor}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

const MapPin: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
