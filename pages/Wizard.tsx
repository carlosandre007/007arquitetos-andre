
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
// Fixed: Added Home to the icon imports
import { ChevronLeft, ChevronRight, Check, Sun, Compass, Ruler, Home } from 'lucide-react';
import { SolarOrientation } from '../types';

const projectSchema = z.object({
  nome_projeto: z.string().min(3, 'Nome muito curto'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().length(2, 'UF obrigatória'),
  largura_terreno: z.number().min(1, 'Largura obrigatória'),
  comprimento_terreno: z.number().min(1, 'Comprimento obrigatório'),
  orientacao_solar: z.enum(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']),
  sol_nascente_pos: z.string(),
  quarto_casal_pos: z.string()
});

type ProjectFormData = z.infer<typeof projectSchema>;

const Wizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      orientacao_solar: 'North',
      sol_nascente_pos: 'Frontal',
      quarto_casal_pos: 'Fundo'
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Projeto criado com sucesso!');
      navigate(`/projects/${project.id}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                s === step ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold' : 
                s < step ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-400'
              }`}
            >
              {s < step ? <Check size={20} /> : s}
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Home size={20} />
              </div>
              <h2 className="text-2xl font-bold">Informações Básicas</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
              <input 
                {...register('nome_projeto')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ex: Mansão Belvedere"
              />
              {errors.nome_projeto && <p className="text-rose-500 text-xs mt-1">{errors.nome_projeto.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input 
                  {...register('cidade')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado (UF)</label>
                <input 
                  {...register('estado')}
                  maxLength={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="EX: SP"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Sun size={20} />
              </div>
              <h2 className="text-2xl font-bold">Terreno e Insolação</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Largura (m)</label>
                <input 
                  type="number"
                  {...register('largura_terreno', { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comprimento (m)</label>
                <input 
                  type="number"
                  {...register('comprimento_terreno', { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Orientação Solar (Fachada)</label>
              <select 
                {...register('orientacao_solar')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="North">Norte</option>
                <option value="South">Sul</option>
                <option value="East">Leste</option>
                <option value="West">Oeste</option>
                <option value="North-East">Nordeste</option>
                <option value="North-West">Noroeste</option>
                <option value="South-East">Sudeste</option>
                <option value="South-West">Sudoeste</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Compass size={20} />
              </div>
              <h2 className="text-2xl font-bold">Layout Estratégico</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Onde o sol nasce em relação ao terreno?</label>
              <div className="grid grid-cols-3 gap-2">
                {['Frontal', 'Fundo', 'Lateral Direita', 'Lateral Esquerda'].map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setValue('sol_nascente_pos', pos)}
                    className={`px-3 py-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      watch('sol_nascente_pos') === pos ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posição sugerida para o Suíte Master</label>
              <p className="text-xs text-slate-400 mb-3">Dica: Evitar incidência direta do sol nascente ou poente excessivo conforme a região.</p>
              <div className="grid grid-cols-3 gap-2">
                {['Frente', 'Fundo', 'Superior Frente', 'Superior Fundo'].map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setValue('quarto_casal_pos', pos)}
                    className={`px-3 py-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      watch('quarto_casal_pos') === pos ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              step === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft size={20} />
            Voltar
          </button>
          
          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100"
            >
              Próximo
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-100"
            >
              Finalizar Projeto
              <Check size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Wizard;
