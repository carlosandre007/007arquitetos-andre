
# ArchMaster Pro 🏛️

Plataforma premium para gestão, documentação e comercialização de projetos arquitetônicos residenciais.

## 🚀 Guia Rápido de Deploy (Vercel)

1. **GitHub**: Suba este código para um repositório privado ou público.
2. **Vercel**: Importe o projeto no dashboard da Vercel.
3. **Variáveis de Ambiente**: Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto na Vercel.
4. **Pronto**: A Vercel gerará um domínio `.vercel.app` automaticamente.

## ⚙️ Configuração do Banco de Dados (Supabase)

Execute o script `supabase_setup.sql` no **SQL Editor** do Supabase para:
- Criar as tabelas com integridade referencial.
- Ativar **RLS (Row Level Security)** para privacidade total dos dados.
- Configurar Triggers de criação automática de perfil de usuário.

## 🛠️ Stack Técnica
- **Frontend**: React 19 (ESM nativo) + Tailwind CSS.
- **Backend**: Supabase (PostgreSQL).
- **Icons**: Lucide React.
- **Relatórios**: jsPDF para geração de documentos técnicos.

## 📊 Estrutura de Pastas
- `/components`: Elementos de interface reutilizáveis (Layout, Sidebar).
- `/pages`: Telas principais (Dashboard, Wizard, Detalhes).
- `/contexts`: Gerenciamento de estado de autenticação.
- `types.ts`: Definições de interfaces para TypeScript.

---
*Este sistema foi projetado para ser escalável e seguro, pronto para o mercado de arquitetura de alto padrão.*
