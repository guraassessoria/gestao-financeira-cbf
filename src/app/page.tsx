import Link from "next/link";
import { KpiCard } from "@/components/Charts";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Painel Executivo Financeiro
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Visão consolidada · CBF · TOTVS Protheus
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receita Líquida"
          value="—"
          sub="Aguardando carga de dados"
          color="blue"
        />
        <KpiCard
          title="EBITDA"
          value="—"
          sub="Aguardando carga de dados"
          color="green"
        />
        <KpiCard
          title="Margem EBITDA"
          value="—"
          sub="Aguardando carga de dados"
          color="amber"
        />
        <KpiCard
          title="Resultado Líquido"
          value="—"
          sub="Aguardando carga de dados"
          color="blue"
        />
      </div>

      {/* Navigation shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/dre", label: "DRE", desc: "Demonstração do Resultado" },
          { href: "/bp", label: "BP", desc: "Balanço Patrimonial" },
          { href: "/dfc", label: "DFC", desc: "Fluxo de Caixa – Método Indireto" },
          { href: "/dra", label: "DRA", desc: "Demonstração do Resultado Abrangente" },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <span className="text-3xl font-extrabold text-blue-600 group-hover:text-blue-700">
              {label}
            </span>
            <p className="text-sm text-slate-500 mt-2">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Getting started notice */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-2">Como começar</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>
            Configure as variáveis de ambiente Supabase no arquivo{" "}
            <code className="bg-blue-100 rounded px-1">.env.local</code>
          </li>
          <li>
            Execute o script SQL em{" "}
            <code className="bg-blue-100 rounded px-1">
              supabase/migrations/001_initial_schema.sql
            </code>{" "}
            no painel Supabase
          </li>
          <li>
            Acesse{" "}
            <Link href="/upload" className="font-semibold underline">
              Carga de Dados
            </Link>{" "}
            para importar os arquivos do TOTVS Protheus (CT1, CT2, CTT)
          </li>
          <li>Retorne ao painel para visualizar os demonstrativos</li>
        </ol>
      </div>
    </div>
  );
}
