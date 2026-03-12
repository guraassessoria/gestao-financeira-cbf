import { Users, Lock, LogOut } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Administração</h1>
      <p className="text-slate-600 mb-8">Gestão de usuários, perfis e permissões</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AdminCard icon={Users} title="Usuários" count="12" description="Contas ativas" />
        <AdminCard icon={Lock} title="Perfis" count="4" description="Grupos de permissão" />
        <AdminCard icon={LogOut} title="Auditoria" count="248" description="Últimos 30 dias" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usuários */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Usuários</h3>
          <div className="space-y-3">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Perfis */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Perfis</h3>
          <div className="space-y-3">
            {mockProfiles.map((profile) => (
              <div key={profile.id} className="p-3 hover:bg-slate-50 rounded border border-slate-200">
                <p className="font-medium text-slate-900">{profile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{profile.perms} permissões</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminCard({ icon: Icon, title, count, description }: { icon: any; title: string; count: string; description: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{count}</p>
          <p className="text-xs text-slate-500 mt-2">{description}</p>
        </div>
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
    </div>
  )
}

const mockUsers = [
  { id: 1, name: 'João Silva', email: 'joao@cbf.org.br', active: true },
  { id: 2, name: 'Maria Santos', email: 'maria@cbf.org.br', active: true },
  { id: 3, name: 'Pedro Costa', email: 'pedro@cbf.org.br', active: false },
]

const mockProfiles = [
  { id: 1, name: 'Admin', perms: 8 },
  { id: 2, name: 'Contador', perms: 5 },
  { id: 3, name: 'Auditor', perms: 4 },
  { id: 4, name: 'Diretor', perms: 3 },
]
