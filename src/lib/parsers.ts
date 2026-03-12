import Papa from "papaparse";
import type { ContaContabil, LancamentoContabil, CentroCusto } from "@/types/financial";

// Protheus CSV files have a 2-line preamble before the actual header.
// Format: delimiter ";"

function removePreamble(text: string): string {
  const lines = text.split("\n");
  // Remove the first 2 lines (preamble) and return the rest
  return lines.slice(2).join("\n");
}

function parseDecimalBR(value: string): number {
  if (!value || value.trim() === "") return 0;
  // Brazilian format uses comma as decimal separator
  return parseFloat(value.trim().replace(/\./g, "").replace(",", ".")) || 0;
}

// ─── CT1 - Plano de Contas ────────────────────────────────────────────────────
export function parseCT1(csvText: string): ContaContabil[] {
  const cleaned = removePreamble(csvText);
  const result = Papa.parse<Record<string, string>>(cleaned, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row["Cod Conta"] && row["Cod Conta"].trim() !== "")
    .map((row) => ({
      filial: row["Filial"]?.trim() ?? "",
      codConta: row["Cod Conta"]?.trim() ?? "",
      descricao: row["Desc Moeda 1"]?.trim() ?? "",
      classeConta: (row["Classe Conta"]?.trim() as "Sintetica" | "Analitica") ?? "Analitica",
      condNormal: (row["Cond Normal"]?.trim() as "Devedora" | "Credora") ?? "Devedora",
      ctaSuperior: row["Cta Superior"]?.trim() ?? "",
      natConta: row["Nat. Conta"]?.trim() ?? "",
    }));
}

// ─── CT2 - Lançamentos ────────────────────────────────────────────────────────
export function parseCT2(csvText: string): LancamentoContabil[] {
  const cleaned = removePreamble(csvText);
  const result = Papa.parse<Record<string, string>>(cleaned, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  return result.data
    .filter(
      (row) =>
        row["Tipo Lcto"]?.trim() === "Partida Dobrada" &&
        row["Cta Debito"] &&
        row["Cta Debito"].trim() !== "" &&
        row["Cta Credito"] &&
        row["Cta Credito"].trim() !== "" &&
        row["Valor"] &&
        row["Valor"].trim() !== "0"
    )
    .map((row) => ({
      filial: row["Filial"]?.trim() ?? "",
      dataLcto: row["Data Lcto"]?.trim() ?? "",
      numeroLote: row["Numero Lote"]?.trim() ?? "",
      subLote: row["Sub Lote"]?.trim() ?? "",
      numeroDoc: row["Numero Doc"]?.trim() ?? "",
      moedaLancto: row["Moeda Lancto"]?.trim() ?? "",
      tipoLcto: row["Tipo Lcto"]?.trim() ?? "",
      ctaDebito: row["Cta Debito"]?.trim() ?? "",
      ctaCredito: row["Cta Credito"]?.trim() ?? "",
      valor: parseDecimalBR(row["Valor"] ?? "0"),
      histLanc: row["Hist Lanc"]?.trim() ?? "",
      cCustoDeb: row["C Custo Deb"]?.trim() ?? "",
      cCustoCrd: row["C Custo Crd"]?.trim() ?? "",
    }));
}

// ─── CTT - Centros de Custo ───────────────────────────────────────────────────
export function parseCTT(csvText: string): CentroCusto[] {
  const cleaned = removePreamble(csvText);
  const result = Papa.parse<Record<string, string>>(cleaned, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row["Cod C.Custo"] && row["Cod C.Custo"].trim() !== "")
    .map((row) => ({
      filial: row["Filial"]?.trim() ?? "",
      codCC: row["Cod C.Custo"]?.trim() ?? "",
      descricao: row["Descricao"]?.trim() ?? row["Desc. C.Custo"]?.trim() ?? "",
    }));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
// Converts "dd/MM/yyyy" → { year, month }
export function parseDateBR(dateStr: string): { year: number; month: number } | null {
  if (!dateStr || dateStr.trim() === "") return null;
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return { year, month };
}

export function yearMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function yearKey(year: number): string {
  return `${year}`;
}
