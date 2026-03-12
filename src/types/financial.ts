// ─── Account Plan (CT1) ───────────────────────────────────────────────────────
export interface ContaContabil {
  filial: string;
  codConta: string;
  descricao: string;
  classeConta: "Sintetica" | "Analitica";
  condNormal: "Devedora" | "Credora";
  ctaSuperior: string;
  natConta: string;
}

// ─── Journal Entries (CT2) ────────────────────────────────────────────────────
export interface LancamentoContabil {
  filial: string;
  dataLcto: string; // dd/MM/yyyy
  numeroLote: string;
  subLote: string;
  numeroDoc: string;
  moedaLancto: string;
  tipoLcto: string;
  ctaDebito: string;
  ctaCredito: string;
  valor: number;
  histLanc: string;
  cCustoDeb: string;
  cCustoCrd: string;
}

// ─── Cost Centers (CTT) ───────────────────────────────────────────────────────
export interface CentroCusto {
  filial: string;
  codCC: string;
  descricao: string;
}

// ─── DRE Mapping ─────────────────────────────────────────────────────────────
export interface DreItem {
  codConta: string;
  descricaoConta: string;
  linhasDRE: string;
  grupoDRE: string;
  sinal: number; // 1 or -1
}

// ─── Financial Statement Row ──────────────────────────────────────────────────
export interface LinhaFinanceira {
  codigo: string;
  descricao: string;
  nivel: number;
  sintetica: boolean;
  valores: Record<string, number>; // key: "YYYY-MM" or "YYYY"
  varAbsoluta?: number;
  varPercentual?: number;
  varQualitativa?: string;
}

// ─── Financial Period Types ───────────────────────────────────────────────────
export type PeriodoTipo = "mensal" | "trimestral" | "anual";

export interface FiltroPeriodo {
  tipo: PeriodoTipo;
  ano: number;
  mes?: number; // 1-12 for mensal
  trimestre?: number; // 1-4 for trimestral
}

// ─── Indicators ───────────────────────────────────────────────────────────────
export interface IndicadoresFinanceiros {
  margemEbitda: number | null;
  margemLiquida: number | null;
  roe: number | null;
  roa: number | null;
  liquidezCorrente: number | null;
  endividamentoGeral: number | null;
  composicaoEndividamentoCp: number | null;
  coberturaJuros: number | null;
  conversaoCaixaOperacional: number | null;
}

// ─── Upload Snapshot ──────────────────────────────────────────────────────────
export interface SnapshotCarga {
  id: string;
  dataHora: string;
  usuario: string;
  arquivo: string;
  totalLinhas: number;
  linhasValidas: number;
  status: "success" | "error" | "partial";
}

// ─── User Roles ───────────────────────────────────────────────────────────────
export type UserRole = "auditor" | "contador" | "presidente" | "diretor";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export type Moeda = "BRL" | "USD";

export interface TaxaCambio {
  data: string;
  taxa: number; // BRL per USD
}

// ─── Report ──────────────────────────────────────────────────────────────────
export type TipoRelatorio = "DRE" | "BP" | "DFC" | "DRA";

export interface Relatorio {
  id: string;
  tipo: TipoRelatorio;
  periodo: FiltroPeriodo;
  moeda: Moeda;
  statusAprovacao: "rascunho" | "revisao" | "aprovado" | "emitido";
  criadoPor: string;
  revisadoPor?: string;
  dataEmissao?: string;
  narrativa?: string;
}
