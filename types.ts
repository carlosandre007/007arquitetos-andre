
export type SolarOrientation = 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  nome_projeto: string;
  cidade: string;
  estado: string;
  orientacao_solar: SolarOrientation;
  sol_nascente_pos: string;
  quarto_casal_pos: string;
  largura_terreno: number;
  comprimento_terreno: number;
  created_at: string;
}

export interface Floor {
  id: string;
  project_id: string;
  nome: string;
  nivel: number;
}

export interface Room {
  id: string;
  pavimento_id: string;
  tipo: string;
  metragem: number;
  posicao_solar: SolarOrientation;
  observacoes: string;
}

export enum MaterialCategory {
  CONSTRUCAO = 'Construção',
  FERRAGEM = 'Ferragem',
  ELETRICA = 'Elétrica',
  HIDRAULICA = 'Hidráulica',
  ACABAMENTO = 'Acabamento'
}

export interface Material {
  id: string;
  project_id: string;
  categoria: MaterialCategory;
  nome: string;
  quantidade: number;
  unidade: string;
}
