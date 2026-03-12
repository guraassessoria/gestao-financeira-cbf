export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-sm text-slate-500 mt-1">
          Parâmetros gerais do painel financeiro
        </p>
      </div>

      {/* Environment */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Conexão Supabase</h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            Configure as variáveis de ambiente no arquivo{" "}
            <code className="bg-slate-100 rounded px-1 py-0.5">.env.local</code>:
          </p>
          <pre className="bg-slate-50 rounded-lg p-4 text-xs overflow-x-auto border border-slate-200">
{`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role`}
          </pre>
        </div>
      </div>

      {/* Currency */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-slate-800">Taxa de Câmbio BRL/USD</h3>
        <p className="text-sm text-slate-600">
          A política de câmbio (taxa média ou fechamento, data de corte, fonte)
          deve ser definida e registrada antes de gerar relatórios em USD.
        </p>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠ Definição pendente – consulte a Seção 8 da especificação do protótipo.
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-slate-800">Perfis de Acesso</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { role: "contador", desc: "Carga de dados, configuração, emissão de relatórios" },
            { role: "auditor", desc: "Leitura completa + trilha de auditoria" },
            { role: "presidente", desc: "Leitura + aprovação de relatórios" },
            { role: "diretor", desc: "Leitura dos painéis e demonstrativos" },
          ].map(({ role, desc }) => (
            <div key={role} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="font-medium capitalize text-slate-800">{role}</span>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
        <h3 className="font-semibold text-slate-800">Recursos</h3>
        <ul className="text-sm space-y-1">
          <li>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Painel Supabase →
            </a>
          </li>
          <li>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Painel Vercel →
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
