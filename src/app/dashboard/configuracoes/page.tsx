const usuarios = [
  { id: '1', nome: 'Ana Paula Silva',    email: 'ana.silva@cbf.com.br',    perfil: 'presidente', ativo: true },
  { id: '2', nome: 'Carlos Mendes',      email: 'carlos.mendes@cbf.com.br', perfil: 'diretor',    ativo: true },
  { id: '3', nome: 'Fernanda Costa',     email: 'fernanda.costa@cbf.com.br',perfil: 'contador',   ativo: true },
  { id: '4', nome: 'Roberto Andrade',    email: 'roberto.andrade@cbf.com.br',perfil: 'auditor',   ativo: false },
]

const perfilLabels: Record<string, string> = {
  presidente: 'Presidente',
  diretor: 'Diretor',
  contador: 'Contador',
  auditor: 'Auditor',
}

const perfilColors: Record<string, string> = {
  presidente: 'bg-purple-100 text-purple-700',
  diretor: 'bg-primary-100 text-primary-700',
  contador: 'bg-green-100 text-green-700',
  auditor: 'bg-amber-100 text-amber-700',
}

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerenciamento de usuários e perfis de acesso
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700">Usuários</h2>
          <button
            disabled
            className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg opacity-50 cursor-not-allowed"
          >
            + Convidar Usuário
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Nome</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">E-mail</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Perfil</th>
              <th className="text-left px-6 py-3 text-slate-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-800">{u.nome}</td>
                <td className="px-6 py-3 text-slate-600">{u.email}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${perfilColors[u.perfil]}`}>
                    {perfilLabels[u.perfil]}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.ativo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-700 mb-3">Perfis de Acesso</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { perfil: 'Presidente', desc: 'Acesso completo a todas as demonstrações e relatórios.' },
            { perfil: 'Diretor', desc: 'Acesso de leitura a todas as demonstrações e indicadores.' },
            { perfil: 'Contador', desc: 'Acesso de leitura e carga de dados. Pode submeter revisões.' },
            { perfil: 'Auditor', desc: 'Acesso somente leitura com trilha de auditoria completa.' },
          ].map((p) => (
            <div key={p.perfil} className="bg-slate-50 rounded-lg p-3">
              <p className="font-medium text-slate-800">{p.perfil}</p>
              <p className="text-slate-500 text-xs mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
