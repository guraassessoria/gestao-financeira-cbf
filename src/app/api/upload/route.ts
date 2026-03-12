import { NextRequest, NextResponse } from "next/server";
import { parseCT1, parseCT2, parseCTT } from "@/lib/parsers";
import { createServiceClient } from "@/lib/supabase";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const tipo = formData.get("tipo");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });
    }
    if (!tipo || typeof tipo !== "string") {
      return NextResponse.json({ error: "Tipo de arquivo não fornecido" }, { status: 400 });
    }
    if (!["CT1", "CT2", "CTT"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de arquivo inválido" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 50 MB)" }, { status: 400 });
    }

    const text = await file.text();

    let linhasValidas = 0;
    let totalLinhas = 0;

    const supabase = createServiceClient();

    if (tipo === "CT1") {
      const contas = parseCT1(text);
      totalLinhas = text.split("\n").length - 3;
      linhasValidas = contas.length;

      // Batch insert
      const rows = contas.map((c) => ({
        filial: c.filial,
        cod_conta: c.codConta,
        descricao: c.descricao,
        classe_conta: c.classeConta,
        cond_normal: c.condNormal,
        cta_superior: c.ctaSuperior || null,
        nat_conta: c.natConta || null,
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("plano_contas")
          .upsert(rows, { onConflict: "filial,cod_conta,snapshot_id" });
        if (error) throw new Error(error.message);
      }
    } else if (tipo === "CT2") {
      const lancamentos = parseCT2(text);
      totalLinhas = text.split("\n").length - 3;
      linhasValidas = lancamentos.length;

      const rows = lancamentos.map((l) => {
        // Convert dd/MM/yyyy to ISO
        const parts = l.dataLcto.split("/");
        const isoDate =
          parts.length === 3
            ? `${parts[2]}-${parts[1]}-${parts[0]}`
            : l.dataLcto;
        return {
          filial: l.filial,
          data_lcto: isoDate,
          numero_lote: l.numeroLote || null,
          sub_lote: l.subLote || null,
          numero_doc: l.numeroDoc || null,
          moeda_lancto: l.moedaLancto || null,
          tipo_lcto: l.tipoLcto,
          cta_debito: l.ctaDebito,
          cta_credito: l.ctaCredito,
          valor: l.valor,
          hist_lanc: l.histLanc || null,
          c_custo_deb: l.cCustoDeb || null,
          c_custo_crd: l.cCustoCrd || null,
        };
      });

      // Insert in chunks of 500 to avoid payload limits
      const CHUNK = 500;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const { error } = await supabase.from("lancamentos").insert(chunk);
        if (error) throw new Error(error.message);
      }
    } else if (tipo === "CTT") {
      const centros = parseCTT(text);
      totalLinhas = text.split("\n").length - 3;
      linhasValidas = centros.length;

      const rows = centros.map((c) => ({
        filial: c.filial,
        cod_cc: c.codCC,
        descricao: c.descricao,
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("centros_custo")
          .upsert(rows, { onConflict: "filial,cod_cc,snapshot_id" });
        if (error) throw new Error(error.message);
      }
    }

    // Record snapshot
    await supabase.from("snapshots_carga").insert({
      arquivo: file.name,
      tipo_arquivo: tipo,
      total_linhas: totalLinhas,
      linhas_validas: linhasValidas,
      status: "success",
    });

    return NextResponse.json({
      message: `${tipo} importado com sucesso`,
      linhasValidas,
      totalLinhas,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
